import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AnalysisContextService,
  CleanupService,
  PromptBuilderService,
  AnalysisContext,
} from '../analysis-core';
import { ProviderManager } from '../ai/provider.manager';
import { AnalysisReportService } from '../analysis-report/analysis-report.service';
import { DocumentationResponseDto } from './dto/documentation-response.dto';

@Injectable()
export class DocumentationGeneratorService {
  private readonly logger = new Logger(DocumentationGeneratorService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly analysisContextService: AnalysisContextService,
    private readonly analysisReportService: AnalysisReportService,
    private readonly promptBuilderService: PromptBuilderService,
    private readonly providerManager: ProviderManager,
    private readonly cleanupService: CleanupService,
  ) {}

  async generate(file: Express.Multer.File): Promise<DocumentationResponseDto> {
    this.logger.log(`Starting single-pass documentation generation for: ${file.originalname}`);
    const context = await this.analysisContextService.createContext(file);
    try {
      // Avoid duplicate context generation. Get report from pre-built context.
      const report = await this.analysisReportService.aggregateContext(context);

      // Run all 7 generation functions in parallel
      const [
        readme,
        architecture,
        apiDocs,
        setupGuide,
        deploymentGuide,
        envVariablesGuide,
        developerOnboarding,
      ] = await Promise.all([
        this.generateReadme(context, report),
        this.generateArchitecture(context, report),
        this.generateApiDocs(context, report),
        this.generateSetupGuide(context, report),
        this.generateDeploymentGuide(context, report),
        this.generateEnvGuide(context, report),
        this.generateOnboardingGuide(context, report),
      ]);

      const generatedAt = new Date().toISOString();
      const projectType = context.projectType || 'Generic';

      return {
        readme,
        architecture,
        apiDocs,
        setupGuide,
        deploymentGuide,
        envVariablesGuide,
        developerOnboarding,
        generatedAt,
        projectType,
      };
    } finally {
      // Cleanup MUST occur exactly once
      this.cleanupService.cleanup(context.tempDir);
    }
  }

  async generateReadme(context: AnalysisContext, report: any): Promise<string> {
    const prompt = this.promptBuilderService.buildReadmePrompt(context, report);
    return this.queryAi(prompt, 'README.md');
  }

  async generateArchitecture(context: AnalysisContext, report: any): Promise<string> {
    const prompt = this.promptBuilderService.buildArchitecturePrompt(context, report);
    return this.queryAi(prompt, 'ARCHITECTURE.md');
  }

  async generateApiDocs(context: AnalysisContext, report: any): Promise<string> {
    const prompt = this.promptBuilderService.buildApiDocsPrompt(context, report);
    return this.queryAi(prompt, 'API.md');
  }

  async generateSetupGuide(context: AnalysisContext, report: any): Promise<string> {
    const prompt = this.promptBuilderService.buildSetupGuidePrompt(context, report);
    return this.queryAi(prompt, 'SETUP.md');
  }

  async generateDeploymentGuide(context: AnalysisContext, report: any): Promise<string> {
    const prompt = this.promptBuilderService.buildDeploymentGuidePrompt(context, report);
    return this.queryAi(prompt, 'DEPLOYMENT.md');
  }

  async generateEnvGuide(context: AnalysisContext, report: any): Promise<string> {
    const prompt = this.promptBuilderService.buildEnvGuidePrompt(context, report);
    return this.queryAi(prompt, 'ENV.md');
  }

  async generateOnboardingGuide(context: AnalysisContext, report: any): Promise<string> {
    const prompt = this.promptBuilderService.buildOnboardingGuidePrompt(context, report);
    return this.queryAi(prompt, 'ONBOARDING.md');
  }

  private async queryAi(prompt: string, docName: string): Promise<string> {
    this.logger.log(`Generating document: ${docName}`);
    const model = this.configService.get<string>('gemini.model');
    try {
      const response = await this.providerManager.chat(prompt, model, 'gemini');
      return response.response || '';
    } catch (err: any) {
      this.logger.error(`Failed to generate ${docName}: ${err.message}`);
      return `*Failed to generate ${docName} due to AI service error: ${err.message}*`;
    }
  }
}
