-- Migration: Add rental agreements table
-- This migration adds the rental_agreements table for storing digital rental agreements

-- Create rental agreements table
CREATE TABLE rental_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    agreement_number VARCHAR(255) UNIQUE NOT NULL,
    renter_signature TEXT,
    lister_signature TEXT,
    agreement_content TEXT NOT NULL,
    agreement_data JSONB NOT NULL,
    status agreement_status DEFAULT 'DRAFT',
    signed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_rental_agreements_booking_id ON rental_agreements(booking_id);
CREATE INDEX idx_rental_agreements_agreement_number ON rental_agreements(agreement_number);
CREATE INDEX idx_rental_agreements_status ON rental_agreements(status);

-- Add comment to the table
COMMENT ON TABLE rental_agreements IS 'Stores digital rental agreements with signatures and content';
COMMENT ON COLUMN rental_agreements.agreement_number IS 'Unique agreement identifier';
COMMENT ON COLUMN rental_agreements.agreement_content IS 'Full text content of the agreement';
COMMENT ON COLUMN rental_agreements.agreement_data IS 'Structured data used to generate the agreement';
COMMENT ON COLUMN rental_agreements.status IS 'Current status of the agreement (DRAFT, SENT, SIGNED, ACTIVE, COMPLETED, CANCELLED)';
