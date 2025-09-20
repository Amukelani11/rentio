-- Pricing Rules, Stock Alerts, and Alert Notifications

-- Dynamic Pricing Rules Table
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Rule Type: WEEKEND, HOLIDAY, SEASONAL, CUSTOM
    rule_type VARCHAR(20) NOT NULL CHECK (rule_type IN ('WEEKEND', 'HOLIDAY', 'SEASONAL', 'CUSTOM')),

    -- Pricing Adjustment
    adjustment_type VARCHAR(10) NOT NULL CHECK (adjustment_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    adjustment_value DECIMAL(10,2) NOT NULL,

    -- Date Range for Seasonal Rules
    start_date DATE,
    end_date DATE,

    -- Weekend Rules
    weekend_days TEXT[] DEFAULT '{6,0}', -- Saturday=6, Sunday=0

    -- Holiday Rules
    holiday_date DATE,
    is_recurring_holiday BOOLEAN DEFAULT false,

    -- Applicability
    min_stay_days INTEGER DEFAULT 1,
    max_stay_days INTEGER,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Alerts Table
CREATE TABLE IF NOT EXISTS stock_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,

    -- Alert Types
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('LOW_STOCK', 'OUT_OF_STOCK', 'REORDER_POINT', 'MAINTENANCE_DUE')),

    -- Alert Triggers
    threshold_quantity INTEGER,
    threshold_percentage DECIMAL(5,2),

    -- Notification Settings
    notify_email BOOLEAN DEFAULT true,
    notify_sms BOOLEAN DEFAULT false,
    notification_frequency VARCHAR(20) DEFAULT 'ONCE' CHECK (notification_frequency IN ('ONCE', 'DAILY', 'WEEKLY')),

    -- Alert Status
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    is_resolved BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert Notifications Log
CREATE TABLE IF NOT EXISTS alert_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_alert_id UUID NOT NULL REFERENCES stock_alerts(id) ON DELETE CASCADE,

    -- Notification Details
    notification_type VARCHAR(10) NOT NULL CHECK (notification_type IN ('EMAIL', 'SMS')),
    recipient VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'DELIVERED')),

    -- Response Tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pricing_rules_business_id ON pricing_rules(business_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_listing_id ON pricing_rules(listing_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_dates ON pricing_rules(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_active ON pricing_rules(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_stock_alerts_business_id ON stock_alerts(business_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_inventory_item_id ON stock_alerts(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_active ON stock_alerts(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_alert_notifications_stock_alert_id ON alert_notifications(stock_alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_notifications_status ON alert_notifications(status);

-- Enable RLS
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Pricing Rules
DROP POLICY IF EXISTS "Business can view pricing rules" ON pricing_rules;
CREATE POLICY "Business can view pricing rules" ON pricing_rules
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Business can insert pricing rules" ON pricing_rules;
CREATE POLICY "Business can insert pricing rules" ON pricing_rules
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Business can update pricing rules" ON pricing_rules;
CREATE POLICY "Business can update pricing rules" ON pricing_rules
    FOR UPDATE USING (
        business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Business can delete pricing rules" ON pricing_rules;
CREATE POLICY "Business can delete pricing rules" ON pricing_rules
    FOR DELETE USING (
        business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for Stock Alerts
DROP POLICY IF EXISTS "Business can view stock alerts" ON stock_alerts;
CREATE POLICY "Business can view stock alerts" ON stock_alerts
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Business can insert stock alerts" ON stock_alerts;
CREATE POLICY "Business can insert stock alerts" ON stock_alerts
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Business can update stock alerts" ON stock_alerts;
CREATE POLICY "Business can update stock alerts" ON stock_alerts
    FOR UPDATE USING (
        business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Business can delete stock alerts" ON stock_alerts;
CREATE POLICY "Business can delete stock alerts" ON stock_alerts
    FOR DELETE USING (
        business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for Alert Notifications
DROP POLICY IF EXISTS "Business can view alert notifications" ON alert_notifications;
CREATE POLICY "Business can view alert notifications" ON alert_notifications
    FOR SELECT USING (
        stock_alert_id IN (
            SELECT sa.id FROM stock_alerts sa
            JOIN businesses b ON sa.business_id = b.id
            WHERE b.user_id = auth.uid()
        )
    );

-- Admin visibility policies
DROP POLICY IF EXISTS "Admin can view all pricing rules" ON pricing_rules;
CREATE POLICY "Admin can view all pricing rules" ON pricing_rules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admin can view all stock alerts" ON stock_alerts;
CREATE POLICY "Admin can view all stock alerts" ON stock_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );


