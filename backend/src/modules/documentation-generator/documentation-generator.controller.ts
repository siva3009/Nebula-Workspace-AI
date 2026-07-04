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
import { DocumentationGeneratorService } from './documentation-generator.service';
import { DocumentationResponseDto } from './dto/documentation-response.dto';

@Controller('documentation')
@UseGuards(JwtAuthGuard)
export class DocumentationGeneratorController {
  constructor(
    private readonly documentationGeneratorService: DocumentationGeneratorService,
  ) {}

  @Post('generate')
  @UseInterceptors(FileInterceptor('file'))
  async generateDocumentation(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<DocumentationResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded or invalid form field name (must be "file")');
    }

    const originalName = file.originalname.toLowerCase();
    if (!originalName.endsWith('.zip')) {
      throw new BadRequestException('Invalid file type. Only ZIP archives (.zip) are supported.');
    }

    return this.documentationGeneratorService.generate(file);
  }
}
