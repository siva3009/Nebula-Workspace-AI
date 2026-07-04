import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SourceReaderService {
  private readonly logger = new Logger(SourceReaderService.name);

  /**
   * Reads the content of source files (.ts, .tsx, .js, .jsx, etc.) from the workspace,
   * prioritizing main directories like 'src', 'app', or 'lib' up to a maximum payload size.
   */
  readSourceFiles(
    tempDir: string,
    filePaths: string[],
    maxPayloadSize = 150000,
  ): Record<string, string> {
    const sourceFilesContent: Record<string, string> = {};
    let accumulatedSize = 0;

    // Prioritize src, app, lib folders
    const sortedPaths = [...filePaths].sort((a, b) => {
      const getPriority = (filePath: string) => {
        const lower = filePath.toLowerCase();
        if (lower.startsWith('src/') || lower.startsWith('app/') || lower.startsWith('lib/')) {
          return 0;
        }
        return 1;
      };

      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return a.localeCompare(b);
    });

    for (const relPath of sortedPaths) {
      const ext = path.extname(relPath).toLowerCase();
      
      // Target primary programming / styling assets
      if (['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.cs', '.php'].includes(ext)) {
        const fullPath = path.join(tempDir, relPath);
        try {
          const stat = fs.statSync(fullPath);
          
          if (accumulatedSize + stat.size <= maxPayloadSize) {
            const content = fs.readFileSync(fullPath, 'utf8');
            sourceFilesContent[relPath] = content;
            accumulatedSize += stat.size;
          } else {
            this.logger.debug(`Size threshold of ${maxPayloadSize} reached. Skipping remaining files starting with ${relPath}.`);
            break;
          }
        } catch (e: any) {
          this.logger.warn(`Failed to read file ${relPath} contents: ${e.message}`);
        }
      }
    }

    return sourceFilesContent;
  }
}
