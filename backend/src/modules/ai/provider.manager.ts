import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider, ChatProviderResponse } from './providers/base.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { GroqProvider } from './providers/groq.provider';
import { FutureLocalProvider } from './providers/local.provider';

@Injectable()
export class ProviderManager {
  private readonly logger = new Logger(ProviderManager.name);
  private readonly providers = new Map<string, AiProvider>();
  private activeProviderName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly geminiProvider: GeminiProvider,
    private readonly groqProvider: GroqProvider,
    private readonly localProvider: FutureLocalProvider,
  ) {
    // Register all providers
    this.providers.set(this.geminiProvider.name, this.geminiProvider);
    this.providers.set(this.groqProvider.name, this.groqProvider);
    this.providers.set(this.localProvider.name, this.localProvider);

    // Determine primary provider from configuration, defaulting to gemini
    this.activeProviderName = this.configService.get<string>('ai.provider', 'gemini').toLowerCase();
    
    if (!this.providers.has(this.activeProviderName)) {
      this.logger.warn(`Configured AI provider "${this.activeProviderName}" not found. Falling back to Gemini.`);
      this.activeProviderName = 'gemini';
    }

    this.logger.log(`AI Provider Manager initialized. Active provider: ${this.activeProviderName}`);
  }

  getProvider(name?: string): AiProvider {
    const targetName = (name || this.activeProviderName).toLowerCase();
    const provider = this.providers.get(targetName);
    if (!provider) {
      this.logger.warn(`AI Provider "${targetName}" not found. Falling back to active provider "${this.activeProviderName}".`);
      return this.providers.get(this.activeProviderName)!;
    }
    return provider;
  }

  async chat(prompt: string, model?: string, providerName?: string): Promise<ChatProviderResponse> {
    const primaryProvider = this.getProvider(providerName);
    const attempted: string[] = [];
    let lastError: any = null;

    // 1. If primary is Gemini, execute with 1x retry on 503/429 errors
    if (primaryProvider.name === 'gemini') {
      attempted.push('gemini');
      let attempts = 0;
      const maxAttempts = 2; // initial + 1 retry

      while (attempts < maxAttempts) {
        attempts++;
        try {
          this.logger.log(`Querying Gemini provider (attempt ${attempts}/${maxAttempts})...`);
          return await primaryProvider.chat(prompt, model);
        } catch (geminiError: any) {
          lastError = geminiError;
          const status = geminiError.response?.status || geminiError.status;
          const errorMsg = geminiError.message || '';
          
          const isTransient = 
            status === 429 || 
            status === 503 || 
            errorMsg.includes('429') ||
            errorMsg.includes('503') ||
            errorMsg.toLowerCase().includes('high demand') ||
            errorMsg.toLowerCase().includes('quota') ||
            errorMsg.toLowerCase().includes('rate limit') ||
            errorMsg.toLowerCase().includes('resource exhausted');

          if (isTransient && attempts < maxAttempts) {
            this.logger.warn(`Gemini transient failure: ${errorMsg}. Retrying in 1.5s...`);
            await new Promise((resolve) => setTimeout(resolve, 1500));
            continue;
          }
          
          // If we reached here, it either is non-transient or retries are exhausted.
          this.logger.error(`Gemini provider failed permanently on attempt ${attempts}: ${errorMsg}`);
          break;
        }
      }
    } else {
      // Direct pass-through for other primary providers
      attempted.push(primaryProvider.name);
      try {
        return await primaryProvider.chat(prompt, model);
      } catch (err: any) {
        lastError = err;
        this.logger.error(`Primary provider "${primaryProvider.name}" failed: ${err.message}`);
      }
    }

    // 2. Fallback to Groq (if configured and not already attempted)
    if (!attempted.includes('groq')) {
      const groqApiKey = this.configService.get<string>('groq.apiKey') || '';
      if (groqApiKey.trim()) {
        attempted.push('groq');
        this.logger.warn('Gemini unavailable. Initiating Groq fallback...');
        try {
          const groq = this.getProvider('groq');
          const res = await groq.chat(prompt, model);
          return {
            ...res,
            fallbackUsed: true,
            fallbackProvider: 'groq',
          };
        } catch (groqError: any) {
          lastError = groqError;
          this.logger.error(`Groq fallback failed: ${groqError.message}`);
        }
      } else {
        this.logger.debug('Groq provider is not configured (missing api key), skipping.');
      }
    }

    // 3. Fallback to Local Provider (if configured and not already attempted)
    if (!attempted.includes('local')) {
      const localUrl = this.configService.get<string>('local.url') || '';
      if (localUrl.trim()) {
        attempted.push('local');
        this.logger.warn('Groq/Gemini unavailable. Initiating Local provider fallback...');
        try {
          const local = this.getProvider('local');
          const res = await local.chat(prompt, model);
          return {
            ...res,
            fallbackUsed: true,
            fallbackProvider: 'local',
          };
        } catch (localError: any) {
          lastError = localError;
          this.logger.error(`Local provider fallback failed: ${localError.message}`);
        }
      }
    }

    // 4. All providers failed or were unconfigured. 
    this.logger.error(`All AI providers are currently offline or unavailable. Attempted: ${attempted.join(', ')}`);
    
    // Throw the actual last provider exception to prevent suppression
    if (lastError) {
      throw lastError;
    }

    const schemaSafeResponse = this.getUnavailableResponseSchema(prompt, attempted);
    
    return {
      response: schemaSafeResponse,
      model: 'none',
      createdAt: new Date().toISOString(),
      fallbackUsed: false,
      providerUnavailable: true,
      attemptedProviders: attempted,
    };
  }

  /**
   * Helper to preserve expected DTO schemas when all providers are offline
   */
  private getUnavailableResponseSchema(prompt: string, attempted: string[]): string {
    const attemptedStr = attempted.join(', ');
    const errorMsg = `AI provider services are currently unavailable or overloaded (tried: ${attemptedStr}). Please check your API credentials or try again later.`;

    if (prompt.toLowerCase().includes('json') || prompt.toLowerCase().includes('schema')) {
      if (prompt.toLowerCase().includes('buganalysis') || prompt.toLowerCase().includes('bug detection')) {
        return JSON.stringify({
          summary: errorMsg,
          overallRiskScore: "Info",
          estimatedFixEffort: "Low",
          criticalBugs: [],
          warnings: [],
          securityIssues: [],
          performanceIssues: [],
          dependencyIssues: [],
          codeSmells: [],
          suggestedFixes: []
        });
      } else if (prompt.toLowerCase().includes('securityreport') || prompt.toLowerCase().includes('security audit')) {
        return JSON.stringify({
          summary: errorMsg,
          overallRiskLevel: "Info",
          securityScore: 0,
          criticalCount: 0,
          highCount: 0,
          mediumCount: 0,
          lowCount: 0,
          topRiskAreas: ["AI Providers Offline"],
          immediateActions: ["Verify your Gemini/Groq API keys in environment config"],
          secretExposure: [],
          authenticationWeaknesses: [],
          authorizationWeaknesses: [],
          dependencyVulnerabilities: [],
          owaspTop10Risks: [],
          environmentConfigRisks: [],
          bestPracticeViolations: [],
          suggestedRemediations: []
        });
      } else if (prompt.toLowerCase().includes('codereview') || prompt.toLowerCase().includes('code quality')) {
        return JSON.stringify({
          overallCodeQualityScore: 0,
          maintainabilityScore: 0,
          architectureScore: 0,
          readabilityScore: 0,
          scalabilityScore: 0,
          technicalDebtScore: 0,
          projectMaturity: "Early Stage",
          estimatedRefactorEffort: "Low",
          summary: errorMsg,
          quickWins: [],
          highImpactImprovements: [],
          recommendedRefactorOrder: [],
          architectureIssues: [],
          maintainabilityIssues: [],
          readabilityIssues: [],
          scalabilityConcerns: [],
          bestPracticeViolations: [],
          refactoringSuggestions: [],
          folderStructureConcerns: []
        });
      } else {
        // General project analysis DTO
        return JSON.stringify({
          projectType: "Unavailable",
          languages: [],
          frameworks: [],
          packageManager: "Unknown",
          dependencies: {},
          architectureSummary: errorMsg,
          technologyStackSummary: "Service offline.",
          folderStructureOverview: "Service offline.",
          recommendations: ["Ensure AI provider keys are set in environmental configuration"],
          complexity: { score: "Medium", filesCount: 0, linesEstimate: "N/A", description: errorMsg },
          risks: [],
          patterns: [],
          bestPractices: { adherenceScore: 0, detectedStrengths: [], improvementAreas: [] }
        });
      }
    }
    return errorMsg;
  }

  async checkHealth(providerName?: string): Promise<boolean> {
    const provider = this.getProvider(providerName);
    return provider.checkHealth();
  }
}
