import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import pdf = require('pdf-parse');

@Injectable()
export class TextExtractorService {
  private readonly logger = new Logger(TextExtractorService.name);

  async extractText(filePath: string, mimeType: string): Promise<string> {
    this.logger.log(`Extracting text from path: ${filePath}, mimeType: ${mimeType}`);
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
      }

      if (mimeType === 'application/pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const parsed = await (pdf as any)(dataBuffer);
        return parsed.text || '';
      }

      // Default for text/markdown or plain text
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error: any) {
      this.logger.error(`Error extracting text: ${error.message}`);
      throw error;
    }
  }
}
