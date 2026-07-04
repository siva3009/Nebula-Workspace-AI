import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProjectAnalyzerService } from '../project-analyzer/project-analyzer.service';
import { BugDetectorService } from '../bug-detector/bug-detector.service';
import { CodeReviewService } from '../code-review/code-review.service';
import { SecurityAuditService } from '../security-audit/security-audit.service';
import { AnalysisReportService } from './analysis-report.service';
import { DocumentationGeneratorService } from '../documentation-generator/documentation-generator.service';
import { AnalysisContextService, CleanupService } from '../analysis-core';
import { UnifiedAnalysisResponseDto } from './dto/unified-analysis.dto';
import { Role } from '@prisma/client';
import * as path from 'path';

class ConcurrencyLimiter {
  private activeCount = 0;
  private queue: (() => void)[] = [];

  constructor(private readonly limit: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.activeCount >= this.limit) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.activeCount++;
    try {
      return await fn();
    } finally {
      this.activeCount--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        if (next) next();
      }
    }
  }
}

@Injectable()
export class UnifiedAnalysisService {
  private readonly logger = new Logger(UnifiedAnalysisService.name);
  private readonly limiter = new ConcurrencyLimiter(2);

  constructor(
    private readonly prisma: PrismaService,
    private readonly projectAnalyzerService: ProjectAnalyzerService,
    private readonly bugDetectorService: BugDetectorService,
    private readonly codeReviewService: CodeReviewService,
    private readonly securityAuditService: SecurityAuditService,
    private readonly analysisReportService: AnalysisReportService,
    private readonly documentationGeneratorService: DocumentationGeneratorService,
    private readonly analysisContextService: AnalysisContextService,
    private readonly cleanupService: CleanupService,
  ) {}
  private async executeWithRetry<T>(taskName: string, action: () => Promise<T>, retries = 3, delayMs = 3000): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.logger.log(`Executing ${taskName} (Attempt ${attempt}/${retries})...`);
        return await action();
      } catch (error: any) {
        const errorMsg = error?.message || '';
        const isTransient = 
          errorMsg.toLowerCase().includes('rate limit') || 
          errorMsg.toLowerCase().includes('quota') || 
          errorMsg.toLowerCase().includes('timeout') || 
          errorMsg.toLowerCase().includes('high demand') ||
          errorMsg.toLowerCase().includes('resource exhausted') ||
          errorMsg.toLowerCase().includes('exhausted') ||
          errorMsg.toLowerCase().includes('429');

        if (isTransient && attempt < retries) {
          const sleepTime = delayMs * attempt;
          this.logger.warn(`Transient error in ${taskName}: ${errorMsg}. Retrying in ${sleepTime}ms...`);
          await new Promise((resolve) => setTimeout(resolve, sleepTime));
        } else {
          this.logger.error(`Permanent error or exhausted retries in ${taskName}: ${errorMsg}`);
          throw error;
        }
      }
    }
    throw new Error(`Failed execution of ${taskName} after ${retries} attempts.`);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async runUnifiedAnalysis(userId: string, file: Express.Multer.File): Promise<UnifiedAnalysisResponseDto> {
    this.logger.log(`Starting unified single-pass analysis for file: ${file.originalname} (User: ${userId})`);
    const context = await this.analysisContextService.createContext(file);
    try {
      // 1. Run all 4 analyzers concurrently under the limiter, with retry protection and graceful fallbacks
      const [project, bugs, review, security] = await Promise.all([
        (async () => {
          try {
            return await this.limiter.run(() => this.executeWithRetry('Project Analysis', () => 
              this.projectAnalyzerService.analyzeContext(context)
            ));
          } catch (err: any) {
            this.logger.error(`Project analysis stage failed permanently: ${err.message}`);
            return {
              projectType: 'Generic',
              languages: [],
              frameworks: [],
              packageManager: 'Unknown',
              dependencies: {},
              architectureSummary: `Project analysis failed: ${err.message}`,
              technologyStackSummary: 'Technology stack analysis failed.',
              folderStructureOverview: 'Folder structure analysis failed.',
              recommendations: [],
              complexity: { score: 'Medium' as 'Low' | 'Medium' | 'High', filesCount: 0, linesEstimate: 'N/A', description: 'Complexity evaluation unavailable.' },
              risks: [],
              patterns: [],
              bestPractices: { adherenceScore: 100, detectedStrengths: [], improvementAreas: [] },
            };
          }
        })(),
        (async () => {
          try {
            return await this.limiter.run(() => this.executeWithRetry('Bug Detection', () => 
              this.bugDetectorService.analyzeContext(context)
            ));
          } catch (err: any) {
            this.logger.error(`Bug detection stage failed permanently: ${err.message}`);
            return {
              summary: `Bug analysis failed: ${err.message}`,
              overallRiskScore: 'Info' as 'Low' | 'Medium' | 'High' | 'Critical' | 'Info',
              estimatedFixEffort: 'Low' as 'Low' | 'Medium' | 'High',
              criticalBugs: [],
              warnings: [],
              securityIssues: [],
              performanceIssues: [],
              dependencyIssues: [],
              codeSmells: [],
              suggestedFixes: [],
            };
          }
        })(),
        (async () => {
          try {
            return await this.limiter.run(() => this.executeWithRetry('Code Quality Review', () => 
              this.codeReviewService.analyzeContext(context)
            ));
          } catch (err: any) {
            this.logger.error(`Code quality review stage failed permanently: ${err.message}`);
            return {
              overallCodeQualityScore: 100,
              maintainabilityScore: 100,
              architectureScore: 100,
              readabilityScore: 100,
              scalabilityScore: 100,
              technicalDebtScore: 0,
              projectMaturity: 'Production Ready' as 'Early Stage' | 'Intermediate' | 'Advanced' | 'Production Ready',
              estimatedRefactorEffort: 'Low' as 'Low' | 'Medium' | 'High',
              summary: `Code review failed: ${err.message}`,
              quickWins: [],
              highImpactImprovements: [],
              recommendedRefactorOrder: [],
              architectureIssues: [],
              maintainabilityIssues: [],
              readabilityIssues: [],
              scalabilityConcerns: [],
              bestPracticeViolations: [],
              refactoringSuggestions: [],
              folderStructureConcerns: [],
            };
          }
        })(),
        (async () => {
          try {
            return await this.limiter.run(() => this.executeWithRetry('Security Audit', () => 
              this.securityAuditService.auditContext(context)
            ));
          } catch (err: any) {
            this.logger.error(`Security audit stage failed permanently: ${err.message}`);
            return {
              summary: `Security audit failed: ${err.message}`,
              overallRiskLevel: 'Info' as 'Low' | 'Medium' | 'High' | 'Critical' | 'Info',
              securityScore: 100,
              criticalCount: 0,
              highCount: 0,
              mediumCount: 0,
              lowCount: 0,
              topRiskAreas: [],
              immediateActions: [],
              secretExposure: [],
              authenticationWeaknesses: [],
              authorizationWeaknesses: [],
              dependencyVulnerabilities: [],
              owaspTop10Risks: [],
              environmentConfigRisks: [],
              bestPracticeViolations: [],
              suggestedRemediations: [],
            };
          }
        })()
      ]);

      // 2. Compute aggregator report
      const aggregator = this.analysisReportService.computeReport(project, bugs, review, security);

      // 3. Generate all 7 documentation guides concurrently (throttled by the limiter)
      const generateGuide = async (name: string, generatorFn: () => Promise<string>, fallbackText: string): Promise<string> => {
        try {
          return await this.limiter.run(() => this.executeWithRetry(name, generatorFn));
        } catch (err: any) {
          this.logger.error(`${name} failed permanently: ${err.message}`);
          return fallbackText;
        }
      };

      const [readme, architecture, apiDocs, setupGuide, deploymentGuide, envVariablesGuide, developerOnboarding] = await Promise.all([
        generateGuide('README Generator', () => 
          this.documentationGeneratorService.generateReadme(context, aggregator)
        , 'Failed to generate README due to LLM constraints.'),
        generateGuide('Architecture Guide Generator', () => 
          this.documentationGeneratorService.generateArchitecture(context, aggregator)
        , 'Failed to generate Architecture Guide due to LLM constraints.'),
        generateGuide('API Docs Generator', () => 
          this.documentationGeneratorService.generateApiDocs(context, aggregator)
        , 'Failed to generate API Documentation due to LLM constraints.'),
        generateGuide('Setup Guide Generator', () => 
          this.documentationGeneratorService.generateSetupGuide(context, aggregator)
        , 'Failed to generate Setup Guide due to LLM constraints.'),
        generateGuide('Deployment Guide Generator', () => 
          this.documentationGeneratorService.generateDeploymentGuide(context, aggregator)
        , 'Failed to generate Deployment Guide due to LLM constraints.'),
        generateGuide('Environment Guide Generator', () => 
          this.documentationGeneratorService.generateEnvGuide(context, aggregator)
        , 'Failed to generate Environment Guide due to LLM constraints.'),
        generateGuide('Onboarding Guide Generator', () => 
          this.documentationGeneratorService.generateOnboardingGuide(context, aggregator)
        , 'Failed to generate Developer Onboarding Guide due to LLM constraints.')
      ]);

      const documentation = {
        readme,
        architecture,
        apiDocs,
        setupGuide,
        deploymentGuide,
        envVariablesGuide,
        developerOnboarding,
        generatedAt: new Date().toISOString(),
        projectType: context.projectType || 'Generic',
      };
      const healthScore = aggregator.projectHealthScore;
      const securityScore = aggregator.securityScore;
      const codeQualityScore = aggregator.codeQualityScore;
      const technicalDebtScore = aggregator.technicalDebtScore;
      
      const projectType = context.projectType || 'Generic';
      const languages = context.languages || [];
      const fileName = file.originalname;
      const fileSize = file.size;

      // Extract raw project name from file name (without extension)
      const baseName = fileName.replace(/\.[^/.]+$/, "");
      // Clean up base name (e.g. capitalize)
      const projectName = baseName.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

      // Construct short summary for History List UI
      const criticalCount = security.criticalCount || 0;
      const bugCount = bugs.criticalBugs?.length || 0;
      const summary = `Health ${healthScore} | Security ${securityScore} | Issues ${criticalCount + bugCount}`;

      const results = {
        aggregator,
        project,
        bugs,
        review,
        security,
        documentation,
      };

      // 4. Save results to database cache
      const cachedRecord = await this.prisma.analysisReportCache.create({
        data: {
          fileName,
          fileSize,
          projectName,
          projectType,
          languages,
          healthScore,
          securityScore,
          codeQualityScore,
          technicalDebtScore,
          analysisType: 'FULL_ANALYSIS',
          summary,
          ownerId: userId,
          isShared: true,
          results: results as any,
        },
      });

      return {
        id: cachedRecord.id,
        fileName: cachedRecord.fileName,
        fileSize: cachedRecord.fileSize,
        projectName: cachedRecord.projectName || undefined,
        projectType: cachedRecord.projectType,
        languages: cachedRecord.languages,
        healthScore: cachedRecord.healthScore,
        securityScore: cachedRecord.securityScore || undefined,
        codeQualityScore: cachedRecord.codeQualityScore || undefined,
        technicalDebtScore: cachedRecord.technicalDebtScore || undefined,
        analysisType: cachedRecord.analysisType,
        summary: cachedRecord.summary || undefined,
        createdAt: cachedRecord.createdAt.toISOString(),
        ...results,
      };
    } finally {
      // Make sure we run cleanup exactly once at the end
      await this.cleanupService.cleanup(context.tempDir);
    }
  }

  async getHistory(userId: string, userRole: Role) {
    this.logger.log(`Fetching lightweight analysis history... (User: ${userId}, Role: ${userRole})`);
    
    const whereClause: any = {};
    if (userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN) {
      whereClause.OR = [
        { ownerId: userId },
        { isShared: true },
        { ownerId: null },
      ];
    }

    return this.prisma.analysisReportCache.findMany({
      where: whereClause,
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        projectName: true,
        projectType: true,
        languages: true,
        healthScore: true,
        securityScore: true,
        codeQualityScore: true,
        technicalDebtScore: true,
        analysisType: true,
        summary: true,
        workspacePath: true,
        workspaceName: true,
        lastAnalyzedAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getDetails(id: string, userId: string, userRole: Role): Promise<UnifiedAnalysisResponseDto> {
    this.logger.log(`Fetching cached analysis details for ID: ${id}`);
    const record = await this.prisma.analysisReportCache.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException(`Analysis cache record not found for ID: ${id}`);
    }

    // Check permissions
    if (userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN) {
      if (!record.isShared && record.ownerId !== userId && record.ownerId !== null) {
        throw new ForbiddenException('You do not have permission to view this report');
      }
    }

    const cachedResults = record.results as any;

    return {
      id: record.id,
      fileName: record.fileName,
      fileSize: record.fileSize,
      projectName: record.projectName || undefined,
      projectType: record.projectType,
      languages: record.languages,
      healthScore: record.healthScore,
      securityScore: record.securityScore || undefined,
      codeQualityScore: record.codeQualityScore || undefined,
      technicalDebtScore: record.technicalDebtScore || undefined,
      analysisType: record.analysisType,
      summary: record.summary || undefined,
      workspacePath: record.workspacePath || undefined,
      workspaceName: record.workspaceName || undefined,
      lastAnalyzedAt: record.lastAnalyzedAt ? record.lastAnalyzedAt.toISOString() : undefined,
      createdAt: record.createdAt.toISOString(),
      aggregator: cachedResults.aggregator,
      project: cachedResults.project,
      bugs: cachedResults.bugs,
      review: cachedResults.review,
      security: cachedResults.security,
      documentation: cachedResults.documentation,
    };
  }

  async runWorkspaceAnalysis(userId: string, dirPath: string): Promise<UnifiedAnalysisResponseDto> {
    this.logger.log(`Starting unified local workspace analysis for path: ${dirPath} (User: ${userId})`);
    const context = await this.analysisContextService.createContextFromPath(dirPath);

    // 1. Run all 4 analyzers concurrently under the limiter, with retry protection and graceful fallbacks
    const [project, bugs, review, security] = await Promise.all([
      (async () => {
        try {
          return await this.limiter.run(() => this.executeWithRetry('Project Analysis', () => 
            this.projectAnalyzerService.analyzeContext(context)
          ));
        } catch (err: any) {
          this.logger.error(`Project analysis stage failed permanently: ${err.message}`);
          return {
            projectType: 'Generic',
            languages: [],
            frameworks: [],
            packageManager: 'Unknown',
            dependencies: {},
            architectureSummary: `Project analysis failed: ${err.message}`,
            technologyStackSummary: 'Technology stack analysis failed.',
            folderStructureOverview: 'Folder structure analysis failed.',
            recommendations: [],
            complexity: { score: 'Medium' as 'Low' | 'Medium' | 'High', filesCount: 0, linesEstimate: 'N/A', description: 'Complexity evaluation unavailable.' },
            risks: [],
            patterns: [],
            bestPractices: { adherenceScore: 100, detectedStrengths: [], improvementAreas: [] },
          };
        }
      })(),
      (async () => {
        try {
          return await this.limiter.run(() => this.executeWithRetry('Bug Detection', () => 
            this.bugDetectorService.analyzeContext(context)
          ));
        } catch (err: any) {
          this.logger.error(`Bug detection stage failed permanently: ${err.message}`);
          return {
            summary: `Bug analysis failed: ${err.message}`,
            overallRiskScore: 'Info' as 'Low' | 'Medium' | 'High' | 'Critical' | 'Info',
            estimatedFixEffort: 'Low' as 'Low' | 'Medium' | 'High',
            criticalBugs: [],
            warnings: [],
            securityIssues: [],
            performanceIssues: [],
            dependencyIssues: [],
            codeSmells: [],
            suggestedFixes: [],
          };
        }
      })(),
      (async () => {
        try {
          return await this.limiter.run(() => this.executeWithRetry('Code Quality Review', () => 
            this.codeReviewService.analyzeContext(context)
          ));
        } catch (err: any) {
          this.logger.error(`Code quality review stage failed permanently: ${err.message}`);
          return {
            overallCodeQualityScore: 100,
            maintainabilityScore: 100,
            architectureScore: 100,
            readabilityScore: 100,
            scalabilityScore: 100,
            technicalDebtScore: 0,
            projectMaturity: 'Production Ready' as 'Early Stage' | 'Intermediate' | 'Advanced' | 'Production Ready',
            estimatedRefactorEffort: 'Low' as 'Low' | 'Medium' | 'High',
            summary: `Code review failed: ${err.message}`,
            quickWins: [],
            highImpactImprovements: [],
            recommendedRefactorOrder: [],
            architectureIssues: [],
            maintainabilityIssues: [],
            readabilityIssues: [],
            scalabilityConcerns: [],
            bestPracticeViolations: [],
            refactoringSuggestions: [],
            folderStructureConcerns: [],
          };
        }
      })(),
      (async () => {
        try {
          return await this.limiter.run(() => this.executeWithRetry('Security Audit', () => 
            this.securityAuditService.auditContext(context)
          ));
        } catch (err: any) {
          this.logger.error(`Security audit stage failed permanently: ${err.message}`);
          return {
            summary: `Security audit failed: ${err.message}`,
            overallRiskLevel: 'Info' as 'Low' | 'Medium' | 'High' | 'Critical' | 'Info',
            securityScore: 100,
            criticalCount: 0,
            highCount: 0,
            mediumCount: 0,
            lowCount: 0,
            topRiskAreas: [],
            immediateActions: [],
            secretExposure: [],
            authenticationWeaknesses: [],
            authorizationWeaknesses: [],
            dependencyVulnerabilities: [],
            owaspTop10Risks: [],
            environmentConfigRisks: [],
            bestPracticeViolations: [],
            suggestedRemediations: [],
          };
        }
      })()
    ]);

    // 2. Compute aggregator report
    const aggregator = this.analysisReportService.computeReport(project, bugs, review, security);

    // 3. Generate all 7 documentation guides concurrently (throttled by the limiter)
    const generateGuide = async (name: string, generatorFn: () => Promise<string>, fallbackText: string): Promise<string> => {
      try {
        return await this.limiter.run(() => this.executeWithRetry(name, generatorFn));
      } catch (err: any) {
        this.logger.error(`${name} failed permanently: ${err.message}`);
        return fallbackText;
      }
    };

    const [readme, architecture, apiDocs, setupGuide, deploymentGuide, envVariablesGuide, developerOnboarding] = await Promise.all([
      generateGuide('README Generator', () => 
        this.documentationGeneratorService.generateReadme(context, aggregator)
      , 'Failed to generate README due to LLM constraints.'),
      generateGuide('Architecture Guide Generator', () => 
        this.documentationGeneratorService.generateArchitecture(context, aggregator)
      , 'Failed to generate Architecture Guide due to LLM constraints.'),
      generateGuide('API Docs Generator', () => 
        this.documentationGeneratorService.generateApiDocs(context, aggregator)
      , 'Failed to generate API Documentation due to LLM constraints.'),
      generateGuide('Setup Guide Generator', () => 
        this.documentationGeneratorService.generateSetupGuide(context, aggregator)
      , 'Failed to generate Setup Guide due to LLM constraints.'),
      generateGuide('Deployment Guide Generator', () => 
        this.documentationGeneratorService.generateDeploymentGuide(context, aggregator)
      , 'Failed to generate Deployment Guide due to LLM constraints.'),
      generateGuide('Environment Guide Generator', () => 
        this.documentationGeneratorService.generateEnvGuide(context, aggregator)
      , 'Failed to generate Environment Guide due to LLM constraints.'),
      generateGuide('Onboarding Guide Generator', () => 
        this.documentationGeneratorService.generateOnboardingGuide(context, aggregator)
      , 'Failed to generate Developer Onboarding Guide due to LLM constraints.')
    ]);

    const documentation = {
      readme,
      architecture,
      apiDocs,
      setupGuide,
      deploymentGuide,
      envVariablesGuide,
      developerOnboarding,
      generatedAt: new Date().toISOString(),
      projectType: context.projectType || 'Generic',
    };

    const healthScore = aggregator.projectHealthScore;
    const securityScore = aggregator.securityScore;
    const codeQualityScore = aggregator.codeQualityScore;
    const technicalDebtScore = aggregator.technicalDebtScore;
    
    const projectType = context.projectType || 'Generic';
    const languages = context.languages || [];
    
    // Resolve workspace name from directory path basename
    const resolvedPath = path.resolve(dirPath);
    const workspaceName = path.basename(resolvedPath) || 'Local Workspace';
    const fileName = workspaceName; // Fallback for list UI
    const fileSize = context.totalSize;

    // Capitalized/cleaned name
    const projectName = workspaceName.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

    // Construct short summary for History List UI
    const criticalCount = security.criticalCount || 0;
    const bugCount = bugs.criticalBugs?.length || 0;
    const summary = `Health ${healthScore} | Security ${securityScore} | Issues ${criticalCount + bugCount}`;

    const results = {
      aggregator,
      project,
      bugs,
      review,
      security,
      documentation,
    };

    // 4. Save results to database cache
    const lastAnalyzedAt = new Date();
    const cachedRecord = await this.prisma.analysisReportCache.create({
      data: {
        fileName,
        fileSize,
        projectName,
        projectType,
        languages,
        healthScore,
        securityScore,
        codeQualityScore,
        technicalDebtScore,
        analysisType: 'FULL_ANALYSIS',
        summary,
        workspacePath: resolvedPath,
        workspaceName,
        lastAnalyzedAt,
        ownerId: userId,
        results: results as any,
      },
    });

    return {
      id: cachedRecord.id,
      fileName: cachedRecord.fileName,
      fileSize: cachedRecord.fileSize,
      projectName: cachedRecord.projectName || undefined,
      projectType: cachedRecord.projectType,
      languages: cachedRecord.languages,
      healthScore: cachedRecord.healthScore,
      securityScore: cachedRecord.securityScore || undefined,
      codeQualityScore: cachedRecord.codeQualityScore || undefined,
      technicalDebtScore: cachedRecord.technicalDebtScore || undefined,
      analysisType: cachedRecord.analysisType,
      summary: cachedRecord.summary || undefined,
      workspacePath: cachedRecord.workspacePath || undefined,
      workspaceName: cachedRecord.workspaceName || undefined,
      lastAnalyzedAt: cachedRecord.lastAnalyzedAt ? cachedRecord.lastAnalyzedAt.toISOString() : undefined,
      createdAt: cachedRecord.createdAt.toISOString(),
      ...results,
    };
  }

  async deleteRecord(id: string, userId: string, userRole: Role) {
    this.logger.log(`Deleting cached analysis record: ${id}`);
    const record = await this.prisma.analysisReportCache.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException(`Analysis cache record not found for ID: ${id}`);
    }

    // Check permissions
    if (userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN) {
      if (record.ownerId !== userId && record.ownerId !== null) {
        throw new ForbiddenException('You do not have permission to delete this report');
      }
    }

    await this.prisma.analysisReportCache.delete({
      where: { id },
    });
    return { success: true };
  }
}

