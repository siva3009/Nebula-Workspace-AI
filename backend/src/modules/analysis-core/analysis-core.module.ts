import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArchiveService } from './services/archive.service';
import { TraversalService } from './services/traversal.service';
import { ProfilingService } from './services/profiling.service';
import { SourceReaderService } from './services/source-reader.service';
import { CleanupService } from './services/cleanup.service';
import { PromptBuilderService } from './services/prompt-builder.service';
import { AnalysisContextService } from './services/analysis-context.service';

@Module({
  imports: [ConfigModule],
  providers: [
    ArchiveService,
    TraversalService,
    ProfilingService,
    SourceReaderService,
    CleanupService,
    PromptBuilderService,
    AnalysisContextService,
  ],
  exports: [
    ArchiveService,
    TraversalService,
    ProfilingService,
    SourceReaderService,
    CleanupService,
    PromptBuilderService,
    AnalysisContextService,
  ],
})
export class AnalysisCoreModule {}
