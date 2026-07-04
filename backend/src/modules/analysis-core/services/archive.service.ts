import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';

@Injectable()
export class ArchiveService {
  private readonly logger = new Logger(ArchiveService.name);
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('storage.localPath') || './uploads';
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Extracts the uploaded file buffer to a unique temporary workspace directory
   * and returns the absolute path to the directory.
   */
  async extract(file: Express.Multer.File): Promise<string> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file upload. No file buffer found.');
    }

    const uniqueId = `workspace-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const tempDir = path.join(this.uploadDir, uniqueId);

    try {
      fs.mkdirSync(tempDir, { recursive: true });
      this.logger.log(`Extracting archive to temporary workspace: ${tempDir}`);
      
      const zip = new AdmZip(file.buffer);
      zip.extractAllTo(tempDir, true);
      
      return tempDir;
    } catch (error: any) {
      this.logger.error(`Failed to extract ZIP archive: ${error.message}`);
      // Clean up directory if created
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      throw new BadRequestException(`Failed to process ZIP archive: ${error.message}`);
    }
  }
}
