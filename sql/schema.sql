-- Complete SQL Schema for Rentio Application
-- Based on the original Prisma schema with all relationships and constraints

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BLOCKED');
CREATE TYPE kyc_status AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE address_type AS ENUM ('HOME', 'WORK', 'BILLING', 'SHIPPING');
CREATE TYPE business_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE deposit_type AS ENUM ('FIXED', 'PERCENTAGE');
CREATE TYPE cancellation_policy AS ENUM ('FLEXIBLE', 'MODERATE', 'STRICT');
CREATE TYPE listing_status AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'DISPUTED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');
CREATE TYPE payment_provider AS ENUM ('STRIPE', 'PAYFAST', 'PAYSTACK', 'YOCO');
CREATE TYPE delivery_type AS ENUM ('PICKUP', 'DELIVERY', 'BOTH');
CREATE TYPE extension_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE payout_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE dispute_reason AS ENUM ('DAMAGE', 'LATE_RETURN', 'NO_SHOW', 'ITEM_NOT_AS_DESCRIBED', 'PAYMENT_ISSUE', 'OTHER');
CREATE TYPE dispute_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE dispute_resolution AS ENUM ('FULL_REFUND', 'PARTIAL_REFUND', 'NO_REFUND', 'SPLIT');
CREATE TYPE message_type AS ENUM ('TEXT', 'IMAGE', 'FILE', 'SYSTEM');
CREATE TYPE agreement_status AS ENUM ('DRAFT', 'SENT', 'SIGNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE notification_type AS ENUM ('BOOKING_REQUEST', 'BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'PAYMENT_RECEIVED', 'DEPOSIT_RELEASED', 'REVIEW_RECEIVED', 'MESSAGE_RECEIVED', 'KYC_APPROVED', 'KYC_REJECTED', 'DISPUTE_OPENED', 'DISPUTE_RESOLVED', 'PAYOUT_SENT', 'REMINDER', 'MARKETING', 'AGREEMENT_SIGNED');
CREATE TYPE notification_channel AS ENUM ('EMAIL', 'PUSH', 'SMS');
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'INDIVIDUAL_LISTER', 'BUSINESS_LISTER', 'ADMIN');
CREATE TYPE team_role AS ENUM ('OWNER', 'MANAGER', 'OPERATIONS', 'FINANCE', 'SUPPORT');
CREATE TYPE team_status AS ENUM ('ACTIVE', 'INACTIVE', 'REMOVED');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE,
    phone VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    bio TEXT,
    status user_status DEFAULT 'ACTIVE',
    kyc_status kyc_status DEFAULT 'UNVERIFIED',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id_number TEXT,
    id_document TEXT,
    proof_of_address TEXT,
    business_name TEXT,
    business_reg TEXT,
    vat_number TEXT,
    currency VARCHAR(3) DEFAULT 'ZAR',
    language VARCHAR(10) DEFAULT 'en-ZA',
    timezone VARCHAR(50) DEFAULT 'Africa/Johannesburg',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses table
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type address_type NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    street TEXT NOT NULL,
    suburb TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country VARCHAR(100) DEFAULT 'South Africa',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Businesses table
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo TEXT,
    website TEXT,
    phone VARCHAR(255),
    email VARCHAR(255),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    delivery_radius DECIMAL(10, 2) DEFAULT 50,
    status business_status DEFAULT 'ACTIVE',
    is_verified BOOLEAN DEFAULT FALSE,
    business_hours JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings table
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    price_daily DECIMAL(10, 2) NOT NULL,
    price_weekly DECIMAL(10, 2),
    price_monthly DECIMAL(10, 2),
    weekly_discount DECIMAL(5, 2) DEFAULT 0,
    monthly_discount DECIMAL(5, 2) DEFAULT 0,
    weekend_multiplier DECIMAL(5, 2) DEFAULT 1,
    deposit_type deposit_type NOT NULL,
    deposit_value DECIMAL(10, 2) NOT NULL,
    min_days INTEGER DEFAULT 1,
    max_days INTEGER,
    instant_book BOOLEAN DEFAULT FALSE,
    requires_kyc BOOLEAN DEFAULT FALSE,
    max_distance DECIMAL(10, 2),
    location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    delivery_options JSONB,
    availability_rules JSONB,
    specifications JSONB,
    tags TEXT[] DEFAULT '{}',
    pickup_address TEXT,
    cancellation_policy cancellation_policy DEFAULT 'MODERATE',
    status listing_status DEFAULT 'DRAFT',
    featured BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    bookings_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (user_id IS NOT NULL OR business_id IS NOT NULL)
);

-- Inventory items table
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    sku VARCHAR(255),
    name VARCHAR(255),
    variant TEXT,
    quantity INTEGER DEFAULT 1,
    available INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packages table
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    min_lead_time INTEGER DEFAULT 1,
    max_quantity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package items table
CREATE TABLE package_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(package_id, listing_id)
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(255) UNIQUE NOT NULL,
    renter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    service_fee DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status booking_status DEFAULT 'PENDING',
    payment_status payment_status DEFAULT 'PENDING',
    delivery_type delivery_type,
    delivery_address TEXT,
    delivery_notes TEXT,
    notes TEXT,
    check_in_report JSONB,
    check_out_report JSONB,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (listing_id IS NOT NULL OR package_id IS NOT NULL)
);

-- Rental agreements table
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

-- Booking extensions table
CREATE TABLE booking_extensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    new_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    additional_days INTEGER NOT NULL,
    additional_price DECIMAL(10, 2) NOT NULL,
    status extension_status DEFAULT 'PENDING',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    provider payment_provider NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    status payment_status NOT NULL,
    escrow_released BOOLEAN DEFAULT FALSE,
    escrow_released_at TIMESTAMP WITH TIME ZONE,
    deposit_hold BOOLEAN DEFAULT FALSE,
    deposit_released BOOLEAN DEFAULT FALSE,
    deposit_released_at TIMESTAMP WITH TIME ZONE,
    deposit_retained DECIMAL(10, 2) DEFAULT 0,
    deposit_reason TEXT,
    refund_amount DECIMAL(10, 2) DEFAULT 0,
    refund_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    platform_fee DECIMAL(10, 2) DEFAULT 0,
    payment_fee DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payouts table
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    status payout_status DEFAULT 'PENDING',
    bank_name TEXT,
    bank_account TEXT,
    bank_ref TEXT,
    platform_fee DECIMAL(10, 2) DEFAULT 0,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    is_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (from_user_id != to_user_id)
);

-- Disputes table
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    opened_by UUID NOT NULL REFERENCES users(id),
    reason dispute_reason NOT NULL,
    description TEXT NOT NULL,
    status dispute_status DEFAULT 'OPEN',
    resolution dispute_resolution,
    settlement JSONB,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    admin_id UUID REFERENCES users(id),
    admin_notes TEXT,
    evidence JSONB
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type message_type DEFAULT 'TEXT',
    attachments JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (from_user_id != to_user_id)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    channels notification_channel[] DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved searches table
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT,
    query TEXT NOT NULL,
    filters JSONB,
    location TEXT,
    has_alert BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role team_role NOT NULL,
    permissions JSONB,
    status team_status DEFAULT 'ACTIVE',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, user_id)
);

-- KYC verifications table (was missing from original)
CREATE TABLE kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id_document TEXT,
    proof_of_address TEXT,
    business_document TEXT,
    status kyc_status DEFAULT 'PENDING',
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants table (for messaging system)
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Conversations table (for messaging system)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message read receipts table
CREATE TABLE message_read (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Review helpful votes table
CREATE TABLE review_helpful (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- Audit log table for tracking important changes
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_type ON addresses(type);
CREATE INDEX idx_addresses_is_default ON addresses(is_default);

CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_verified ON businesses(is_verified);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_business_id ON listings(business_id);
CREATE INDEX idx_listings_category_id ON listings(category_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_featured ON listings(featured);
CREATE INDEX idx_listings_verified ON listings(verified);
CREATE INDEX idx_listings_slug ON listings(slug);
CREATE INDEX idx_listings_price_daily ON listings(price_daily);
CREATE INDEX idx_listings_location ON listings USING GIN(to_tsvector('english', location));

CREATE INDEX idx_inventory_items_listing_id ON inventory_items(listing_id);

CREATE INDEX idx_packages_business_id ON packages(business_id);

CREATE INDEX idx_package_items_package_id ON package_items(package_id);
CREATE INDEX idx_package_items_listing_id ON package_items(listing_id);

CREATE INDEX idx_bookings_renter_id ON bookings(renter_id);
CREATE INDEX idx_bookings_listing_id ON bookings(listing_id);
CREATE INDEX idx_bookings_package_id ON bookings(package_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

CREATE INDEX idx_booking_extensions_booking_id ON booking_extensions(booking_id);
CREATE INDEX idx_booking_extensions_status ON booking_extensions(status);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_provider ON payments(provider);
CREATE INDEX idx_payments_provider_id ON payments(provider_id);

CREATE INDEX idx_payouts_user_id ON payouts(user_id);
CREATE INDEX idx_payouts_booking_id ON payouts(booking_id);
CREATE INDEX idx_payouts_status ON payouts(status);

CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_from_user_id ON reviews(from_user_id);
CREATE INDEX idx_reviews_to_user_id ON reviews(to_user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_public ON reviews(is_public);

CREATE INDEX idx_disputes_booking_id ON disputes(booking_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_opened_by ON disputes(opened_by);

CREATE INDEX idx_messages_booking_id ON messages(booking_id);
CREATE INDEX idx_messages_from_user_id ON messages(from_user_id);
CREATE INDEX idx_messages_to_user_id ON messages(to_user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_has_alert ON saved_searches(has_alert);

CREATE INDEX idx_team_members_business_id ON team_members(business_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_role ON team_members(role);
CREATE INDEX idx_team_members_status ON team_members(status);

CREATE INDEX idx_kyc_verifications_user_id ON kyc_verifications(user_id);
CREATE INDEX idx_kyc_verifications_status ON kyc_verifications(status);

CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);

CREATE INDEX idx_conversations_booking_id ON conversations(booking_id);

CREATE INDEX idx_message_read_message_id ON message_read(message_id);
CREATE INDEX idx_message_read_user_id ON message_read(user_id);

CREATE INDEX idx_review_helpful_review_id ON review_helpful(review_id);
CREATE INDEX idx_review_helpful_user_id ON review_helpful(user_id);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_entity_type ON audit_log(entity_type);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_booking_extensions_updated_at BEFORE UPDATE ON booking_extensions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kyc_verifications_updated_at BEFORE UPDATE ON kyc_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON saved_searches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate booking numbers
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS VARCHAR AS $$
DECLARE
    booking_number VARCHAR;
    attempt INTEGER := 0;
    max_attempts INTEGER := 10;
BEGIN
    WHILE attempt < max_attempts LOOP
        booking_number := 'RNTO-' || to_char(NOW(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
        
        IF NOT EXISTS (SELECT 1 FROM bookings WHERE booking_number = booking_number) THEN
            RETURN booking_number;
        END IF;
        
        attempt := attempt + 1;
    END LOOP;
    
    -- Fallback to UUID-based number if random generation fails
    RETURN 'RNTO-' || substring(gen_random_uuid()::text, 1, 8);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating booking numbers
CREATE OR REPLACE FUNCTION set_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_number IS NULL THEN
        NEW.booking_number := generate_booking_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_booking_number_trigger
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION set_booking_number();

-- Create function to ensure user has at least one role
CREATE OR REPLACE FUNCTION ensure_user_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = NEW.id) THEN
        INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'CUSTOMER');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_user_role_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION ensure_user_role();

-- Create view for active listings with categories
CREATE VIEW active_listings_view AS
SELECT 
    l.*,
    c.name as category_name,
    c.slug as category_slug,
    c.icon as category_icon,
    u.name as owner_name,
    u.avatar as owner_avatar,
    b.name as business_name,
    b.is_verified as business_verified
FROM listings l
LEFT JOIN categories c ON l.category_id = c.id
LEFT JOIN users u ON l.user_id = u.id
LEFT JOIN businesses b ON l.business_id = b.id
WHERE l.status = 'ACTIVE';

-- Grant permissions (adjust as needed for your application)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rentio_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rentio_app_user;

-- Add comments for documentation
COMMENT ON TABLE users IS 'Core user accounts with authentication and profile information';
COMMENT ON TABLE user_roles IS 'User role assignments for access control';
COMMENT ON TABLE profiles IS 'Extended user profile information including KYC data';
COMMENT ON TABLE addresses IS 'User address information for multiple address types';
COMMENT ON TABLE businesses IS 'Business accounts with verified status and team management';
COMMENT ON TABLE categories IS 'Hierarchical category structure for organizing listings';
COMMENT ON TABLE listings IS 'Items available for rent with pricing and availability settings';
COMMENT ON TABLE bookings IS 'Rental transactions with payment and status tracking';
COMMENT ON TABLE payments IS 'Payment processing records with escrow and refund handling';
COMMENT ON TABLE reviews IS 'User reviews and ratings for rental experiences';
COMMENT ON TABLE messages IS 'In-app messaging between users related to bookings';
COMMENT ON TABLE notifications IS 'User notifications for various system events';
COMMENT ON TABLE disputes IS 'Dispute resolution system for rental conflicts';
COMMENT ON TABLE kyc_verifications IS 'Know Your Customer verification process tracking';
COMMENT ON TABLE audit_log IS 'Audit trail for tracking important system changes';