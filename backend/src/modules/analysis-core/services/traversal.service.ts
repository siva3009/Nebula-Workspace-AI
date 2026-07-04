import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TraversalService {
  private readonly logger = new Logger(TraversalService.name);

  /**
   * Recursively discovers all files in the given directory, excluding dependency and build outputs.
   * Returns list of relative file paths.
   */
  traverse(tempDir: string): string[] {
    const filePaths: string[] = [];

    const ignoreDirs = new Set([
      'node_modules', 'dist', '.git', '.next', '.nuxt', 'build',
      'target', 'bin', 'obj', 'venv', '.venv', '__pycache__', 'out'
    ]);

    const traverseDir = (currentDir: string, relativePath = '') => {
      let items: string[];
      try {
        items = fs.readdirSync(currentDir);
      } catch (error: any) {
        this.logger.warn(`Failed to read directory ${currentDir}: ${error.message}`);
        return;
      }

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const relPath = relativePath ? `${relativePath}/${item}` : item;
        let stat: fs.Stats;
        
        try {
          stat = fs.statSync(fullPath);
        } catch (e) {
          // Skip broken symlinks or unresolvable paths
          continue;
        }

        if (stat.isDirectory()) {
          if (ignoreDirs.has(item)) {
            continue;
          }
          // Limit nesting depth to 10 to avoid stack overflow or infinite loops
          if (relPath.split('/').length > 10) {
            continue;
          }
          traverseDir(fullPath, relPath);
        } else if (stat.isFile()) {
          filePaths.push(relPath);
        }
      }
    };

    traverseDir(tempDir);
    return filePaths;
  }
}
