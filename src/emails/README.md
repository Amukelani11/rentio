# Rentio Email Template System

A comprehensive email template system built with React and TypeScript, designed to provide beautiful, consistent, and responsive emails that match Rentio's brand identity.

## Overview

The email template system consists of:

1. **Core Layout Components** (`EmailLayout.tsx`) - Reusable UI components
2. **Transactional Emails** (`Transactional.tsx`) - Booking confirmations, payments, etc.
3. **Notification Emails** (`Notifications.tsx`) - Alerts, messages, status updates
4. **Marketing Emails** (`Marketing.tsx`) - Welcome, promotions, newsletters
5. **Legacy Compatibility** (`templates.tsx`) - Updated existing templates
6. **Email Renderer** (`lib/email-renderer.tsx`) - Server-side React rendering

## Brand Colors

The system uses Rentio's official color palette:

- **Primary (Coral)**: `#FF5A5F` with gradient variations
- **Charcoal**: `#1F1F23` for primary text
- **Status Colors**: Success (#22c55e), Warning (#f59e0b), Error (#ef4444)
- **Backgrounds**: Light gray (#f8fafc) and white

## Quick Start

### Using React Components (Recommended)

```tsx
import { WelcomeEmail, renderEmailToHTML } from '@/emails'

// Create welcome email
const emailHTML = renderEmailToHTML({
  template: 'welcome',
  data: {
    name: 'John Doe',
    role: 'CUSTOMER',
    onboardingUrl: 'https://rentio.co.za/onboarding'
  }
})
```

### Using Legacy Functions (Backward Compatible)

```tsx
import { bookingConfirmationEmail } from '@/emails/templates'

// Legacy function with fallback
const emailHTML = bookingConfirmationEmail({
  renterName: 'John Doe',
  listingTitle: 'Camera Lens',
  startDate: '2024-01-15',
  endDate: '2024-01-20',
  total: 'R 500'
})
```

## Available Templates

### Transactional Emails

1. **Booking Confirmation** - `bookingConfirmationEmail`
   - Confirmed booking details
   - Pickup/delivery instructions
   - Owner contact information

2. **Payment Receipt** - `paymentReceiptEmail`
   - Payment confirmation
   - Transaction details
   - Booking reference

3. **Deposit Status** - `depositStatusEmail`
   - Deposit released/retained notifications
   - Reason explanations
   - Next steps

4. **Booking Status** - `bookingStatusEmail`
   - Status updates (confirmed, cancelled, etc.)
   - Action required notifications

5. **New Booking Notification** - `newBookingNotificationEmail`
   - New booking alerts for owners
   - Renter contact details
   - Confirmation requirements

### Notification Emails

1. **Message Received** - `messageReceivedEmail`
   - New message alerts
   - Message preview
   - Quick reply links

2. **KYC Status** - `kycStatusEmail`
   - Verification status updates
   - Reason for rejection
   - Next steps

3. **Listing Review** - `listingReviewEmail`
   - Listing approval/rejection
   - Admin feedback
   - Edit instructions

4. **Support Ticket** - `supportTicketEmail`
   - Ticket status updates
   - Support messages

5. **Rating Request** - `ratingRequestEmail`
   - Post-rental review requests
   - Quick rating links

6. **Stock Alert** - `stockAlertEmail`
   - Inventory notifications
   - Low stock warnings
   - Reorder reminders

### Marketing Emails

1. **Welcome Email** - `WelcomeEmail`
   - Role-specific onboarding
   - Feature highlights
   - Quick start guide

2. **Promotion Email** - `PromotionEmail`
   - Special offers and discounts
   - Featured listings
   - Limited-time deals

3. **Announcement Email** - `AnnouncementEmail`
   - Product updates
   - New features
   - Company news

4. **Newsletter Email** - `NewsletterEmail`
   - Monthly updates
   - Community highlights
   - Popular listings

5. **Reengagement Email** - `ReengagementEmail`
   - Welcome back offers
   - New features since last visit
   - Personalized recommendations

## Customization

### Brand Customization

All templates use Rentio's brand colors and design system. To customize:

```tsx
// Colors are defined in BRAND_COLORS object
export const BRAND_COLORS = {
  primary: {
    50: '#FFF5F5',
    // ... more shades
  },
  charcoal: {
    50: '#F8F8F9',
    // ... more shades
  }
}
```

### Template Components

Each template uses reusable components:

- `EmailLayout` - Main wrapper with responsive design
- `EmailCard` - Content sections with background colors
- `EmailButton` - Call-to-action buttons with variants
- `EmailHeading` - Styled headings (H1-H4)
- `EmailText` - Body text with size and color options
- `EmailBadge` - Status badges and labels
- `EmailDivider` - Section separators

### Example Custom Template

```tsx
import { EmailLayout, EmailCard, EmailHeading, EmailButton } from '@/emails'

function CustomEmail({ data }) {
  return (
    <EmailLayout title="Custom Email" preview="Your custom message">
      <EmailCard background="primary" padding="md">
        <EmailHeading level={1}>Hello {data.name}!</EmailHeading>
        {/* Custom content */}
      </EmailCard>
      <EmailButton href={data.actionUrl} variant="primary">
        Take Action
      </EmailButton>
    </EmailLayout>
  )
}
```

## Server-Side Rendering

The system includes a renderer for converting React components to HTML:

```tsx
import { renderEmailToHTML } from '@/lib/email-renderer'

const html = renderEmailToHTML({
  template: 'bookingConfirmation',
  data: bookingData
})
```

## Responsive Design

All templates are mobile-responsive with:

- Fluid layouts that adapt to screen size
- Touch-friendly buttons (minimum 44px height)
- Optimized font sizes for mobile reading
- Proper spacing and padding

## Testing

To test email templates:

1. **Visual Testing**: Use React DevTools to inspect components
2. **HTML Validation**: Validate rendered HTML with email testing tools
3. **Cross-Client Testing**: Test in major email clients (Gmail, Outlook, etc.)

## Best Practices

1. **Keep it Simple**: Use table-based layouts for maximum email client compatibility
2. **Inline Styles**: All styles are inlined for better email client support
3. **Alt Text**: Always include alt text for images
4. **Plain Text Fallback**: Consider including plain text versions
5. **Testing**: Test across different email clients and devices

## Troubleshooting

### Common Issues

**Templates not rendering**: Check that `react-dom/server` is properly installed
**Styles not showing**: Ensure CSS is inlined and email client supports it
**Images not loading**: Use absolute URLs and ensure images are publicly accessible

### Debug Mode

Enable debug logging to see rendering errors:

```tsx
// Templates automatically log errors to console
// Check browser/server console for rendering issues
```

## Dependencies

- React 18+
- TypeScript
- `react-dom/server` for server-side rendering
- Tailwind CSS (for design system consistency)

## Contributing

1. Follow the existing component structure
2. Use TypeScript for type safety
3. Include proper documentation
4. Test across email clients
5. Maintain brand consistency