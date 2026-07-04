import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { EmbeddingService } from './embedding.service';
import { QdrantService } from './qdrant.service';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly embeddingService: EmbeddingService,
    private readonly qdrantService: QdrantService,
  ) {}

  async getFiles() {
    return this.prisma.knowledgeFile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { chunks: true },
        },
      },
    });
  }

  async searchKnowledge(query: string, limit?: number) {
    const searchTopK = limit ?? this.configService.get<number>('search.topK') ?? 5;
    const scoreThreshold = this.configService.get<number>('search.scoreThreshold') ?? 0.7;

    this.logger.log(`[DIAGNOSTIC] searchKnowledge() called with query="${query}"`);

    // 1. Get query embedding
    const queryVector = await this.embeddingService.getEmbedding(query);
    this.logger.log(`[DIAGNOSTIC] Embedding length: ${queryVector.length}`);
    this.logger.log(`[DIAGNOSTIC] Configured score_threshold: ${scoreThreshold}`);

    // Show the exact Qdrant search request payload that would be sent with the configured threshold
    const qdrantUrl = this.configService.get<string>('qdrant.url') || 'http://localhost:6333';
    const collectionName = this.configService.get<string>('qdrant.collectionName') || 'nebula_knowledge';
    const exactPayload = {
      vector: (queryVector.slice(0, 5) as any[]).concat(['...']), // abbreviate vector for display in logs
      limit: searchTopK,
      score_threshold: scoreThreshold,
      with_payload: true,
    };
    this.logger.log(`[DIAGNOSTIC] Exact Qdrant search request endpoint: POST ${qdrantUrl}/collections/${collectionName}/points/search`);
    this.logger.log(`[DIAGNOSTIC] Exact Qdrant search request payload template: ${JSON.stringify(exactPayload)}`);

    // 2. Query Qdrant with threshold = 0.0 to retrieve raw results before filtering
    // Let's log the actual query payload (with 0.0 threshold)
    const queryPayload = {
      vector: (queryVector.slice(0, 5) as any[]).concat(['...']),
      limit: searchTopK,
      score_threshold: 0.0,
      with_payload: true,
    };
    this.logger.log(`[DIAGNOSTIC] Sending search request to Qdrant with 0.0 threshold: ${JSON.stringify(queryPayload)}`);

    const rawResults = await this.qdrantService.searchSimilar(queryVector, searchTopK, 0.0);
    this.logger.log(`[DIAGNOSTIC] Raw Qdrant result count: ${rawResults.length}`);

    const scoresBefore = rawResults.map(r => ({
      fileName: r.payload?.fileName,
      chunkIndex: r.payload?.chunkIndex,
      score: r.score
    }));
    this.logger.log(`[DIAGNOSTIC] Scores before filtering: ${JSON.stringify(scoresBefore, null, 2)}`);

    // 3. Temporarily disable threshold filtering OR set threshold to 0.0 for testing only
    const effectiveThreshold = 0.0;
    this.logger.log(`[DIAGNOSTIC] Applying effective score_threshold: ${effectiveThreshold}`);

    const filteredResults = rawResults.filter(r => r.score >= effectiveThreshold);
    
    const scoresAfter = filteredResults.map(r => ({
      fileName: r.payload?.fileName,
      chunkIndex: r.payload?.chunkIndex,
      score: r.score
    }));
    this.logger.log(`[DIAGNOSTIC] Scores after filtering: ${JSON.stringify(scoresAfter, null, 2)}`);

    // 4. Map points payload
    return filteredResults.map(result => ({
      fileId: result.payload?.fileId,
      fileName: result.payload?.fileName,
      chunkId: result.payload?.chunkId,
      chunkIndex: result.payload?.chunkIndex,
      score: result.score,
      content: result.payload?.content,
    }));
  }
}
