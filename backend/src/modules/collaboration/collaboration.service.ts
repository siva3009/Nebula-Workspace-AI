import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TaskStatus, FindingStatusVal, ActivityLogType, Role } from '@prisma/client';

@Injectable()
export class CollaborationService {
  private readonly logger = new Logger(CollaborationService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Helper Security checks ───────────────────────────────────────

  private async checkReportAccess(reportId: string, userId: string, userRole: Role) {
    const report = await this.prisma.analysisReportCache.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        ownerId: true,
        isShared: true,
      },
    });
    if (!report) throw new NotFoundException('Report not found');

    if (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN) {
      return report;
    }
    if (report.isShared === true || report.ownerId === userId) {
      return report;
    }
    throw new ForbiddenException('You do not have permission to access this report');
  }

  private async checkReportOwner(reportId: string, userId: string, userRole: Role) {
    const report = await this.prisma.analysisReportCache.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        ownerId: true,
        isShared: true,
        projectName: true,
        fileName: true,
      },
    });
    if (!report) throw new NotFoundException('Report not found');

    if (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN) {
      return report;
    }
    if (report.ownerId === userId) {
      return report;
    }
    throw new ForbiddenException('Only the report owner can perform this action');
  }

  // ─── Report Ownership & Sharing ───────────────────────────────────

  async toggleShare(reportId: string, isShared: boolean, userId: string, userRole: Role) {
    const report = await this.checkReportOwner(reportId, userId, userRole);

    const updated = await this.prisma.analysisReportCache.update({
      where: { id: reportId },
      data: { isShared },
    });

    // Log activity
    await this.logActivity(reportId, userId, ActivityLogType.REPORT_SHARED, {
      isShared,
      projectName: report.projectName || report.fileName,
    });

    return updated;
  }

  async changeOwner(reportId: string, ownerId: string, userId: string, userRole: Role) {
    await this.checkReportOwner(reportId, userId, userRole);

    const owner = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) throw new NotFoundException('Owner user not found');

    return this.prisma.analysisReportCache.update({
      where: { id: reportId },
      data: { ownerId },
    });
  }

  // ─── Comments & Discussions ────────────────────────────────────────

  async getComments(reportId: string, userId: string, userRole: Role) {
    await this.checkReportAccess(reportId, userId, userRole);

    // Return root-level comments first, with user relations and nested replies
    const comments = await this.prisma.comment.findMany({
      where: { reportId, parentId: null },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            title: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                name: true,
                title: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return comments;
  }

  async createComment(
    reportId: string,
    userId: string,
    content: string,
    callerId: string,
    userRole: Role,
    filePath?: string,
    lineNumber?: number,
    findingId?: string,
    parentId?: string,
  ) {
    await this.checkReportAccess(reportId, callerId, userRole);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent) throw new NotFoundException('Parent comment not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        reportId,
        userId,
        content,
        filePath,
        lineNumber,
        findingId,
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            title: true,
            avatar: true,
          },
        },
      },
    });

    // Log Activity
    await this.logActivity(reportId, userId, ActivityLogType.COMMENT_ADDED, {
      commentId: comment.id,
      filePath,
      findingId,
      isReply: !!parentId,
    });

    return comment;
  }

  async deleteComment(reportId: string, commentId: string, userId: string, userRole: Role) {
    await this.checkReportAccess(reportId, userId, userRole);

    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Comment not found');

    // Check ownership of the comment
    if (comment.userId !== userId && userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this comment');
    }

    await this.prisma.comment.delete({ where: { id: commentId } });

    await this.logActivity(reportId, comment.userId, ActivityLogType.COMMENT_DELETED, {
      commentId,
      filePath: comment.filePath,
      findingId: comment.findingId,
    });

    return { success: true };
  }

  // ─── Task Assignments ──────────────────────────────────────────────

  async getTasks(reportId: string, userId: string, userRole: Role) {
    await this.checkReportAccess(reportId, userId, userRole);

    return this.prisma.taskAssignment.findMany({
      where: { reportId },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            title: true,
            avatar: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            title: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTask(
    reportId: string,
    creatorId: string,
    title: string,
    callerId: string,
    userRole: Role,
    description?: string,
    assigneeId?: string,
    filePath?: string,
    findingId?: string,
  ) {
    await this.checkReportAccess(reportId, callerId, userRole);

    const creator = await this.prisma.user.findUnique({ where: { id: creatorId } });
    if (!creator) throw new NotFoundException('Creator not found');

    if (assigneeId) {
      const assignee = await this.prisma.user.findUnique({ where: { id: assigneeId } });
      if (!assignee) throw new NotFoundException('Assignee not found');
    }

    const task = await this.prisma.taskAssignment.create({
      data: {
        reportId,
        creatorId,
        title,
        description,
        assigneeId,
        filePath,
        findingId,
      },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    await this.logActivity(reportId, creatorId, ActivityLogType.TASK_ASSIGNED, {
      taskId: task.id,
      title: task.title,
      assigneeId,
      assigneeName: task.assignee?.name,
    });

    return task;
  }

  async updateTask(
    reportId: string,
    taskId: string,
    userId: string,
    updateData: { status?: TaskStatus; assigneeId?: string },
    callerId: string,
    userRole: Role,
  ) {
    await this.checkReportAccess(reportId, callerId, userRole);

    const task = await this.prisma.taskAssignment.findUnique({
      where: { id: taskId },
      include: { assignee: true },
    });
    if (!task) throw new NotFoundException('Task not found');

    // Check task permissions: creator, assignee, or admin
    if (
      task.creatorId !== callerId &&
      task.assigneeId !== callerId &&
      userRole !== Role.ADMIN &&
      userRole !== Role.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You do not have permission to modify this task');
    }

    const data: any = {};
    if (updateData.status !== undefined) data.status = updateData.status;
    if (updateData.assigneeId !== undefined) data.assigneeId = updateData.assigneeId;

    const updated = await this.prisma.taskAssignment.update({
      where: { id: taskId },
      data,
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    if (updateData.status !== undefined && updateData.status !== task.status) {
      await this.logActivity(task.reportId, userId, ActivityLogType.TASK_STATUS_CHANGED, {
        taskId,
        title: task.title,
        oldStatus: task.status,
        newStatus: updateData.status,
      });
    }

    return updated;
  }

  async deleteTask(reportId: string, taskId: string, userId: string, userRole: Role) {
    await this.checkReportAccess(reportId, userId, userRole);

    const task = await this.prisma.taskAssignment.findUnique({
      where: { id: taskId },
    });
    if (!task) throw new NotFoundException('Task not found');

    // Only creator or admin can delete tasks
    if (task.creatorId !== userId && userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this task');
    }

    await this.prisma.taskAssignment.delete({ where: { id: taskId } });
    return { success: true };
  }

  // ─── Collaborative Resolution Tracking ────────────────────────────

  async getResolutions(reportId: string, userId: string, userRole: Role) {
    await this.checkReportAccess(reportId, userId, userRole);

    return this.prisma.findingStatus.findMany({
      where: { reportId },
      include: {
        updatedBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async setResolution(
    reportId: string,
    findingId: string,
    status: FindingStatusVal,
    notes: string | null,
    userId: string,
    callerId: string,
    userRole: Role,
  ) {
    await this.checkReportAccess(reportId, callerId, userRole);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const resolution = await this.prisma.findingStatus.upsert({
      where: {
        reportId_findingId: {
          reportId,
          findingId,
        },
      },
      update: {
        status,
        notes,
        updatedById: userId,
      },
      create: {
        reportId,
        findingId,
        status,
        notes,
        updatedById: userId,
      },
      include: {
        updatedBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    await this.logActivity(reportId, userId, ActivityLogType.RESOLUTION_CHANGED, {
      findingId,
      status,
      notes,
    });

    return resolution;
  }

  // ─── Activity Timeline logs ────────────────────────────────────────

  async getActivityTimeline(reportId: string, userId: string, userRole: Role) {
    await this.checkReportAccess(reportId, userId, userRole);

    return this.prisma.activityLog.findMany({
      where: { reportId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            title: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Helper method to write activity logs
  private async logActivity(reportId: string, userId: string, type: ActivityLogType, details: any) {
    // If the system itself is logging an action, we associate it with the first admin user or keep a dummy id
    let verifiedUserId = userId;
    if (userId === 'system') {
      const admin = await this.prisma.user.findFirst({ where: { username: 'alex' } });
      verifiedUserId = admin ? admin.id : '';
    }

    if (!verifiedUserId) return;

    try {
      await this.prisma.activityLog.create({
        data: {
          reportId,
          userId: verifiedUserId,
          type,
          details: details || {},
        },
      });
    } catch (err: any) {
      this.logger.error(`Failed to log activity: ${err.message}`, err.stack);
    }
  }
}
