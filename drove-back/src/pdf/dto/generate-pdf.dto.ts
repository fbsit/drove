// src/pdf/dto/generate-pdf.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class GeneratePdfDto {
  @ApiProperty() @IsString() travelId: string;
  @ApiProperty() @IsBoolean() usePage: string;
  @ApiProperty() @IsBoolean() addQr: boolean;
  @ApiProperty() @IsBoolean() addStartImagesVehicule: boolean;
  @ApiProperty() @IsBoolean() addBothSignature: boolean;
  @ApiProperty() @IsBoolean() addEndImagesVehicule: boolean;
  @ApiProperty() @IsBoolean() addDniClient: boolean;
  @ApiPropertyOptional() @IsOptional() detailInfo: any;
  @ApiProperty() @IsNumber() step: number;
}
