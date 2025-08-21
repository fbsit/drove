
import { LatLngCity } from '@/types/lat-lng-city';
import { TransferStatus } from './transfers';

/**
 * Interfaz para la solicitud de viaje en formato plano para la API REST
 */
export interface TravelRequest {
  // Detalles del vehículo
  type: string;
  brand: string;
  model: string;
  year: string;
  licensePlate: string;
  vin: string;

  // Detalles de recogida
  originAddress: LatLngCity;
  destinationAddress: LatLngCity;
  pickupTime: string;
  pickupDate: string;
  routePolyline: string;
  
  // Detalles del remitente
  senderName: string;
  senderDni: string;
  senderEmail: string;
  senderPhone: string;

  // Detalles del receptor
  receiverName: string;
  receiverDni: string;
  receiverEmail: string;
  receiverPhone: string;

  // Detalles del traslado
  distance: number;
  duration: number;
  totalPrice: number;
  signature: string;

  // Otros detalles
  paymentMethod: string;
  createdAt: string;
  idClient?: string;
  status: string;
}
