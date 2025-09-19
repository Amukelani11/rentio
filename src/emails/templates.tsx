import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { BaseLayout } from './BaseLayout'

function h(html: React.ReactElement) {
  return '<!doctype html>' + renderToStaticMarkup(html)
}

export function bookingConfirmationEmail(opts: { renterName: string; listingTitle: string; startDate: string; endDate: string; total: string }) {
  return h(
    <BaseLayout title="Your booking is confirmed">
      <h1 style={{ margin: '0 0 8px', fontSize: 22 }}>Booking confirmed</h1>
      <p style={{ margin: '0 0 16px', color: '#334155' }}>Hi {opts.renterName}, your booking is confirmed.</p>
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: '100%', marginTop: 12, backgroundColor: '#f8fafc', borderRadius: 12, overflow: 'hidden' }}>
        <tbody>
          <tr>
            <td style={{ padding: 16 }}>
              <div style={{ fontWeight: 600 }}>{opts.listingTitle}</div>
              <div style={{ marginTop: 6, color: '#475569' }}>{opts.startDate} → {opts.endDate}</div>
              <div style={{ marginTop: 6 }}><span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: 9999 }}>Total: {opts.total}</span></div>
            </td>
          </tr>
        </tbody>
      </table>
      <p style={{ marginTop: 16, color: '#475569' }}>You'll receive handover details before pickup. Deposits are protected and released after successful return.</p>
      <a href="https://rentio.app/dashboard/bookings" style={{ display: 'inline-block', marginTop: 16, backgroundColor: '#ff5a5f', color: '#fff', padding: '10px 16px', borderRadius: 10, textDecoration: 'none' }}>View booking</a>
    </BaseLayout>
  )
}

export function kycStatusEmail(opts: { name: string; status: 'VERIFIED' | 'REJECTED' | 'PENDING'; reason?: string }) {
  const title = opts.status === 'VERIFIED' ? 'KYC Approved' : opts.status === 'REJECTED' ? 'KYC Rejected' : 'KYC Update'
  const highlight = opts.status === 'VERIFIED' ? '#16a34a' : opts.status === 'REJECTED' ? '#dc2626' : '#f59e0b'
  return h(
    <BaseLayout title={title}>
      <h1 style={{ margin: '0 0 8px', fontSize: 22 }}>{title}</h1>
      <p style={{ margin: '0 0 16px', color: '#334155' }}>Hi {opts.name},</p>
      <p style={{ margin: '0 0 8px', color: '#334155' }}>Your KYC status: <strong style={{ color: highlight }}>{opts.status}</strong></p>
      {opts.reason && (
        <p style={{ margin: '0 0 12px', color: '#475569' }}>Reason: {opts.reason}</p>
      )}
      <a href="https://rentio.app/dashboard/kyc" style={{ display: 'inline-block', marginTop: 12, backgroundColor: '#ff5a5f', color: '#fff', padding: '10px 16px', borderRadius: 10, textDecoration: 'none' }}>Manage KYC</a>
    </BaseLayout>
  )
}

export function listingReviewEmail(opts: { ownerName: string; listingTitle: string; status: 'SUBMITTED' | 'APPROVED' | 'REJECTED'; note?: string }) {
  const title = opts.status === 'APPROVED' ? 'Listing Approved' : opts.status === 'REJECTED' ? 'Listing Rejected' : 'Listing Submitted for Review'
  return h(
    <BaseLayout title={title}>
      <h1 style={{ margin: '0 0 8px', fontSize: 22 }}>{title}</h1>
      <p style={{ margin: '0 0 16px', color: '#334155' }}>Hi {opts.ownerName},</p>
      <p style={{ margin: '0 0 8px', color: '#334155' }}>Listing: <strong>{opts.listingTitle}</strong></p>
      {opts.note && (
        <p style={{ margin: '0 0 12px', color: '#475569' }}>Note: {opts.note}</p>
      )}
      <a href="https://rentio.app/dashboard/listings" style={{ display: 'inline-block', marginTop: 12, backgroundColor: '#ff5a5f', color: '#fff', padding: '10px 16px', borderRadius: 10, textDecoration: 'none' }}>Manage listings</a>
    </BaseLayout>
  )
}

export function paymentReceiptEmail(opts: { name: string; amount: string; bookingNumber?: string; provider: 'YOCO' | 'STRIPE' | string }) {
  return h(
    <BaseLayout title="Payment received">
      <h1 style={{ margin: '0 0 8px', fontSize: 22 }}>Payment received</h1>
      <p style={{ margin: '0 0 12px', color: '#334155' }}>Hi {opts.name}, we received your payment of <strong>{opts.amount}</strong>.</p>
      {opts.bookingNumber && <p style={{ margin: '0 0 12px', color: '#475569' }}>Booking: {opts.bookingNumber}</p>}
      <p style={{ margin: 0, color: '#475569' }}>Provider: {opts.provider}</p>
    </BaseLayout>
  )
}

export function bookingStatusEmail(opts: { name: string; listingTitle: string; status: string; note?: string }) {
  return h(
    <BaseLayout title={`Booking ${opts.status}`}>
      <h1 style={{ margin: '0 0 8px', fontSize: 22 }}>Booking {opts.status}</h1>
      <p style={{ margin: '0 0 12px', color: '#334155' }}>Hi {opts.name}, your booking for <strong>{opts.listingTitle}</strong> is now <strong>{opts.status}</strong>.</p>
      {opts.note && <p style={{ margin: 0, color: '#475569' }}>{opts.note}</p>}
    </BaseLayout>
  )
}

export function depositStatusEmail(opts: { name: string; amount: string; action: 'RELEASED' | 'RETAINED'; reason?: string }) {
  const title = opts.action === 'RELEASED' ? 'Deposit released' : 'Deposit retained'
  return h(
    <BaseLayout title={title}>
      <h1 style={{ margin: '0 0 8px', fontSize: 22 }}>{title}</h1>
      <p style={{ margin: '0 0 12px', color: '#334155' }}>Hi {opts.name}, your deposit {opts.action === 'RELEASED' ? 'has been released.' : 'has been retained.'}</p>
      <p style={{ margin: 0, color: '#475569' }}>Amount: {opts.amount}</p>
      {opts.reason && <p style={{ margin: '8px 0 0', color: '#475569' }}>Reason: {opts.reason}</p>}
    </BaseLayout>
  )
}

export function messageReceivedEmail(opts: { name: string; fromName: string; preview: string; conversationUrl: string }) {
  return h(
    <BaseLayout title="New message">
      <h1 style={{ margin: '0 0 8px', fontSize: 22 }}>You have a new message</h1>
      <p style={{ margin: '0 0 8px', color: '#334155' }}>From: <strong>{opts.fromName}</strong></p>
      <blockquote style={{ margin: '0 0 12px', color: '#475569', borderLeft: '4px solid #fee2e2', paddingLeft: 12 }}>{opts.preview}</blockquote>
      <a href={opts.conversationUrl} style={{ display: 'inline-block', marginTop: 12, backgroundColor: '#ff5a5f', color: '#fff', padding: '10px 16px', borderRadius: 10, textDecoration: 'none' }}>Reply</a>
    </BaseLayout>
  )
}

export function supportTicketEmail(opts: { name: string; ticketId: string; status: string; message?: string }) {
  return h(
    <BaseLayout title={`Support ticket ${opts.status}`}>
      <h1 style={{ margin: '0 0 8px', fontSize: 22 }}>Support ticket {opts.status}</h1>
      <p style={{ margin: '0 0 12px', color: '#334155' }}>Hi {opts.name}, your ticket #{opts.ticketId} is now {opts.status}.</p>
      {opts.message && <p style={{ margin: 0, color: '#475569' }}>{opts.message}</p>}
    </BaseLayout>
  )
}
