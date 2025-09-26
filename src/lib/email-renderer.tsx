// Note: This file uses string-based email templates instead of React components
// to avoid react-dom/server issues in API routes

// Email template types
type EmailTemplate =
  | 'bookingConfirmation'
  | 'paymentReceipt'
  | 'depositStatus'
  | 'bookingStatus'
  | 'newBookingNotification'
  | 'messageReceived'
  | 'kycStatus'
  | 'listingReview'
  | 'supportTicket'
  | 'ratingRequest'
  | 'stockAlert'
  | 'welcome'
  | 'promotion'
  | 'announcement'
  | 'newsletter'
  | 'reengagement'

interface EmailRenderOptions {
  template: EmailTemplate
  data: any
  title?: string
  preview?: string
}

// Base email layout HTML template
function getBaseEmailLayout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta http-equiv="x-ua-compatible" content="ie=edge"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>${title}</title>
  </head>
  <body style="margin:0;background:#f8fafc;color:#0f172a;font-family:Inter,-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f8fafc;padding:24px 0">
      <tbody>
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,0.06)">
              <tbody>
                <tr>
                  <td style="padding:20px;background:linear-gradient(90deg, rgba(255,90,95,0.08), rgba(255,90,95,0))">
                    <img src="https://rentio-public.s3.amazonaws.com/rentiologo.png" alt="Rentio" height="24" style="display:block"/>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px">
                    ${content}
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;background:#f1f5f9;color:#475569;font-size:12px;text-align:center">
                    <div>You're receiving this email because you have a Rentio account.</div>
                    <div style="margin-top:8px">© ${new Date().getFullYear()} Rentio. All rights reserved.</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`
}

export function renderEmailToHTML({ template, data, title, preview }: EmailRenderOptions): string {
  try {
    let content: string
    let emailTitle: string

    switch (template) {
      case 'bookingConfirmation':
        emailTitle = 'Booking Confirmation'
        content = `
          <h1 style="margin:0 0 16px;font-size:24px;color:#0f172a">Booking Confirmed!</h1>
          <p style="margin:0 0 16px;color:#475569">Your booking has been confirmed. Here are the details:</p>
          <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0">
            <p style="margin:0 0 8px;font-weight:600">Booking Details:</p>
            <p style="margin:0 0 4px">Item: ${data.item || 'N/A'}</p>
            <p style="margin:0 0 4px">Dates: ${data.startDate || 'N/A'} - ${data.endDate || 'N/A'}</p>
            <p style="margin:0">Total: ${data.total || 'N/A'}</p>
          </div>
          <div style="text-align:center;margin:24px 0">
            <a href="${data.bookingUrl || '#'}" style="display:inline-block;background:#ff5a5f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">View Booking</a>
          </div>
        `
        break
      case 'paymentReceipt':
        emailTitle = 'Payment Receipt'
        content = `
          <h1 style="margin:0 0 16px;font-size:24px;color:#0f172a">Payment Received</h1>
          <p style="margin:0 0 16px;color:#475569">Thank you for your payment. Here's your receipt:</p>
          <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0">
            <p style="margin:0 0 8px;font-weight:600">Payment Details:</p>
            <p style="margin:0 0 4px">Amount: ${data.amount || 'N/A'}</p>
            <p style="margin:0 0 4px">Reference: ${data.reference || 'N/A'}</p>
            <p style="margin:0">Date: ${data.date || 'N/A'}</p>
          </div>
        `
        break
      default:
        emailTitle = 'Rentio Notification'
        content = `
          <h1 style="margin:0 0 16px;font-size:24px;color:#0f172a">Notification</h1>
          <p style="margin:0 0 16px;color:#475569">You have a new notification from Rentio.</p>
        `
    }

    return getBaseEmailLayout(title || emailTitle, content)
  } catch (error) {
    console.error('Error rendering email template:', error)
    throw new Error(`Failed to render email template: ${template}`)
  }
}

// Convenience functions for specific email types
export function renderBookingConfirmation(data: any): string {
  return renderEmailToHTML({ template: 'bookingConfirmation', data })
}

export function renderPaymentReceipt(data: any): string {
  return renderEmailToHTML({ template: 'paymentReceipt', data })
}

export function renderKYCStatus(data: any): string {
  return renderEmailToHTML({ template: 'kycStatus', data })
}

export function renderListingReview(data: any): string {
  return renderEmailToHTML({ template: 'listingReview', data })
}

export function renderStockAlert(data: any): string {
  return renderEmailToHTML({ template: 'stockAlert', data })
}

export function renderMessageReceived(data: any): string {
  return renderEmailToHTML({ template: 'messageReceived', data })
}

export function renderRatingRequest(data: any): string {
  return renderEmailToHTML({ template: 'ratingRequest', data })
}

export function renderSupportTicket(data: any): string {
  return renderEmailToHTML({ template: 'supportTicket', data })
}

export function renderWelcomeEmail(data: any): string {
  return renderEmailToHTML({ template: 'welcome', data })
}

export function renderPromotionEmail(data: any): string {
  return renderEmailToHTML({ template: 'promotion', data })
}

export function renderAnnouncementEmail(data: any): string {
  return renderEmailToHTML({ template: 'announcement', data })
}

export function renderNewsletterEmail(data: any): string {
  return renderEmailToHTML({ template: 'newsletter', data })
}

export function renderReengagementEmail(data: any): string {
  return renderEmailToHTML({ template: 'reengagement', data })
}
