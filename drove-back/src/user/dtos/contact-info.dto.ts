// src/user/dtos/contact-info.dto.ts
import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContactInfoDto {
  /* ❶ Campos que **sí** llegan desde el front */
  @ApiProperty() @IsString() fullName: string;
  @ApiProperty() @IsString() phone: string;
  @ApiProperty() @IsString() documentId: string;
  @ApiProperty() @IsString() documentType: string;
  @ApiProperty() @IsBoolean()
  profileComplete: boolean;

  /* ❷ Campos legacy — los dejamos opcionales por si los usas más adelante */
  @ApiPropertyOptional() @IsOptional() @IsString() identificationNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() zip?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() country?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsString({ each: true }) phones?: string[];

  /* Driver‐only (opcional) */
  @ApiPropertyOptional() @IsOptional() @IsString() birthDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() licenseFront?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() licenseBack?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() selfie?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() imageUpload2?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pdfUpload?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() latitud?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() longitud?: string;
}
