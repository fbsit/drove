// src/user/dtos/detailed-user.dto.ts

export interface FavoriteRoute {
  origin: string;
  destination: string;
  count: number;
}

export interface VehicleTypeStat {
  type: string;
  count: number;
}

export interface DetailedUser {
  id: string;
  email: string;
  status: string;
  role: string;
  contactInfo: {
    fullName: string;
    phone: string;
    documentId: string;
    address: string;
    city: string;
    province: string;
    country: string;
    zipCode: string;
    selfie?: string;
  };
  totalSpent: number;
  tripsCount: number;
  favoriteRoutes: FavoriteRoute[];
  vehicleStats: VehicleTypeStat[];
}
