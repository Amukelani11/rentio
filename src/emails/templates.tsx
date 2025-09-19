// Simple HTML email templates (no JSX)

const brandColor = '#ff5a5f'
const textColor = '#0f172a'
const subText = '#475569'

function baseLayout(title: string, body: string) {
  return `<!doctype html><html lang="en"><head><meta charSet="utf-8"/><meta http-equiv="x-ua-compatible" content="ie=edge"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title></head><body style="margin:0;background:#f8fafc;color:${textColor};font-family:Inter,-apple-system,Segoe UI,Helvetica,Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f8fafc;padding:24px 0"><tbody><tr><td><table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,0.06)"><tbody><tr><td style="padding:20px;background:linear-gradient(90deg, rgba(255,90,95,0.08), rgba(255,90,95,0))"><img src="https://rentio-public.s3.amazonaws.com/rentiologo.png" alt="Rentio" height="24" style="display:block"/></td></tr><tr><td style="padding:24px">${body}</td></tr><tr><td style="padding:20px;background:#f1f5f9;color:#475569;font-size:12px"><div>You're receiving this email because you have a Rentio account.</div><div style="margin-top:6px">© ${new Date().getFullYear()} Rentio. All rights reserved.</div></td></tr></tbody></table></td></tr></tbody></table></body></html>`
}

export function bookingConfirmationEmail(opts: { renterName: string; listingTitle: string; startDate: string; endDate: string; total: string }) {
  const body = `<h1 style="margin:0 0 8px;font-size:22px">Booking confirmed</h1><p style="margin:0 0 16px;color:#334155">Hi ${opts.renterName}, your booking is confirmed.</p><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:12px;background:#f8fafc;border-radius:12px;overflow:hidden"><tbody><tr><td style="padding:16px"><div style="font-weight:600">${opts.listingTitle}</div><div style="margin-top:6px;color:${subText}">${opts.startDate} → ${opts.endDate}</div><div style="margin-top:6px"><span style="background:#fee2e2;color:#b91c1c;padding:2px 8px;border-radius:9999px">Total: ${opts.total}</span></div></td></tr></tbody></table><p style="margin-top:16px;color:${subText}">You'll receive handover details before pickup. Deposits are protected and released after successful return.</p><a href="https://rentio.app/dashboard/bookings" style="display:inline-block;margin-top:16px;background:${brandColor};color:#fff;padding:10px 16px;border-radius:10px;text-decoration:none">View booking</a>`
  return baseLayout('Your booking is confirmed', body)
}

export function kycStatusEmail(opts: { name: string; status: 'VERIFIED' | 'REJECTED' | 'PENDING'; reason?: string }) {
  const title = opts.status === 'VERIFIED' ? 'KYC Approved' : opts.status === 'REJECTED' ? 'KYC Rejected' : 'KYC Update'
  const highlight = opts.status === 'VERIFIED' ? '#16a34a' : opts.status === 'REJECTED' ? '#dc2626' : '#f59e0b'
  const body = `<h1 style="margin:0 0 8px;font-size:22px">${title}</h1><p style="margin:0 0 16px;color:#334155">Hi ${opts.name},</p><p style="margin:0 0 8px;color:#334155">Your KYC status: <strong style="color:${highlight}">${opts.status}</strong></p>${opts.reason ? `<p style="margin:0 0 12px;color:${subText}">Reason: ${opts.reason}</p>` : ''}<a href="https://rentio.app/dashboard/kyc" style="display:inline-block;margin-top:12px;background:${brandColor};color:#fff;padding:10px 16px;border-radius:10px;text-decoration:none">Manage KYC</a>`
  return baseLayout(title, body)
}

export function listingReviewEmail(opts: { ownerName: string; listingTitle: string; status: 'SUBMITTED' | 'APPROVED' | 'REJECTED'; note?: string }) {
  const title = opts.status === 'APPROVED' ? 'Listing Approved' : opts.status === 'REJECTED' ? 'Listing Rejected' : 'Listing Submitted for Review'
  const body = `<h1 style="margin:0 0 8px;font-size:22px">${title}</h1><p style="margin:0 0 16px;color:#334155">Hi ${opts.ownerName},</p><p style="margin:0 0 8px;color:#334155">Listing: <strong>${opts.listingTitle}</strong></p>${opts.note ? `<p style="margin:0 0 12px;color:${subText}">Note: ${opts.note}</p>` : ''}<a href="https://rentio.app/dashboard/listings" style="display:inline-block;margin-top:12px;background:${brandColor};color:#fff;padding:10px 16px;border-radius:10px;text-decoration:none">Manage listings</a>`
  return baseLayout(title, body)
}

export function paymentReceiptEmail(opts: { name: string; amount: string; bookingNumber?: string; provider: 'YOCO' | 'STRIPE' | string }) {
  const body = `<h1 style="margin:0 0 8px;font-size:22px">Payment received</h1><p style="margin:0 0 12px;color:#334155">Hi ${opts.name}, we received your payment of <strong>${opts.amount}</strong>.</p>${opts.bookingNumber ? `<p style="margin:0 0 12px;color:${subText}">Booking: ${opts.bookingNumber}</p>` : ''}<p style="margin:0;color:${subText}">Provider: ${opts.provider}</p>`
  return baseLayout('Payment received', body)
}

export function bookingStatusEmail(opts: { name: string; listingTitle: string; status: string; note?: string }) {
  const body = `<h1 style="margin:0 0 8px;font-size:22px">Booking ${opts.status}</h1><p style="margin:0 0 12px;color:#334155">Hi ${opts.name}, your booking for <strong>${opts.listingTitle}</strong> is now <strong>${opts.status}</strong>.</p>${opts.note ? `<p style="margin:0;color:${subText}">${opts.note}</p>` : ''}`
  return baseLayout(`Booking ${opts.status}`, body)
}

export function depositStatusEmail(opts: { name: string; amount: string; action: 'RELEASED' | 'RETAINED'; reason?: string }) {
  const title = opts.action === 'RELEASED' ? 'Deposit released' : 'Deposit retained'
  const body = `<h1 style="margin:0 0 8px;font-size:22px">${title}</h1><p style="margin:0 0 12px;color:#334155">Hi ${opts.name}, your deposit ${opts.action === 'RELEASED' ? 'has been released.' : 'has been retained.'}</p><p style="margin:0;color:${subText}">Amount: ${opts.amount}</p>${opts.reason ? `<p style="margin:8px 0 0;color:${subText}">Reason: ${opts.reason}</p>` : ''}`
  return baseLayout(title, body)
}

export function messageReceivedEmail(opts: { name: string; fromName: string; preview: string; conversationUrl: string }) {
  const body = `<h1 style="margin:0 0 8px;font-size:22px">You have a new message</h1><p style="margin:0 0 8px;color:#334155">From: <strong>${opts.fromName}</strong></p><blockquote style="margin:0 0 12px;color:${subText};border-left:4px solid #fee2e2;padding-left:12px">${opts.preview}</blockquote><a href="${opts.conversationUrl}" style="display:inline-block;margin-top:12px;background:${brandColor};color:#fff;padding:10px 16px;border-radius:10px;text-decoration:none">Reply</a>`
  return baseLayout('New message', body)
}

export function supportTicketEmail(opts: { name: string; ticketId: string; status: string; message?: string }) {
  const body = `<h1 style="margin:0 0 8px;font-size:22px">Support ticket ${opts.status}</h1><p style="margin:0 0 12px;color:#334155">Hi ${opts.name}, your ticket #${opts.ticketId} is now ${opts.status}.</p>${opts.message ? `<p style="margin:0;color:${subText}">${opts.message}</p>` : ''}`
  return baseLayout(`Support ticket ${opts.status}`, body)
}
