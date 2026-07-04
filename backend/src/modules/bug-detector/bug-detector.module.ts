import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnalysisCoreModule } from '../analysis-core/analysis-core.module';
import { AiModule } from '../ai/ai.module';
import { BugDetectorController } from './bug-detector.controller';
import { BugDetectorService } from './bug-detector.service';

@Module({
  imports: [ConfigModule, AnalysisCoreModule, AiModule],
  controllers: [BugDetectorController],
  providers: [BugDetectorService],
  exports: [BugDetectorService],
})
export class BugDetectorModule {}
