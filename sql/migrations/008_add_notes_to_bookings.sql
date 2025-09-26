-- Add missing notes column to bookings for extension notes storage
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- This migration ensures that booking extensions can append renter notes safely.


