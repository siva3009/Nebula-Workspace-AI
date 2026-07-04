import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TextExtractorService } from './text-extractor.service';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { QdrantService } from './qdrant.service';
import { randomUUID } from 'crypto';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly extractor: TextExtractorService,
    private readonly chunker: ChunkingService,
    private readonly embedder: EmbeddingService,
    private readonly qdrant: QdrantService,
  ) {}

  async ingest(fileId: string) {
    this.logger.log(`Starting ingestion pipeline for file: ${fileId}`);
    
    // 1. Get file details
    const file = await this.prisma.knowledgeFile.findUnique({
      where: { id: fileId },
    });
    if (!file) {
      this.logger.error(`Knowledge file ${fileId} not found in database.`);
      return;
    }

    // 2. Set status to PROCESSING
    await this.prisma.knowledgeFile.update({
      where: { id: fileId },
      data: { status: 'PROCESSING' },
    });

    try {
      // 3. Extract text
      this.logger.log(`Extracting text from: ${file.storagePath}`);
      const text = await this.extractor.extractText(file.storagePath, file.mimeType);
      
      if (!text || !text.trim()) {
        throw new Error('Extracted text is empty');
      }

      // 4. Chunk text
      this.logger.log(`Chunking text...`);
      const chunks = await this.chunker.chunkText(text);
      this.logger.log(`Generated ${chunks.length} chunks.`);

      // 5. Generate embeddings and save chunks/vectors
      const points = [];
      this.logger.log(`Saving ${chunks.length} chunks to database...`);
      const dbChunks = await Promise.all(
        chunks.map((chunkText, idx) =>
          this.prisma.knowledgeChunk.create({
            data: {
              knowledgeFileId: fileId,
              chunkIndex: idx,
              content: chunkText,
            },
          })
        )
      );

      this.logger.log(`Generating batch embeddings for ${chunks.length} chunks...`);
      const batchSize = 100;
      let allVectors: number[][] = [];
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batchChunks = chunks.slice(i, i + batchSize);
        const vectors = await this.embedder.getEmbeddingsBatch(batchChunks);
        allVectors = allVectors.concat(vectors);
      }

      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        const dbChunk = dbChunks[i];
        const vector = allVectors[i];

        points.push({
          id: randomUUID(),
          vector,
          payload: {
            fileId: file.id,
            fileName: file.originalName,
            chunkId: dbChunk.id,
            chunkIndex: i,
            content: chunkText,
            createdAt: dbChunk.createdAt.toISOString(),
          },
        });
      }

      // 6. Save vectors to Qdrant
      this.logger.log(`Upserting points to Qdrant...`);
      await this.qdrant.upsertPoints(points);

      // 7. Update file status to READY
      await this.prisma.knowledgeFile.update({
        where: { id: fileId },
        data: { status: 'READY' },
      });
      
      this.logger.log(`Ingestion completed successfully for file: ${fileId}`);
    } catch (error: any) {
      this.logger.error(`Ingestion pipeline failed: ${error.message}`);
      
      // Update file status to ERROR
      await this.prisma.knowledgeFile.update({
        where: { id: fileId },
        data: { status: 'ERROR' },
      });
    }
  }
}
