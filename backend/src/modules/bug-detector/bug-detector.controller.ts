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
import { BugDetectorService } from './bug-detector.service';
import { BugAnalysisResponseDto } from './dto/bug-analysis-response.dto';

@Controller('bugs')
@UseGuards(JwtAuthGuard)
export class BugDetectorController {
  constructor(private readonly bugDetectorService: BugDetectorService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeBugs(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<BugAnalysisResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded or invalid form field name (must be "file")');
    }

    const originalName = file.originalname.toLowerCase();
    if (!originalName.endsWith('.zip')) {
      throw new BadRequestException('Invalid file type. Only ZIP archives (.zip) are supported.');
    }

    return this.bugDetectorService.analyze(file);
  }
}
