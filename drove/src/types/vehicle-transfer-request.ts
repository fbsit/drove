export interface VehicleTransferFormData {
  pickupAddress: string;
  pickupAddressLat: number | null;
  pickupAddressLng: number | null;
  destinationAddress: string;
  destinationAddressLat: number | null;
  destinationAddressLng: number | null;
  transferDate: Date | null;
  transferTime: string;
  vehicleType: string;
  name: string;
  email: string;
  phone: string;
  comments?: string;
  price?: number;
  paymentMethod?: "card" | "transfer";
  cardToken?: string;
  saveCard?: boolean;

  vehicleDetails?: {
    type?: string;
    brand?: string;
    model?: string;
    year?: string;
    licensePlate?: string;
    vin?: string;
  };

  transferDetails?: {
    totalPrice?: number;
    distance?: number;
    duration?: number;
    signature?: string;
  };

  senderDetails?: {
    fullName?: string;
    dni?: string;
    email?: string;
    phone?: string;
  };

  receiverDetails?: {
    fullName?: string;
    dni?: string;
    email?: string;
    phone?: string;
  };

  pickupDetails?: {
    originAddress?: {
      address: string;
      city: string;
      lat: number;
      lng: number;
    };
    destinationAddress?: {
      address: string;
      city: string;
      lat: number;
      lng: number;
    };
    pickupDate?: Date;
    pickupTime?: string;
  };
}

export interface VehicleTransferRequest extends VehicleTransferFormData {}

export interface LocationSuggestion {
  place_id: string;
  description: string;
}
