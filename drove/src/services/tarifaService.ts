
import ApiService from './api';
import { CalculateTarifaRequest, CalculateTarifaResponse } from './api/types/tarifas';

/**
 * Servicio de Tarifas
 * Gestiona cálculo de precios y tarifas
 */
export class TarifaService {
  // No existe /tarifas/calculate en backend; usa /rates (km) y combina con distancia/tiempo si es necesario
  static async calculateTarifa(data: CalculateTarifaRequest): Promise<CalculateTarifaResponse> {
    const total = await this.getPriceByDistance(data.distance || 0);
    return {
      price: total,
      distance: data.distance || 0,
      duration: data.duration || '0 min',
      basePrice: 0,
      distancePrice: total,
      additionalFees: [],
    };
  }

  // Obtener precio por distancia usando endpoint /rates
  static async getPriceByDistance(distance: number): Promise<number> {
    try {
      const response = await ApiService.get<any>(`/rates?km=${distance}`);
      const totalPrice = parseFloat(response.total.replace(',', '.'));
      
      if (isNaN(totalPrice)) {
        const fallbackPrice = parseFloat(response.totalWithoutTax.replace(',', '.'));
        return fallbackPrice || 0;
      }
      
      return totalPrice;
    } catch (error) {
      console.error('Error al obtener precio desde /rates:', error);
      throw error;
    }
  }
}

// Re-exports para compatibilidad
export const calculateTarifa = TarifaService.calculateTarifa;
export const getPriceByDistance = TarifaService.getPriceByDistance;

export default TarifaService;
