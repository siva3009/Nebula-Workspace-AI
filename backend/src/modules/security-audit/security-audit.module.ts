import { Module } from '@nestjs/common';
import { AnalysisCoreModule } from '../analysis-core/analysis-core.module';
import { AiModule } from '../ai/ai.module';
import { SecurityAuditController } from './security-audit.controller';
import { SecurityAuditService } from './security-audit.service';

@Module({
  imports: [AnalysisCoreModule, AiModule],
  controllers: [SecurityAuditController],
  providers: [SecurityAuditService],
  exports: [SecurityAuditService],
})
export class SecurityAuditModule {}
