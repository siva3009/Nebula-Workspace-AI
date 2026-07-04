import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChunkingService {
  private readonly logger = new Logger(ChunkingService.name);
  private readonly chunkSize: number;
  private readonly chunkOverlap: number;

  constructor(private readonly configService: ConfigService) {
    this.chunkSize = this.configService.get<number>('chunk.size') || 800;
    this.chunkOverlap = this.configService.get<number>('chunk.overlap') || 150;
  }

  async chunkText(text: string): Promise<string[]> {
    this.logger.log(`Chunking text (size: ${this.chunkSize}, overlap: ${this.chunkOverlap})`);
    if (!text) return [];

    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + this.chunkSize, text.length);
      const chunk = text.slice(start, end);
      chunks.push(chunk);

      if (end === text.length) {
        break;
      }

      start += (this.chunkSize - this.chunkOverlap);
    }

    return chunks;
  }
}
