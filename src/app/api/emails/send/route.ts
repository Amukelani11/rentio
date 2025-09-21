import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'
import { 
  ratingRequestEmail, 
  bookingConfirmationEmail, 
  kycStatusEmail, 
  listingReviewEmail, 
  stockAlertEmail 
} from '@/emails/templates'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, template, data } = await request.json()

    if (!to || !subject || !template || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let html = ''

    switch (template) {
      case 'ratingRequest':
        html = ratingRequestEmail(data)
        break
      case 'bookingConfirmation':
        html = bookingConfirmationEmail(data)
        break
      case 'kycStatus':
        html = kycStatusEmail(data)
        break
      case 'listingReview':
        html = listingReviewEmail(data)
        break
      case 'stockAlert':
        html = stockAlertEmail(data)
        break
      default:
        return NextResponse.json({ error: 'Invalid template' }, { status: 400 })
    }

    await sendEmail({
      to,
      subject,
      html,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
