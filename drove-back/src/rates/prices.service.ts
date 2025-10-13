// src/pricing/pricing.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

interface Band {
  min: number;
  max: number;
  baseRate: number; // "TASA" de la hoja por tramo (sin IVA, sin combustible)
  combustible: number; // coste de combustible por tramo (sin IVA)
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
  // Tramos de kilómetros con su TASA (baseRate) y combustible (según hoja)
  private readonly bands: Band[] = [
    { min: 0,    max: 99,   baseRate: 147.50, combustible: 9.00 },
    { min: 100,  max: 199,  baseRate: 191.50, combustible: 17.80 },
    { min: 200,  max: 299,  baseRate: 246.50, combustible: 25.70 },
    { min: 300,  max: 399,  baseRate: 279.50, combustible: 31.60 },
    { min: 400,  max: 499,  baseRate: 299.30, combustible: 39.50 },
    { min: 500,  max: 599,  baseRate: 316.90, combustible: 47.40 },
    { min: 600,  max: 699,  baseRate: 345.60, combustible: 55.30 },
    { min: 700,  max: 799,  baseRate: 389.50, combustible: 63.20 },
    { min: 800,  max: 899,  baseRate: 422.50, combustible: 71.10 },
    { min: 900,  max: 999,  baseRate: 466.50, combustible: 79.00 },
    { min: 1000, max: 1099, baseRate: 499.50, combustible: 86.90 },
    { min: 1100, max: 1199, baseRate: 543.50, combustible: 94.80 },
    { min: 1200, max: 1299, baseRate: 556.70, combustible: 102.70 },
    { min: 1300, max: 1399, baseRate: 576.50, combustible: 110.60 },
    { min: 1400, max: 1499, baseRate: 631.50, combustible: 118.50 },
    { min: 1500, max: 1599, baseRate: 653.50, combustible: 126.40 },
    { min: 1600, max: 1699, baseRate: 675.50, combustible: 134.30 },
    { min: 1700, max: 1799, baseRate: 697.50, combustible: 142.20 },
    { min: 1800, max: 1899, baseRate: 719.50, combustible: 150.10 },
    { min: 1900, max: 1999, baseRate: 741.50, combustible: 158.00 },
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

    // Localizar el tramo; si excede, extrapolar linealmente desde el último tramo
    let band = this.bands.find(b => km >= b.min && km <= b.max);
    let baseRate = band?.baseRate ?? 0;
    let combustible = band?.combustible ?? 0;
    if (!band) {
      const last = this.bands[this.bands.length - 1];
      const prev = this.bands[this.bands.length - 2];
      const lastWidth = (last.max - last.min) || 100;
      const baseDiff = last.baseRate - prev.baseRate;
      const fuelDiff = last.combustible - prev.combustible;
      const stepsBeyond = Math.floor((km - last.max) / lastWidth) + 1;
      baseRate = last.baseRate + stepsBeyond * baseDiff;
      combustible = last.combustible + stepsBeyond * fuelDiff;
    }

    // Modelo por tramos: no hay coste adicional por km
    const kmAdicional = 0;
    const costoAdicional = 0;

    const totalSinIVA = baseRate + combustible;
    const tax = totalSinIVA * 0.21;
    const totalCliente = totalSinIVA + tax;

    return {
      kilometers: km,
      exactKilometers: kmExactos.toFixed(3),
      baseCost: baseRate.toFixed(2),
      additionalKilometers: kmAdicional,
      additionalCost: costoAdicional.toFixed(2),
      fuelCost: combustible.toFixed(2),
      totalWithoutTax: totalSinIVA.toFixed(2),
      tax: tax.toFixed(2),
      total: totalCliente.toFixed(2),
    };
  }
}
