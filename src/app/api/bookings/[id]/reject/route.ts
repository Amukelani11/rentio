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
    const user = await getAuthUser(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = params.id
    const body = await request.json()
    const { reason } = body

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    console.log('Rejecting booking:', bookingId, 'by user:', user.id, 'reason:', reason)

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
      return NextResponse.json({ error: 'Only the listing owner can reject bookings' }, { status: 403 })
    }

    // Validate booking status
    if (booking.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending bookings can be rejected' }, { status: 400 })
    }

    // Check if payment is completed (required for rejection with refund)
    const hasCompletedPayment = booking.payments &&
      booking.payments.length > 0 &&
      booking.payments.some(payment => payment.status === 'COMPLETED')

    if (!hasCompletedPayment) {
      return NextResponse.json({ error: 'Booking cannot be rejected without a completed payment' }, { status: 400 })
    }

    // Get the completed payment record
    const completedPayment = booking.payments.find(payment => payment.status === 'COMPLETED')

    // Update booking status to cancelled
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'CANCELLED',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (updateError) {
      console.error('Update booking error:', updateError)
      return NextResponse.json({ error: 'Failed to reject booking' }, { status: 500 })
    }

    // Initiate refund process - update payment record
    if (completedPayment) {
      const { error: refundError } = await supabase
        .from('payments')
        .update({
          refund_amount: completedPayment.amount,
          refund_reason: reason,
          refunded_at: new Date().toISOString(),
          status: 'REFUNDED',
        })
        .eq('id', completedPayment.id)

      if (refundError) {
        console.error('Refund processing error:', refundError)
        // Continue with booking rejection even if refund processing fails
        // Log the error but don't fail the entire operation
      }
    }

    // Create notification for renter
    await supabase
      .from('notifications')
      .insert({
        user_id: booking.renter_id,
        type: 'BOOKING_CANCELLED',
        title: 'Booking Rejected',
        message: `Your booking for "${booking.listing.title}" has been rejected by the owner. Reason: ${reason}`,
        data: {
          bookingId,
          listingId: booking.listing.id,
          rejectionReason: reason,
        },
        channels: ['EMAIL', 'PUSH'],
      })

    console.log('Booking rejected successfully:', bookingId)

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: 'Booking rejected successfully and refund initiated',
    })
  } catch (error) {
    console.error('Reject booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}