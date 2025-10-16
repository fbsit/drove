
export enum TransferStatus {
  PENDINGPAID = 'PENDINGPAID',
  CREATED = 'CREATED',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_PROGRESS = 'IN_PROGRESS',
  REQUEST_FINISH = 'REQUEST_FINISH',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface TransferDetail {
  id: string;
  status: TransferStatus;
  created_at: string;
  createdAt?: string;
  
  // Detalles de vehículo
  type?: string;
  brand?: string;
  model?: string;
  year?: string;
  licensePlate?: string;
  vin?: string;
  
  // Detalles de ubicación
  originAddress?: string;
  destinationAddress?: string;
  originLat?: number;
  originLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  pickupDate?: string;
  pickupTime?: string;
  
  // Detalles de personas
  senderName?: string;
  senderDni?: string;
  senderEmail?: string;
  senderPhone?: string;
  receiverName?: string;
  receiverDni?: string;
  receiverEmail?: string;
  receiverPhone?: string;
  
  // Detalles del cliente y transportista
  idClient?: string;
  client_id?: string;  // Añadida propiedad adicional para compatibilidad
  clientName?: string;
  clientEmail?: string;
  companyName?: string;
  driverId?: string;
  driver_id?: string;  // Añadida propiedad adicional para compatibilidad
  driverName?: string;

  // Detalles del traslado
  distance?: number;
  duration?: number;
  totalPrice?: number;
  signature?: string;
  paymentMethod?: string;
  price?: number;
}

export interface TransferSummary {
  id: string;
  status: string;
  created_at: string;
  price: number;
  pickup_details: {
    originAddress: string;
    destinationAddress: string;
    pickupDate: string;
  };
  vehicle_details: {
    brand: string;
    model: string;
    licensePlate: string;
  };
  drover?: {
    full_name: string;
  };
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
    droverResponse?: string;
    droverResponseDate?: string;
    adminResponse?: string;
    adminResponseDate?: string;
  };
}

export interface ClientTransfersResponse {
  transfers: TransferSummary[];
}

export interface CreateTransferRequest {
  vehicleDetails: {
    type: string;
    brand: string;
    model: string;
    year: string;
    licensePlate?: string; // opcional
    vin: string;
  };

  pickupDetails: {
    originAddress: { city: string; lat: number; lng: number; address?: string };
    destinationAddress: { city: string; lat: number; lng: number; address?: string };
    pickupTime: string;
    pickupDate: string; // ISO date
  };

  senderDetails: { fullName: string; dni: string; email: string; phone: string };
  receiverDetails: { fullName: string; dni: string; email: string; phone: string };

  transferDetails: {
    distance: number;
    duration?: number;
    totalPrice: number;
    signature: string;
  };

  paymentMethod: string; // 'card' | 'transfer'
  status: string; // backend lo recalcula, pero enviamos referencia
}

export interface CreateTransferResponse {
  id: string;
  status: TransferStatus;
  createdAt: string;
}

export interface UpdateTransferStatusRequest {
  status: TransferStatus;
}
