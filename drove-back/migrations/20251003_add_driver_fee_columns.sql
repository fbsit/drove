-- Migration: add driver compensation fields to travels
-- Safe to run multiple times

BEGIN;

-- Add numeric driver compensation per trip (freelance)
ALTER TABLE IF EXISTS travels
  ADD COLUMN IF NOT EXISTS "driverFee" double precision NULL;

-- Add metadata snapshot used for audits (TypeORM simple-json maps to text)
ALTER TABLE IF EXISTS travels
  ADD COLUMN IF NOT EXISTS "driverFeeMeta" text NULL;

COMMIT;

-- Down (manual rollback)
-- BEGIN;
-- ALTER TABLE IF EXISTS travels DROP COLUMN IF EXISTS "driverFeeMeta";
-- ALTER TABLE IF EXISTS travels DROP COLUMN IF EXISTS "driverFee";
-- COMMIT;


