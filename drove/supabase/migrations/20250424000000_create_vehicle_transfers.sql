
-- Create custom types
CREATE TYPE vehicle_type AS ENUM ('coche', 'camioneta');
CREATE TYPE payment_method AS ENUM ('card', 'transfer');
CREATE TYPE transfer_status AS ENUM ('pendiente', 'confirmado', 'en_proceso', 'en_recogida', 'en_entrega', 'completado', 'cancelado');

-- Create the vehicle_transfers table
CREATE TABLE vehicle_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  vehicle_details JSONB NOT NULL,
  pickup_details JSONB NOT NULL,
  sender_details JSONB NOT NULL,
  receiver_details JSONB NOT NULL,
  transfer_details JSONB NOT NULL,
  payment_method payment_method NOT NULL,
  status transfer_status NOT NULL DEFAULT 'pendiente',
  client_id UUID REFERENCES auth.users(id),
  driver_id UUID REFERENCES auth.users(id),
  pickup_verification JSONB,
  
  CONSTRAINT vehicle_details_check CHECK (
    vehicle_details ? 'type' AND
    vehicle_details ? 'brand' AND
    vehicle_details ? 'model' AND
    vehicle_details ? 'year' AND
    vehicle_details ? 'licensePlate' AND
    vehicle_details ? 'vin'
  ),
  CONSTRAINT pickup_details_check CHECK (
    pickup_details ? 'originAddress' AND
    pickup_details ? 'originLat' AND
    pickup_details ? 'originLng' AND
    pickup_details ? 'destinationAddress' AND
    pickup_details ? 'destinationLat' AND
    pickup_details ? 'destinationLng' AND
    pickup_details ? 'pickupDate' AND
    pickup_details ? 'pickupTime'
  ),
  CONSTRAINT sender_receiver_details_check CHECK (
    sender_details ? 'fullName' AND
    sender_details ? 'dni' AND
    sender_details ? 'email' AND
    sender_details ? 'phone' AND
    receiver_details ? 'fullName' AND
    receiver_details ? 'dni' AND
    receiver_details ? 'email' AND
    receiver_details ? 'phone'
  ),
  CONSTRAINT transfer_details_check CHECK (
    transfer_details ? 'distance' AND
    transfer_details ? 'duration' AND
    transfer_details ? 'totalPrice' AND
    transfer_details ? 'signature'
  )
);

-- Create indexes
CREATE INDEX idx_vehicle_transfers_status ON vehicle_transfers(status);
CREATE INDEX idx_vehicle_transfers_created_at ON vehicle_transfers(created_at DESC);
CREATE INDEX idx_vehicle_transfers_driver_id ON vehicle_transfers(driver_id);
CREATE INDEX idx_vehicle_transfers_client_id ON vehicle_transfers(client_id);

-- Enable RLS
ALTER TABLE vehicle_transfers ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users to insert
CREATE POLICY "Enable insert for authenticated users only"
ON vehicle_transfers FOR INSERT TO authenticated WITH CHECK (true);

-- Create a policy that allows users to view their own transfers
CREATE POLICY "Enable read access for users based on sender email"
ON vehicle_transfers FOR SELECT TO authenticated
USING ((sender_details->>'email')::text = auth.jwt()->>'email');

-- Create a policy that allows drivers to view transfers assigned to them
CREATE POLICY "Enable read access for drivers assigned to transfers"
ON vehicle_transfers FOR SELECT TO authenticated
USING (driver_id = auth.uid());

-- Create a policy that allows drivers to update their assigned transfers
CREATE POLICY "Enable update for drivers on assigned transfers"
ON vehicle_transfers FOR UPDATE TO authenticated
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

-- Sample data stays the same
