// src/resend/dto/send-email.dto.ts
import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty() @IsEmail() to: string;
  @ApiProperty() @IsString() subject: string;
  @ApiProperty() @IsString() html: string; // Puedes cambiar a `text` si lo prefieres
}
