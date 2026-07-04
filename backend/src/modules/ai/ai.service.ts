import { Injectable, Logger } from '@nestjs/common';
import { ProviderManager } from './provider.manager';
import type { ChatResponseDto } from './dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly providerManager: ProviderManager) {}

  /**
   * Send a chat message to the AI and return the response
   */
  async chat(message: string, model?: string): Promise<ChatResponseDto> {
    this.logger.log(`Chat request via ProviderManager → message_length=${message.length}, model_override=${model || 'none'}`);

    const result = await this.providerManager.chat(message, model);

    return {
      response: result.response,
      model: result.model,
      createdAt: result.createdAt,
      totalDuration: result.usage?.totalTokens, // Map token usage for display
      evalCount: result.usage?.completionTokens,
      fallbackUsed: result.fallbackUsed,
      fallbackProvider: result.fallbackProvider,
      providerUnavailable: result.providerUnavailable,
      attemptedProviders: result.attemptedProviders,
    };
  }

  /**
   * Check AI provider connectivity
   */
  async checkHealth(): Promise<{ gemini: boolean }> {
    const geminiOk = await this.providerManager.checkHealth('gemini');
    return {
      gemini: geminiOk,
    };
  }
}
