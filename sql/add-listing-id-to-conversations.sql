-- Add listing_id column to conversations table
-- This allows direct messaging about listings without requiring a booking

ALTER TABLE conversations ADD COLUMN listing_id UUID REFERENCES listings(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX idx_conversations_listing_id ON conversations(listing_id);

-- Remove the UNIQUE constraint on booking_id since conversations can now exist without bookings
-- (This step might fail depending on your PostgreSQL version and existing constraints)
-- ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_booking_id_key;