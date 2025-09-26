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
    const user = await getAuthUser() // Let getAuthUser create its own client
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = params.id
    const body = await request.json()
    const { new_end_date, notes } = body

    if (!new_end_date) {
      return NextResponse.json({ error: 'New end date is required' }, { status: 400 })
    }

    // Get the current booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(
          *,
          user:users(*),
          business:businesses(*)
        ),
        renter:users(*)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      console.error('Booking fetch error:', bookingError)
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if user is the renter
    if (booking.renter_id !== user.id) {
      return NextResponse.json({ error: 'Only the renter can extend this booking' }, { status: 403 })
    }

    // Check if booking can be extended
    if (!['CONFIRMED', 'IN_PROGRESS'].includes(booking.status)) {
      return NextResponse.json({ error: 'Only confirmed or in-progress bookings can be extended' }, { status: 400 })
    }

    // Validate new end date
    const currentEndDate = new Date(booking.end_date)
    const newEndDate = new Date(new_end_date)

    if (newEndDate <= currentEndDate) {
      return NextResponse.json({ error: 'New end date must be after current end date' }, { status: 400 })
    }

    // Calculate extension details
    const extensionDays = Math.ceil((newEndDate.getTime() - currentEndDate.getTime()) / (1000 * 60 * 60 * 24))
    const dailyRate = parseFloat(booking.unit_price)
    const extensionCost = extensionDays * dailyRate

    // Check for conflicts with the extended period (from original start date to new end date)
    console.log('[EXTENSION] Checking for conflicts:', {
      listingId: booking.listing_id,
      currentBooking: { id: bookingId, start: booking.start_date, end: booking.end_date },
      extensionTo: new_end_date,
      extensionDays
    })

    // Get all other bookings for this listing that could potentially conflict
    const { data: potentialConflicts } = await supabase
      .from('bookings')
      .select('id, start_date, end_date, status, renter_id')
      .eq('listing_id', booking.listing_id)
      .neq('id', bookingId) // Exclude the current booking
      .in('status', ['CONFIRMED', 'IN_PROGRESS', 'PENDING'])

    console.log('[EXTENSION] Found potential conflicts:', potentialConflicts?.length || 0)

    if (potentialConflicts && potentialConflicts.length > 0) {
      const extensionStart = new Date(booking.start_date)
      const extensionEnd = new Date(new_end_date)

      // Check for actual overlaps
      const actualConflicts = potentialConflicts.filter(conflict => {
        const conflictStart = new Date(conflict.start_date)
        const conflictEnd = new Date(conflict.end_date)

        // Two bookings overlap if:
        // 1. Conflict starts before extension ends AND
        // 2. Conflict ends after extension starts
        // This means they overlap in time
        const overlaps = conflictStart < extensionEnd && conflictEnd > extensionStart

        if (overlaps) {
          console.log('[EXTENSION] Overlap detected:', {
            conflict: { id: conflict.id, start: conflict.start_date, end: conflict.end_date },
            extension: { start: booking.start_date, end: new_end_date },
            overlapDays: Math.max(0, Math.ceil((Math.min(conflictEnd.getTime(), extensionEnd.getTime()) - Math.max(conflictStart.getTime(), extensionStart.getTime())) / (1000 * 60 * 60 * 24)))
          })
        }

        return overlaps
      })

      if (actualConflicts.length > 0) {
        console.log('[EXTENSION] Actual conflicts found:', actualConflicts.map(c => ({
          id: c.id,
          renter_id: c.renter_id,
          period: `${c.start_date} to ${c.end_date}`
        })))

        return NextResponse.json({
          error: 'Selected extension dates are not available. The listing is already booked during part of your requested extension period.',
          details: `Conflicts found: ${actualConflicts.length} booking(s) overlap with your extension request.`
        }, { status: 409 })
      }
    }

    console.log('[EXTENSION] No conflicts found, proceeding with extension')

    // Update the booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        end_date: new_end_date,
        duration: booking.duration + extensionDays,
        subtotal: booking.subtotal + extensionCost,
        total_amount: booking.total_amount + extensionCost,
        notes: notes ? (booking.notes ? `${booking.notes}\n\nExtension: ${notes}` : `Extension: ${notes}`) : booking.notes
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (updateError) {
      console.error('Booking update error:', updateError)
      return NextResponse.json({ error: 'Failed to extend booking' }, { status: 500 })
    }

    // Create extension record for tracking (pending approval)
    const { error: extensionError } = await supabase
      .from('booking_extensions')
      .insert({
        booking_id: bookingId,
        new_end_date: new_end_date,
        additional_days: extensionDays,
        additional_price: extensionCost,
        status: 'PENDING' // Requires lister approval
      })

    if (extensionError) {
      console.error('Extension record creation error:', extensionError)
      // Don't fail the whole operation, just log the error
    }

    return NextResponse.json({
      success: true,
      data: {
        booking: updatedBooking,
        extension: {
          days: extensionDays,
          cost: extensionCost,
          newEndDate: new_end_date
        }
      }
    })
  } catch (error) {
    console.error('Extend booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
