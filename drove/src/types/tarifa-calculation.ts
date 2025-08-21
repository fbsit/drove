
export interface CalculateTarifaResult {
  distanceValue: number;
  durationMinutes: number;
  totalPrice: number; // Agregando la propiedad faltante
  ratesResponse?: any;
}

export interface TarifaCalculationHook {
  isLoadingTarifa: boolean;
  tarifaError: string | null;
  currentTarifa: CalculateTarifaResult | null;
  ratesResponse: any;
  calculateTarifa: (distance: number, duration: number) => Promise<CalculateTarifaResult | null>;
  calculateManualTarifa: (estimatedDistance: number) => Promise<CalculateTarifaResult | null>;
  recalculateTarifa: () => Promise<CalculateTarifaResult | null>;
}
