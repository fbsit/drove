
import { Json } from './base';

export interface PaymentTable {
  id: number
  transfer_id: string
  method: string
  status: string
  amount?: number
  confirmed_at?: string
  confirmed_by?: string
  created_at: string
}

export interface InvoiceTable {
  id: number
  transfer_id: string
  invoice_number?: string
  issued: boolean
  issued_at?: string
  issued_by?: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      payments: {
        Row: PaymentTable
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
        Row: InvoiceTable
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
  }
}
