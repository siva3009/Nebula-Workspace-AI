import { Module } from '@nestjs/common';
import { AnalysisCoreModule } from '../analysis-core/analysis-core.module';
import { ProjectAnalyzerModule } from '../project-analyzer/project-analyzer.module';
import { BugDetectorModule } from '../bug-detector/bug-detector.module';
import { CodeReviewModule } from '../code-review/code-review.module';
import { SecurityAuditModule } from '../security-audit/security-audit.module';
import { DocumentationGeneratorModule } from '../documentation-generator/documentation-generator.module';
import { AnalysisReportModule } from './analysis-report.module';
import { UnifiedAnalysisService } from './unified-analysis.service';
import { UnifiedAnalysisController } from './unified-analysis.controller';

@Module({
  imports: [
    AnalysisCoreModule,
    ProjectAnalyzerModule,
    BugDetectorModule,
    CodeReviewModule,
    SecurityAuditModule,
    DocumentationGeneratorModule,
    AnalysisReportModule,
  ],
  controllers: [UnifiedAnalysisController],
  providers: [UnifiedAnalysisService],
  exports: [UnifiedAnalysisService],
})
export class UnifiedAnalysisModule {}
