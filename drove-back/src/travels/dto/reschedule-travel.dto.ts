import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RescheduleTravelDto {
  @ApiProperty({ example: '2025-05-01' })
  @IsString()
  travelDate: string;   // “YYYY-MM-DD”
  @ApiProperty({ example: '10:30' })
  @IsString()
  travelTime: string;   // “HH:mm”
}