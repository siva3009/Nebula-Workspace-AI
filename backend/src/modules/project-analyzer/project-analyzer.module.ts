import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProjectAnalyzerController } from './project-analyzer.controller';
import { ProjectAnalyzerService } from './project-analyzer.service';
import { AnalysisCoreModule } from '../analysis-core/analysis-core.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [ConfigModule, AnalysisCoreModule, AiModule],
  controllers: [ProjectAnalyzerController],
  providers: [ProjectAnalyzerService],
  exports: [ProjectAnalyzerService],
})
export class ProjectAnalyzerModule {}
