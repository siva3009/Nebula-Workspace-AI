import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard, CurrentUser, JwtPayload } from '../auth';

import { FilesService } from './files.service';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded or invalid form field name (must be "file")');
    }

    // Filter file types by extension
    const allowedExtensions = ['.pdf', '.txt', '.md'];
    const originalName = file.originalname.toLowerCase();
    const isAllowedExt = allowedExtensions.some(ext => originalName.endsWith(ext));

    if (!isAllowedExt) {
      throw new BadRequestException('Invalid file type. Only PDF, TXT, and MD are supported.');
    }

    // Filter by MIME type
    const allowedMimeTypes = ['application/pdf', 'text/plain', 'text/markdown', 'text/x-markdown'];
    const isAllowedMime = allowedMimeTypes.includes(file.mimetype);

    if (!isAllowedMime) {
      throw new BadRequestException(`Invalid MIME type: "${file.mimetype}". Only PDF, TXT, and Markdown files are supported.`);
    }

    return this.filesService.handleFileUpload(user.sub, file);
  }
}
