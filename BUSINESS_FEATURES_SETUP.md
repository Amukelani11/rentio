# Business Features Implementation

This document outlines the new business features that have been implemented for the Rentio platform.

## Features Implemented

### 1. 📅 Calendar View for Bookings Visualization
**File**: `/dashboard/calendar`
**API**: `/api/business/calendar`

A comprehensive calendar view that allows business owners to:
- Visualize all bookings across their rental items (similar to Airbnb hosts)
- View booking status with color coding
- See occupancy rates and revenue statistics
- Navigate month-by-month with upcoming bookings display
- Filter by specific listings when needed

**Key Features:**
- Monthly calendar grid with booking blocks
- Real-time booking status updates
- Revenue and occupancy statistics
- Color-coded booking status (Active, Confirmed, Completed, etc.)
- Upcoming bookings sidebar

### 2. 💰 Dynamic Pricing / Seasonal Rates
**Files**: `/dashboard/pricing` + APIs
**Schema**: `sql/pricing-schema.sql` + `sql/pricing-rls.sql`

Advanced pricing management system that supports:
- Weekend rate adjustments
- Holiday pricing (one-time or recurring)
- Seasonal rate changes (date ranges)
- Custom pricing periods
- Percentage or fixed amount adjustments
- Minimum/maximum stay requirements

**Rule Types:**
- **Weekend Rules**: Automatically apply different rates for specified weekend days
- **Holiday Rules**: Set special pricing for holidays (with recurring option)
- **Seasonal Rules**: Define date ranges with specific pricing (e.g., summer rates)
- **Custom Rules**: Create any custom pricing period you need

**Key Features:**
- Flexible adjustment types (percentage or fixed amount)
- Rule activation/deactivation
- Stay length requirements
- Business-wide or per-item rules

### 3. 🚨 Automated Stock Alerts
**Files**: `/dashboard/alerts` + APIs + Background Service
**Schema**: Included in pricing schema

Intelligent inventory monitoring system that:
- Automatically monitors stock levels 24/7
- Sends email/SMS notifications when thresholds are reached
- Supports multiple alert types and frequencies
- Tracks notification history and delivery status

**Alert Types:**
- **Low Stock**: Triggered when quantity falls below threshold
- **Out of Stock**: Immediate alert when items reach zero stock
- **Reorder Point**: Alert when it's time to reorder inventory
- **Maintenance Due**: Alerts for scheduled maintenance (future feature)

**Notification Options:**
- Email notifications with detailed information
- SMS alerts for urgent notifications
- Frequency control (Once, Daily, Weekly)
- Customizable thresholds and recipients

## Database Setup

### 1. Run the Schema Migration
```bash
# Execute the pricing schema
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const schema = \`
-- [Paste contents of sql/pricing-schema.sql here]
\`;

client.rpc('exec_sql', { sql: schema }).then(({ data, error }) => {
  if (error) console.error('Error:', error);
  else console.log('Schema created successfully');
});
"
```

### 2. Run the RLS Policies
```bash
# Execute the RLS policies
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const rls = \`
-- [Paste contents of sql/pricing-rls.sql here]
\`;

client.rpc('exec_sql', { sql: rls }).then(({ data, error }) => {
  if (error) console.error('Error:', error);
  else console.log('RLS policies created successfully');
});
"
```

## Cron Job Setup

### For Stock Alert Monitoring
Set up a cron job to check stock levels regularly:

```bash
# Add to your crontab (runs every hour)
0 * * * * curl -X POST https://your-domain.com/api/cron/stock-alerts -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Environment Variables
Add these to your `.env.local`:
```env
# Cron job secret (generate a random string)
CRON_SECRET=your_random_secret_here

# Email/SMS settings (if not already configured)
RESEND_API_KEY=your_resend_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

## Navigation Updates

The business dashboard sidebar has been updated to include:
- 🏢 Business Profile
- 📦 Inventory
- 📋 Listings
- 📅 Calendar (NEW)
- 📅 Bookings
- 💰 Pricing (NEW)
- 🚨 Alerts (NEW)
- 👥 Team
- 💰 Earnings
- 💳 Wallet

## Usage Instructions

### Calendar View
1. Navigate to `/dashboard/calendar`
2. Use the month navigation to browse different periods
3. View color-coded booking blocks on each day
4. Check the "Upcoming Bookings" section for next 7 days
5. Monitor occupancy rates and revenue statistics

### Dynamic Pricing
1. Go to `/dashboard/pricing`
2. Click "Add Pricing Rule"
3. Choose rule type (Weekend, Holiday, Seasonal, Custom)
4. Set adjustment value (percentage or fixed amount)
5. Configure specific parameters for the rule type
6. Set notification frequency and activate the rule

### Stock Alerts
1. Visit `/dashboard/alerts`
2. Click "Create Alert"
3. Select inventory item and alert type
4. Set thresholds (quantity or percentage)
5. Choose notification methods (email/SMS)
6. Set frequency and save the alert
7. Monitor notification history in the Notifications tab

## API Endpoints

### Calendar
- `GET /api/business/calendar` - Fetch bookings for calendar view

### Pricing Rules
- `GET /api/business/pricing` - Get all pricing rules
- `POST /api/business/pricing` - Create new pricing rule
- `PUT /api/business/pricing/[id]` - Update pricing rule
- `DELETE /api/business/pricing/[id]` - Delete pricing rule

### Stock Alerts
- `GET /api/business/alerts` - Get stock alerts
- `POST /api/business/alerts` - Create stock alert
- `PUT /api/business/alerts/[id]` - Update stock alert
- `DELETE /api/business/alerts/[id]` - Delete stock alert
- `GET /api/business/alerts/notifications` - Get notification history

### Cron Jobs
- `POST /api/cron/stock-alerts` - Trigger stock alert check (secured)

## Security Features

- All business endpoints are protected by role-based access control
- Row Level Security (RLS) ensures businesses can only access their own data
- Cron job endpoint requires secret token
- All API operations use service role client for proper permissions

## Future Enhancements

### Planned Features:
- Integration with external calendar systems (Google Calendar, iCal)
- Advanced pricing algorithms based on demand and competition
- Mobile app push notifications
- Predictive inventory management
- Automated reorder suggestions
- Maintenance scheduling integration

### Technical Improvements:
- Real-time WebSocket updates for calendar
- Bulk operations for pricing rules
- Advanced filtering and search capabilities
- Export functionality for reports
- Integration with accounting software

## Support

For any issues or questions about these features, please check the console logs for error messages and ensure all environment variables are properly configured.