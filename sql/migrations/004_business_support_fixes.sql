-- Business feature support fixes
-- - Add missing columns used by app code
-- - Add missing enum value for team invitation status
-- - Add triggers for updated_at where applicable

-- 1) team_status add 'PENDING' (safe-guarded for re-runs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'team_status' AND e.enumlabel = 'PENDING'
  ) THEN
    ALTER TYPE team_status ADD VALUE 'PENDING';
  END IF;
END$$;

-- 2) team_members timestamps expected by code
ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger to maintain updated_at on team_members (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_team_members_updated_at'
  ) THEN
    CREATE TRIGGER update_team_members_updated_at
      BEFORE UPDATE ON team_members
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- 3) payments.checkout_id used for matching provider session ids
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS checkout_id VARCHAR(255);

-- Helpful index for lookups by checkout_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'idx_payments_checkout_id'
  ) THEN
    CREATE INDEX idx_payments_checkout_id ON payments(checkout_id);
  END IF;
END$$;

-- 4) bookings contact details captured at checkout
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_address TEXT;




