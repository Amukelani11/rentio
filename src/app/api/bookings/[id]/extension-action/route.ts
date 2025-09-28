import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'
import { sendEmail } from '@/lib/resend'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser() // Let getAuthUser create its own client
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params
    const body = await request.json()
    const { action, reason } = body

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get the booking and extension details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(
          *,
          user:users(*),
          business:businesses(*)
        ),
        renter:users(*),
        extensions:booking_extensions(*)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      console.error('Booking fetch error:', bookingError)
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Get the latest extension request
    const { data: extension, error: extensionError } = await supabase
      .from('booking_extensions')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (extensionError || !extension) {
      console.error('Extension fetch error:', extensionError)
      return NextResponse.json({ error: 'No pending extension found' }, { status: 404 })
    }

    // Check if user owns the listing (can only accept/decline their own listing extensions)
    const isOwner = booking.listing.user?.id === user.id ||
                   booking.listing.business?.user_id === user.id

    if (!isOwner) {
      return NextResponse.json({ error: 'Only the listing owner can approve extensions' }, { status: 403 })
    }

    // Update extension status
    const { error: updateError } = await supabase
      .from('booking_extensions')
      .update({
        status: action === 'accept' ? 'APPROVED' : 'REJECTED',
        approved_at: action === 'accept' ? new Date().toISOString() : null
      })
      .eq('id', extension.id)

    if (updateError) {
      console.error('Extension update error:', updateError)
      return NextResponse.json({ error: 'Failed to update extension' }, { status: 500 })
    }

    if (action === 'accept') {
      // Update the booking with the new dates and costs
      const { error: bookingUpdateError } = await supabase
        .from('bookings')
        .update({
          end_date: extension.new_end_date,
          duration: booking.duration + extension.additional_days,
          subtotal: booking.subtotal + extension.additional_price,
          total_amount: booking.total_amount + extension.additional_price
        })
        .eq('id', bookingId)

      if (bookingUpdateError) {
        console.error('Booking update error:', bookingUpdateError)
        return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
      }
    }

    // Send email notification to the renter
    try {
      const renterEmail = booking.renter?.email
      const listingTitle = booking.listing.title
      const ownerName = booking.listing.user?.name || booking.listing.business?.name

      if (renterEmail) {
        const statusText = action === 'accept' ? 'approved' : 'declined'
        const subject = `📋 Extension ${statusText}: ${listingTitle}`

        const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charSet="utf-8"/>
    <meta http-equiv="x-ua-compatible" content="ie=edge"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>${subject}</title>
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
                    <h1 style="margin:0 0 16px;font-size:24px;color:#0f172a">
                      Extension Request ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}
                    </h1>

                    <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid #${action === 'accept' ? '22c55e' : 'ef4444'}">
                      <div style="margin-bottom:12px">
                        <span style="font-weight:600;color:#0f172a">Listing:</span>
                        <span style="margin-left:8px;color:#475569">${listingTitle}</span>
                      </div>

                      <div style="margin-bottom:12px">
                        <span style="font-weight:600;color:#0f172a">Owner:</span>
                        <span style="margin-left:8px;color:#475569">${ownerName}</span>
                      </div>

                      ${action === 'accept' ? `
                        <div style="margin-bottom:12px">
                          <span style="font-weight:600;color:#0f172a">New Return Date:</span>
                          <span style="margin-left:8px;color:#475569">${new Date(extension.new_end_date).toLocaleDateString()}</span>
                        </div>

                        <div style="background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;margin-top:16px">
                          <p style="margin:0;color:#0f172a;line-height:1.6">Your extension has been approved! The additional cost of <strong>R${extension.additional_price.toFixed(2)}</strong> has been added to your booking.</p>
                        </div>
                      ` : `
                        <div style="background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;margin-top:16px">
                          <p style="margin:0;color:#0f172a;line-height:1.6">Your extension request has been declined. ${reason ? `Reason: ${reason}` : ''}</p>
                        </div>
                      `}

                      ${action === 'accept' ? `
                        <div style="text-align:center;margin:24px 0">
                          <a href="https://rentio.co.za/dashboard/rentals"
                             style="display:inline-block;background:#ff5a5f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
                            📋 View Updated Booking
                          </a>
                        </div>
                      ` : ''}
                    </div>

                    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e2e8f0">
                      <div style="background:#fef3c7;border-radius:8px;padding:16px;margin-bottom:16px;border-left:4px solid #f59e0b">
                        <h3 style="margin:0 0 8px;font-size:14px;color:#92400e;font-weight:600">ℹ️ Next Steps</h3>
                        <p style="margin:0;color:#92400e;font-size:13px">
                          ${action === 'accept'
                            ? 'Your booking has been extended. You can continue using the item until the new return date.'
                            : 'You can contact the owner if you have any questions about the declined extension request.'
                          }
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;background:#f1f5f9;color:#475569;font-size:12px;text-align:center">
                    <div>You're receiving this email about your rental booking on Rentio.</div>
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
</html>
        `

        await sendEmail({
          to: renterEmail,
          subject,
          html,
        })

        console.log(`Extension ${statusText} notification sent to:`, renterEmail)
      }
    } catch (emailError) {
      console.error('Failed to send extension notification email:', emailError)
      // Don't fail the operation if email fails
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        status: action === 'accept' ? 'APPROVED' : 'REJECTED',
        extensionId: extension.id
      }
    })
  } catch (error) {
    console.error('Extension action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
