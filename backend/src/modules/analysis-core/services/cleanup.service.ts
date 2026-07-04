import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  /**
   * Safely deletes the temporary workspace directory.
   */
  cleanup(tempDir: string): void {
    if (!tempDir) return;
    
    try {
      if (fs.existsSync(tempDir)) {
        this.logger.log(`Cleaning up workspace directory: ${tempDir}`);
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (error: any) {
      this.logger.error(`Failed to cleanup directory ${tempDir}: ${error.message}`);
    }
  }
}
