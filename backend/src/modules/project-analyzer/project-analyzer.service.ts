import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProviderManager } from '../ai/provider.manager';
import { ProjectAnalysisResponseDto } from './dto/project-analysis-response.dto';
import {
  ArchiveService,
  TraversalService,
  ProfilingService,
  PromptBuilderService,
  CleanupService,
  AnalysisContext,
  AnalysisContextService,
} from '../analysis-core';

@Injectable()
export class ProjectAnalyzerService {
  private readonly logger = new Logger(ProjectAnalyzerService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly archiveService: ArchiveService,
    private readonly traversalService: TraversalService,
    private readonly profilingService: ProfilingService,
    private readonly promptBuilderService: PromptBuilderService,
    private readonly cleanupService: CleanupService,
    private readonly providerManager: ProviderManager,
    private readonly analysisContextService: AnalysisContextService,
  ) {}

  async analyze(file: Express.Multer.File): Promise<ProjectAnalysisResponseDto> {
    const context = await this.analysisContextService.createContext(file);
    try {
      return await this.analyzeContext(context);
    } finally {
      this.cleanupService.cleanup(context.tempDir);
    }
  }

  async analyzeContext(context: AnalysisContext): Promise<ProjectAnalysisResponseDto> {
    const outlinePaths = context.filePaths.slice(0, 150);
    const directoryStructureStr = outlinePaths.join('\n');
    const hasMoreFiles = context.filePaths.length > 150;

    return await this.queryGeminiAnalysis({
      projectType: context.projectType,
      detectedLanguages: context.languages,
      detectedFrameworks: context.frameworks,
      detectedPackageManager: context.packageManager,
      detectedDependencies: context.dependencies,
      totalFiles: context.totalFiles,
      totalSize: context.totalSize,
      directoryStructureStr,
      hasMoreFiles,
      configFilesContent: context.configFilesContent,
    });
  }

  private async queryGeminiAnalysis(params: {
    projectType: string;
    detectedLanguages: string[];
    detectedFrameworks: string[];
    detectedPackageManager: string;
    detectedDependencies: Record<string, string>;
    totalFiles: number;
    totalSize: number;
    directoryStructureStr: string;
    hasMoreFiles: boolean;
    configFilesContent: Record<string, string>;
  }): Promise<ProjectAnalysisResponseDto> {
    const model = this.configService.get<string>('gemini.model') || 'gemini-3.5-flash';

    // Delegate prompt generation to the PromptBuilderService
    const prompt = this.promptBuilderService.buildProjectAnalysisPrompt(params);

    this.logger.log(`Invoking AI via ProviderManager for Project Analysis... Model: ${model}`);

    try {
      const response = await this.providerManager.chat(prompt, model, 'gemini');
      const responseText = response.response;

      if (!responseText) {
        throw new Error('AI returned an empty response.');
      }

      this.logger.debug(`AI response received (length: ${responseText.length})`);

      // Clean markdown code blocks from response if present
      let cleanedJson = responseText.trim();
      if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```(json)?\s*/, '');
        cleanedJson = cleanedJson.replace(/\s*```$/, '');
      }
      cleanedJson = cleanedJson.trim();

      // Parse JSON directly
      const result: ProjectAnalysisResponseDto = JSON.parse(cleanedJson);
      return result;

    } catch (err: any) {
      const errMsg = err.message;
      this.logger.error(`AI query failed: ${errMsg}`);
      throw new Error(`AI Analysis failed: ${errMsg}`);
    }
  }
}
