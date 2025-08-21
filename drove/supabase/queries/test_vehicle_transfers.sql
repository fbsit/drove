
-- Test basic CRUD operations
-- 1. Select all transfers
SELECT * FROM vehicle_transfers;

-- 2. Select transfers by status
SELECT id, status, vehicle_details->>'brand' as brand, 
       sender_details->>'fullName' as sender,
       transfer_details->>'totalPrice' as price
FROM vehicle_transfers
WHERE status = 'pendiente';

-- 3. Test JSON field queries
SELECT 
  v.id,
  v.status,
  v.vehicle_details->>'brand' as brand,
  v.vehicle_details->>'model' as model,
  v.pickup_details->>'originAddress' as origin,
  v.pickup_details->>'destinationAddress' as destination,
  v.sender_details->>'fullName' as sender,
  v.receiver_details->>'fullName' as receiver,
  v.transfer_details->>'totalPrice' as price
FROM vehicle_transfers v
WHERE (v.vehicle_details->>'type')::text = 'coche'
ORDER BY v.created_at DESC;

-- 4. Test constraints
-- This should fail due to missing required fields
INSERT INTO vehicle_transfers (
  vehicle_details,
  pickup_details,
  sender_details,
  receiver_details,
  transfer_details,
  payment_method
) VALUES (
  '{"type": "coche"}',  -- Missing required fields
  '{}',
  '{}',
  '{}',
  '{}',
  'card'
);


