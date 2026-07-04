import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth';

import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // TODO: Implement user settings CRUD endpoints
}
