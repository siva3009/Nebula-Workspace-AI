import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CollaborationService } from './collaboration.service';
import { JwtAuthGuard, CurrentUser, JwtPayload, RolesGuard, Roles } from '../auth';
import {
  CreateCommentDto,
  CreateTaskDto,
  UpdateTaskDto,
  SetResolutionDto,
  ToggleShareDto,
  ChangeOwnerDto,
} from './dto/collaboration.dto';

@Controller('analysis')
@UseGuards(JwtAuthGuard)
export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  // ─── Share / Unshare Report ────────────────────────────────────────

  @Patch(':id/share')
  async toggleShare(
    @CurrentUser() user: JwtPayload,
    @Param('id') reportId: string,
    @Body() dto: ToggleShareDto,
  ) {
    return this.collaborationService.toggleShare(reportId, dto.isShared, user.sub, user.role);
  }

  @Patch(':id/owner')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async changeOwner(
    @CurrentUser() user: JwtPayload,
    @Param('id') reportId: string,
    @Body() dto: ChangeOwnerDto,
  ) {
    return this.collaborationService.changeOwner(reportId, dto.ownerId, user.sub, user.role);
  }

  // ─── Comments ──────────────────────────────────────────────────────

  @Get(':id/comments')
  async getComments(
    @CurrentUser() user: JwtPayload,
    @Param('id') reportId: string,
  ) {
    return this.collaborationService.getComments(reportId, user.sub, user.role);
  }

  @Post(':id/comments')
  async createComment(
    @CurrentUser() user: JwtPayload,
    @Param('id') reportId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.collaborationService.createComment(
      reportId,
      dto.userId,
      dto.content,
      user.sub,
      user.role,
      dto.filePath,
      dto.lineNumber,
      dto.findingId,
      dto.parentId,
    );
  }

  @Delete(':id/comments/:commentId')
  async deleteComment(
    @CurrentUser() user: JwtPayload,
    @Param('id') reportId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.collaborationService.deleteComment(reportId, commentId, user.sub, user.role);
  }

  // ─── Tasks ─────────────────────────────────────────────────────────

  @Get(':id/tasks')
  async getTasks(
    @CurrentUser() user: JwtPayload,
    @Param('id') reportId: string,
  ) {
    return this.collaborationService.getTasks(reportId, user.sub, user.role);
  }

  @Post(':id/tasks')
  async createTask(
    @CurrentUser() user: JwtPayload,
    @Param('id') reportId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.collaborationService.createTask(
      reportId,
      dto.creatorId,
      dto.title,
      user.sub,
      user.role,
      dto.description,
      dto.assigneeId,
      dto.filePath,
      dto.findingId,
    );
  }

  @Patch(':id/tasks/:taskId')
  async updateTask(
    @CurrentUser() user: JwtPayload,
    @Param('id') reportId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.collaborationService.updateTask(
      reportId,
      taskId,
      dto.userId,
      {
        status: dto.status,
        assigneeId: dto.assigneeId,
      },
      user.sub,
      user.role,
    );
  }

  @Delete(':id/tasks/:taskId')
  async deleteTask(
    @CurrentUser() user: JwtPayload,
    @Param('id') reportId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.collaborationService.deleteTask(reportId, taskId, user.sub, user.role);
  }

  // ─── Resolutions ───────────────────────────────────────────────────

  @Get(':id/resolutions')
  async getResolutions(
    @CurrentUser() user: JwtPayload,
    @Param('id') reportId: string,
  ) {
    return this.collaborationService.getResolutions(reportId, user.sub, user.role);
  }

  @Put(':id/resolutions')
  async setResolution(
    @CurrentUser() user: JwtPayload,
    @Param('id') reportId: string,
    @Body() dto: SetResolutionDto,
  ) {
    return this.collaborationService.setResolution(
      reportId,
      dto.findingId,
      dto.status,
      dto.notes ?? null,
      dto.userId,
      user.sub,
      user.role,
    );
  }

  // ─── Timeline / Logs ──────────────────────────────────────────────

  @Get(':id/activity')
  async getActivityTimeline(
    @CurrentUser() user: JwtPayload,
    @Param('id') reportId: string,
  ) {
    return this.collaborationService.getActivityTimeline(reportId, user.sub, user.role);
  }
}

