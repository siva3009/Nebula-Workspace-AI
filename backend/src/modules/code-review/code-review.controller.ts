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
import { CodeReviewService } from './code-review.service';
import { CodeReviewResponseDto } from './dto/code-review-response.dto';

@Controller('review')
@UseGuards(JwtAuthGuard)
export class CodeReviewController {
  constructor(private readonly codeReviewService: CodeReviewService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeReview(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CodeReviewResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded or invalid form field name (must be "file")');
    }

    const originalName = file.originalname.toLowerCase();
    if (!originalName.endsWith('.zip')) {
      throw new BadRequestException('Invalid file type. Only ZIP archives (.zip) are supported.');
    }

    return this.codeReviewService.analyze(file);
  }
}
