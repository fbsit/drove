
export interface CalculateTarifaRequest {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  distance?: number;
  vehicleType?: 'sedan' | 'suv' | 'van' | 'other';
}

export interface AdditionalFee {
  name: string;
  amount: number;
}

export interface CalculateTarifaResponse {
  price: number;
  distance: number;
  duration: string;
  basePrice: number;
  distancePrice: number;
  additionalFees?: AdditionalFee[];
}

export interface TarifaDrove {
  id: number;
  km_range: number;
  tasa_conductor: number;
  porcentaje_beneficio: number;
  tasa: number;
  combustible: number;
  tasa_final: number;
  total_para_driver: number;
  totalPrice?: number; // Añadido para compatibilidad
  created_at: string;
}
