import { TransferStatus } from "@/services/api/types/transfers";

export type VehicleType = "coche" | "camioneta";
export type PaymentMethod = "card" | "transfer";

export type PickupStepKey = 
  | 'transferSummary'
  | 'exteriorPhotos' 
  | 'interiorPhotos'
  | 'signatureComments'
  | 'confirmation';

export type DeliveryStepKey = 
  | 'deliverySummary'
  | 'exteriorPhotos'
  | 'interiorPhotos' 
  | 'recipientIdentity'
  | 'finalHandover'
  | 'confirmation';

export interface VehicleTransferDB {
  id: string;
  created_at: string;
  status: TransferStatus;
  vehicleDetails: {
    type: VehicleType;
    brand: string;
    model: string;
    year: string;
    licensePlate: string;
    vin: string;
  };
  pickupDetails: {
    originAddress: string;
    destinationAddress: string;
    originLat: number;
    originLng: number;
    destinationLat: number;
    destinationLng: number;
    pickupDate: string;
    pickupTime: string;
  };
  senderDetails: SenderDetails;
  receiverDetails: ReceiverDetails;
  transferDetails: {
    totalPrice: number;
    distance: number;
    duration: number;
    signature: string;
  };
  paymentMethod: PaymentMethod;
}

export interface PickupVerificationData {
  exterior_photos: Record<string, string>;
  interior_photos: Record<string, string>;
  comments: string;
  signature: string;
  verifiedAt: string;
}

export interface DeliveryVerificationData {
  exterior_photos: Record<string, string>;
  interior_photos: Record<string, string>;
  recipientIdentity: {
    idNumber: string;
    idFrontPhoto: string;
    idBackPhoto: string;
    selfieWithId: string;
    hasDamage: boolean;
    damageDescription?: string;
  };
  handoverDocuments: {
    deliveryDocument: string;
    fuelReceipt: string;
    comments?: string;
    droverSignature: string;
    clientSignature: string;
  };
  deliveredAt: string;
}

// Updated interfaces to be consistent
export interface SenderDetails {
  name: string;
  fullName?: string;
  dni: string;
  email: string;
  phone: string;
}

export interface ReceiverDetails {
  name: string;
  fullName?: string;
  dni: string;
  email: string;
  phone: string;
}

// Review interface
export interface TransferReview {
  rating: number;
  comment: string;
  createdAt: string;
  droverResponse?: string;
  droverResponseDate?: string;
  adminResponse?: string;
  adminResponseDate?: string;
}

// Updated MockTransfer interface to match actual usage
export interface MockTransfer {
  id: string;
  created_at: string;
  status: string;
  // Vehicle properties directly accessible
  brand: string;
  model: string;
  year: string;
  licensePlate: string;
  vin?: string;
  // Pickup properties directly accessible  
  originAddress: string;
  destinationAddress: string;
  pickupDate: string;
  pickupTime: string;
  // Transfer properties directly accessible
  price: number;
  distance?: number;
  duration?: number;
  // Required nested structure for backward compatibility
  vehicle_details: {
    brand: string;
    model: string;
    year: string;
    licensePlate: string;
  };
  pickup_details: {
    originAddress: string;
    destinationAddress: string;
    pickupDate: string;
    pickupTime: string;
  };
  transfer_details: {
    totalPrice: number;
    distance: number;
    duration: number;
  };
  payment_method: PaymentMethod;
  sender: SenderDetails;
  receiver: ReceiverDetails;
  drover: {
    full_name: string;
    telefono: string;
    email: string;
  };
  isRescheduled?: boolean;
  originalPickupDate?: string;
  originalPickupTime?: string;
  rescheduleReason?: string;
  rescheduledAt?: string;
  review?: TransferReview;
}
