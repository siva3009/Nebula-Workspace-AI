import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UnifiedAnalysisService } from './unified-analysis.service';
import { UnifiedAnalysisResponseDto } from './dto/unified-analysis.dto';
import { WorkspaceAnalysisDto } from './dto/workspace-analysis.dto';
import { JwtAuthGuard, CurrentUser, JwtPayload } from '../auth';

@Controller('analysis')
@UseGuards(JwtAuthGuard)
export class UnifiedAnalysisController {
  constructor(private readonly unifiedAnalysisService: UnifiedAnalysisService) {}

  @Post('workspace')
  async runWorkspaceAnalysis(
    @CurrentUser() user: JwtPayload,
    @Body() dto: WorkspaceAnalysisDto,
  ): Promise<UnifiedAnalysisResponseDto> {
    return this.unifiedAnalysisService.runWorkspaceAnalysis(user.sub, dto.path);
  }

  @Post('unified')
  @UseInterceptors(FileInterceptor('file'))
  async runAnalysis(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UnifiedAnalysisResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded or invalid form field name (must be "file")');
    }

    const originalName = file.originalname.toLowerCase();
    if (!originalName.endsWith('.zip')) {
      throw new BadRequestException('Invalid file type. Only ZIP archives (.zip) are supported.');
    }

    return this.unifiedAnalysisService.runUnifiedAnalysis(user.sub, file);
  }

  @Get('history')
  async getHistory(@CurrentUser() user: JwtPayload) {
    return this.unifiedAnalysisService.getHistory(user.sub, user.role);
  }

  @Get('unified/:id')
  async getDetails(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<UnifiedAnalysisResponseDto> {
    return this.unifiedAnalysisService.getDetails(id, user.sub, user.role);
  }

  @Delete(':id')
  async deleteRecord(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.unifiedAnalysisService.deleteRecord(id, user.sub, user.role);
  }
}

