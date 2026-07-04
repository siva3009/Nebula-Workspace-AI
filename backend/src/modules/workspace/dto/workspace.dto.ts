import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class WorkspaceImportDto {
  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsString()
  @IsOptional()
  name?: string;
}

export class WorkspaceFilesCreateDto {
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @IsString()
  @IsNotEmpty()
  path!: string; // relative to workspace root

  @IsEnum(['file', 'folder'])
  type!: 'file' | 'folder';

  @IsString()
  @IsOptional()
  content?: string;
}

export class WorkspaceFilesRenameDto {
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @IsString()
  @IsNotEmpty()
  oldPath!: string; // relative to workspace root

  @IsString()
  @IsNotEmpty()
  newPath!: string; // relative to workspace root
}

export class WorkspaceFilesDeleteDto {
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @IsString()
  @IsNotEmpty()
  path!: string; // relative to workspace root
}
