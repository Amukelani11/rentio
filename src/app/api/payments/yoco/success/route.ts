import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

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

    // Redirect to the booking confirmation page (now should show confirmed)
    return NextResponse.redirect(`${baseUrl}/booking-confirmation?bookingId=${payment.booking_id}`)
  } catch (err) {
    console.error('Yoco success handler error:', err)
    const fallback = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin
    return NextResponse.redirect(`${fallback}/`)
  }
}


