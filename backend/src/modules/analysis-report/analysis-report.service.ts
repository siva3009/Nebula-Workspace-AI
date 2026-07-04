import { Injectable, Logger } from '@nestjs/common';
import { ProjectAnalyzerService } from '../project-analyzer/project-analyzer.service';
import { BugDetectorService } from '../bug-detector/bug-detector.service';
import { CodeReviewService } from '../code-review/code-review.service';
import { SecurityAuditService } from '../security-audit/security-audit.service';
import { AnalysisContextService, CleanupService, AnalysisContext } from '../analysis-core';
import { AnalysisReportResponseDto, RoadmapTask } from './dto/analysis-report.dto';
import { ProjectAnalysisResponseDto } from '../project-analyzer/dto/project-analysis-response.dto';
import { BugAnalysisResponseDto } from '../bug-detector/dto/bug-analysis-response.dto';
import { CodeReviewResponseDto } from '../code-review/dto/code-review-response.dto';
import { SecurityAuditResponseDto } from '../security-audit/dto/security-audit-response.dto';

@Injectable()
export class AnalysisReportService {
  private readonly logger = new Logger(AnalysisReportService.name);

  constructor(
    private readonly projectAnalyzerService: ProjectAnalyzerService,
    private readonly bugDetectorService: BugDetectorService,
    private readonly codeReviewService: CodeReviewService,
    private readonly securityAuditService: SecurityAuditService,
    private readonly analysisContextService: AnalysisContextService,
    private readonly cleanupService: CleanupService,
  ) {}

  async aggregate(file: Express.Multer.File): Promise<AnalysisReportResponseDto> {
    this.logger.log(`Starting master aggregated analysis for file: ${file.originalname}`);
    const context = await this.analysisContextService.createContext(file);
    try {
      return await this.aggregateContext(context);
    } finally {
      await this.cleanupService.cleanup(context.tempDir);
    }
  }

  async aggregateContext(context: AnalysisContext): Promise<AnalysisReportResponseDto> {
    this.logger.log(`Aggregating metrics for context: ${context.tempDir}`);

    // Execute all four analyzers in parallel sharing the same pre-built context
    const [projectResult, bugResult, codeResult, securityResult] = await Promise.all([
      this.projectAnalyzerService.analyzeContext(context),
      this.bugDetectorService.analyzeContext(context),
      this.codeReviewService.analyzeContext(context),
      this.securityAuditService.auditContext(context),
    ]);

    return this.computeReport(projectResult, bugResult, codeResult, securityResult);
  }

  computeReport(
    projectResult: ProjectAnalysisResponseDto,
    bugResult: BugAnalysisResponseDto,
    codeResult: CodeReviewResponseDto,
    securityResult: SecurityAuditResponseDto,
  ): AnalysisReportResponseDto {
    // 3. Compute scores with weighted health score algorithm
    const securityScore = securityResult.securityScore ?? 100;
    const codeQualityScore = codeResult.overallCodeQualityScore ?? 100;
    const technicalDebtScore = codeResult.technicalDebtScore ?? 0;

    const projectHealthScore = Math.round(
      securityScore * 0.40 +
      codeQualityScore * 0.35 +
      (100 - technicalDebtScore) * 0.25
    );

    // 4. Synthesize Executive Summary
    const executiveSummary = 
      `Codebase Type: ${projectResult.projectType || 'Generic'}. ` +
      `Built with ${projectResult.languages?.join(', ') || 'N/A'} utilizing ${projectResult.frameworks?.join(', ') || 'no major'} frameworks. ` +
      `Security posture is rated as "${securityResult.overallRiskLevel || 'Info'}" (Score: ${securityScore}/100) with ${securityResult.criticalCount || 0} critical and ${securityResult.highCount || 0} high vulnerability vectors. ` +
      `Code quality scored ${codeQualityScore}/100 with a technical debt value of ${technicalDebtScore}/100. ` +
      `Overall project maturity is considered "${codeResult.projectMaturity || 'Unknown'}".`;

    // 5. Compile Top Issues
    const topIssues: string[] = [];
    
    securityResult.secretExposure?.forEach(i => topIssues.push(`[Security] Exposed Secret in ${i.file}: ${i.description}`));
    securityResult.owaspTop10Risks?.filter(r => r.severity === 'Critical' || r.severity === 'High').forEach(i => topIssues.push(`[OWASP] ${i.owaspCategory || 'Risk'} in ${i.file}: ${i.description}`));
    bugResult.criticalBugs?.forEach(b => topIssues.push(`[Bug] Critical Bug in ${b.file}: ${b.description}`));
    codeResult.architectureIssues?.filter(a => a.severity === 'Critical' || a.severity === 'High').forEach(i => topIssues.push(`[Architecture] Issue in ${i.file}: ${i.description}`));

    if (topIssues.length === 0) {
      topIssues.push('No critical or high-severity security, bug, or architectural issues detected.');
    }

    // 6. Compile Recommended Actions
    const recommendedActionsSet = new Set<string>();
    securityResult.immediateActions?.forEach(a => recommendedActionsSet.add(a));
    bugResult.suggestedFixes?.forEach(f => recommendedActionsSet.add(`Fix bug in ${f.file}: ${f.explanation}`));
    codeResult.quickWins?.forEach(w => recommendedActionsSet.add(w));
    projectResult.recommendations?.forEach(r => recommendedActionsSet.add(r));

    const recommendedActions = Array.from(recommendedActionsSet).slice(0, 10);

    // 7. Construct Prioritized Roadmap pipeline
    const roadmap: RoadmapTask[] = [];
    let priorityCounter = 1;

    // Priority 1: Immediate security mitigations
    securityResult.immediateActions?.forEach(action => {
      roadmap.push({ priority: priorityCounter++, task: `[Security] ${action}` });
    });

    // Priority 2: Critical runtime bugs
    bugResult.criticalBugs?.forEach(bug => {
      roadmap.push({ priority: priorityCounter++, task: `[Bug Fix] Resolve critical issue in ${bug.file}: ${bug.description}` });
    });

    // Priority 3: Code quality quick wins
    codeResult.quickWins?.forEach(win => {
      roadmap.push({ priority: priorityCounter++, task: `[Quality Quick Win] ${win}` });
    });

    // Priority 4: Structural refactors
    codeResult.highImpactImprovements?.forEach(imp => {
      roadmap.push({ priority: priorityCounter++, task: `[Refactor] ${imp}` });
    });

    return {
      projectHealthScore,
      securityScore,
      codeQualityScore,
      technicalDebtScore,
      executiveSummary,
      topIssues,
      recommendedActions,
      roadmap: roadmap.slice(0, 12),
    };
  }
}
