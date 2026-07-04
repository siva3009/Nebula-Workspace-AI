import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProviderManager } from '../ai/provider.manager';
import { CodeReviewResponseDto } from './dto/code-review-response.dto';
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
export class CodeReviewService {
  private readonly logger = new Logger(CodeReviewService.name);

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

  async analyze(file: Express.Multer.File): Promise<CodeReviewResponseDto> {
    const context = await this.analysisContextService.createContext(file);
    try {
      return await this.analyzeContext(context);
    } finally {
      this.cleanupService.cleanup(context.tempDir);
    }
  }

  async analyzeContext(context: AnalysisContext): Promise<CodeReviewResponseDto> {
    return await this.queryGeminiReview(context.sourceFiles, context.configFilesContent);
  }

  private async queryGeminiReview(
    sourceFiles: Record<string, string>,
    configFiles: Record<string, string>,
  ): Promise<CodeReviewResponseDto> {
    const model = this.configService.get<string>('gemini.model') || 'gemini-2.5-flash';

    // Delegate prompt generation to the PromptBuilderService
    const prompt = this.promptBuilderService.buildCodeReviewPrompt({
      sourceFiles,
      configFiles,
    });

    this.logger.log(`Invoking AI via ProviderManager for Code Quality Review... Model: ${model}`);

    try {
      const response = await this.providerManager.chat(prompt, model, 'gemini');
      const responseText = response.response;

      if (!responseText) {
        throw new Error('AI returned an empty response.');
      }

      this.logger.debug(`AI code review response received (length: ${responseText.length})`);

      // Clean markdown code blocks from response if present
      let cleanedJson = responseText.trim();
      if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```(json)?\s*/, '');
        cleanedJson = cleanedJson.replace(/\s*```$/, '');
      }
      cleanedJson = cleanedJson.trim();

      // Parse JSON directly
      const result: CodeReviewResponseDto = JSON.parse(cleanedJson);
      return result;

    } catch (err: any) {
      const errMsg = err.message;
      this.logger.error(`AI code review failed: ${errMsg}`);
      throw new Error(`AI Code Review failed: ${errMsg}`);
    }
  }
}
