import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { FileSystemService, FileNode } from './file-system.service';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';

@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name);
  private readonly storageDir: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileSystemService: FileSystemService,
    private readonly configService: ConfigService,
  ) {
    this.storageDir = this.configService.get<string>('storage.localPath') || './uploads';
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Imports an existing folder directory path as a workspace
   */
  async importWorkspace(userId: string, targetPath: string, customName?: string) {
    const resolvedPath = path.resolve(targetPath);

    if (!fs.existsSync(resolvedPath)) {
      throw new BadRequestException(`Target directory does not exist: ${targetPath}`);
    }

    const stat = fs.statSync(resolvedPath);
    if (!stat.isDirectory()) {
      throw new BadRequestException(`Target path is not a directory: ${targetPath}`);
    }

    const name = customName || path.basename(resolvedPath) || 'Imported Workspace';

    // Save or update in database
    return this.prisma.workspace.upsert({
      where: { path: resolvedPath },
      update: { name, userId, updatedAt: new Date() },
      create: {
        name,
        path: resolvedPath,
        userId,
      },
    });
  }

  /**
   * Unpacks a ZIP file and registers it as a workspace
   */
  async uploadZipWorkspace(userId: string, file: Express.Multer.File) {
    const originalName = file.originalname;
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const cleanedName = baseName
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const uniqueId = Math.random().toString(36).substring(2, 15) + Date.now();
    const workspacePath = path.join(this.storageDir, 'workspaces', uniqueId);

    // Save buffer temporarily and decompress using AdmZip
    try {
      if (!fs.existsSync(path.dirname(workspacePath))) {
        fs.mkdirSync(path.dirname(workspacePath), { recursive: true });
      }

      const zip = new AdmZip(file.buffer);
      zip.extractAllTo(workspacePath, true);
      this.logger.log(`Extracted ZIP project archive to workspace folder: ${workspacePath}`);
    } catch (err: any) {
      this.logger.error(`Failed to extract ZIP workspace archive: ${err.message}`);
      throw new BadRequestException('Invalid ZIP archive structure or extraction failure');
    }

    // Save to database
    return this.prisma.workspace.create({
      data: {
        name: cleanedName,
        path: workspacePath,
        userId,
      },
    });
  }

  /**
   * Lists all workspaces accessible by the user
   */
  async listWorkspaces(userId: string) {
    return this.prisma.workspace.findMany({
      where: {
        OR: [
          { userId },
          { userId: null }, // shared/system workspaces if any
        ],
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Helper to verify workspace exists and belongs to the user
   */
  async findWorkspaceById(userId: string, id: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id,
        OR: [
          { userId },
          { userId: null },
        ],
      },
    });
    if (!workspace) {
      throw new NotFoundException(`Workspace record not found for ID: ${id}`);
    }
    return workspace;
  }

  /**
   * Returns workspace details including the file tree structure
   */
  async getWorkspaceDetails(userId: string, id: string): Promise<{ id: string; name: string; path: string; files: FileNode[] }> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace record not found for ID: ${id}`);
    }

    // Check directory exists on disk
    if (!fs.existsSync(workspace.path)) {
      throw new BadRequestException(`Workspace path does not exist on disk: ${workspace.path}`);
    }

    // Traverse directory tree
    const files = this.fileSystemService.generateFileTree(workspace.path);

    return {
      id: workspace.id,
      name: workspace.name,
      path: workspace.path,
      files,
    };
  }

  /**
   * Deletes a workspace registry and clears filesystem files if it was an extracted ZIP
   */
  async deleteWorkspace(userId: string, id: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace record not found for ID: ${id}`);
    }

    // Only clean up ZIP extractions folder from local disk (located inside storageDir/workspaces)
    const zipWorkspacesRoot = path.join(path.resolve(this.storageDir), 'workspaces');
    const isZipExtraction = path.resolve(workspace.path).startsWith(zipWorkspacesRoot);
    if (isZipExtraction && fs.existsSync(workspace.path)) {
      try {
        fs.rmSync(workspace.path, { recursive: true, force: true });
        this.logger.log(`Deleted extracted ZIP workspace directory: ${workspace.path}`);
      } catch (err: any) {
        this.logger.warn(`Failed to clean workspace directory: ${err.message}`);
      }
    }

    await this.prisma.workspace.delete({
      where: { id },
    });

    return { success: true };
  }
}
