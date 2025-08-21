
import { Json } from './base';

export interface VehicleTransferTable {
  id: string
  created_at: string
  vehicle_details: Json
  pickup_details: Json
  sender_details: Json
  receiver_details: Json
  transfer_details: Json
  payment_method: string
  status: string
  client_id?: string
  driver_id?: string
  pickup_verification?: Json
}

export interface Database {
  public: {
    Tables: {
      vehicle_transfers: {
        Row: VehicleTransferTable
        Insert: {
          id?: string
          created_at?: string
          vehicle_details: Json
          pickup_details: Json
          sender_details: Json
          receiver_details: Json
          transfer_details: Json
          payment_method: string
          status?: string
          client_id?: string
          driver_id?: string
          pickup_verification?: Json
        }
        Update: {
          id?: string
          created_at?: string
          vehicle_details?: Json
          pickup_details?: Json
          sender_details?: Json
          receiver_details?: Json
          transfer_details?: Json
          payment_method?: string
          status?: string
          client_id?: string
          driver_id?: string
          pickup_verification?: Json
        }
      }
    }
  }
}
