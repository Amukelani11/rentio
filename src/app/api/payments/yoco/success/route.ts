import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'
import { sendEmail } from '@/lib/resend'
import { paymentReceiptEmail, bookingStatusEmail, bookingConfirmationEmail, newBookingNotificationEmail } from '@/emails/templates'

// This endpoint handles the redirect URL from Yoco after a successful payment.
// It attempts to confirm the payment server-side using the authenticated session
// (so the page can render already-confirmed state) without requiring the service role.
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser(supabase)

    const url = new URL(request.url)
    const bookingId = url.searchParams.get('bookingId')
    // Prefer explicit BASE_URL / NEXT_PUBLIC_BASE_URL when set (e.g. your ngrok/tunnel URL)
    const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || url.origin
    const checkoutId = url.searchParams.get('session_id') || url.searchParams.get('checkout_id') || url.searchParams.get('provider_id')

    if (!user) {
      // If user isn't authenticated, redirect to the public confirmation page which will fallback accordingly
      const redirectTo = bookingId ? `${baseUrl}/booking-confirmation?bookingId=${bookingId}` : `${baseUrl}/`
      return NextResponse.redirect(redirectTo)
    }

    if (!checkoutId && !bookingId) {
      const redirectTo = bookingId ? `${baseUrl}/booking-confirmation?bookingId=${bookingId}` : `${baseUrl}/`
      return NextResponse.redirect(redirectTo)
    }

    // Try find the payment record matching checkout/provider id and booking
    let { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`*, booking:bookings(*)`)
      .eq('checkout_id', checkoutId)
      .maybeSingle()

    if ((!payment || payment === null) && (!bookingId || payment?.booking_id !== bookingId)) {
      // try provider_id
      const { data: payment2, error: paymentError2 } = await supabase
        .from('payments')
        .select(`*, booking:bookings(*)`)
        .eq('provider_id', checkoutId)
        .maybeSingle()
      payment = payment2
      paymentError = paymentError2
    }

    if (!payment) {
      // as last resort, try to match by bookingId only
      if (bookingId) {
        const { data: payment3 } = await supabase
          .from('payments')
          .select(`*, booking:bookings(*)`)
          .eq('booking_id', bookingId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        payment = payment3
      }
    }

    if (!payment) {
      // nothing we can do; redirect to confirmation page which will poll/fallback
      const redirectTo = bookingId ? `${baseUrl}/booking-confirmation?bookingId=${bookingId}` : `${baseUrl}/`
      return NextResponse.redirect(redirectTo)
    }

    // Ensure the logged-in user owns the booking (renter)
    if (payment.booking && payment.booking.renter_id && payment.booking.renter_id !== user.id) {
      // don't modify other's bookings; just redirect to the confirmation page
      return NextResponse.redirect(`${baseUrl}/booking-confirmation?bookingId=${payment.booking_id}`)
    }

    // Mark payment completed and update booking accordingly
    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
      .eq('id', payment.id)

    if (updatePaymentError) {
      console.error('Success confirm: failed to update payment', updatePaymentError)
      return NextResponse.redirect(`${baseUrl}/booking-confirmation?bookingId=${payment.booking_id}`)
    }

    const requiresConfirmation = payment.metadata?.requires_confirmation || false
    if (requiresConfirmation) {
      await supabase
        .from('bookings')
        .update({ status: 'PENDING', payment_status: 'COMPLETED' })
        .eq('id', payment.booking_id)
    } else {
      await supabase
        .from('bookings')
        .update({ status: 'CONFIRMED', payment_status: 'COMPLETED', confirmed_at: new Date().toISOString() })
        .eq('id', payment.booking_id)
    }

    // Send confirmation emails since webhook might not be triggered
    try {
      // Get full booking details with listing and renter info
      const { data: fullBooking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          listing:listings(*),
          renter:users!renter_id(*)
        `)
        .eq('id', payment.booking_id)
        .single()

      if (fullBooking && !bookingError) {
        const renterEmail = fullBooking.renter?.email
        const renterName = fullBooking.renter?.name || 'there'
        const listingTitle = fullBooking.listing?.title || 'Unknown Item'
        const amountStr = `R ${(payment.amount || fullBooking.total_amount || 0).toFixed?.(2) || String(payment.amount)}`

        console.log('📧 [SUCCESS] Sending confirmation emails to:', renterEmail)

        if (renterEmail) {
          // Send payment receipt
          await sendEmail({
            to: renterEmail,
            subject: 'Payment Received',
            html: paymentReceiptEmail({
              name: renterName,
              amount: amountStr,
              bookingNumber: fullBooking.booking_number,
              provider: 'YOCO'
            })
          })
          console.log('✅ [SUCCESS] Payment receipt sent')

          // Send booking confirmation based on type
          if (requiresConfirmation) {
            await sendEmail({
              to: renterEmail,
              subject: 'Booking Awaiting Confirmation',
              html: bookingStatusEmail({
                name: renterName,
                listingTitle: listingTitle,
                status: 'PENDING',
                note: 'Your payment has been received. The listing owner will review your booking request shortly.'
              })
            })
            console.log('✅ [SUCCESS] Booking pending email sent')
          } else {
            await sendEmail({
              to: renterEmail,
              subject: 'Booking Confirmed!',
              html: bookingConfirmationEmail({
                renterName,
                listingTitle,
                startDate: new Date(fullBooking.start_date).toLocaleDateString('en-ZA'),
                endDate: new Date(fullBooking.end_date).toLocaleDateString('en-ZA'),
                total: amountStr,
                pickupLocation: fullBooking.listing?.pickup_location || fullBooking.listing?.location,
                pickupInstructions: fullBooking.listing?.pickup_instructions,
                deliveryInstructions: fullBooking.listing?.delivery_instructions,
                deliveryAddress: fullBooking.delivery_address,
                isDelivery: fullBooking.listing?.delivery_available || false,
                ownerName: fullBooking.listing?.user?.name || fullBooking.listing?.business?.name,
                ownerEmail: fullBooking.listing?.user?.email || fullBooking.listing?.business?.email,
                bookingId: fullBooking.id
              })
            })
            console.log('✅ [SUCCESS] Booking confirmation sent')
          }

          // Send notification to owner/lister
          const userId = fullBooking.listing?.user_id
          const businessId = fullBooking.listing?.business_id
          console.log('📧 [SUCCESS] Listing data:', {
            user_id: userId,
            business_id: businessId
          })
          
          let owner = null
          let ownerError = null

          if (userId) {
            // Individual lister - fetch from users table
            console.log('📧 [SUCCESS] Fetching individual owner details for user ID:', userId)
            const { data: userOwner, error: userError } = await supabase
              .from('users')
              .select('email, name')
              .eq('id', userId)
              .single()
            
            owner = userOwner
            ownerError = userError
            console.log('📧 [SUCCESS] Individual owner fetch result:', { owner, ownerError })
          } else if (businessId) {
            // Business lister - fetch from businesses table
            console.log('📧 [SUCCESS] Fetching business owner details for business ID:', businessId)
            const { data: businessOwner, error: businessError } = await supabase
              .from('businesses')
              .select('email, name')
              .eq('id', businessId)
              .single()
            
            // Map business fields to match expected structure
            owner = businessOwner ? {
              email: businessOwner.email,
              name: businessOwner.name
            } : null
            ownerError = businessError
            console.log('📧 [SUCCESS] Business owner fetch result:', { owner, ownerError })
          }

          if (owner?.email) {
            const renterPhone = fullBooking.contact_phone || 'Not provided'
            
            console.log('📧 [SUCCESS] Sending owner notification to:', owner.email)
            await sendEmail({
              to: owner.email,
              subject: `New Booking ${requiresConfirmation ? 'Request' : 'Confirmed'} - ${listingTitle}`,
              html: newBookingNotificationEmail({
                ownerName: owner.name || 'there',
                renterName,
                renterEmail: renterEmail,
                renterPhone,
                listingTitle,
                startDate: new Date(fullBooking.start_date).toLocaleDateString('en-ZA'),
                endDate: new Date(fullBooking.end_date).toLocaleDateString('en-ZA'),
                total: amountStr,
                bookingNumber: fullBooking.booking_number,
                requiresConfirmation
              })
            })
            console.log('✅ [SUCCESS] Owner notification sent')
          } else {
            console.log('❌ [SUCCESS] No owner email found or owner fetch failed:', ownerError)
          }
        }
      }
    } catch (emailError) {
      console.error('❌ [SUCCESS] Error sending emails:', emailError)
      // Don't fail the redirect if emails fail
    }

    // Redirect to the booking confirmation page (now should show confirmed)
    return NextResponse.redirect(`${baseUrl}/booking-confirmation?bookingId=${payment.booking_id}`)
  } catch (err) {
    console.error('Yoco success handler error:', err)
    const fallback = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin
    return NextResponse.redirect(`${fallback}/`)
  }
}


