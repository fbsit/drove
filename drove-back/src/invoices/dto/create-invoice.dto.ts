// src/invoices/dto/create-invoice.dto.ts
import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  VOID = 'VOID',
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  TRANSFER = 'transfer',
}

export class LineItemDto {
  @ApiProperty() @IsString()
  description: string;

  @ApiProperty() @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty() @IsNumber()
  unitPrice: number; // in smallest currency unit (e.g. cents)
}

export class PaymentReferenceDto {
  @ApiProperty({ enum: PaymentMethod }) @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional() @IsOptional() @IsString()
  stripePaymentId?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  transferReference?: string; // p.ej. número de transferencia

  @ApiProperty() @IsNumber()
  amount: number; // amount paid

  @ApiProperty() @IsDateString()
  paidAt: string;
}

export class CreateInvoiceDto {
  @ApiPropertyOptional() @IsString({}) @IsOptional() customerId: string | undefined; // internal customer ID

  @ApiProperty() @IsString()
  travelId: string; // ID del viaje relacionado

  @ApiProperty() @IsDateString()
  invoiceDate: string; // e.g. "2025-06-26"

  @ApiPropertyOptional() @IsOptional() @IsDateString()
  dueDate?: string;

  @ApiProperty({ enum: InvoiceStatus }) @IsEnum(InvoiceStatus)
  status: InvoiceStatus;

  @ApiProperty({ enum: PaymentMethod }) @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ type: [LineItemDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => LineItemDto)
  lineItems: LineItemDto[];

  @ApiProperty() @IsString()
  currency: string; // e.g. "EUR", "USD"

  @ApiProperty() @IsNumber()
  totalAmount: number; // sum of (quantity * unitPrice)

  @ApiPropertyOptional({ type: [PaymentReferenceDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PaymentReferenceDto)
  payments?: PaymentReferenceDto[];
}
