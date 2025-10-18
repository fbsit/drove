// src/pricing/pricing.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

interface BandFinal {
  min: number;
  max: number;
  finalTotal: number; // Total con IVA para el cliente según tabla oficial
}

export interface PriceResponse {
  kilometers: number;
  exactKilometers: string;
  baseCost: string; // TASA por tramo
  additionalKilometers: number; // se mantiene por compatibilidad (0 con modelo por tramos)
  additionalCost: string; // 0 con modelo por tramos
  fuelCost: string;
  totalWithoutTax: string;
  tax: string;
  total: string;
}

@Injectable()
export class PricingService {
  // Tramos de kilómetros con el TOTAL (IVA incl.) según la tabla final
  private readonly bands: BandFinal[] = [
    { min: 0,    max: 99,   finalTotal: 189.37 },
    { min: 100,  max: 199,  finalTotal: 253.25 },
    { min: 200,  max: 299,  finalTotal: 329.36 },
    { min: 300,  max: 399,  finalTotal: 376.43 },
    { min: 400,  max: 499,  finalTotal: 409.95 },
    { min: 500,  max: 599,  finalTotal: 440.80 },
    { min: 600,  max: 699,  finalTotal: 498.28 },
    { min: 700,  max: 799,  finalTotal: 547.77 },
    { min: 800,  max: 899,  finalTotal: 597.26 },
    { min: 900,  max: 999,  finalTotal: 660.06 },
    { min: 1000, max: 1099, finalTotal: 709.54 },
    { min: 1100, max: 1199, finalTotal: 772.34 },
    { min: 1200, max: 1299, finalTotal: 797.87 },
    { min: 1300, max: 1399, finalTotal: 831.39 },
    { min: 1400, max: 1499, finalTotal: 907.50 },
    { min: 1500, max: 1599, finalTotal: 943.68 },
    { min: 1600, max: 1699, finalTotal: 979.86 },
    { min: 1700, max: 1799, finalTotal: 1016.04 },
    { min: 1800, max: 1899, finalTotal: 1052.22 },
    { min: 1900, max: 1999, finalTotal: 1088.40 },
  ];

  /**
   * Parsea dinámicamente cualquier formato numérico:
   * - Elimina espacios y separadores de miles.
   * - Soporta comas o puntos como separador decimal.
   */
  private parseKmInput(input: string | number): number {
    let str = String(input).trim().replace(/\s+/g, '');

    const lastDot = str.lastIndexOf('.');
    const lastComma = str.lastIndexOf(',');

    if (lastDot !== -1 && lastComma !== -1) {
      if (lastDot > lastComma) {
        str = str.replace(/,/g, '');
      } else {
        str = str.replace(/\./g, '');
        str = str.replace(',', '.');
      }
    } else if (lastComma !== -1 && lastDot === -1) {
      str = str.replace(',', '.');
    }

    const val = parseFloat(str);
    return val;
  }

  /**
   * Calcula el precio total para un kilometraje dado.
   * @param kmInput Valor de kilómetros (string o número)
   */
  getPrice(kmInput: string | number): PriceResponse {
    const kmExactos = this.parseKmInput(kmInput);

    if (isNaN(kmExactos) || kmExactos < 0) {
      throw new BadRequestException('Kilometraje inválido');
    }

    const km = Math.round(kmExactos);

    // Localizar el tramo; si excede, usar el último tramo sin extrapolar (política conservadora)
    const band = this.bands.find(b => km >= b.min && km <= b.max) || this.bands[this.bands.length - 1];

    const totalCliente = band.finalTotal;
    const totalSinIVA = totalCliente / 1.21;
    const tax = totalCliente - totalSinIVA;

    // Desglose compatible: tratamos todo como "base" y sin combustible/adicional
    const kmAdicional = 0;
    const costoAdicional = 0;

    return {
      kilometers: km,
      exactKilometers: kmExactos.toFixed(3),
      baseCost: totalSinIVA.toFixed(2),
      additionalKilometers: kmAdicional,
      additionalCost: costoAdicional.toFixed(2),
      fuelCost: (0).toFixed(2),
      totalWithoutTax: totalSinIVA.toFixed(2),
      tax: tax.toFixed(2),
      total: totalCliente.toFixed(2),
    };
  }
}
