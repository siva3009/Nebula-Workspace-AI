import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProviderManager } from '../ai/provider.manager';
import { BugAnalysisResponseDto } from './dto/bug-analysis-response.dto';
import {
  ArchiveService,
  TraversalService,
  ProfilingService,
  SourceReaderService,
  PromptBuilderService,
  CleanupService,
  AnalysisContext,
  AnalysisContextService,
} from '../analysis-core';

@Injectable()
export class BugDetectorService {
  private readonly logger = new Logger(BugDetectorService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly archiveService: ArchiveService,
    private readonly traversalService: TraversalService,
    private readonly profilingService: ProfilingService,
    private readonly sourceReaderService: SourceReaderService,
    private readonly promptBuilderService: PromptBuilderService,
    private readonly cleanupService: CleanupService,
    private readonly providerManager: ProviderManager,
    private readonly analysisContextService: AnalysisContextService,
  ) {}

  async analyze(file: Express.Multer.File): Promise<BugAnalysisResponseDto> {
    const context = await this.analysisContextService.createContext(file);
    try {
      return await this.analyzeContext(context);
    } finally {
      this.cleanupService.cleanup(context.tempDir);
    }
  }

  async analyzeContext(context: AnalysisContext): Promise<BugAnalysisResponseDto> {
    return await this.queryGeminiBugAnalysis(context.sourceFiles, context.configFilesContent);
  }

  private async queryGeminiBugAnalysis(
    sourceFiles: Record<string, string>,
    configFiles: Record<string, string>,
  ): Promise<BugAnalysisResponseDto> {
    const model = this.configService.get<string>('gemini.model') || 'gemini-3.5-flash';

    // Delegate prompt generation to the PromptBuilderService
    const prompt = this.promptBuilderService.buildBugAnalysisPrompt({
      sourceFiles,
      configFiles,
    });

    this.logger.log(`Invoking AI via ProviderManager for Bug Analysis... Model: ${model}`);

    try {
      const response = await this.providerManager.chat(prompt, model, 'gemini');
      const responseText = response.response;

      if (!responseText) {
        throw new Error('AI returned an empty response.');
      }

      this.logger.debug(`AI bug analysis response received (length: ${responseText.length})`);

      // Clean markdown code blocks from response if present
      let cleanedJson = responseText.trim();
      if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```(json)?\s*/, '');
        cleanedJson = cleanedJson.replace(/\s*```$/, '');
      }
      cleanedJson = cleanedJson.trim();

      // Parse JSON directly
      const result: BugAnalysisResponseDto = JSON.parse(cleanedJson);
      return result;

    } catch (err: any) {
      const errMsg = err.message;
      this.logger.error(`AI bug analysis failed: ${errMsg}`);
      throw new Error(`AI Bug Analysis failed: ${errMsg}`);
    }
  }
}
