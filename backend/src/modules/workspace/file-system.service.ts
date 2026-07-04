import { Injectable, Logger, ForbiddenException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface FileNode {
  name: string;
  path: string; // relative to workspace root (using forward slashes for cross-platform compatibility)
  kind: 'file' | 'folder';
  size?: number;
  children?: FileNode[];
}

@Injectable()
export class FileSystemService {
  private readonly logger = new Logger(FileSystemService.name);

  // Folders ignored during file tree traversal for performance
  private readonly EXCLUDED_FOLDERS = new Set([
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    '.cache',
    'coverage',
  ]);

  /**
   * Validates that the target path is strictly within the workspace root directory boundaries.
   * Throws a ForbiddenException if path traversal is detected.
   */
  validatePathWithinWorkspace(workspaceRoot: string, relativeOrAbsolutePath: string): string {
    const resolvedRoot = path.resolve(workspaceRoot);
    const resolvedTarget = path.isAbsolute(relativeOrAbsolutePath)
      ? path.resolve(relativeOrAbsolutePath)
      : path.resolve(resolvedRoot, relativeOrAbsolutePath);

    const relative = path.relative(resolvedRoot, resolvedTarget);

    // If target path goes outside resolved root (i.e. starts with .. or is absolute out of tree)
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new ForbiddenException('Access denied: target path falls outside the workspace root directory');
    }

    return resolvedTarget;
  }

  /**
   * Recursively generates a file structure tree for a workspace
   */
  generateFileTree(workspaceRoot: string, currentDirRelPath = ''): FileNode[] {
    const absoluteCurrentDir = this.validatePathWithinWorkspace(workspaceRoot, currentDirRelPath);
    
    if (!fs.existsSync(absoluteCurrentDir)) {
      throw new BadRequestException(`Directory does not exist: ${currentDirRelPath}`);
    }

    const stat = fs.statSync(absoluteCurrentDir);
    if (!stat.isDirectory()) {
      throw new BadRequestException(`Path is not a directory: ${currentDirRelPath}`);
    }

    const items = fs.readdirSync(absoluteCurrentDir);
    const nodes: FileNode[] = [];

    for (const item of items) {
      if (this.EXCLUDED_FOLDERS.has(item)) {
        continue;
      }

      const itemRelPath = currentDirRelPath ? `${currentDirRelPath}/${item}` : item;
      const itemAbsPath = path.join(absoluteCurrentDir, item);
      const itemStat = fs.statSync(itemAbsPath);

      if (itemStat.isDirectory()) {
        nodes.push({
          name: item,
          path: itemRelPath.replace(/\\/g, '/'), // normalize windows paths
          kind: 'folder',
          children: this.generateFileTree(workspaceRoot, itemRelPath),
        });
      } else {
        nodes.push({
          name: item,
          path: itemRelPath.replace(/\\/g, '/'),
          kind: 'file',
          size: itemStat.size,
        });
      }
    }

    // Sort folders first, then files alphabetically
    return nodes.sort((a, b) => {
      if (a.kind !== b.kind) {
        return a.kind === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Creates a file or folder inside the workspace
   */
  createFileOrFolder(workspaceRoot: string, targetRelPath: string, type: 'file' | 'folder', content = ''): void {
    const absolutePath = this.validatePathWithinWorkspace(workspaceRoot, targetRelPath);

    if (fs.existsSync(absolutePath)) {
      throw new BadRequestException(`Target already exists: ${targetRelPath}`);
    }

    const parentDir = path.dirname(absolutePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    if (type === 'folder') {
      fs.mkdirSync(absolutePath, { recursive: true });
      this.logger.log(`Created folder: ${absolutePath}`);
    } else {
      fs.writeFileSync(absolutePath, content, 'utf8');
      this.logger.log(`Created file: ${absolutePath}`);
    }
  }

  /**
   * Renames/Moves a file or folder inside the workspace
   */
  renameFileOrFolder(workspaceRoot: string, oldRelPath: string, newRelPath: string): void {
    const absoluteOldPath = this.validatePathWithinWorkspace(workspaceRoot, oldRelPath);
    const absoluteNewPath = this.validatePathWithinWorkspace(workspaceRoot, newRelPath);

    if (!fs.existsSync(absoluteOldPath)) {
      throw new BadRequestException(`Source path does not exist: ${oldRelPath}`);
    }

    if (fs.existsSync(absoluteNewPath)) {
      throw new BadRequestException(`Target path already exists: ${newRelPath}`);
    }

    const parentDir = path.dirname(absoluteNewPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.renameSync(absoluteOldPath, absoluteNewPath);
    this.logger.log(`Renamed/Moved: ${absoluteOldPath} -> ${absoluteNewPath}`);
  }

  /**
   * Deletes a file or folder inside the workspace
   */
  deleteFileOrFolder(workspaceRoot: string, targetRelPath: string): void {
    const absolutePath = this.validatePathWithinWorkspace(workspaceRoot, targetRelPath);

    if (!fs.existsSync(absolutePath)) {
      throw new BadRequestException(`Path does not exist: ${targetRelPath}`);
    }

    const stat = fs.statSync(absolutePath);
    if (stat.isDirectory()) {
      fs.rmSync(absolutePath, { recursive: true, force: true });
      this.logger.log(`Deleted folder: ${absolutePath}`);
    } else {
      fs.unlinkSync(absolutePath);
      this.logger.log(`Deleted file: ${absolutePath}`);
    }
  }
}
