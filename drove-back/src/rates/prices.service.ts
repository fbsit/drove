// src/pricing/pricing.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

interface Range {
  kmRange: string;
  combustible: number;
}

export interface PriceResponse {
  kilometers: number;
  exactKilometers: string;
  baseCost: string;
  additionalKilometers: number;
  additionalCost: string;
  fuelCost: string;
  totalWithoutTax: string;
  tax: string;
  total: string;
}

@Injectable()
export class PricingService {
  // Rangos de kilómetros con su costo de combustible
  private readonly ranges: Range[] = [
    { kmRange: '0 A 99', combustible: 7.9 },
    { kmRange: '100 A 199', combustible: 17.8 },
    { kmRange: '200 A 299', combustible: 25.7 },
    { kmRange: '300 A 399', combustible: 31.6 },
    { kmRange: '400 A 499', combustible: 39.5 },
    { kmRange: '500 A 599', combustible: 47.4 },
    { kmRange: '600 A 699', combustible: 55.3 },
    { kmRange: '700 A 799', combustible: 63.2 },
    { kmRange: '800 A 899', combustible: 71.1 },
    { kmRange: '900 A 999', combustible: 79.0 },
    { kmRange: '1000 A 1099', combustible: 86.9 },
    { kmRange: '1100 A 1199', combustible: 94.8 },
    { kmRange: '1200 A 1299', combustible: 102.7 },
    { kmRange: '1300 A 1399', combustible: 110.6 },
    { kmRange: '1400 A 1499', combustible: 118.5 },
    { kmRange: '1500 A 1599', combustible: 126.4 },
    { kmRange: '1600 A 1699', combustible: 134.3 },
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
    const costoBase = 184.2;
    const costoPorKmExtra = 0.69;

    const kmAdicional = km > 100 ? km - 100 : 0;
    const costoAdicional = kmAdicional * costoPorKmExtra;

    // Determinar costo de combustible según rangos
    let costoCombustible: number | null = null;
    for (const range of this.ranges) {
      const [minStr, maxStr] = range.kmRange.split(' A ');
      const min = parseInt(minStr, 10);
      const max = parseInt(maxStr, 10);

      if (km >= min && km <= max) {
        costoCombustible = range.combustible;
        break;
      }
    }

    // Si supera el último rango, estimar línea recta
    if (costoCombustible === null) {
      const last = this.ranges[this.ranges.length - 1];
      const secondLast = this.ranges[this.ranges.length - 2];
      const [_, lastMaxStr] = last.kmRange.split(' A ');
      const lastMax = parseInt(lastMaxStr, 10);

      const diff = last.combustible - secondLast.combustible;
      const incrementPerKm = diff / 100;
      const extraKm = km - lastMax;

      costoCombustible = last.combustible + extraKm * incrementPerKm;
    }

    const totalSinIVA = costoBase + costoAdicional + costoCombustible;
    const tax = totalSinIVA * 0.21;
    const totalCliente = totalSinIVA + tax;

    return {
      kilometers: km,
      exactKilometers: kmExactos.toFixed(3),
      baseCost: costoBase.toFixed(2),
      additionalKilometers: kmAdicional,
      additionalCost: costoAdicional.toFixed(2),
      fuelCost: costoCombustible.toFixed(2),
      totalWithoutTax: totalSinIVA.toFixed(2),
      tax: tax.toFixed(2),
      total: totalCliente.toFixed(2),
    };
  }
}
