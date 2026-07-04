import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  @IsOptional()
  title?: string;
}

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  message!: string;
}
