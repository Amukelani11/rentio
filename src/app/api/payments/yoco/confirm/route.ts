import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, checkoutId } = body

    if (!bookingId || !checkoutId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find the payment record by checkout ID
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        booking:bookings(*)
      `)
      .eq('provider_id', checkoutId)
      .eq('booking_id', bookingId)
      .single()

    if (paymentError || !payment) {
      console.error('Payment not found:', paymentError)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Check if user owns this booking
    if (payment.booking.renter_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // If payment is still pending, update it to completed and confirm booking
    if (payment.status === 'PENDING') {
      // Update payment status
      const { error: updatePaymentError } = await supabase
        .from('payments')
        .update({
          status: 'COMPLETED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id)

      if (updatePaymentError) {
        console.error('Update payment error:', updatePaymentError)
        return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
      }

      // Update booking status to confirmed
      const { error: updateBookingError } = await supabase
        .from('bookings')
        .update({
          status: 'CONFIRMED',
          payment_status: 'COMPLETED',
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', bookingId)

      if (updateBookingError) {
        console.error('Update booking error:', updateBookingError)
        return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 })
      }

      // Create conversation for this booking if it doesn't exist
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('booking_id', bookingId)
        .single()

      if (!existingConversation) {
        const { data: conversation, error: conversationError } = await supabase
          .from('conversations')
          .insert({
            booking_id: bookingId,
            title: `Chat about ${payment.booking.listing?.title || 'rental'}`,
          })
          .select()
          .single()

        if (!conversationError && conversation) {
          // Add participants to conversation
          const ownerId = payment.booking.listing?.user_id || payment.booking.listing?.business_id
          if (ownerId) {
            await supabase
              .from('conversation_participants')
              .insert([
                { conversation_id: conversation.id, user_id: payment.booking.renter_id },
                { conversation_id: conversation.id, user_id: ownerId },
              ])
          }
        }
      }

      // Create notifications
      const ownerId = payment.booking.listing?.user_id || payment.booking.listing?.business_id
      const listingTitle = payment.booking.listing?.title || 'Unknown Item'
      
      if (ownerId) {
        await supabase
          .from('notifications')
          .insert({
            user_id: ownerId,
            type: 'BOOKING_CONFIRMED',
            title: 'New Booking Confirmed',
            message: `You have a new confirmed booking for "${listingTitle}"`,
            data: {
              bookingId,
            },
            channels: ['EMAIL', 'PUSH'],
          })
      }

      // Notify the renter
      await supabase
        .from('notifications')
        .insert({
          user_id: payment.booking.renter_id,
          type: 'BOOKING_CONFIRMED',
          title: 'Booking Confirmed',
          message: `Your booking for "${listingTitle}" has been confirmed`,
          data: {
            bookingId,
          },
          channels: ['PUSH'],
        })
    }

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed successfully',
    })
  } catch (error) {
    console.error('Confirm payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


