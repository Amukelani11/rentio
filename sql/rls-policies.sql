-- Row Level Security (RLS) Setup for Rentio Application
-- Add this to the end of sql/schema.sql or run separately

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for each table

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (id = current_setting('app.current_user_id', true)::uuid OR 
                      current_setting('app.current_user_role', true) = 'ADMIN');

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- User roles policies
CREATE POLICY "Users can view own roles" ON user_roles
    FOR SELECT USING (
        user_id = current_setting('app.current_user_id', true)::uuid OR 
        current_setting('app.current_user_role', true) = 'ADMIN' OR
        current_user = 'postgres'
    );

CREATE POLICY "Admins can manage user roles" ON user_roles
    FOR ALL USING (
        current_setting('app.current_user_role', true) = 'ADMIN' OR
        current_user = 'postgres'
    );

-- Profiles table policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::uuid OR 
                      current_setting('app.current_user_role', true) = 'ADMIN');

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Admins can manage all profiles" ON profiles
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- Addresses table policies
CREATE POLICY "Users can view own addresses" ON addresses
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::uuid OR 
                      current_setting('app.current_user_role', true) = 'ADMIN');

CREATE POLICY "Users can manage own addresses" ON addresses
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Admins can manage all addresses" ON addresses
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- Businesses table policies
CREATE POLICY "Users can view own businesses" ON businesses
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::uuid OR 
                      current_setting('app.current_user_role', true) = 'ADMIN');

CREATE POLICY "Users can manage own businesses" ON businesses
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Business team members can view business" ON businesses
    FOR SELECT USING (
        id IN (
            SELECT business_id FROM team_members 
            WHERE user_id = current_setting('app.current_user_id', true)::uuid 
            AND status = 'ACTIVE'
        )
    );

CREATE POLICY "Admins can manage all businesses" ON businesses
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- Categories table policies (public read-only)
CREATE POLICY "Everyone can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- Listings table policies
CREATE POLICY "Users can view active listings" ON listings
    FOR SELECT USING (status = 'ACTIVE' AND featured = true);

CREATE POLICY "Users can view own listings" ON listings
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Businesses can view own listings" ON listings
    FOR SELECT USING (business_id IN (
        SELECT id FROM businesses 
        WHERE user_id = current_setting('app.current_user_id', true)::uuid
    ));

CREATE POLICY "Business team members can view business listings" ON listings
    FOR SELECT USING (business_id IN (
        SELECT business_id FROM team_members 
        WHERE user_id = current_setting('app.current_user_id', true)::uuid 
        AND status = 'ACTIVE'
    ));

CREATE POLICY "Users can manage own listings" ON listings
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Businesses can manage own listings" ON listings
    FOR ALL USING (business_id IN (
        SELECT id FROM businesses 
        WHERE user_id = current_setting('app.current_user_id', true)::uuid
    ));

CREATE POLICY "Business team members can manage business listings" ON listings
    FOR ALL USING (business_id IN (
        SELECT business_id FROM team_members 
        WHERE user_id = current_setting('app.current_user_id', true)::uuid 
        AND status = 'ACTIVE' 
        AND (permissions->>'listings'::text = 'write' OR role = 'OWNER' OR role = 'MANAGER')
    ));

CREATE POLICY "Admins can manage all listings" ON listings
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- Inventory items policies
CREATE POLICY "Users can manage own inventory items" ON inventory_items
    FOR ALL USING (listing_id IN (
        SELECT id FROM listings 
        WHERE user_id = current_setting('app.current_user_id', true)::uuid
    ));

CREATE POLICY "Businesses can manage own inventory items" ON inventory_items
    FOR ALL USING (listing_id IN (
        SELECT id FROM listings 
        WHERE business_id IN (
            SELECT id FROM businesses 
            WHERE user_id = current_setting('app.current_user_id', true)::uuid
        )
    ));

CREATE POLICY "Business team members can manage inventory items" ON inventory_items
    FOR ALL USING (listing_id IN (
        SELECT id FROM listings 
        WHERE business_id IN (
            SELECT business_id FROM team_members 
            WHERE user_id = current_setting('app.current_user_id', true)::uuid 
            AND status = 'ACTIVE'
            AND (permissions->>'inventory'::text = 'write' OR role = 'OWNER' OR role = 'MANAGER')
        )
    ));

CREATE POLICY "Admins can manage all inventory items" ON inventory_items
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- Packages policies
CREATE POLICY "Users can manage own packages" ON packages
    FOR ALL USING (business_id IN (
        SELECT id FROM businesses 
        WHERE user_id = current_setting('app.current_user_id', true)::uuid
    ));

CREATE POLICY "Business team members can manage packages" ON packages
    FOR ALL USING (business_id IN (
        SELECT business_id FROM team_members 
        WHERE user_id = current_setting('app.current_user_id', true)::uuid 
        AND status = 'ACTIVE'
        AND (permissions->>'packages'::text = 'write' OR role = 'OWNER' OR role = 'MANAGER')
    ));

CREATE POLICY "Everyone can view active packages" ON packages
    FOR SELECT USING (business_id IN (
        SELECT id FROM businesses 
        WHERE status = 'ACTIVE' AND is_verified = true
    ));

CREATE POLICY "Admins can manage all packages" ON packages
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- Package items policies
CREATE POLICY "Users can manage own package items" ON package_items
    FOR ALL USING (package_id IN (
        SELECT id FROM packages 
        WHERE business_id IN (
            SELECT id FROM businesses 
            WHERE user_id = current_setting('app.current_user_id', true)::uuid
        )
    ));

CREATE POLICY "Admins can manage all package items" ON package_items
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- Bookings table policies
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (renter_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can view bookings for their listings" ON bookings
    FOR SELECT USING (listing_id IN (
        SELECT id FROM listings 
        WHERE user_id = current_setting('app.current_user_id', true)::uuid
    ));

CREATE POLICY "Businesses can view bookings for their listings" ON bookings
    FOR SELECT USING (listing_id IN (
        SELECT id FROM listings 
        WHERE business_id IN (
            SELECT id FROM businesses 
            WHERE user_id = current_setting('app.current_user_id', true)::uuid
        )
    ));

CREATE POLICY "Users can manage own bookings" ON bookings
    FOR ALL USING (renter_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Businesses can manage bookings for their listings" ON bookings
    FOR ALL USING (listing_id IN (
        SELECT id FROM listings 
        WHERE business_id IN (
            SELECT id FROM businesses 
            WHERE user_id = current_setting('app.current_user_id', true)::uuid
        )
    ));

CREATE POLICY "Business team members can manage bookings" ON bookings
    FOR ALL USING (listing_id IN (
        SELECT id FROM listings 
        WHERE business_id IN (
            SELECT business_id FROM team_members 
            WHERE user_id = current_setting('app.current_user_id', true)::uuid 
            AND status = 'ACTIVE'
            AND (permissions->>'bookings'::text = 'write' OR role = 'OWNER' OR role = 'MANAGER')
        )
    ));

CREATE POLICY "Admins can manage all bookings" ON bookings
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- Booking extensions policies
CREATE POLICY "Users can view own booking extensions" ON booking_extensions
    FOR SELECT USING (booking_id IN (
        SELECT id FROM bookings 
        WHERE renter_id = current_setting('app.current_user_id', true)::uuid
    ));

CREATE POLICY "Businesses can insert booking extensions for their listings" ON booking_extensions
    FOR INSERT WITH CHECK (booking_id IN (
        SELECT id FROM bookings
        WHERE listing_id IN (
            SELECT id FROM listings
            WHERE business_id IN (
                SELECT id FROM businesses
                WHERE user_id = current_setting('app.current_user_id', true)::uuid
            )
        )
    ));

CREATE POLICY "Businesses can view booking extensions for their listings" ON booking_extensions
    FOR SELECT USING (booking_id IN (
        SELECT id FROM bookings
        WHERE listing_id IN (
            SELECT id FROM listings
            WHERE business_id IN (
                SELECT id FROM businesses
                WHERE user_id = current_setting('app.current_user_id', true)::uuid
            )
        )
    ));

CREATE POLICY "Businesses can manage booking extensions for their listings" ON booking_extensions
    FOR ALL USING (booking_id IN (
        SELECT id FROM bookings
        WHERE listing_id IN (
            SELECT id FROM listings
            WHERE business_id IN (
                SELECT id FROM businesses
                WHERE user_id = current_setting('app.current_user_id', true)::uuid
            )
        )
    ));

CREATE POLICY "Users can insert own booking extensions" ON booking_extensions
    FOR INSERT WITH CHECK (booking_id IN (
        SELECT id FROM bookings
        WHERE renter_id = current_setting('app.current_user_id', true)::uuid
    ));

CREATE POLICY "Users can manage own booking extensions" ON booking_extensions
    FOR ALL USING (booking_id IN (
        SELECT id FROM bookings
        WHERE renter_id = current_setting('app.current_user_id', true)::uuid
    ));

CREATE POLICY "Admins can manage all booking extensions" ON booking_extensions
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- Payments table policies
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (booking_id IN (
        SELECT id FROM bookings 
        WHERE renter_id = current_setting('app.current_user_id', true)::uuid
    ));

CREATE POLICY "Businesses can view payments for their bookings" ON payments
    FOR SELECT USING (booking_id IN (
        SELECT id FROM bookings 
        WHERE listing_id IN (
            SELECT id FROM listings 
            WHERE business_id IN (
                SELECT id FROM businesses 
                WHERE user_id = current_setting('app.current_user_id', true)::uuid
            )
        )
    ));

CREATE POLICY "Users can manage own payments" ON payments
    FOR ALL USING (booking_id IN (
        SELECT id FROM bookings 
        WHERE renter_id = current_setting('app.current_user_id', true)::uuid
    ));

CREATE POLICY "Businesses can manage payments for their bookings" ON payments
    FOR ALL USING (booking_id IN (
        SELECT id FROM bookings 
        WHERE listing_id IN (
            SELECT id FROM listings 
            WHERE business_id IN (
                SELECT id FROM businesses 
                WHERE user_id = current_setting('app.current_user_id', true)::uuid
            )
        )
    ));

CREATE POLICY "Admins can manage all payments" ON payments
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- Payouts table policies
CREATE POLICY "Users can view own payouts" ON payouts
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can manage own payouts" ON payouts
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Admins can manage all payouts" ON payouts
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- Reviews table policies
CREATE POLICY "Users can view public reviews" ON reviews
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view reviews they wrote" ON reviews
    FOR SELECT USING (from_user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can view reviews about them" ON reviews
    FOR SELECT USING (to_user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can manage own reviews" ON reviews
    FOR ALL USING (from_user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Admins can manage all reviews" ON reviews
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- Disputes table policies
CREATE POLICY "Users can view own disputes" ON disputes
    FOR SELECT USING (opened_by = current_setting('app.current_user_id', true)::uuid OR
                      booking_id IN (
                          SELECT id FROM bookings 
                          WHERE renter_id = current_setting('app.current_user_id', true)::uuid
                      ) OR
                      booking_id IN (
                          SELECT id FROM bookings 
                          WHERE listing_id IN (
                              SELECT id FROM listings 
                              WHERE user_id = current_setting('app.current_user_id', true)::uuid
                          )
                      ));

CREATE POLICY "Users can manage own disputes" ON disputes
    FOR ALL USING (opened_by = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Admins can manage all disputes" ON disputes
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- Messages table policies
CREATE POLICY "Users can view messages in their bookings" ON messages
    FOR SELECT USING (booking_id IN (
        SELECT id FROM bookings 
        WHERE renter_id = current_setting('app.current_user_id', true)::uuid OR
              listing_id IN (
                  SELECT id FROM listings 
                  WHERE user_id = current_setting('app.current_user_id', true)::uuid
              )
    ));

CREATE POLICY "Users can insert messages in conversations they participate in" ON messages
    FOR INSERT WITH CHECK (from_user_id = current_setting('app.current_user_id', true)::uuid AND
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants
            WHERE user_id = current_setting('app.current_user_id', true)::uuid
        ));

CREATE POLICY "Users can manage messages they sent" ON messages
    FOR ALL USING (from_user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can view messages sent to them" ON messages
    FOR SELECT USING (to_user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Business team members can view business messages" ON messages
    FOR SELECT USING (booking_id IN (
        SELECT id FROM bookings 
        WHERE listing_id IN (
            SELECT id FROM listings 
            WHERE business_id IN (
                SELECT business_id FROM team_members 
                WHERE user_id = current_setting('app.current_user_id', true)::uuid 
                AND status = 'ACTIVE'
            )
        )
    ));

CREATE POLICY "Users can view messages in conversations they participate in" ON messages
    FOR SELECT USING (conversation_id IN (
        SELECT conversation_id FROM conversation_participants
        WHERE user_id = current_setting('app.current_user_id', true)::uuid
    ));

CREATE POLICY "Admins can manage all messages" ON messages
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- Notifications table policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Admins can manage all notifications" ON notifications
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- Saved searches table policies
CREATE POLICY "Users can view own saved searches" ON saved_searches
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can manage own saved searches" ON saved_searches
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Admins can manage all saved searches" ON saved_searches
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- Team members table policies
CREATE POLICY "Users can view their team memberships" ON team_members
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Business owners can view their team" ON team_members
    FOR SELECT USING (business_id IN (
        SELECT id FROM businesses 
        WHERE user_id = current_setting('app.current_user_id', true)::uuid
    ));

CREATE POLICY "Business managers can view their team" ON team_members
    FOR SELECT USING (business_id IN (
        SELECT business_id FROM team_members 
        WHERE user_id = current_setting('app.current_user_id', true)::uuid 
        AND status = 'ACTIVE' 
        AND role IN ('OWNER', 'MANAGER')
    ));

CREATE POLICY "Users can manage their team memberships" ON team_members
    FOR UPDATE USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Business owners can manage their team" ON team_members
    FOR ALL USING (business_id IN (
        SELECT id FROM businesses 
        WHERE user_id = current_setting('app.current_user_id', true)::uuid
    ));

CREATE POLICY "Business managers can manage their team" ON team_members
    FOR ALL USING (business_id IN (
        SELECT business_id FROM team_members 
        WHERE user_id = current_setting('app.current_user_id', true)::uuid 
        AND status = 'ACTIVE' 
        AND role IN ('OWNER', 'MANAGER')
    ));

CREATE POLICY "Admins can manage all team members" ON team_members
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- KYC verifications table policies
CREATE POLICY "Users can view own KYC verifications" ON kyc_verifications
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can insert own KYC verifications" ON kyc_verifications
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can update own KYC verifications" ON kyc_verifications
    FOR UPDATE USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Admins can manage all KYC verifications" ON kyc_verifications
    FOR ALL USING (current_setting('app.current_user_role', true) = 'ADMIN');

-- Conversation participants policies
CREATE POLICY "Authenticated users can view conversation participants" ON conversation_participants
    FOR SELECT USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Users can manage their conversation participation" ON conversation_participants
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- Conversations table policies
CREATE POLICY "Users can view conversations they participate in" ON conversations
    FOR SELECT USING (id IN (
        SELECT conversation_id FROM conversation_participants 
        WHERE user_id = current_setting('app.current_user_id', true)::uuid
    ));

CREATE POLICY "Users can manage conversations they participate in" ON conversations
    FOR ALL USING (id IN (
        SELECT conversation_id FROM conversation_participants 
        WHERE user_id = current_setting('app.current_user_id', true)::uuid
    ));

-- Message read receipts policies
CREATE POLICY "Users can view their message read receipts" ON message_read
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can manage their message read receipts" ON message_read
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- Review helpful votes policies
CREATE POLICY "Users can view their helpful votes" ON review_helpful
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can manage their helpful votes" ON review_helpful
    FOR ALL USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- Audit log table policies
CREATE POLICY "Admins can view audit log" ON audit_log
    FOR SELECT USING (current_setting('app.current_user_role', true) = 'ADMIN');

CREATE POLICY "System can write to audit log" ON audit_log
    FOR INSERT WITH CHECK (true);