import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FinishTravelDto {
  @ApiProperty()
  @IsString()
  polyline: string;
}
