import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FinishTravelDto {
  @ApiProperty()
  @IsString()
  polyline: string;

  @ApiPropertyOptional({ description: 'Latitud actual del drover al finalizar' })
  @IsOptional()
  @IsNumber()
  currentLat?: number;

  @ApiPropertyOptional({ description: 'Longitud actual del drover al finalizar' })
  @IsOptional()
  @IsNumber()
  currentLng?: number;
}
