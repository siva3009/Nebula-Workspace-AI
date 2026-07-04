import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth';
import { ProjectAnalyzerService } from './project-analyzer.service';
import { ProjectAnalysisResponseDto } from './dto/project-analysis-response.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectAnalyzerController {
  constructor(private readonly projectAnalyzerService: ProjectAnalyzerService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeProject(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProjectAnalysisResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded or invalid form field name (must be "file")');
    }

    const originalName = file.originalname.toLowerCase();
    if (!originalName.endsWith('.zip')) {
      throw new BadRequestException('Invalid file type. Only ZIP archives (.zip) are supported.');
    }

    return this.projectAnalyzerService.analyze(file);
  }
}
