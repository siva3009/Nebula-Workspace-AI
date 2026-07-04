import { Module } from '@nestjs/common';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { FileSystemService } from './file-system.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService, FileSystemService],
  exports: [WorkspaceService, FileSystemService],
})
export class WorkspaceModule {}
