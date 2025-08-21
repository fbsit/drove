
import { useState, useEffect } from 'react';
import { TarifaService } from '@/services/tarifaService';

export interface UseTarifaCalculationResult {
  calculatePrice?: (distance: number) => number;
  loading: boolean;
  error: string | null;
}

export const useTarifaCalculation = (): UseTarifaCalculationResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatePrice = (distance: number): number => {
    // Tarifa base simplificada
    const basePrice = 50; // €50 base
    const pricePerKm = 1.5; // €1.50 por km
    
    return basePrice + (distance * pricePerKm);
  };

  return {
    calculatePrice,
    loading,
    error
  };
};
