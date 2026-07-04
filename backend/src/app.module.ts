import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AiModule } from './modules/ai/ai.module';
import { ChatModule } from './modules/chat/chat.module';
import { MemoryModule } from './modules/memory/memory.module';
import { FilesModule } from './modules/files/files.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AdminModule } from './modules/admin/admin.module';
import { ProjectAnalyzerModule } from './modules/project-analyzer/project-analyzer.module';
import { BugDetectorModule } from './modules/bug-detector/bug-detector.module';
import { AnalysisCoreModule } from './modules/analysis-core/analysis-core.module';
import { CodeReviewModule } from './modules/code-review/code-review.module';
import { SecurityAuditModule } from './modules/security-audit/security-audit.module';
import { AnalysisReportModule } from './modules/analysis-report/analysis-report.module';
import { DocumentationGeneratorModule } from './modules/documentation-generator/documentation-generator.module';
import { UnifiedAnalysisModule } from './modules/analysis-report/unified-analysis.module';
import { AppConfigModule } from './config/config.module';
import { HealthController } from './health.controller';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { WorkspaceModule } from './modules/workspace';

@Module({
  imports: [
    // ── Global Configuration ────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      cache: true,
    }),

    // ── Infrastructure ──────────────────────────────────────────
    AppConfigModule,
    DatabaseModule,

    // ── Feature Modules ─────────────────────────────────────────
    AuthModule,
    UsersModule,
    AiModule,
    ChatModule,
    MemoryModule,
    FilesModule,
    KnowledgeModule,
    SettingsModule,
    AdminModule,
    AnalysisCoreModule,
    ProjectAnalyzerModule,
    BugDetectorModule,
    CodeReviewModule,
    SecurityAuditModule,
    AnalysisReportModule,
    DocumentationGeneratorModule,
    UnifiedAnalysisModule,
    CollaborationModule,
    WorkspaceModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
