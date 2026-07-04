import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard, CurrentUser, JwtPayload } from '../auth';
import { WorkspaceService } from './workspace.service';
import { FileSystemService } from './file-system.service';
import {
  WorkspaceImportDto,
  WorkspaceFilesCreateDto,
  WorkspaceFilesRenameDto,
  WorkspaceFilesDeleteDto,
} from './dto/workspace.dto';

@Controller('workspace')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly fileSystemService: FileSystemService,
  ) {}

  @Get('list')
  async listWorkspaces(@CurrentUser() user: JwtPayload) {
    return this.workspaceService.listWorkspaces(user.sub);
  }

  @Post('import')
  async importWorkspace(
    @CurrentUser() user: JwtPayload,
    @Body() dto: WorkspaceImportDto,
  ) {
    return this.workspaceService.importWorkspace(user.sub, dto.path, dto.name);
  }

  @Post('upload-zip')
  @UseInterceptors(FileInterceptor('file'))
  async uploadZipWorkspace(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded or invalid form field name (must be "file")');
    }

    const originalName = file.originalname.toLowerCase();
    if (!originalName.endsWith('.zip')) {
      throw new BadRequestException('Invalid file type. Only ZIP archives (.zip) are supported.');
    }

    return this.workspaceService.uploadZipWorkspace(user.sub, file);
  }

  @Get(':id')
  async getWorkspaceDetails(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.workspaceService.getWorkspaceDetails(user.sub, id);
  }

  @Delete(':id')
  async deleteWorkspace(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.workspaceService.deleteWorkspace(user.sub, id);
  }

  // ─── File CRUD Operations ──────────────────────────────────────────

  @Post('files/create')
  async createFileOrFolder(
    @CurrentUser() user: JwtPayload,
    @Body() dto: WorkspaceFilesCreateDto,
  ) {
    // 1. Resolve workspace root path throwing 404 if not found
    const targetWorkspace = await this.workspaceService.findWorkspaceById(user.sub, dto.workspaceId);

    // 2. Perform create action
    this.fileSystemService.createFileOrFolder(
      targetWorkspace.path,
      dto.path,
      dto.type,
      dto.content ?? '',
    );

    return { success: true };
  }

  @Post('files/rename')
  async renameFileOrFolder(
    @CurrentUser() user: JwtPayload,
    @Body() dto: WorkspaceFilesRenameDto,
  ) {
    const targetWorkspace = await this.workspaceService.findWorkspaceById(user.sub, dto.workspaceId);

    this.fileSystemService.renameFileOrFolder(
      targetWorkspace.path,
      dto.oldPath,
      dto.newPath,
    );

    return { success: true };
  }

  @Delete('files/delete')
  async deleteFileOrFolder(
    @CurrentUser() user: JwtPayload,
    @Body() dto: WorkspaceFilesDeleteDto,
  ) {
    const targetWorkspace = await this.workspaceService.findWorkspaceById(user.sub, dto.workspaceId);

    this.fileSystemService.deleteFileOrFolder(targetWorkspace.path, dto.path);

    return { success: true };
  }
}
