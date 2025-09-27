import * as React from 'react'
import {
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

export interface MessageReceivedData {
  name: string
  fromName: string
  preview: string
  conversationUrl: string
  listingTitle?: string
  timestamp: string
}

export function MessageReceivedEmail({ data }: { data: MessageReceivedData }) {
  return (
    <EmailLayout
      title="New Message Received"
      preview={`New message from ${data.fromName}`}
    >
      <EmailSection>
        <EmailHeading level={1} align="center">
          New Message 💬
        </EmailHeading>
        <EmailText align="center" color="secondary">
          Hi {data.name}, you have a new message from {data.fromName}.
        </EmailText>
      </EmailSection>

      <EmailCard background="primary" padding="md">
        <EmailHeading level={3}>Message Details</EmailHeading>
        <EmailText>
          <strong>From:</strong> {data.fromName}
        </EmailText>
        {data.listingTitle && (
          <EmailText>
            <strong>Regarding:</strong> {data.listingTitle}
          </EmailText>
        )}
        <EmailText>
          <strong>Time:</strong> {data.timestamp}
        </EmailText>
        <EmailCard background="white" padding="sm" border={false}>
          <EmailText color="secondary" size="sm">
            "{data.preview}"
          </EmailText>
        </EmailCard>
      </EmailCard>

      <EmailSection>
        <EmailButton href={data.conversationUrl} variant="primary" fullWidth>
          Reply to Message
        </EmailButton>
      </EmailSection>

      <EmailDivider />

      <EmailText align="center" color="muted" size="sm">
        Tip: Quick responses lead to better rental experiences!
      </EmailText>
    </EmailLayout>
  )
}

export interface KYCStatusData {
  name: string
  status: 'VERIFIED' | 'REJECTED' | 'PENDING'
  reason?: string
  verificationDate?: string
}

export function KYCStatusEmail({ data }: { data: KYCStatusData }) {
  const getStatusColor = () => {
    switch (data.status) {
      case 'VERIFIED': return 'success'
      case 'REJECTED': return 'error'
      case 'PENDING': return 'warning'
      default: return 'primary'
    }
  }

  const getStatusTitle = () => {
    switch (data.status) {
      case 'VERIFIED': return 'KYC Verification Approved ✅'
      case 'REJECTED': return 'KYC Verification Rejected ❌'
      case 'PENDING': return 'KYC Verification Under Review ⏳'
      default: return 'KYC Status Updated'
    }
  }

  const getStatusCardVariant = () => {
    switch (data.status) {
      case 'VERIFIED':
        return 'success' as const
      case 'REJECTED':
        return 'error' as const
      case 'PENDING':
        return 'warning' as const
      default:
        return 'primary' as const
    }
  }

  return (
    <EmailLayout
      title={getStatusTitle()}
      preview={`Your KYC verification status is now ${data.status}`}
    >
      <EmailSection>
        <EmailHeading level={1} align="center">
          {getStatusTitle()}
        </EmailHeading>
        <EmailText align="center" color="secondary">
          Hi {data.name}, your verification status has been updated.
        </EmailText>
      </EmailSection>

      <EmailCard background={getStatusCardVariant()} padding="md">
        <EmailHeading level={3}>Verification Status</EmailHeading>
        <EmailText>
          <strong>Status:</strong> <EmailBadge variant={getStatusCardVariant()}>{data.status}</EmailBadge>
        </EmailText>
        {data.verificationDate && (
          <EmailText>
            <strong>Updated:</strong> {data.verificationDate}
          </EmailText>
        )}
      </EmailCard>

      {data.reason && (
        <EmailCard background="white" padding="md">
          <EmailHeading level={3}>Reason</EmailHeading>
          <EmailText color="secondary">
            {data.reason}
          </EmailText>
        </EmailCard>
      )}

      {data.status === 'REJECTED' && (
        <EmailCard background="warning" padding="md">
          <EmailHeading level={3}>Next Steps</EmailHeading>
          <EmailText>
            Please review the reason provided and resubmit your verification documents. Make sure all documents are clear and match your profile information.
          </EmailText>
        </EmailCard>
      )}

      <EmailSection>
        <EmailButton href={`${SITE_URL}/dashboard/kyc`} variant="primary" fullWidth>
          {data.status === 'VERIFIED' ? 'View Verification' : data.status === 'REJECTED' ? 'Resubmit Documents' : 'Check Status'}
        </EmailButton>
      </EmailSection>

      <EmailDivider />

      <EmailText align="center" color="muted" size="sm">
        Verification helps keep our marketplace safe for everyone. Questions? Reply to this email.
      </EmailText>
    </EmailLayout>
  )
}

export interface ListingReviewData {
  ownerName: string
  listingTitle: string
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  note?: string
  reviewDate?: string
  listingId?: string
}

export function ListingReviewEmail({ data }: { data: ListingReviewData }) {
  const getStatusColor = () => {
    switch (data.status) {
      case 'APPROVED': return 'success'
      case 'REJECTED': return 'error'
      case 'SUBMITTED': return 'warning'
      default: return 'primary'
    }
  }

  const getStatusMessage = () => {
    switch (data.status) {
      case 'APPROVED': return 'Your listing has been approved and is now live!'
      case 'REJECTED': return 'Your listing needs some updates before it can go live.'
      case 'SUBMITTED': return 'Your listing is under review.'
      default: return 'Your listing status has been updated.'
    }
  }

  return (
    <EmailLayout
      title={`Listing ${data.status}`}
      preview={`Your listing "${data.listingTitle}" status: ${data.status}`}
    >
      <EmailSection>
        <EmailHeading level={1} align="center">
          Listing {data.status}
        </EmailHeading>
        <EmailText align="center" color="secondary">
          Hi {data.ownerName}, {getStatusMessage()}
        </EmailText>
      </EmailSection>

      <EmailCard background={getStatusColor()} padding="md">
        <EmailHeading level={3}>Listing Information</EmailHeading>
        <EmailText>
          <strong>Listing:</strong> {data.listingTitle}
        </EmailText>
        <EmailText>
          <strong>Status:</strong> <EmailBadge variant={getStatusColor()}>{data.status}</EmailBadge>
        </EmailText>
        {data.reviewDate && (
          <EmailText>
            <strong>Reviewed:</strong> {data.reviewDate}
          </EmailText>
        )}
      </EmailCard>

      {data.note && (
        <EmailCard background="white" padding="md">
          <EmailHeading level={3}>Admin Note</EmailHeading>
          <EmailText color="secondary">
            {data.note}
          </EmailText>
        </EmailCard>
      )}

      {data.status === 'APPROVED' && (
        <EmailCard background="success" padding="md">
          <EmailHeading level={3}>What's Next?</EmailHeading>
          <EmailText>
            Your listing is now visible to all Rentio users. Make sure to respond quickly to booking requests and keep your availability calendar up to date.
          </EmailText>
        </EmailCard>
      )}

      {data.status === 'REJECTED' && (
        <EmailCard background="error" padding="md">
          <EmailHeading level={3}>Action Required</EmailHeading>
          <EmailText>
            Please review the admin note above, make the necessary changes, and resubmit your listing for review.
          </EmailText>
        </EmailCard>
      )}

      <EmailSection>
        <EmailButton
          href={`${SITE_URL}/dashboard/inventory${data.listingId ? `?id=${data.listingId}` : ''}`}
          variant="primary"
          fullWidth
        >
          {data.status === 'APPROVED' ? 'View Live Listing' : 'Edit Listing'}
        </EmailButton>
      </EmailSection>

      <EmailDivider />

      <EmailText align="center" color="muted" size="sm">
        Questions about your listing? Reply to this email or visit our Help Center.
      </EmailText>
    </EmailLayout>
  )
}

export interface SupportTicketData {
  name: string
  ticketId: string
  status: 'OPEN' | 'CLOSED' | 'IN_PROGRESS' | 'RESOLVED'
  message?: string
  ticketUrl?: string
  timestamp?: string
}

export function SupportTicketEmail({ data }: { data: SupportTicketData }) {
  const getStatusColor = () => {
    switch (data.status) {
      case 'OPEN': return 'warning'
      case 'CLOSED': return 'primary'
      case 'IN_PROGRESS': return 'primary'
      case 'RESOLVED': return 'success'
      default: return 'primary'
    }
  }

  return (
    <EmailLayout
      title={`Support Ticket ${data.status}`}
      preview={`Your support ticket #${data.ticketId} is now ${data.status}`}
    >
      <EmailSection>
        <EmailHeading level={1} align="center">
          Support Ticket Update
        </EmailHeading>
        <EmailText align="center" color="secondary">
          Hi {data.name}, your support ticket status has been updated.
        </EmailText>
      </EmailSection>

      <EmailCard background={getStatusColor()} padding="md">
        <EmailHeading level={3}>Ticket Information</EmailHeading>
        <EmailText>
          <strong>Ticket ID:</strong> #{data.ticketId}
        </EmailText>
        <EmailText>
          <strong>Status:</strong> <EmailBadge variant={getStatusColor()}>{data.status}</EmailBadge>
        </EmailText>
        {data.timestamp && (
          <EmailText>
            <strong>Updated:</strong> {data.timestamp}
          </EmailText>
        )}
      </EmailCard>

      {data.message && (
        <EmailCard background="white" padding="md">
          <EmailHeading level={3}>Latest Message</EmailHeading>
          <EmailText color="secondary">
            {data.message}
          </EmailText>
        </EmailCard>
      )}

      {data.status === 'RESOLVED' && (
        <EmailCard background="success" padding="md">
          <EmailHeading level={3}>Resolved! 🎉</EmailHeading>
          <EmailText>
            We're glad we could help! If you have any more questions, feel free to open a new ticket.
          </EmailText>
        </EmailCard>
      )}

      {data.ticketUrl && (
        <EmailSection>
          <EmailButton href={data.ticketUrl} variant="primary" fullWidth>
            View Ticket Details
          </EmailButton>
        </EmailSection>
      )}

      <EmailDivider />

      <EmailText align="center" color="muted" size="sm">
        Need more help? Reply to this email or visit our support center.
      </EmailText>
    </EmailLayout>
  )
}

export interface RatingRequestData {
  renterName: string
  listingTitle: string
  ownerName: string
  bookingId: string
  listingSlug: string
  rentalPeriod: string
}

export function RatingRequestEmail({ data }: { data: RatingRequestData }) {
  return (
    <EmailLayout
      title="Rate Your Rental Experience ⭐"
      preview="How was your experience with Rentio?"
    >
      <EmailSection>
        <EmailHeading level={1} align="center">
          How was your rental experience? ⭐
        </EmailHeading>
        <EmailText align="center" color="secondary">
          Hi {data.renterName}, thanks for completing your rental with {data.ownerName}!
        </EmailText>
      </EmailSection>

      <EmailCard background="primary" padding="md">
        <EmailHeading level={3}>Rental Details</EmailHeading>
        <EmailText>
          <strong>Item:</strong> {data.listingTitle}
        </EmailText>
        <EmailText>
          <strong>Owner:</strong> {data.ownerName}
        </EmailText>
        <EmailText>
          <strong>Rental Period:</strong> {data.rentalPeriod}
        </EmailText>
      </EmailCard>

      <EmailCard background="success" padding="md">
        <EmailHeading level={3}>Why Your Review Matters</EmailHeading>
        <EmailText color="secondary">
          Your honest feedback helps other renters make informed decisions and helps owners improve their service. Plus, it makes our community safer and more trustworthy for everyone!
        </EmailText>
      </EmailCard>

      <EmailSection>
        <EmailButton
          href={`${SITE_URL}/reviews/new?booking=${data.bookingId}`}
          variant="primary"
          fullWidth
        >
          ⭐ Rate Your Experience
        </EmailButton>
      </EmailSection>

      <EmailCard background="white" padding="md">
        <EmailHeading level={4}>Quick Tips for Great Reviews:</EmailHeading>
        <EmailText color="secondary" size="sm">
          • Be honest and specific about your experience
        </EmailText>
        <EmailText color="secondary" size="sm">
          • Mention what you liked most about the rental
        </EmailText>
        <EmailText color="secondary" size="sm">
          • Include helpful details for future renters
        </EmailText>
        <EmailText color="secondary" size="sm">
          • Rate both the item and the owner's service
        </EmailText>
      </EmailCard>

      <EmailDivider />

      <EmailText align="center" color="muted" size="sm">
        This review will only take a minute and helps keep our community trustworthy.
      </EmailText>
    </EmailLayout>
  )
}

export interface StockAlertData {
  recipientName: string
  businessName: string
  itemName: string
  sku?: string
  currentQuantity: number
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'REORDER_POINT' | 'MAINTENANCE_DUE'
  thresholdText?: string
  manageUrl?: string
  timestamp?: string
}

export function StockAlertEmail({ data }: { data: StockAlertData }) {
  const getAlertColor = () => {
    switch (data.alertType) {
      case 'OUT_OF_STOCK': return 'error'
      case 'LOW_STOCK': return 'warning'
      case 'REORDER_POINT': return 'primary'
      case 'MAINTENANCE_DUE': return 'warning'
      default: return 'primary'
    }
  }

  const getAlertTitle = () => {
    switch (data.alertType) {
      case 'OUT_OF_STOCK': return 'Out of Stock Alert'
      case 'LOW_STOCK': return 'Low Stock Alert'
      case 'REORDER_POINT': return 'Reorder Point Reached'
      case 'MAINTENANCE_DUE': return 'Maintenance Due Alert'
      default: return 'Inventory Alert'
    }
  }

  return (
    <EmailLayout
      title={getAlertTitle()}
      preview={`Inventory alert for ${data.itemName}`}
    >
      <EmailSection>
        <EmailHeading level={1} align="center">
          {getAlertTitle()}
        </EmailHeading>
        <EmailText align="center" color="secondary">
          Hi {data.recipientName}, your business has an inventory alert.
        </EmailText>
      </EmailSection>

      <EmailCard background={getAlertColor()} padding="md">
        <EmailHeading level={3}>Alert Details</EmailHeading>
        <EmailText>
          <strong>Business:</strong> {data.businessName}
        </EmailText>
        <EmailText>
          <strong>Item:</strong> {data.itemName}
          {data.sku && <span> (SKU: {data.sku})</span>}
        </EmailText>
        <EmailText>
          <strong>Current Quantity:</strong> {data.currentQuantity}
        </EmailText>
        <EmailText>
          <strong>Alert Type:</strong> <EmailBadge variant={getAlertColor()}>{data.alertType.replace('_', ' ')}</EmailBadge>
        </EmailText>
        {data.thresholdText && (
          <EmailText>
            <strong>Threshold:</strong> {data.thresholdText}
          </EmailText>
        )}
        {data.timestamp && (
          <EmailText>
            <strong>Alert Time:</strong> {data.timestamp}
          </EmailText>
        )}
      </EmailCard>

      {data.alertType === 'OUT_OF_STOCK' && (
        <EmailCard background="error" padding="md">
          <EmailHeading level={3}>Immediate Action Required</EmailHeading>
          <EmailText color="secondary">
            This item is completely out of stock. Consider updating your listing to pause new bookings or restocking immediately.
          </EmailText>
        </EmailCard>
      )}

      {data.alertType === 'LOW_STOCK' && (
        <EmailCard background="warning" padding="md">
          <EmailHeading level={3}>Consider Restocking</EmailHeading>
          <EmailText color="secondary">
            This item is running low on stock. To avoid missing out on potential bookings, consider restocking soon.
          </EmailText>
        </EmailCard>
      )}

      {data.manageUrl && (
        <EmailSection>
          <EmailButton href={data.manageUrl} variant="primary" fullWidth>
            Manage Inventory
          </EmailButton>
        </EmailSection>
      )}

      <EmailDivider />

      <EmailText align="center" color="muted" size="sm">
        Keeping your inventory up to date helps provide better service to your customers.
      </EmailText>
    </EmailLayout>
  )
}