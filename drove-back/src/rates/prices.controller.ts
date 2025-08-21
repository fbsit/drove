// src/pricing/prices.controller.ts

import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { PricingService, PriceResponse } from './prices.service';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Rates')
@Controller('rates')
export class PricesController {
  constructor(private readonly pricingService: PricingService) {}

  /**
   * GET /rates?km=123.45
   *
   * Calcula el precio total según el kilometraje proporcionado.
   */
  @Get()
  @ApiOperation({ summary: 'Calcular tarifa por km' })
  @ApiQuery({ name: 'km', required: true, description: 'Kilómetros exactos' })
  @ApiOkResponse({
    description: 'Detalle de cálculo de tarifa',
    schema: {
      example: {
        kilometers: 120,
        exactKilometers: '119.542',
        baseCost: '184.20',
        additionalKilometers: 20,
        additionalCost: '13.80',
        fuelCost: '17.80',
        totalWithoutTax: '215.80',
        tax: '45.32',
        total: '261.12',
      },
    },
  })
  calculate(@Query('km') km: string): PriceResponse {
    try {
      return this.pricingService.getPrice(km);
    } catch (err) {
      // Convertimos cualquier error de parseo o validación en un 400
      throw new BadRequestException(err.message);
    }
  }
}
