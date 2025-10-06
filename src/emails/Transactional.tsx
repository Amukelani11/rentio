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

export interface BookingConfirmationData {
  renterName: string
  listingTitle: string
  startDate: string
  endDate: string
  total: string
  pickupLocation?: string
  pickupInstructions?: string
  deliveryInstructions?: string
  deliveryAddress?: string
  isDelivery?: boolean
  ownerName?: string
  ownerEmail?: string
  bookingId?: string
  bookingNumber?: string
}

export function BookingConfirmationEmail({ data }: { data: BookingConfirmationData }) {
  const isDelivery = data.isDelivery || false

  return (
    <EmailLayout title="Your Booking is Confirmed ✅" preview="Your rental booking has been confirmed">
      <EmailSection>
        <EmailHeading level={1} align="center">
          Your Booking is Confirmed! 🎉
        </EmailHeading>
        <EmailText align="center" color="secondary">
          Hi {data.renterName}, thank you for choosing Rentio! Your booking has been successfully confirmed.
        </EmailText>
      </EmailSection>

      <EmailCard background="primary" padding="md">
        <EmailHeading level={3}>Booking Details</EmailHeading>
        <EmailText>
          <strong>Item:</strong> {data.listingTitle}
        </EmailText>
        <EmailText>
          <strong>Dates:</strong> {data.startDate} → {data.endDate}
        </EmailText>
        {data.bookingNumber && (
          <EmailText>
            <strong>Booking Number:</strong> {data.bookingNumber}
          </EmailText>
        )}
        <EmailText>
          <strong>Total Amount:</strong> {data.total}
        </EmailText>
      </EmailCard>

      <EmailCard background={isDelivery ? "success" : "warning"} padding="md">
        <EmailHeading level={3}>
          {isDelivery ? "Delivery Information" : "Pickup Information"}
        </EmailHeading>

        {isDelivery ? (
          <>
            <EmailText>
              Your item will be delivered to: <strong>{data.deliveryAddress || 'To be confirmed'}</strong>
            </EmailText>
            {data.deliveryInstructions && (
              <EmailText>
                <strong>Delivery Instructions:</strong> {data.deliveryInstructions}
              </EmailText>
            )}
            <EmailText color="secondary">
              The owner will contact you to arrange delivery timing.
            </EmailText>
          </>
        ) : (
          <>
            <EmailText>
              Pickup Location: <strong>{data.pickupLocation || 'To be confirmed with owner'}</strong>
            </EmailText>
            {data.pickupInstructions && (
              <EmailText>
                <strong>Pickup Instructions:</strong> {data.pickupInstructions}
              </EmailText>
            )}
            <EmailText color="secondary">
              Please contact the owner to arrange pickup timing.
            </EmailText>
          </>
        )}
      </EmailCard>

      <EmailCard background="white" padding="md">
        <EmailHeading level={3}>Owner Contact</EmailHeading>
        <EmailText>
          <strong>Owner:</strong> {data.ownerName || 'Listing Owner'}
        </EmailText>
        <EmailText color="secondary">
          You can contact the owner through our messaging system for any questions about your rental.
        </EmailText>
        <EmailButton
          href={`${SITE_URL}/dashboard/messages${data.bookingId ? `?booking=${data.bookingId}` : ''}`}
          variant="primary"
          fullWidth
        >
          Contact Owner
        </EmailButton>
      </EmailCard>

      <EmailSection>
        <EmailButton href={`${SITE_URL}/dashboard/bookings`} variant="primary" fullWidth>
          View Booking Details
        </EmailButton>
      </EmailSection>

      <EmailDivider />

      <EmailText align="center" color="muted" size="sm">
        Need help? Reply to this email or visit our{' '}
        <a href={`${SITE_URL}/support`} style={{ color: BRAND_COLORS.primary[500] }}>
          Help Center
        </a>
        .
      </EmailText>
    </EmailLayout>
  )
}

export interface PaymentReceiptData {
  name: string
  amount: string
  bookingNumber?: string
  provider: 'YOCO' | 'STRIPE' | string
  paymentDate: string
  paymentMethod: string
}

export function PaymentReceiptEmail({ data }: { data: PaymentReceiptData }) {
  return (
    <EmailLayout title="Payment Receipt" preview="Your payment has been received">
      <EmailSection>
        <EmailHeading level={1} align="center">
          Payment Received ✅
        </EmailHeading>
        <EmailText align="center" color="secondary">
          Hi {data.name}, we're happy to let you know we've received your payment.
        </EmailText>
      </EmailSection>

      <EmailCard background="success" padding="md">
        <EmailHeading level={3}>Payment Details</EmailHeading>
        <EmailText>
          <strong>Amount:</strong> {data.amount}
        </EmailText>
        {data.bookingNumber && (
          <EmailText>
            <strong>Booking Reference:</strong> {data.bookingNumber}
          </EmailText>
        )}
        <EmailText>
          <strong>Payment Method:</strong> {data.paymentMethod}
        </EmailText>
        <EmailText>
          <strong>Payment Date:</strong> {data.paymentDate}
        </EmailText>
        <EmailText>
          <strong>Payment Provider:</strong> {data.provider}
        </EmailText>
      </EmailCard>

      <EmailSection>
        <EmailBadge variant="success">Payment Confirmed</EmailBadge>
      </EmailSection>

      <EmailSection>
        <EmailButton href={`${SITE_URL}/dashboard/payments`} variant="primary" fullWidth>
          View Payment History
        </EmailButton>
      </EmailSection>

      <EmailDivider />

      <EmailText align="center" color="muted" size="sm">
        This payment has been securely processed. Keep this receipt for your records.
      </EmailText>
    </EmailLayout>
  )
}

export interface DepositStatusData {
  name: string
  amount: string
  action: 'RELEASED' | 'RETAINED'
  reason?: string
  bookingNumber?: string
}

export function DepositStatusEmail({ data }: { data: DepositStatusData }) {
  const isReleased = data.action === 'RELEASED'

  return (
    <EmailLayout
      title={isReleased ? "Deposit Released" : "Deposit Retained"}
      preview={`Your security deposit has been ${data.action.toLowerCase()}`}
    >
      <EmailSection>
        <EmailHeading level={1} align="center">
          Security Deposit {data.action}
        </EmailHeading>
        <EmailText align="center" color="secondary">
          Hi {data.name}, your security deposit has been {data.action.toLowerCase()}.
        </EmailText>
      </EmailSection>

      <EmailCard background={isReleased ? "success" : "warning"} padding="md">
        <EmailHeading level={3}>Deposit Information</EmailHeading>
        <EmailText>
          <strong>Amount:</strong> {data.amount}
        </EmailText>
        {data.bookingNumber && (
          <EmailText>
            <strong>Booking Reference:</strong> {data.bookingNumber}
          </EmailText>
        )}
        <EmailText>
          <strong>Status:</strong> {data.action}
        </EmailText>
        {data.reason && (
          <EmailText>
            <strong>Reason:</strong> {data.reason}
          </EmailText>
        )}
      </EmailCard>

      {isReleased ? (
        <EmailCard background="success" padding="md">
          <EmailHeading level={3}>Next Steps</EmailHeading>
          <EmailText>
            Your deposit has been refunded to your original payment method. Please allow 3-5 business days for the refund to appear in your account.
          </EmailText>
        </EmailCard>
      ) : (
        <EmailCard background="warning" padding="md">
          <EmailHeading level={3}>Why was the deposit retained?</EmailHeading>
          <EmailText>
            The deposit was retained due to the reason mentioned above. If you have any questions about this decision, please contact our support team.
          </EmailText>
        </EmailCard>
      )}

      <EmailSection>
        <EmailButton href={`${SITE_URL}/dashboard/bookings`} variant="primary" fullWidth>
          View Booking Details
        </EmailButton>
      </EmailSection>

      <EmailDivider />

      <EmailText align="center" color="muted" size="sm">
        Questions about your deposit? Reply to this email or contact our{' '}
        <a href={`${SITE_URL}/support`} style={{ color: BRAND_COLORS.primary[500] }}>
          support team
        </a>
        .
      </EmailText>
    </EmailLayout>
  )
}

export interface BookingStatusData {
  name: string
  listingTitle: string
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED' | 'REJECTED'
  note?: string
  bookingId?: string
  bookingNumber?: string
}

export function BookingStatusEmail({ data }: { data: BookingStatusData }) {
  const getStatusColor = () => {
    switch (data.status) {
      case 'CONFIRMED': return 'success'
      case 'PENDING': return 'warning'
      case 'CANCELLED': return 'error'
      case 'COMPLETED': return 'success'
      case 'REJECTED': return 'error'
      default: return 'primary'
    }
  }

  const getStatusMessage = () => {
    switch (data.status) {
      case 'CONFIRMED': return 'Your booking has been confirmed!'
      case 'PENDING': return 'Your booking is pending approval.'
      case 'CANCELLED': return 'Your booking has been cancelled.'
      case 'COMPLETED': return 'Your booking has been completed.'
      case 'REJECTED': return 'Your booking request was rejected.'
      default: return 'Your booking status has been updated.'
    }
  }

  return (
    <EmailLayout
      title={`Booking ${data.status}`}
      preview={`Your booking status has been updated to ${data.status}`}
    >
      <EmailSection>
        <EmailHeading level={1} align="center">
          Booking {data.status}
        </EmailHeading>
        <EmailText align="center" color="secondary">
          Hi {data.name}, {getStatusMessage()}
        </EmailText>
      </EmailSection>

      <EmailCard background={getStatusColor()} padding="md">
        <EmailHeading level={3}>Booking Information</EmailHeading>
        <EmailText>
          <strong>Item:</strong> {data.listingTitle}
        </EmailText>
        {data.bookingNumber && (
          <EmailText>
            <strong>Booking Number:</strong> {data.bookingNumber}
          </EmailText>
        )}
        <EmailText>
          <strong>Status:</strong> <EmailBadge variant={getStatusColor()}>{data.status}</EmailBadge>
        </EmailText>
      </EmailCard>

      {data.note && (
        <EmailCard background="white" padding="md">
          <EmailHeading level={3}>Note</EmailHeading>
          <EmailText>
            {data.note}
          </EmailText>
        </EmailCard>
      )}

      <EmailSection>
        <EmailButton href={`${SITE_URL}/dashboard/bookings`} variant="primary" fullWidth>
          View Booking Details
        </EmailButton>
      </EmailSection>

      <EmailDivider />

      <EmailText align="center" color="muted" size="sm">
        Need help? Reply to this email or visit our{' '}
        <a href={`${SITE_URL}/support`} style={{ color: BRAND_COLORS.primary[500] }}>
          Help Center
        </a>
        .
      </EmailText>
    </EmailLayout>
  )
}

export interface NewBookingNotificationData {
  ownerName: string
  renterName: string
  renterEmail: string
  renterPhone: string
  listingTitle: string
  startDate: string
  endDate: string
  total: string
  bookingNumber?: string
  requiresConfirmation: boolean
  bookingId?: string
}

export function NewBookingNotificationEmail({ data }: { data: NewBookingNotificationData }) {
  return (
    <EmailLayout
      title="New Booking Received! 🎉"
      preview="You have received a new booking request"
    >
      <EmailSection>
        <EmailHeading level={1} align="center">
          New Booking Received! 🎉
        </EmailHeading>
        <EmailText align="center" color="secondary">
          Hi {data.ownerName}, you have a new booking request for your listing.
        </EmailText>
      </EmailSection>

      <EmailCard background="primary" padding="md">
        <EmailHeading level={3}>Booking Details</EmailHeading>
        <EmailText>
          <strong>Item:</strong> {data.listingTitle}
        </EmailText>
        <EmailText>
          <strong>Renter:</strong> {data.renterName}
        </EmailText>
        <EmailText>
          <strong>Email:</strong> {data.renterEmail}
        </EmailText>
        <EmailText>
          <strong>Phone:</strong> {data.renterPhone}
        </EmailText>
        <EmailText>
          <strong>Dates:</strong> {data.startDate} → {data.endDate}
        </EmailText>
        <EmailText>
          <strong>Total Payment:</strong> {data.total}
        </EmailText>
        {data.bookingNumber && (
          <EmailText>
            <strong>Booking Number:</strong> {data.bookingNumber}
          </EmailText>
        )}
      </EmailCard>

      <EmailCard background={data.requiresConfirmation ? "warning" : "success"} padding="md">
        <EmailHeading level={3}>Action Required</EmailHeading>
        <EmailText>
          {data.requiresConfirmation
            ? "This booking requires your confirmation. Please review and respond to the renter."
            : "This booking has been automatically confirmed as an instant booking."
          }
        </EmailText>
      </EmailCard>

      <EmailSection>
        <EmailButton
          href={`${SITE_URL}/dashboard/bookings`}
          variant="primary"
          fullWidth
        >
          {data.requiresConfirmation ? "Review Booking Request" : "View Booking Details"}
        </EmailButton>
      </EmailSection>

      <EmailDivider />

      <EmailText align="center" color="muted" size="sm">
        Please contact the renter to arrange pickup/delivery details. Questions? Reply to this email.
      </EmailText>
    </EmailLayout>
  )
}