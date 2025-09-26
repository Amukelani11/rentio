// Updated email templates using the new design system
import { renderEmailToHTML } from '@/lib/email-renderer'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://rentio.co.za'

// Legacy wrapper function for compatibility
function baseLayout(title: string, body: string) {
  return `<!doctype html><html lang="en"><head><meta charSet="utf-8"/><meta http-equiv="x-ua-compatible" content="ie=edge"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title></head><body style="margin:0;background:#f8fafc;color:#0f172a;font-family:Inter,-apple-system,Segoe UI,Helvetica,Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f8fafc;padding:24px 0"><tbody><tr><td><table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,0.06)"><tbody><tr><td style="padding:20px;background:linear-gradient(90deg, rgba(255,90,95,0.08), rgba(255,90,95,0))"><img src="https://rentio-public.s3.amazonaws.com/rentiologo.png" alt="Rentio" height="24" style="display:block"/></td></tr><tr><td style="padding:24px">${body}</td></tr><tr><td style="padding:20px;background:#f1f5f9;color:#475569;font-size:12px"><div>You're receiving this email because you have a Rentio account.</div><div style="margin-top:6px">© ${new Date().getFullYear()} Rentio. All rights reserved.</div></td></tr></tbody></table></td></tr></tbody></table></body></html>`
}

export function bookingConfirmationEmail(opts: {
  renterName: string;
  listingTitle: string;
  startDate: string;
  endDate: string;
  total: string;
  pickupLocation?: string;
  pickupInstructions?: string;
  deliveryInstructions?: string;
  deliveryAddress?: string;
  isDelivery?: boolean;
  ownerName?: string;
  ownerEmail?: string;
  bookingId?: string;
  bookingNumber?: string;
}) {
  // Use new design system
  try {
    return renderEmailToHTML({
      template: 'bookingConfirmation',
      data: opts
    })
  } catch (error) {
    console.error('Error rendering booking confirmation email:', error)
    // Fallback to legacy template
    const isDelivery = opts.isDelivery || false

    const body = `<h1 style="margin:0 0 8px;font-size:22px">Your booking is confirmed 🎉</h1><p style="margin:0 0 16px;color:#334155">Hi ${opts.renterName}, thank you for choosing Rentio! Your booking has been successfully confirmed. Below are the details:</p><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:12px;background:#f8fafc;border-radius:12px;overflow:hidden"><tbody><tr><td style="padding:16px"><div style="font-weight:600;font-size:16px">${opts.listingTitle}</div><div style="margin-top:6px;color:#475569"><strong>Dates:</strong> ${opts.startDate} → ${opts.endDate}</div><div style="margin-top:6px;color:#475569"><strong>Total:</strong> ${opts.total}</div></td></tr></tbody></table><div style="margin-top:20px;background:#f0f9ff;border-radius:12px;padding:16px;border-left:4px solid #0ea5e9"><h3 style="margin:0 0 12px;font-size:16px;color:#0c4a6e">What's Next?</h3>${isDelivery ? `<ol style="margin:0;padding-left:20px;color:#0c4a6e"><li style="margin-bottom:8px"><strong>Delivery processing:</strong> The lister will process your booking and deliver the item to you</li><li style="margin-bottom:8px"><strong>Delivery address:</strong> ${opts.deliveryAddress || 'To be confirmed with owner'}</li><li style="margin-bottom:8px"><strong>Return:</strong> The lister will arrange pickup at the end of your rental period</li></ol>` : `<ol style="margin:0;padding-left:20px;color:#0c4a6e"><li style="margin-bottom:8px"><strong>Contact the owner:</strong> You'll need to arrange a pickup time during your rental period</li><li style="margin-bottom:8px"><strong>Pickup location:</strong> ${opts.pickupLocation || 'To be confirmed with owner'}</li><li style="margin-bottom:8px"><strong>Return:</strong> Arrange the return time and location with the owner</li></ol>`}</div>${isDelivery ? (opts.deliveryInstructions ? `<div style="margin-top:16px;background:#fef3c7;border-radius:12px;padding:16px;border-left:4px solid #f59e0b"><h3 style="margin:0 0 8px;font-size:16px;color:#92400e">Delivery Instructions</h3><p style="margin:0;color:#92400e">${opts.deliveryInstructions}</p></div>` : '') : (opts.pickupInstructions ? `<div style="margin-top:16px;background:#fef3c7;border-radius:12px;padding:16px;border-left:4px solid #f59e0b"><h3 style="margin:0 0 8px;font-size:16px;color:#92400e">Pickup Instructions</h3><p style="margin:0;color:#92400e">${opts.pickupInstructions}</p></div>` : '')}<div style="margin-top:20px;background:#f0fdf4;border-radius:12px;padding:16px;border-left:4px solid #22c55e"><h3 style="margin:0 0 8px;font-size:16px;color:#166534">Contact Information</h3><p style="margin:0 0 8px;color:#166534"><strong>Owner:</strong> ${opts.ownerName || 'Listing Owner'}</p><p style="margin:0 0 12px;color:#166534">You can contact them through our messaging system or directly if they've provided their contact details.</p><a href="${SITE_URL}/dashboard/messages${opts.bookingId ? `?booking=${opts.bookingId}` : ''}" style="display:inline-block;background:#22c55e;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Contact Owner</a></div><div style="margin-top:16px;text-align:center"><a href="${SITE_URL}/dashboard/bookings" style="display:inline-block;background:#ff5a5f;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">View or manage this booking</a></div><p style="margin:24px 0 0;color:#475569;font-size:13px">Need help? Reply to this email or visit our <a href="${SITE_URL}/support" style="color:#ff5a5f;text-decoration:none">Help Center</a>.</p>`
    return baseLayout('Your booking is confirmed', body)
  }
}

export function kycStatusEmail(opts: { name: string; status: 'VERIFIED' | 'REJECTED' | 'PENDING'; reason?: string }) {
  // Use new design system
  try {
    return renderEmailToHTML({
      template: 'kycStatus',
      data: opts
    })
  } catch (error) {
    console.error('Error rendering KYC status email:', error)
    // Fallback to legacy template
    const title = opts.status === 'VERIFIED' ? 'KYC Approved' : opts.status === 'REJECTED' ? 'KYC Rejected' : 'KYC Update'
    const highlight = opts.status === 'VERIFIED' ? '#16a34a' : opts.status === 'REJECTED' ? '#dc2626' : '#f59e0b'
    const body = `<h1 style="margin:0 0 8px;font-size:22px">${title}</h1><p style="margin:0 0 16px;color:#334155">Hi ${opts.name},</p><p style="margin:0 0 12px;color:#334155">We've completed the review of your verification documents. Your current KYC status is <strong style="color:${highlight}">${opts.status}</strong>.</p>${opts.reason ? `<p style="margin:0 0 12px;color:#475569"><strong>Reason provided:</strong> ${opts.reason}</p>` : ''}<p style="margin:0 0 16px;color:#475569">Keeping your account verified helps us keep the marketplace safe for everyone.</p><a href="${SITE_URL}/dashboard/kyc" style="display:inline-block;margin-top:12px;background:#ff5a5f;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">View Verification</a>`
    return baseLayout(title, body)
  }
}

export function listingReviewEmail(opts: { ownerName: string; listingTitle: string; status: 'SUBMITTED' | 'APPROVED' | 'REJECTED'; note?: string }) {
  // Use new design system
  try {
    return renderEmailToHTML({
      template: 'listingReview',
      data: opts
    })
  } catch (error) {
    console.error('Error rendering listing review email:', error)
    // Fallback to legacy template
    const title = opts.status === 'APPROVED' ? 'Listing Approved ✅' : opts.status === 'REJECTED' ? 'Listing Update Required' : 'Listing Submitted for Review'
    const statusColor = opts.status === 'APPROVED' ? '#16a34a' : opts.status === 'REJECTED' ? '#dc2626' : '#f59e0b'

    let statusMessage = ''
    if (opts.status === 'APPROVED') {
      statusMessage = `<p style="margin:0 0 16px;color:#334155">Great news! Your listing "<strong>${opts.listingTitle}</strong>" has been approved and is now live on Rentio. Customers can start booking it right away.</p>`
    } else if (opts.status === 'REJECTED') {
      statusMessage = `<p style="margin:0 0 16px;color:#334155">Your listing "<strong>${opts.listingTitle}</strong>" needs some updates before it can go live. Please review the feedback below and resubmit when ready.</p>`
    } else {
      statusMessage = `<p style="margin:0 0 16px;color:#334155">We've received your listing "<strong>${opts.listingTitle}</strong>" and it's now under review. We'll email you within 24-48 hours with the results.</p>`
    }

    const body = `<h1 style="margin:0 0 8px;font-size:22px">${title}</h1><p style="margin:0 0 16px;color:#334155">Hi ${opts.ownerName},</p>${statusMessage}<div style="background:#f8fafc;border-radius:12px;padding:16px;margin:16px 0"><div style="font-weight:600;color:${statusColor};margin-bottom:8px">Status: ${opts.status}</div><div style="color:#334155;font-weight:500">${opts.listingTitle}</div></div>${opts.note ? `<div style="background:#fef3cd;border-radius:8px;padding:12px;margin:16px 0"><div style="font-weight:600;color:#92400e;margin-bottom:4px">Admin Note:</div><div style="color:#92400e">${opts.note}</div></div>` : ''}<a href="${SITE_URL}/dashboard/inventory" style="display:inline-block;margin-top:16px;background:#ff5a5f;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">${opts.status === 'APPROVED' ? 'View Live Listing' : 'Edit Listing'}</a><p style="margin:24px 0 0;color:#475569;font-size:13px">Questions? Reply to this email or visit our <a href="${SITE_URL}/support" style="color:#ff5a5f;text-decoration:none">Help Center</a>.</p>`
    return baseLayout(title, body)
  }
}

export function paymentReceiptEmail(opts: { name: string; amount: string; bookingNumber?: string; provider: 'YOCO' | 'STRIPE' | string; paymentDate?: string; paymentMethod?: string }) {
  // Use new design system
  try {
    return renderEmailToHTML({
      template: 'paymentReceipt',
      data: opts
    })
  } catch (error) {
    console.error('Error rendering payment receipt email:', error)
    // Fallback to legacy template
    const body = `<h1 style="margin:0 0 8px;font-size:22px">Payment received ✅</h1><p style="margin:0 0 12px;color:#334155">Hi ${opts.name}, we're happy to let you know we've received your payment of <strong>${opts.amount}</strong>.</p>${opts.bookingNumber ? `<p style="margin:0 0 12px;color:#475569"><strong>Booking ref:</strong> ${opts.bookingNumber}</p>` : ''}<p style="margin:0 0 16px;color:#475569"><strong>Provider:</strong> ${opts.provider}</p><a href="${SITE_URL}/dashboard/payments" style="display:inline-block;margin-top:12px;background:#ff5a5f;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">View payment details</a>`
    return baseLayout('Payment received', body)
  }
}

export function bookingStatusEmail(opts: { name: string; listingTitle: string; status: string; note?: string; bookingId?: string; bookingNumber?: string }) {
  // Use new design system
  try {
    return renderEmailToHTML({
      template: 'bookingStatus',
      data: opts
    })
  } catch (error) {
    console.error('Error rendering booking status email:', error)
    // Fallback to legacy template
    const body = `<h1 style="margin:0 0 8px;font-size:22px">Booking ${opts.status}</h1><p style="margin:0 0 12px;color:#334155">Hi ${opts.name}, your booking for <strong>${opts.listingTitle}</strong> is now <strong>${opts.status}</strong>.</p>${opts.note ? `<p style="margin:0 0 16px;color:#475569">${opts.note}</p>` : ''}<a href="${SITE_URL}/dashboard/bookings" style="display:inline-block;margin-top:12px;background:#ff5a5f;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">View booking</a>`
    return baseLayout(`Booking ${opts.status}`, body)
  }
}

export function depositStatusEmail(opts: { name: string; amount: string; action: 'RELEASED' | 'RETAINED'; reason?: string; bookingNumber?: string }) {
  // Use new design system
  try {
    return renderEmailToHTML({
      template: 'depositStatus',
      data: opts
    })
  } catch (error) {
    console.error('Error rendering deposit status email:', error)
    // Fallback to legacy template
    const title = opts.action === 'RELEASED' ? 'Deposit released' : 'Deposit retained'
    const body = `<h1 style="margin:0 0 8px;font-size:22px">${title}</h1><p style="margin:0 0 12px;color:#334155">Hi ${opts.name}, your deposit ${opts.action === 'RELEASED' ? 'has been released.' : 'has been retained.'}</p><p style="margin:0;color:#475569">Amount: ${opts.amount}</p>${opts.reason ? `<p style="margin:8px 0 0;color:#475569">Reason: ${opts.reason}</p>` : ''}`
    return baseLayout(title, body)
  }
}

export function messageReceivedEmail(opts: { name: string; fromName: string; preview: string; conversationUrl: string; listingTitle?: string; timestamp?: string }) {
  // Use new design system
  try {
    return renderEmailToHTML({
      template: 'messageReceived',
      data: opts
    })
  } catch (error) {
    console.error('Error rendering message received email:', error)
    // Fallback to legacy template
    const body = `<h1 style="margin:0 0 8px;font-size:22px">You have a new message</h1><p style="margin:0 0 8px;color:#334155">From: <strong>${opts.fromName}</strong></p><blockquote style="margin:0 0 12px;color:#475569;border-left:4px solid #fee2e2;padding-left:12px">${opts.preview}</blockquote><a href="${opts.conversationUrl}" style="display:inline-block;margin-top:12px;background:#ff5a5f;color:#fff;padding:10px 16px;border-radius:10px;text-decoration:none">Reply</a>`
    return baseLayout('New message', body)
  }
}

export function supportTicketEmail(opts: { name: string; ticketId: string; status: string; message?: string; ticketUrl?: string; timestamp?: string }) {
  // Use new design system
  try {
    return renderEmailToHTML({
      template: 'supportTicket',
      data: opts
    })
  } catch (error) {
    console.error('Error rendering support ticket email:', error)
    // Fallback to legacy template
    const body = `<h1 style="margin:0 0 8px;font-size:22px">Support ticket ${opts.status}</h1><p style="margin:0 0 12px;color:#334155">Hi ${opts.name}, your ticket #${opts.ticketId} is now ${opts.status}.</p>${opts.message ? `<p style="margin:0;color:#475569">${opts.message}</p>` : ''}`
    return baseLayout(`Support ticket ${opts.status}`, body)
  }
}

export function ratingRequestEmail(opts: { renterName: string; listingTitle: string; ownerName: string; bookingId: string; listingSlug: string; rentalPeriod?: string }) {
  // Use new design system
  try {
    return renderEmailToHTML({
      template: 'ratingRequest',
      data: opts
    })
  } catch (error) {
    console.error('Error rendering rating request email:', error)
    // Fallback to legacy template
    const title = 'How was your rental experience? ⭐'
    const body = `<h1 style="margin:0 0 8px;font-size:22px">${title}</h1><p style="margin:0 0 16px;color:#334155">Hi ${opts.renterName},</p><p style="margin:0 0 16px;color:#334155">Thanks for completing your rental of "<strong>${opts.listingTitle}</strong>" with ${opts.ownerName}. We'd love to hear about your experience!</p><div style="background:#f8fafc;border-radius:12px;padding:16px;margin:16px 0;text-align:center"><div style="color:#334155;margin-bottom:12px">Your feedback helps other renters make informed decisions and helps owners improve their service.</div><a href="${SITE_URL}/reviews/new?booking=${opts.bookingId}" style="display:inline-block;background:#ff5a5f;color:#fff;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px">⭐ Rate Your Experience</a></div><p style="margin:16px 0 0;color:#334155">The review will only take a minute and helps keep our community trustworthy and reliable.</p><p style="margin:24px 0 0;color:#475569;font-size:13px">Questions? Reply to this email or visit our <a href="${SITE_URL}/support" style="color:#ff5a5f;text-decoration:none">Help Center</a>.</p>`
    return baseLayout(title, body)
  }
}

export function newBookingNotificationEmail(opts: {
  ownerName: string;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  listingTitle: string;
  startDate: string;
  endDate: string;
  total: string;
  bookingNumber?: string;
  requiresConfirmation: boolean;
  bookingId?: string;
}) {
  // Use new design system
  try {
    return renderEmailToHTML({
      template: 'newBookingNotification',
      data: opts
    })
  } catch (error) {
    console.error('Error rendering new booking notification email:', error)
    // Fallback to legacy template
    const title = 'New Booking Received! 🎉'
    const statusMessage = opts.requiresConfirmation
      ? 'This booking requires your confirmation. Please review the details and respond to the renter.'
      : 'This booking has been automatically confirmed as an instant booking.'

    const body = `<h1 style="margin:0 0 8px;font-size:22px">${title}</h1><p style="margin:0 0 16px;color:#334155">Hi ${opts.ownerName},</p><p style="margin:0 0 16px;color:#334155">Great news! You've received a new booking${opts.bookingNumber ? ` (#${opts.bookingNumber})` : ''} for your listing.</p><div style="background:#f8fafc;border-radius:12px;padding:16px;margin:16px 0"><div style="font-weight:600;font-size:16px;margin-bottom:8px">${opts.listingTitle}</div><div style="color:#475569;margin-bottom:4px"><strong>Renter:</strong> ${opts.renterName}</div><div style="color:#475569;margin-bottom:4px"><strong>Email:</strong> ${opts.renterEmail}</div><div style="color:#475569;margin-bottom:4px"><strong>Phone:</strong> ${opts.renterPhone}</div><div style="color:#475569;margin-bottom:4px"><strong>Dates:</strong> ${opts.startDate} → ${opts.endDate}</div><div style="color:#475569;margin-bottom:8px"><strong>Total Payment:</strong> ${opts.total}</div><div style="padding:12px;background:${opts.requiresConfirmation ? '#fef3c7' : '#dcfce7'};border-radius:8px;font-size:14px;color:${opts.requiresConfirmation ? '#92400e' : '#166534'}">${statusMessage}</div></div><p style="margin:16px 0;color:#475569">Please contact the renter to arrange pickup/delivery details and provide any additional instructions.</p><a href="${SITE_URL}/dashboard/bookings" style="display:inline-block;background:#ff5a5f;color:#fff;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px">View Booking Details</a><p style="margin:24px 0 0;color:#475569;font-size:13px">Questions? Reply to this email or visit our <a href="${SITE_URL}/support" style="color:#ff5a5f;text-decoration:none">Help Center</a>.</p>`
    return baseLayout(title, body)
  }
}

export function stockAlertEmail(opts: {
  recipientName: string
  businessName: string
  itemName: string
  sku?: string
  currentQuantity: number
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'REORDER_POINT' | 'MAINTENANCE_DUE'
  thresholdText?: string
  manageUrl?: string
  timestamp?: string
}) {
  // Use new design system
  try {
    return renderEmailToHTML({
      template: 'stockAlert',
      data: opts
    })
  } catch (error) {
    console.error('Error rendering stock alert email:', error)
    // Fallback to legacy template
    const badgeColor = opts.alertType === 'OUT_OF_STOCK' ? '#dc2626' : opts.alertType === 'LOW_STOCK' ? '#f59e0b' : '#2563eb'
    const title = `Inventory Alert: ${opts.alertType.replaceAll('_',' ')}`
    const body = `
      <h1 style="margin:0 0 8px;font-size:22px">${title}</h1>
      <p style="margin:0 0 12px;color:#334155">Hi ${opts.recipientName},</p>
      <p style="margin:0 0 12px;color:#334155">Your business <strong>${opts.businessName}</strong> has an inventory alert.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:12px;background:#f8fafc;border-radius:12px;overflow:hidden">
        <tbody>
          <tr>
            <td style="padding:16px">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <span style="background:${badgeColor};color:#fff;padding:2px 10px;border-radius:9999px;font-size:12px">${opts.alertType.replaceAll('_',' ')}</span>
                ${opts.thresholdText ? `<span style="background:#e2e8f0;color:#0f172a;padding:2px 10px;border-radius:9999px;font-size:12px">${opts.thresholdText}</span>` : ''}
              </div>
              <div style="margin-top:10px;font-weight:600">${opts.itemName}${opts.sku ? ` <span style="color:#475569;font-weight:400">(SKU: ${opts.sku})</span>` : ''}</div>
              <div style="margin-top:6px;color:#475569">Current quantity: <strong>${opts.currentQuantity}</strong></div>
            </td>
          </tr>
        </tbody>
      </table>
      ${opts.manageUrl ? `<a href="${opts.manageUrl}" style="display:inline-block;margin-top:16px;background:#ff5a5f;color:#fff;padding:10px 16px;border-radius:10px;text-decoration:none">Review inventory</a>` : ''}
    `
    return baseLayout(title, body)
  }
}