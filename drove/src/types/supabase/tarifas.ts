
import { Json } from './base';

export interface TarifaTable {
  id: number
  km_range: number // Tipo correcto como número
  tasa_conductor: number
  porcentaje_beneficio: number
  tasa: number
  combustible: number
  tasa_final: number
  total_para_driver: number
  created_at: string
  updated_at?: string
}

export interface Database {
  public: {
    Tables: {
      "tarifas_drove": {
        Row: TarifaTable
        Insert: {
          id?: number
          km_range: number // Tipo correcto como número
          tasa_conductor: number
          porcentaje_beneficio: number
          tasa: number
          combustible: number
          tasa_final: number
          total_para_driver: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          km_range?: number // Tipo correcto como número
          tasa_conductor?: number
          porcentaje_beneficio?: number
          tasa?: number
          combustible?: number
          tasa_final?: number
          total_para_driver?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
