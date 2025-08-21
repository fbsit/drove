// src/admin/dto/admin.dto.ts

import { IsOptional, IsString, MinLength, IsISO8601 } from 'class-validator';

/**
 * DTO para actualizar el rol de un usuario
 */
export class UpdateUserRoleDto {
  @IsString({ message: 'El rol debe ser una cadena de texto.' })
  @MinLength(2, { message: 'El rol debe tener al menos 2 caracteres.' })
  role: string;
}

/**
 * DTO para confirmar un pago
 */
export class ConfirmPaymentDto {
  @IsString({ message: 'El adminId debe ser una cadena de texto.' })
  adminId: string;
}

/**
 * DTO para emitir una factura
 */
export class IssueInvoiceDto {
  @IsString({ message: 'El adminId debe ser una cadena de texto.' })
  adminId: string;

  @IsString({ message: 'El invoiceNumber debe ser una cadena de texto.' })
  @MinLength(1, { message: 'El número de factura no puede estar vacío.' })
  invoiceNumber: string;
}

/**
 * DTO para asignar un driver a un traslado
 */
export class AssignDriverDto {
  @IsString({ message: 'El driverId debe ser una cadena de texto.' })
  driverId: string;

  @IsString({ message: 'El adminId debe ser una cadena de texto.' })
  adminId: string;
}

/**
 * DTO para los filtros de consulta de traslados administrativos
 */
export class AdminTransfersQueryDto {
  @IsOptional()
  @IsString({ message: 'El status debe ser una cadena.' })
  status?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'startDate debe seguir el formato ISO8601.' })
  startDate?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'endDate debe seguir el formato ISO8601.' })
  endDate?: string;
}

/**
 * DTO para los filtros de consulta de métricas de negocio
 */
export class BusinessMetricsQueryDto {
  @IsOptional()
  @IsISO8601({}, { message: 'startDate debe seguir el formato ISO8601.' })
  startDate?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'endDate debe seguir el formato ISO8601.' })
  endDate?: string;

  @IsOptional()
  @IsString({ message: 'clientType debe ser una cadena.' })
  clientType?: string;
}
