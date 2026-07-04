import { Module } from '@nestjs/common';

import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { TextExtractorService } from './text-extractor.service';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { QdrantService } from './qdrant.service';
import { IngestionService } from './ingestion.service';

@Module({
  controllers: [KnowledgeController],
  providers: [
    KnowledgeService,
    TextExtractorService,
    ChunkingService,
    EmbeddingService,
    QdrantService,
    IngestionService,
  ],
  exports: [KnowledgeService, IngestionService],
})
export class KnowledgeModule {}
