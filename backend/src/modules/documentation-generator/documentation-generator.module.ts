import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocumentationGeneratorController } from './documentation-generator.controller';
import { DocumentationGeneratorService } from './documentation-generator.service';
import { AnalysisCoreModule } from '../analysis-core/analysis-core.module';
import { AnalysisReportModule } from '../analysis-report/analysis-report.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    ConfigModule,
    AnalysisCoreModule,
    AnalysisReportModule,
    AiModule,
  ],
  controllers: [DocumentationGeneratorController],
  providers: [DocumentationGeneratorService],
  exports: [DocumentationGeneratorService],
})
export class DocumentationGeneratorModule {}
