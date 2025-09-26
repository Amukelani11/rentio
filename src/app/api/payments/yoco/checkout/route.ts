import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      bookingId, 
      amountInCents, 
      currency = 'ZAR', 
      metadata,
      successUrl,
      cancelUrl 
    } = body

    if (!bookingId || !amountInCents) {
      return NextResponse.json({ error: 'bookingId and amountInCents required' }, { status: 400 })
    }

    // Verify the booking exists and belongs to the user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(*)
      `)
      .eq('id', bookingId)
      .eq('renter_id', user.id)
      .eq('status', 'PENDING')
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found or not in pending status' }, { status: 404 })
    }

    // Check if listing requires lister confirmation
    const requiresConfirmation = !booking.listing.instant_book

    // Debug: Log the amounts for troubleshooting
    console.log('Amount verification:', {
      amountInCents,
      bookingTotal: booking.total_amount,
      expectedAmount: Math.round(booking.total_amount * 100)
    })

    // Verify the amount matches (allow small floating point differences)
    const expectedAmount = Math.round(booking.total_amount * 100) // Convert to cents
    const amountDifference = Math.abs(amountInCents - expectedAmount)
    if (amountDifference > 5) { // Allow 5 cent difference for floating point precision
      console.error('Amount mismatch:', { amountInCents, expectedAmount, bookingTotal: booking.total_amount })
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

        // Get base URL from environment
        const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

        // Create Yoco checkout session
        const yocoApiKey = process.env.YOCO_SECRET_KEY
        if (!yocoApiKey) {
          console.error('Missing Yoco secret key')
          return NextResponse.json({ error: 'Payment service configuration error' }, { status: 500 })
        }

        // Determine success URL - use server-side success handler so we can confirm before the page loads
        const successUrlPath = `/api/payments/yoco/success?bookingId=${bookingId}`

        // Call Yoco API to create checkout session first
        const yocoCheckoutData = {
          amount: amountInCents,
          currency,
          // prefer explicit successUrl param, otherwise use server success handler
          successUrl: successUrl || `${baseUrl}${successUrlPath}`,
          cancelUrl: cancelUrl || `${baseUrl}/dashboard/rentals?payment=cancelled`,
          metadata: {
            bookingId,
            userId: user.id,
            requiresConfirmation,
            ...metadata
          }
        }

        const yocoResponse = await fetch('https://payments.yoco.com/api/checkouts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${yocoApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(yocoCheckoutData)
        })

        if (!yocoResponse.ok) {
          const errorData = await yocoResponse.text()
          console.error('Yoco API error:', errorData)
          return NextResponse.json({ error: 'Failed to create payment session' }, { status: 500 })
        }

        const yocoData = await yocoResponse.json()
        const yocoCheckoutId = yocoData.id
        const redirectUrl = yocoData.redirectUrl

        // Create a pending payment record with Yoco checkout ID
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .insert({
            booking_id: bookingId,
            provider: 'YOCO',
            provider_id: yocoCheckoutId,
            checkout_id: yocoCheckoutId, // Store checkout ID for webhook lookup
            amount: booking.total_amount,
            amount_cents: Math.round(booking.total_amount * 100),
            currency,
            status: 'PENDING',
            escrow_released: false,
            deposit_hold: true,
            deposit_released: false,
            metadata: {
              requires_confirmation: requiresConfirmation
            }
          })
          .select()
          .single()

        if (paymentError) {
          console.error('Create payment error:', paymentError)
          return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 })
        }

        // Update booking status to PENDING to indicate payment is in progress
        const { error: bookingUpdateError } = await supabase
          .from('bookings')
          .update({
            status: 'PENDING',
            payment_status: 'PENDING',
          })
          .eq('id', bookingId)

        if (bookingUpdateError) {
          console.error('Update booking status error:', bookingUpdateError)
          // Don't fail the checkout, just log the error
        }

        return NextResponse.json({
          success: true,
          data: {
            redirectUrl,
            paymentId: payment.id,
            checkoutId: yocoCheckoutId,
            amount: booking.total_amount,
            currency,
            requiresConfirmation,
          }
        })
  } catch (error) {
    console.error('Yoco checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

