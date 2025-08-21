import {
  IsString,
  IsDateString,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PersonDto, PendingViewsDto } from './create-travel.dto';

export class UpdateTravelDto {
  @IsOptional()
  @IsString()
  bastidor?: string;

  @IsOptional()
  @IsString()
  typeVehicle?: string;

  @IsOptional()
  @IsString()
  brandVehicle?: string;

  @IsOptional()
  @IsString()
  yearVehicle?: string;

  @IsOptional()
  @IsString()
  patentVehicle?: string;

  @IsOptional()
  @IsString()
  modelVehicle?: string;

  @IsOptional()
  @IsString()
  startAddress?: string;

  @IsOptional()
  @IsString()
  endAddress?: string;

  @IsOptional()
  @IsDateString()
  travelDate?: string;

  @IsOptional()
  @IsString()
  travelTime?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  idClient?: string;

  @IsOptional()
  @IsString()
  timeTravel?: string;

  @IsOptional()
  @IsString()
  routePolyline?: string;

  @IsOptional()
  @IsString()
  distanceTravel?: string;

  @IsOptional()
  @IsString()
  priceRoute?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PersonDto)
  personDelivery?: PersonDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PersonDto)
  personReceive?: PersonDto;

  @IsOptional()
  @IsString()
  signatureStartClient?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PendingViewsDto)
  pendingViews?: PendingViewsDto;

  @IsOptional()
  @IsString()
  orderId?: string;
}
