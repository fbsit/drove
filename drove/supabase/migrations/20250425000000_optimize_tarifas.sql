
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tarifas_km_range ON tarifas_drove(km_range);
CREATE INDEX IF NOT EXISTS idx_tarifas_tasa_final ON tarifas_drove(tasa_final);

-- Add constraints to ensure valid ranges
ALTER TABLE tarifas_drove
ADD CONSTRAINT check_valid_tasa_final
CHECK (tasa_final > 0);

-- Add metadata columns for auditing
ALTER TABLE tarifas_drove
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE OR REPLACE FUNCTION update_tarifas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tarifas_timestamp
BEFORE UPDATE ON tarifas_drove
FOR EACH ROW
EXECUTE FUNCTION update_tarifas_timestamp();
