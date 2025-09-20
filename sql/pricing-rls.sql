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

-- Admin can view all pricing rules and alerts
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