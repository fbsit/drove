
-- Add delivery_verification column to vehicle_transfers table
ALTER TABLE vehicle_transfers ADD COLUMN delivery_verification JSONB;

-- Update transfer_status enum to ensure we have all needed statuses
ALTER TYPE transfer_status ADD VALUE IF NOT EXISTS 'completado' AFTER 'en_entrega';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vehicle_transfers_delivery_verification ON vehicle_transfers USING gin(delivery_verification);
