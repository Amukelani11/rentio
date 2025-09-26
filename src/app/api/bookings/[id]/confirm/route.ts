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
    console.log('Confirming booking:', bookingId, 'by user:', user.id)

    // Get booking details with listing and payment information
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(*),
        renter:users!renter_id(*),
        payments(*)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      console.error('Booking not found:', bookingError)
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if user is the listing owner or admin
    const isOwner = booking.listing?.user_id === user.id || booking.listing?.business_id === user.id
    const isAdmin = user.isAdmin || false

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Only the listing owner can confirm bookings' }, { status: 403 })
    }

    // Validate booking status
    if (booking.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending bookings can be confirmed' }, { status: 400 })
    }

    // Check if payment is completed
    const hasCompletedPayment = booking.payments &&
      booking.payments.length > 0 &&
      booking.payments.some((payment: any) => payment.status === 'COMPLETED')

    if (!hasCompletedPayment) {
      return NextResponse.json({ error: 'Booking cannot be confirmed until payment is completed' }, { status: 400 })
    }

    // Update booking status to confirmed
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'CONFIRMED',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (updateError) {
      console.error('Update booking error:', updateError)
      return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 })
    }

    // Create conversation for this booking if it doesn't exist
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('booking_id', bookingId)
      .single()

    let conversationId = existingConversation?.id

    if (!existingConversation) {
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          booking_id: bookingId,
          title: `Chat about ${booking.listing.title}`,
        })
        .select()
        .single()

      if (!conversationError && conversation) {
        conversationId = conversation.id

        // Add participants to conversation
        const ownerId = booking.listing.user_id || booking.listing.business_id
        if (ownerId) {
          await supabase
            .from('conversation_participants')
            .insert([
              { conversation_id: conversation.id, user_id: booking.renter_id },
              { conversation_id: conversation.id, user_id: ownerId },
            ])
        }
      }
    }

    // Create notification for renter
    await supabase
      .from('notifications')
      .insert({
        user_id: booking.renter_id,
        type: 'BOOKING_CONFIRMED',
        title: 'Booking Confirmed',
        message: `Your booking for "${booking.listing.title}" has been confirmed by the owner`,
        data: {
          bookingId,
          listingId: booking.listing.id,
          conversationId,
        },
        channels: ['EMAIL', 'PUSH'],
      })

    console.log('Booking confirmed successfully:', bookingId)

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      conversationId,
      message: 'Booking confirmed successfully',
    })
  } catch (error) {
    console.error('Confirm booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

