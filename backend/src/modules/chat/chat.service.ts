import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../database/prisma.service';
import { AiService } from '../ai';
import { KnowledgeService } from '../knowledge';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly knowledgeService: KnowledgeService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get all conversations sorted by last updated
   */
  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { userId, isActive: true },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  /**
   * Create a new conversation
   */
  async createConversation(userId: string, title?: string) {
    return this.prisma.conversation.create({
      data: {
        userId,
        title: title || 'New conversation',
      },
    });
  }

  /**
   * Get a conversation by ID, including its messages in chronological order (createdAt ascending)
   */
  async getConversation(id: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id, userId, isActive: true },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID "${id}" not found`);
    }

    return conversation;
  }

  /**
   * Save a user message, run inference through AiService, save the response, and return it
   */
  async createMessage(conversationId: string, userId: string, messageContent: string) {
    // 1. Verify conversation exists and belongs to the user
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId, userId, isActive: true },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID "${conversationId}" not found`);
    }

    // 2. Save user message
    await this.prisma.message.create({
      data: {
        conversationId,
        role: 'USER',
        content: messageContent,
      },
    });

    // 3. Query knowledge base
    this.logger.log(`Knowledge search executed for query: "${messageContent.substring(0, 50)}..."`);
    const searchResults = await this.knowledgeService.searchKnowledge(messageContent);
    const maxContextChars = this.configService.get<number>('search.maxContextChars') ?? 4000;

    this.logger.log(`Number of retrieved chunks: ${searchResults ? searchResults.length : 0}`);
    if (searchResults) {
      for (const chunk of searchResults) {
        this.logger.debug(`  → score=${chunk.score?.toFixed(4)} file="${chunk.fileName}" chunkIndex=${chunk.chunkIndex}`);
      }
    }

    let contextBlock = '';
    const sources: Array<{ fileId: string; fileName: string; chunkId: string; chunkIndex: number; score: number }> = [];

    if (searchResults && searchResults.length > 0) {
      for (const chunk of searchResults) {
        const chunkString = `[Source: ${chunk.fileName}]\n${chunk.content}\n\n`;
        sources.push({
          fileId: chunk.fileId,
          fileName: chunk.fileName,
          chunkId: chunk.chunkId,
          chunkIndex: chunk.chunkIndex,
          score: chunk.score,
        });
        contextBlock += chunkString;
      }

      // Truncate the final combined context to the configured limit
      if (contextBlock.length > maxContextChars) {
        contextBlock = contextBlock.substring(0, maxContextChars);
      }
    }

    // Prepend context to the Gemini prompt if available
    const promptLengthBefore = messageContent.length;
    let prompt = messageContent;
    if (contextBlock.trim()) {
      this.logger.log('Mode selected: RAG mode');
      prompt = `You are a helpful and knowledgeable AI assistant. I have retrieved some context from my knowledge base that might be relevant to the user's question. 
Please prioritize the provided context when answering. However, if the context does not fully address the question, you are encouraged to use your general reasoning and broader knowledge to provide a complete and helpful answer.

Context:
${contextBlock}

Question: ${messageContent}
Answer:`;
    } else {
      this.logger.log('Mode selected: General Chat mode');
      prompt = messageContent;
    }

    // 4. Call AI Service
    const aiResponse = await this.aiService.chat(prompt);

    // 5. Save assistant response
    const assistantMessage = await this.prisma.message.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content: aiResponse.response,
        metadata: {
          model: aiResponse.model,
          createdAt: aiResponse.createdAt,
          totalDuration: aiResponse.totalDuration,
          evalCount: aiResponse.evalCount,
          fallbackUsed: aiResponse.fallbackUsed,
          fallbackProvider: aiResponse.fallbackProvider,
          providerUnavailable: aiResponse.providerUnavailable,
          attemptedProviders: aiResponse.attemptedProviders,
          sources: sources.length > 0 ? sources : undefined,
        },
      },
    });

    // 6. Update conversation timestamp
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return assistantMessage;
  }
}
