import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CollaborationController } from './collaboration.controller';
import { CollaborationService } from './collaboration.service';
import { CollaborationBootstrapService } from './collaboration-bootstrap.service';

@Module({
  controllers: [CollaborationController],
  providers: [PrismaService, CollaborationService, CollaborationBootstrapService],
  exports: [CollaborationService],
})
export class CollaborationModule {}
