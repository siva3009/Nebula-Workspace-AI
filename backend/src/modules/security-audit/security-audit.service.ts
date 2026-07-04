import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { ProviderManager } from '../ai/provider.manager';
import { SecurityAuditResponseDto } from './dto/security-audit-response.dto';

@Injectable()
export class SecurityAuditService {
  private readonly logger = new Logger(SecurityAuditService.name);

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

  async audit(file: Express.Multer.File): Promise<SecurityAuditResponseDto> {
    const context = await this.analysisContextService.createContext(file);
    try {
      return await this.auditContext(context);
    } finally {
      this.cleanupService.cleanup(context.tempDir);
    }
  }

  async auditContext(context: AnalysisContext): Promise<SecurityAuditResponseDto> {
    this.logger.log('Starting audit from shared AnalysisContext...');
    
    // 1. Construct prompt
    const prompt = this.promptBuilderService.buildSecurityAuditPrompt({
      sourceFiles: context.sourceFiles,
      configFiles: context.configFilesContent,
    });

    // 2. Query the Gemini model via ProviderManager
    const activeModel = this.configService.get<string>('gemini.model') || 'gemini-2.5-flash';
    this.logger.log(`Querying Gemini model for security audit... Model: ${activeModel}`);
    const response = await this.providerManager.chat(prompt, activeModel, 'gemini');
    
    const responseText = response.response;
    if (!responseText) {
      throw new Error('Gemini API returned an empty response.');
    }

    // Clean markdown code blocks from response if present
    let cleanedJson = responseText.trim();
    if (cleanedJson.startsWith('```')) {
      // Strip leading ```json or ```
      cleanedJson = cleanedJson.replace(/^```(json)?\s*/, '');
      // Strip trailing ```
      cleanedJson = cleanedJson.replace(/\s*```$/, '');
    }
    cleanedJson = cleanedJson.trim();

    this.logger.debug(`Cleaned Gemini response length: ${cleanedJson.length}`);

    // 3. Parse result and return DTO
    const result: SecurityAuditResponseDto = JSON.parse(cleanedJson);
    
    // Ensure numerical counters match array contents if Gemini gets it wrong
    result.criticalCount = result.criticalCount ?? 0;
    result.highCount = result.highCount ?? 0;
    result.mediumCount = result.mediumCount ?? 0;
    result.lowCount = result.lowCount ?? 0;

    return result;
  }
}
