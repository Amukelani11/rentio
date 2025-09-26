import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = params.id
    const body = await request.json()
    const { paymentId, paymentStatus, yocoTransactionId } = body

    if (!paymentId || !paymentStatus) {
      return NextResponse.json({ error: 'Missing payment information' }, { status: 400 })
    }

    // Get the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(*),
        renter:users!renter_id(*)
      `)
      .eq('id', bookingId)
      .eq('renter_id', user.id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json({ error: 'Booking is not in pending status' }, { status: 400 })
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        provider: 'YOCO',
        provider_id: yocoTransactionId || paymentId,
        amount: booking.total_amount,
        amount_cents: Math.round(booking.total_amount * 100),
        currency: 'ZAR',
        status: paymentStatus === 'successful' ? 'COMPLETED' : 'FAILED',
        escrow_released: false,
        deposit_hold: true,
        deposit_released: false,
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Create payment error:', paymentError)
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 })
    }

    if (paymentStatus === 'successful') {
      // Update booking status to confirmed
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'CONFIRMED',
          payment_status: 'COMPLETED',
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', bookingId)

      if (updateError) {
        console.error('Update booking error:', updateError)
        return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 })
      }

      // Create conversation for this booking
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          booking_id: bookingId,
          title: `Chat about ${booking.listing.title}`,
        })
        .select()
        .single()

      if (!conversationError && conversation) {
        // Add participants to conversation
        const ownerId = booking.listing.user_id || booking.listing.business_id
        if (ownerId) {
          await supabase
            .from('conversation_participants')
            .insert([
              { conversation_id: conversation.id, user_id: user.id },
              { conversation_id: conversation.id, user_id: ownerId },
            ])
        }
      }

      // Create notifications
      const ownerId = booking.listing.user_id || booking.listing.business_id
      if (ownerId) {
        await supabase
          .from('notifications')
          .insert({
            user_id: ownerId,
            type: 'BOOKING_CONFIRMED',
            title: 'New Booking Confirmed',
            message: `You have a new confirmed booking for "${booking.listing.title}"`,
            data: {
              bookingId,
              conversationId: conversation?.id,
            },
            channels: ['EMAIL', 'PUSH'],
          })
      }

      return NextResponse.json({
        success: true,
        data: {
          booking: { ...booking, status: 'CONFIRMED', payment_status: 'COMPLETED' },
          payment,
          conversationId: conversation?.id,
        },
      })
    } else {
      // Payment failed - update booking status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'CANCELLED',
          payment_status: 'FAILED',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', bookingId)

      if (updateError) {
        console.error('Update booking error:', updateError)
      }

      return NextResponse.json({
        success: false,
        data: {
          booking: { ...booking, status: 'CANCELLED', payment_status: 'FAILED' },
          payment,
        },
        error: 'Payment failed',
      })
    }
  } catch (error) {
    console.error('Confirm booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
