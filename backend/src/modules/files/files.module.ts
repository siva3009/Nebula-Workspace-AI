import { Module } from '@nestjs/common';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [KnowledgeModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
