import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnalysisCoreModule } from '../analysis-core/analysis-core.module';
import { AiModule } from '../ai/ai.module';
import { CodeReviewController } from './code-review.controller';
import { CodeReviewService } from './code-review.service';

@Module({
  imports: [ConfigModule, AnalysisCoreModule, AiModule],
  controllers: [CodeReviewController],
  providers: [CodeReviewService],
  exports: [CodeReviewService],
})
export class CodeReviewModule {}
