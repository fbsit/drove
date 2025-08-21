
-- Drop existing table if exists (this will be handled by the Supabase migration)
DROP TABLE IF EXISTS tarifas_drove CASCADE;

-- Create new tabla tarifas_drove with simplified structure
CREATE TABLE tarifas_drove (
    id SERIAL PRIMARY KEY,
    km_range INTEGER NOT NULL,
    tasa_conductor DECIMAL(10, 2) NOT NULL,
    porcentaje_beneficio DECIMAL(5, 2) NOT NULL,
    tasa DECIMAL(10, 2) NOT NULL,
    combustible DECIMAL(10, 2) NOT NULL,
    tasa_final DECIMAL(10, 2) NOT NULL,
    total_para_driver DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_tarifas_km_range ON tarifas_drove(km_range);

-- Create updater function for timestamps
CREATE OR REPLACE FUNCTION update_tarifas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for timestamp updates
CREATE TRIGGER trigger_update_tarifas_timestamp
BEFORE UPDATE ON tarifas_drove
FOR EACH ROW
EXECUTE FUNCTION update_tarifas_timestamp();

-- Datos iniciales basados en la información proporcionada
INSERT INTO tarifas_drove (km_range, tasa_conductor, porcentaje_beneficio, tasa, combustible, tasa_final, total_para_driver) VALUES
(50, 10.00, 20.00, 12.00, 5.00, 17.00, 10.00),
(100, 20.00, 20.00, 24.00, 10.00, 34.00, 20.00),
(150, 30.00, 20.00, 36.00, 15.00, 51.00, 30.00),
(200, 40.00, 20.00, 48.00, 20.00, 68.00, 40.00),
(250, 50.00, 20.00, 60.00, 25.00, 85.00, 50.00),
(300, 60.00, 20.00, 72.00, 30.00, 102.00, 60.00),
(350, 70.00, 20.00, 84.00, 35.00, 119.00, 70.00),
(400, 80.00, 20.00, 96.00, 40.00, 136.00, 80.00),
(450, 90.00, 20.00, 108.00, 45.00, 153.00, 90.00),
(500, 100.00, 20.00, 120.00, 50.00, 170.00, 100.00);
