import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsOptional()
  model?: string;
}

export interface ChatResponseDto {
  response: string;
  model: string;
  createdAt: string;
  totalDuration?: number;
  evalCount?: number;
  fallbackUsed?: boolean;
  fallbackProvider?: string;
  providerUnavailable?: boolean;
  attemptedProviders?: string[];
}
