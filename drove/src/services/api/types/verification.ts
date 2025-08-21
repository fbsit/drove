
/**
 * Tipos para el servicio de verificación de vehículos
 */

// Daños reportados en el vehículo
export interface VehicleDamage {
  location: string;
  description: string;
  photoUrl?: string;
}

// Estado del vehículo en verificación
export interface VehicleStatus {
  fuelLevel: number; // 0-100
  mileage: number;
  damages?: VehicleDamage[];
}

// Solicitud de verificación en recogida
export interface VehiclePickupRequest {
  transferId: string;
  driverId: string;
  exteriorPhotos: string[]; // URLs de fotos guardadas
  interiorPhotos: string[]; // URLs de fotos guardadas
  signature: string; // URL de la firma
  notes: string;
  vehicleStatus: VehicleStatus;
}

// Solicitud de verificación en entrega
export interface VehicleDeliveryRequest {
  transferId: string;
  driverId: string;
  recipientId: string;
  recipientName: string;
  recipientDocumentType: string;
  recipientDocumentId: string;
  exteriorPhotos: string[];
  interiorPhotos: string[];
  signature: string;
  notes: string;
  vehicleStatus: VehicleStatus;
}

// Respuesta a verificación
export interface VerificationResponse {
  success: boolean;
  verification: {
    id: string;
    transferId: string;
    timestamp: string;
    type: 'pickup' | 'delivery';
    status: 'completed' | 'pending';
  };
}
