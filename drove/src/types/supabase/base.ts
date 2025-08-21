
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      vehicle_transfers: {
        Row: {
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
          delivery_verification?: Json
        }
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
          delivery_verification?: Json
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
          delivery_verification?: Json
        }
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          user_type: string
          role?: string
          full_name?: string
          phone?: string
          document_id?: string
          document_type?: string
          profile_complete?: boolean
          company_name?: string
          is_approved?: boolean
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          user_type: string
          role?: string
          full_name?: string
          phone?: string
          document_id?: string
          document_type?: string
          profile_complete?: boolean
          company_name?: string
          is_approved?: boolean
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          user_type?: string
          role?: string
          full_name?: string
          phone?: string
          document_id?: string
          document_type?: string
          profile_complete?: boolean
          company_name?: string
          is_approved?: boolean
        }
      }
      tarifas_drove: {
        Row: {
          id: number
          km_range: number // Changed from string to number
          tasa_conductor: number
          porcentaje_beneficio: number
          tasa: number
          combustible: number
          tasa_final: number
          total_para_driver: number
          created_at: string
        }
        Insert: {
          id?: number
          km_range: number // Changed from string to number
          tasa_conductor: number
          porcentaje_beneficio: number
          tasa: number
          combustible: number
          tasa_final: number
          total_para_driver: number
          created_at?: string
        }
        Update: {
          id?: number
          km_range?: number // Changed from string to number
          tasa_conductor?: number
          porcentaje_beneficio?: number
          tasa?: number
          combustible?: number
          tasa_final?: number
          total_para_driver?: number
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: number
          transfer_id: string
          method: string
          status: string
          amount?: number
          confirmed_at?: string
          confirmed_by?: string
          created_at: string
        }
        Insert: {
          id?: number
          transfer_id: string
          method: string
          status?: string
          amount?: number
          confirmed_at?: string
          confirmed_by?: string
          created_at?: string
        }
        Update: {
          id?: number
          transfer_id?: string
          method?: string
          status?: string
          amount?: number
          confirmed_at?: string
          confirmed_by?: string
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: number
          transfer_id: string
          invoice_number?: string
          issued: boolean
          issued_at?: string
          issued_by?: string
          created_at: string
        }
        Insert: {
          id?: number
          transfer_id: string
          invoice_number?: string
          issued?: boolean
          issued_at?: string
          issued_by?: string
          created_at?: string
        }
        Update: {
          id?: number
          transfer_id?: string
          invoice_number?: string
          issued?: boolean
          issued_at?: string
          issued_by?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
