import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ArchiveService } from './archive.service';
import { TraversalService } from './traversal.service';
import { ProfilingService } from './profiling.service';
import { SourceReaderService } from './source-reader.service';
import * as fs from 'fs';
import * as path from 'path';

export interface AnalysisContext {
  tempDir: string;
  filePaths: string[];
  sourceFiles: Record<string, string>;
  configFilesContent: Record<string, string>;
  extensionCounts: Record<string, number>;
  projectType: string;
  packageManager: string;
  dependencies: Record<string, string>;
  frameworks: string[];
  languages: string[];
  totalFiles: number;
  totalSize: number;
}

@Injectable()
export class AnalysisContextService {
  private readonly logger = new Logger(AnalysisContextService.name);

  constructor(
    private readonly archiveService: ArchiveService,
    private readonly traversalService: TraversalService,
    private readonly profilingService: ProfilingService,
    private readonly sourceReaderService: SourceReaderService,
  ) {}

  async createContext(file: Express.Multer.File): Promise<AnalysisContext> {
    this.logger.log(`Building shared AnalysisContext for: ${file.originalname}`);
    const tempDir = await this.archiveService.extract(file);

    try {
      const filePaths = this.traversalService.traverse(tempDir);
      const profile = this.profilingService.profile(tempDir, filePaths);
      const sourceFiles = this.sourceReaderService.readSourceFiles(tempDir, filePaths);

      let totalSize = 0;
      const extensionCounts: Record<string, number> = {};

      for (const relPath of filePaths) {
        try {
          const fullPath = path.join(tempDir, relPath);
          const stat = fs.statSync(fullPath);
          totalSize += stat.size;

          const ext = path.extname(relPath).toLowerCase() || '[no extension]';
          extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
        } catch (e) {
          // ignore
        }
      }

      return {
        tempDir,
        filePaths,
        sourceFiles,
        configFilesContent: profile.configFilesContent,
        extensionCounts,
        projectType: profile.projectType,
        packageManager: profile.packageManager,
        dependencies: profile.dependencies,
        frameworks: profile.frameworks,
        languages: profile.languages,
        totalFiles: filePaths.length,
        totalSize,
      };
    } catch (error) {
      this.logger.error(`Failed to construct AnalysisContext: ${error}`);
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanupErr) {
        // ignore
      }
      throw error;
    }
  }

  async createContextFromPath(dirPath: string): Promise<AnalysisContext> {
    this.logger.log(`Building shared AnalysisContext for local path: ${dirPath}`);
    const resolvedPath = path.resolve(dirPath);
    
    if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isDirectory()) {
      throw new BadRequestException(`Invalid directory path: ${dirPath}`);
    }

    try {
      const filePaths = this.traversalService.traverse(resolvedPath);
      const profile = this.profilingService.profile(resolvedPath, filePaths);
      const sourceFiles = this.sourceReaderService.readSourceFiles(resolvedPath, filePaths);

      let totalSize = 0;
      const extensionCounts: Record<string, number> = {};

      for (const relPath of filePaths) {
        try {
          const fullPath = path.join(resolvedPath, relPath);
          const stat = fs.statSync(fullPath);
          totalSize += stat.size;

          const ext = path.extname(relPath).toLowerCase() || '[no extension]';
          extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
        } catch (e) {
          // ignore
        }
      }

      return {
        tempDir: resolvedPath,
        filePaths,
        sourceFiles,
        configFilesContent: profile.configFilesContent,
        extensionCounts,
        projectType: profile.projectType,
        packageManager: profile.packageManager,
        dependencies: profile.dependencies,
        frameworks: profile.frameworks,
        languages: profile.languages,
        totalFiles: filePaths.length,
        totalSize,
      };
    } catch (error) {
      this.logger.error(`Failed to construct AnalysisContext from path: ${error}`);
      throw error;
    }
  }
}
