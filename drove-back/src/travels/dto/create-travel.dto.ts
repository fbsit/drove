// src/travels/dto/verification.dto.ts
import {
  IsString,
  IsDateString,
  ValidateNested,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { TransferStatus } from '../dto/travel-enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/* ---------- sub-DTOs genéricos ---------- */

export class PersonDto {
  @ApiProperty() @IsString() fullName: string;
  @ApiProperty() @IsString() dni: string;
  @ApiProperty() @IsString() email: string;
  @ApiProperty() @IsString() phone: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactId?: string;
}

export class PendingViewsDto {
  @ApiProperty() @IsBoolean() client: boolean;
  @ApiProperty() @IsBoolean() driver: boolean;
  @ApiProperty() @IsBoolean() trafficManager: boolean;
}

/* ---------- DTOs de verificación de recogida ---------- */

/** Fotos exteriores, con 6 vistas */
export class ExteriorPhotosDto {
  @ApiProperty() @IsString() frontView: string;
  @ApiProperty() @IsString() rearView: string;
  @ApiProperty() @IsString() leftFront: string;
  @ApiProperty() @IsString() leftRear: string;
  @ApiProperty() @IsString() rightFront: string;
  @ApiProperty() @IsString() rightRear: string;
}

/** Fotos interiores, con 6 vistas */
export class InteriorPhotosDto {
  @ApiProperty() @IsString() dashboard: string;
  @ApiProperty() @IsString() driverSeat: string;
  @ApiProperty() @IsString() passengerSeat: string;
  @ApiProperty() @IsString() rearLeftSeat: string;
  @ApiProperty() @IsString() rearRightSeat: string;
  @ApiProperty() @IsString() trunk: string;
}

export class PickupVerificationDto {
  @ValidateNested()
  @Type(() => ExteriorPhotosDto)
  exteriorPhotos: ExteriorPhotosDto;

  @ValidateNested()
  @Type(() => InteriorPhotosDto)
  interiorPhotos: InteriorPhotosDto;

  /** Firma en dataURL (base64) */
  @ApiProperty() @IsString() signature: string;

  /** Firma del drover en dataURL (base64) */
  @ApiPropertyOptional() @IsOptional() @IsString() droverSignature?: string;

  /** Comentarios opcionales */
  @ApiPropertyOptional() @IsOptional() @IsString() comments?: string;

  /** Fecha y hora ISO en que se realizó la verificación */
  @ApiProperty() @IsDateString() verifiedAt: string;
}

/* ---------- DTOs de verificación de entrega ---------- */

/** Estructura anidada completa para entrega */
export class RecipientIdentityDto {
  @ApiProperty() @IsString() idNumber: string;
  @ApiProperty() @IsString() idFrontPhoto: string;
  @ApiProperty() @IsString() idBackPhoto: string;
  @ApiProperty() @IsString() selfieWithId: string;
  @ApiProperty() @IsBoolean() hasDamage: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() damageDescription?: string;
}

export class HandoverDocumentsDto {
  @ApiProperty() @IsString() delivery_document: string;
  @ApiProperty() @IsString() fuel_receipt: string;
  @ApiProperty() @IsString() drover_signature: string; // data-URL
  @ApiProperty() @IsString() client_signature: string; // data-URL
  @ApiPropertyOptional() @IsOptional() @IsString() comments?: string;
}

export class DeliveryVerificationDto {
  @ValidateNested()
  @Type(() => ExteriorPhotosDto)
  exteriorPhotos: ExteriorPhotosDto;

  @ValidateNested()
  @Type(() => InteriorPhotosDto)
  interiorPhotos: InteriorPhotosDto;

  @ValidateNested()
  @Type(() => RecipientIdentityDto)
  recipientIdentity: RecipientIdentityDto;

  @ValidateNested()
  @Type(() => HandoverDocumentsDto)
  handoverDocuments: HandoverDocumentsDto;

  /** Fecha ISO en que se completó la entrega */
  @ApiProperty() @IsDateString() deliveredAt: string;
}

export class AddressDto {
  @ApiProperty() @IsString() city: string;
  @ApiProperty() @IsNumber() lat: number;
  @ApiProperty() @IsNumber() lng: number;
}

/* ---------- DTOs principales de viaje ---------- */

export class CreateTravelDto {
  @ApiProperty() @IsString() bastidor: string;
  @ApiProperty() @IsString() typeVehicle: string;
  @ApiProperty() @IsString() brandVehicle: string;
  @ApiProperty() @IsString() yearVehicle: string;
  @ApiPropertyOptional() @IsOptional() @IsString() patentVehicle?: string;
  @ApiProperty() @IsString() modelVehicle: string;
  @ApiProperty() @IsString() paymentMethod: string;
  @ValidateNested()
  @Type(() => AddressDto)
  startAddress: AddressDto;
  @ValidateNested()
  @Type(() => AddressDto)
  endAddress: AddressDto;
  @ApiProperty() @IsDateString() travelDate: string;
  @ApiProperty() @IsString() travelTime: string;

  @ApiProperty({ enum: TransferStatus }) @IsEnum(TransferStatus) status: TransferStatus;
  @ApiProperty() @IsString() idClient: string;
  @ApiProperty() @IsString() timeTravel: string;
  @ApiProperty() @IsString() routePolyline: string;
  @ApiProperty() @IsString() distanceTravel: string;
  @ApiProperty() @IsString() priceRoute: string;
  @ApiProperty() @IsNumber() totalPrice: number;

  @ValidateNested()
  @Type(() => PersonDto)
  personDelivery: PersonDto;

  @ValidateNested()
  @Type(() => PersonDto)
  personReceive: PersonDto;

  @ApiProperty() @IsString() signatureStartClient: string;

  @ValidateNested()
  @Type(() => PendingViewsDto)
  pendingViews: PendingViewsDto;

  @ApiPropertyOptional() @IsOptional() @IsString() orderId?: string;
}

export class UpdateTravelDto extends PartialType(CreateTravelDto) {
  @ApiPropertyOptional() @IsOptional() @IsString() droverId?: string;
}

export class UpdateTravelStatusDto {
  @IsEnum(TransferStatus) status: TransferStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() droverId?: string;
}
