import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { TaskStatus, FindingStatusVal } from '@prisma/client';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsOptional()
  filePath?: string;

  @IsNumber()
  @IsOptional()
  lineNumber?: number;

  @IsString()
  @IsOptional()
  findingId?: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  creatorId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;

  @IsString()
  @IsOptional()
  filePath?: string;

  @IsString()
  @IsOptional()
  findingId?: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsString()
  @IsOptional()
  assigneeId?: string;
}

export class SetResolutionDto {
  @IsString()
  @IsNotEmpty()
  findingId!: string;

  @IsEnum(FindingStatusVal)
  @IsNotEmpty()
  status!: FindingStatusVal;

  @IsString()
  @IsOptional()
  notes?: string | null;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}

export class ToggleShareDto {
  @IsBoolean()
  isShared!: boolean;
}

export class ChangeOwnerDto {
  @IsString()
  @IsNotEmpty()
  ownerId!: string;
}
