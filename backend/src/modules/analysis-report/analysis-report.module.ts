import { Module } from '@nestjs/common';
import { ProjectAnalyzerModule } from '../project-analyzer/project-analyzer.module';
import { BugDetectorModule } from '../bug-detector/bug-detector.module';
import { CodeReviewModule } from '../code-review/code-review.module';
import { SecurityAuditModule } from '../security-audit/security-audit.module';
import { AnalysisCoreModule } from '../analysis-core/analysis-core.module';
import { AnalysisReportService } from './analysis-report.service';

@Module({
  imports: [
    AnalysisCoreModule,
    ProjectAnalyzerModule,
    BugDetectorModule,
    CodeReviewModule,
    SecurityAuditModule,
  ],
  providers: [AnalysisReportService],
  exports: [AnalysisReportService],
})
export class AnalysisReportModule {}
