import * as React from 'react'

// Import email components
import {
  BookingConfirmationEmail,
  PaymentReceiptEmail,
  DepositStatusEmail,
  BookingStatusEmail,
  NewBookingNotificationEmail,
} from './Transactional'

import {
  MessageReceivedEmail,
  KYCStatusEmail,
  ListingReviewEmail,
  SupportTicketEmail,
  RatingRequestEmail,
  StockAlertEmail,
} from './Notifications'

import {
  WelcomeEmail,
  PromotionEmail,
  AnnouncementEmail,
  NewsletterEmail,
  ReengagementEmail,
} from './Marketing'

// Main email exports using the new design system
export {
  EmailLayout,
  EmailButton,
  EmailCard,
  EmailSection,
  EmailHeading,
  EmailText,
  EmailDivider,
  EmailBadge,
  BRAND_COLORS,
  SITE_URL,
} from './EmailLayout'

// Transactional emails
export {
  BookingConfirmationEmail,
  PaymentReceiptEmail,
  DepositStatusEmail,
  BookingStatusEmail,
  NewBookingNotificationEmail,
} from './Transactional'

// Notification emails
export {
  MessageReceivedEmail,
  KYCStatusEmail,
  ListingReviewEmail,
  SupportTicketEmail,
  RatingRequestEmail,
  StockAlertEmail,
} from './Notifications'

// Marketing emails
export {
  WelcomeEmail,
  PromotionEmail,
  AnnouncementEmail,
  NewsletterEmail,
  ReengagementEmail,
} from './Marketing'

// Type definitions
export type {
  BookingConfirmationData,
  PaymentReceiptData,
  DepositStatusData,
  BookingStatusData,
  NewBookingNotificationData,
} from './Transactional'

export type {
  MessageReceivedData,
  KYCStatusData,
  ListingReviewData,
  SupportTicketData,
  RatingRequestData,
  StockAlertData,
} from './Notifications'

export type {
  WelcomeEmailData,
  PromotionEmailData,
  AnnouncementEmailData,
  NewsletterEmailData,
  ReengagementEmailData,
} from './Marketing'

// Legacy compatibility - convert new templates to HTML strings
export function generateEmailHTML<T = any>(template: React.ReactElement): string {
  // This would be implemented with a server-side React renderer
  // For now, we'll return a placeholder
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Email Template</title>
    </head>
    <body>
      <div style="padding: 20px;">
        <p>Email template generated with new design system</p>
        <p>For production use, implement server-side React rendering</p>
      </div>
    </body>
    </html>
  `
}

// Helper function to create HTML email strings (for compatibility with existing system)
export function createBookingConfirmationHTML(data: any): string {
  return generateEmailHTML(<BookingConfirmationEmail data={data} />)
}

export function createPaymentReceiptHTML(data: any): string {
  return generateEmailHTML(<PaymentReceiptEmail data={data} />)
}

export function createKYCStatusHTML(data: any): string {
  return generateEmailHTML(<KYCStatusEmail data={data} />)
}

export function createListingReviewHTML(data: any): string {
  return generateEmailHTML(<ListingReviewEmail data={data} />)
}

export function createStockAlertHTML(data: any): string {
  return generateEmailHTML(<StockAlertEmail data={data} />)
}

export function createMessageReceivedHTML(data: any): string {
  return generateEmailHTML(<MessageReceivedEmail data={data} />)
}

export function createRatingRequestHTML(data: any): string {
  return generateEmailHTML(<RatingRequestEmail data={data} />)
}

export function createSupportTicketHTML(data: any): string {
  return generateEmailHTML(<SupportTicketEmail data={data} />)
}

export function createWelcomeEmailHTML(data: any): string {
  return generateEmailHTML(<WelcomeEmail data={data} />)
}

export function createPromotionEmailHTML(data: any): string {
  return generateEmailHTML(<PromotionEmail data={data} />)
}

export function createAnnouncementEmailHTML(data: any): string {
  return generateEmailHTML(<AnnouncementEmail data={data} />)
}

export function createNewsletterEmailHTML(data: any): string {
  return generateEmailHTML(<NewsletterEmail data={data} />)
}

export function createReengagementEmailHTML(data: any): string {
  return generateEmailHTML(<ReengagementEmail data={data} />)
}