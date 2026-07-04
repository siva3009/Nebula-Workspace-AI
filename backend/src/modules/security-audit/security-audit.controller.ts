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
import { SecurityAuditService } from './security-audit.service';
import { SecurityAuditResponseDto } from './dto/security-audit-response.dto';

@Controller('security')
@UseGuards(JwtAuthGuard)
export class SecurityAuditController {
  constructor(private readonly securityAuditService: SecurityAuditService) {}

  @Post('audit')
  @UseInterceptors(FileInterceptor('file'))
  async auditProject(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<SecurityAuditResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded or invalid form field name (must be "file")');
    }

    const originalName = file.originalname.toLowerCase();
    if (!originalName.endsWith('.zip')) {
      throw new BadRequestException('Invalid file type. Only ZIP archives (.zip) are supported.');
    }

    return this.securityAuditService.audit(file);
  }
}
