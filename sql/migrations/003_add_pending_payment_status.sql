-- Add PENDING_PAYMENT status to booking_status enum
-- This status is used when payment is processing but booking is not yet confirmed

-- First, add the new value to the enum type
ALTER TYPE booking_status ADD VALUE 'PENDING_PAYMENT';

-- This allows the system to distinguish between:
-- PENDING: Booking created, waiting for payment initiation
-- PENDING_PAYMENT: Payment initiated, waiting for payment completion
-- CONFIRMED: Payment completed and booking confirmed (for instant bookings)
-- PENDING: For non-instant bookings, after payment completes, status becomes PENDING awaiting lister approval