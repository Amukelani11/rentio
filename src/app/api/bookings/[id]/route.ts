import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function GET(
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
    console.log('Fetching booking details for ID:', bookingId, 'User:', user.id)

    // Get booking details with all relationships - simplified approach
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

    // Get additional listing details separately to avoid complex joins
    if (booking.listing) {
      const { data: listingDetails } = await supabase
        .from('listings')
        .select(`
          *,
          category:categories(*),
          user:users(*),
          business:businesses(*)
        `)
        .eq('id', booking.listing.id)
        .single()

      if (listingDetails) {
        booking.listing = listingDetails
      }
    }

    // Check permissions
    const isOwner = booking.listing?.user_id === user.id || booking.listing?.business_id === user.id
    const isRenter = booking.renter_id === user.id
    const isAdmin = (user as any).is_admin ?? user.isAdmin ?? false

    if (!isOwner && !isRenter && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: booking,
    })
  } catch (error) {
    console.error('Get booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const { action, ...data } = body

    // Get booking details
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
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check permissions
    const isOwner = booking.listing?.user_id === user.id || booking.listing?.business_id === user.id
    const isRenter = booking.renter_id === user.id
    const isAdmin = (user as any).is_admin ?? user.isAdmin ?? false

    if (!isOwner && !isRenter && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    switch (action) {
      case 'cancel': {
        if (!isRenter && !isAdmin) {
          return NextResponse.json({ error: 'Only renter can cancel booking' }, { status: 403 })
        }
        if (booking.status === 'CANCELLED') {
          return NextResponse.json({ error: 'Booking already cancelled' }, { status: 400 })
        }
        if (['COMPLETED', 'IN_PROGRESS'].includes(booking.status)) {
          return NextResponse.json({ error: 'Cannot cancel completed or in-progress booking' }, { status: 400 })
        }
        const { data: updatedBooking, error: updateError } = await supabase
          .from('bookings')
          .update({
            status: 'CANCELLED',
            cancelled_at: new Date().toISOString(),
            cancellation_reason: data.reason,
          })
          .eq('id', bookingId)
          .select()
          .single()
        if (updateError) {
          console.error('Update booking error:', updateError)
          return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
        }
        if (booking.payments && booking.payments.length > 0 && booking.payments[0].status === 'COMPLETED') {
          await supabase
            .from('payments')
            .update({
              refund_amount: booking.total_amount,
              refund_reason: data.reason,
              refunded_at: new Date().toISOString(),
              status: 'REFUNDED',
            })
            .eq('id', booking.payments[0].id)
        }
        const ownerId = booking.listing?.user_id || booking.listing?.business_id
        if (ownerId) {
          await supabase
            .from('notifications')
            .insert({
              user_id: ownerId,
              type: 'BOOKING_CANCELLED',
              title: 'Booking Cancelled',
              message: `Your booking for "${booking.listing?.title}" has been cancelled`,
              data: { bookingId, listingId: booking.listing?.id },
              channels: ['EMAIL', 'PUSH'],
            })
        }
        return NextResponse.json({ success: true, data: updatedBooking, message: 'Booking cancelled successfully' })
      }
      case 'confirm': {
        if (!isOwner && !isAdmin) {
          return NextResponse.json({ error: 'Only owner can confirm booking' }, { status: 403 })
        }
        if (booking.status !== 'PENDING') {
          return NextResponse.json({ error: 'Only pending bookings can be confirmed' }, { status: 400 })
        }
        const { data: confirmedBooking, error: confirmError } = await supabase
          .from('bookings')
          .update({ status: 'CONFIRMED', confirmed_at: new Date().toISOString() })
          .eq('id', bookingId)
          .select()
          .single()
        if (confirmError) {
          console.error('Confirm booking error:', confirmError)
          return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 })
        }
        await supabase
          .from('notifications')
          .insert({
            user_id: booking.renter_id,
            type: 'BOOKING_CONFIRMED',
            title: 'Booking Confirmed',
            message: `Your booking for "${booking.listing?.title}" has been confirmed`,
            data: { bookingId, listingId: booking.listing?.id },
            channels: ['EMAIL', 'PUSH'],
          })
        return NextResponse.json({ success: true, data: confirmedBooking, message: 'Booking confirmed successfully' })
      }
      case 'start': {
        if (!isOwner && !isAdmin) {
          return NextResponse.json({ error: 'Only owner can start rental' }, { status: 403 })
        }
        if (booking.status !== 'CONFIRMED') {
          return NextResponse.json({ error: 'Only confirmed bookings can be started' }, { status: 400 })
        }
        if (new Date() < new Date(booking.start_date)) {
          return NextResponse.json({ error: 'Cannot start rental before start date' }, { status: 400 })
        }
        const { data: startedBooking, error: startError } = await supabase
          .from('bookings')
          .update({ status: 'IN_PROGRESS', started_at: new Date().toISOString() })
          .eq('id', bookingId)
          .select()
          .single()
        if (startError) {
          console.error('Start booking error:', startError)
          return NextResponse.json({ error: 'Failed to start rental' }, { status: 500 })
        }
        return NextResponse.json({ success: true, data: startedBooking, message: 'Rental started successfully' })
      }
      case 'complete': {
        if (!isOwner && !isAdmin) {
          return NextResponse.json({ error: 'Only owner can complete rental' }, { status: 403 })
        }
        if (booking.status !== 'IN_PROGRESS') {
          return NextResponse.json({ error: 'Only in-progress rentals can be completed' }, { status: 400 })
        }
        const { data: completedBooking, error: completeError } = await supabase
          .from('bookings')
          .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
          .eq('id', bookingId)
          .select()
          .single()
        if (completeError) {
          console.error('Complete booking error:', completeError)
          return NextResponse.json({ error: 'Failed to complete rental' }, { status: 500 })
        }
        await supabase
          .from('notifications')
          .insert({
            user_id: booking.renter_id,
            type: 'BOOKING_COMPLETED',
            title: 'Rental Completed',
            message: `Your rental for "${booking.listing?.title}" has been completed`,
            data: { bookingId, listingId: booking.listing?.id },
            channels: ['EMAIL', 'PUSH'],
          })

        // Send rating request email to renter
        try {
          const renterEmail = booking.renter?.email
          const ownerName = booking.listing?.user?.name || booking.listing?.business?.name || 'the owner'
          
          if (renterEmail) {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/emails/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: renterEmail,
                subject: 'How was your rental experience? ⭐',
                template: 'ratingRequest',
                data: {
                  renterName: booking.renter?.name || 'there',
                  listingTitle: booking.listing?.title || 'your rental',
                  ownerName,
                  bookingId,
                  listingSlug: booking.listing?.slug || booking.listing?.id,
                },
              }),
            })
          }
        } catch (emailError) {
          console.error('Failed to send rating request email:', emailError)
          // Don't fail the booking completion if email fails
        }

        return NextResponse.json({ success: true, data: completedBooking, message: 'Rental completed successfully' })
      }
      case 'extend': {
        if (!isRenter && !isAdmin) {
          return NextResponse.json({ error: 'Only renter can extend booking' }, { status: 403 })
        }
        const { newEndDate } = data
        if (!newEndDate) {
          return NextResponse.json({ error: 'newEndDate is required (ISO string)' }, { status: 400 })
        }
        const currentEnd = new Date(booking.end_date)
        const requestedEnd = new Date(newEndDate)
        if (requestedEnd <= currentEnd) {
          return NextResponse.json({ error: 'New end date must be after current end date' }, { status: 400 })
        }
        // Conflict check: any overlapping confirmed/in_progress bookings on same listing
        const { data: conflicts } = await supabase
          .from('bookings')
          .select('id')
          .eq('listing_id', booking.listing_id)
          .in('status', ['CONFIRMED', 'IN_PROGRESS'])
          .or(`and(start_date.lte.${newEndDate},end_date.gte.${newEndDate}),and(start_date.lte.${booking.end_date},end_date.gte.${booking.end_date}),and(start_date.gte.${booking.start_date},end_date.lte.${newEndDate})`)
        if (conflicts && conflicts.length > 0) {
          return NextResponse.json({ error: 'Requested extension overlaps with another booking' }, { status: 409 })
        }
        // Recalculate pricing
        const dayMs = 1000 * 60 * 60 * 24
        const newDuration = Math.ceil((requestedEnd.getTime() - new Date(booking.start_date).getTime()) / dayMs)
        const unitPrice = parseFloat(String(booking.unit_price || booking.listing?.price_daily || 0))
        const subtotal = Math.round((unitPrice * newDuration * (booking.quantity || 1)) * 100) / 100
        const serviceFee = Math.round((subtotal * 0.05) * 100) / 100
        const totalAmount = Math.round((subtotal + serviceFee + (booking.delivery_fee || 0) + (booking.deposit_amount || 0)) * 100) / 100

        const { data: extended, error: extendError } = await supabase
          .from('bookings')
          .update({
            end_date: newEndDate,
            duration: newDuration,
            subtotal,
            service_fee: serviceFee,
            total_amount: totalAmount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId)
          .select()
          .single()
        if (extendError) {
          console.error('Extend booking error:', extendError)
          return NextResponse.json({ error: 'Failed to extend booking' }, { status: 500 })
        }
        return NextResponse.json({ success: true, data: extended, message: 'Booking extended successfully' })
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check permissions
    const isAdmin = (user as any).is_admin ?? user.isAdmin ?? false
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only admin can delete bookings' }, { status: 403 })
    }

    // Delete booking
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)

    if (deleteError) {
      console.error('Delete booking error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    })
  } catch (error) {
    console.error('Delete booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}