import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

import { PrismaService } from '../../database/prisma.service';
import { IngestionService } from '../knowledge/ingestion.service';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly uploadDir: string;
  private readonly maxFileSizeMb: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly ingestionService: IngestionService,
  ) {
    this.uploadDir = this.configService.get<string>('storage.localPath') || './uploads';
    this.maxFileSizeMb = this.configService.get<number>('storage.maxFileSizeMb') || 25;
    
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async handleFileUpload(userId: string, file: Express.Multer.File) {
    // 1. Fetch configurable upload boundaries from storageConfig
    const maxUserUploads = this.configService.get<number>('storage.maxUserUploads') || 15;
    const maxConcurrentUploads = this.configService.get<number>('storage.maxConcurrentUploads') || 2;
    const maxFileSizeMb = this.configService.get<number>('storage.maxFileSizeMb') || 25;

    // 2. Validate file size limits
    const maxSizeBytes = maxFileSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException(`File size exceeds the configured limit of ${maxFileSizeMb} MB`);
    }

    // 3. Prevent abuse: check concurrent uploads limit (PENDING/PROCESSING status)
    const activeUploadsCount = await this.prisma.knowledgeFile.count({
      where: {
        userId,
        status: { in: ['PENDING', 'PROCESSING'] },
      },
    });
    if (activeUploadsCount >= maxConcurrentUploads) {
      throw new BadRequestException(`Too many concurrent uploads. Maximum is ${maxConcurrentUploads} active uploads.`);
    }

    // 4. Prevent abuse: check per-user cumulative upload limits
    const userUploadsCount = await this.prisma.knowledgeFile.count({
      where: { userId },
    });
    if (userUploadsCount >= maxUserUploads) {
      throw new BadRequestException(`Upload limit reached. You can upload at most ${maxUserUploads} files.`);
    }

    const originalName = file.originalname;
    const mimeType = file.mimetype;
    const size = file.size;

    // Generate unique name to avoid collisions
    const uniqueId = Math.random().toString(36).substring(2, 15) + Date.now();
    const extension = path.extname(originalName);
    const uniqueFilename = `${uniqueId}${extension}`;
    const storagePath = path.join(this.uploadDir, uniqueFilename);

    // Save file buffer to local disk
    try {
      fs.writeFileSync(storagePath, file.buffer);
      this.logger.log(`Saved uploaded file to: ${storagePath} for user: ${userId}`);
    } catch (writeError: any) {
      this.logger.error(`Failed to write file to disk: ${writeError.message}`);
      throw new BadRequestException('Could not save uploaded file to disk');
    }

    // Create DB entry for KnowledgeFile associated with authenticated user
    const knowledgeFile = await this.prisma.knowledgeFile.create({
      data: {
        userId,
        filename: uniqueFilename,
        originalName,
        mimeType,
        size,
        storagePath,
        status: 'PENDING',
      },
    });

    // Run ingestion asynchronously in the background
    this.ingestionService.ingest(knowledgeFile.id).catch(err => {
      this.logger.error(`Ingestion failed for file ID ${knowledgeFile.id}:`, err);
    });

    return knowledgeFile;
  }
}
