
import { Json } from './base';

export interface UserTable {
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

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserTable
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
    }
  }
}
