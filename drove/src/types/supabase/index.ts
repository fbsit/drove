
import { Database as DB } from './base';

// Re-export types
export type Database = DB;
export type Tables = Database['public']['Tables'];

// Export derived types for commonly used tables
export type VehicleTransfer = Tables['vehicle_transfers']['Row'];
export type User = Tables['users']['Row'];
export type TarifaDrove = Tables['tarifas_drove']['Row'];
export type Payment = Tables['payments']['Row'];
export type Invoice = Tables['invoices']['Row'];

export * from './base';
export * from './tarifas';
export * from './transfers';
export * from './users';
export * from './payments';
