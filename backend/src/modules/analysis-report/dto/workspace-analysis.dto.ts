import { IsNotEmpty, IsString } from 'class-validator';

export class WorkspaceAnalysisDto {
  @IsString()
  @IsNotEmpty()
  path!: string;
}
