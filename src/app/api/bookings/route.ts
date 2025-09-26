import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'
import { sendEmail } from '@/lib/resend'
import { bookingConfirmationEmail } from '@/emails/templates'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')
    const renterId = searchParams.get('renterId')
    const status = searchParams.get('status')
    const type = searchParams.get('type') // 'upcoming' for dashboard
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Get bookings with complete listing data including user/business info
    let query = supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(
          *,
          user:users(*),
          business:businesses(*),
          category:categories(*)
        ),
        renter:users!renter_id(*),
        payments(*)
      `)
      .order('created_at', { ascending: false })
      .range(from, to)

    // Handle different query types
    if (type === 'upcoming') {
      // For dashboard upcoming bookings - get bookings starting from today onwards
      const today = new Date().toISOString().split('T')[0]
      console.log('[BOOKINGS] Looking for CONFIRMED upcoming bookings from date:', today)
      // First, let's see all bookings with their statuses for debugging
      const debugQuery = supabase
        .from('bookings')
        .select('id, start_date, end_date, status, listing:listings(title)')
        .gte('start_date', today)
        .order('start_date', { ascending: true })
      
      const { data: allFutureBookings } = await debugQuery
      console.log('[BOOKINGS] All future bookings (any status):', JSON.stringify(allFutureBookings, null, 2))
      
      query = query
        .eq('renter_id', user.id)  // Only show bookings where user is the renter
        .gte('start_date', today)
        .eq('status', 'CONFIRMED')  // Only show confirmed bookings that are upcoming
        .order('start_date', { ascending: true })
        .limit(5) // Only show next 5 upcoming bookings
    } else {
      // Standard query handling - only show bookings where the user is the renter
      // This excludes bookings for their own listings (which they manage in a different section)
      query = query.eq('renter_id', user.id)

      if (listingId) query = query.eq('listing_id', listingId)
      if (renterId) query = query.eq('renter_id', renterId)
      if (status && status !== 'ALL') query = query.eq('status', status)
    }

    console.log('Fetching bookings for user:', user.id, 'with filters:', { listingId, renterId, status, type })

    const { data: bookings, error, count } = await query

    if (error) {
      console.error('Get bookings error:', error)
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }

    console.log('Bookings found:', bookings?.length || 0, 'Total count:', count)
    
    if (type === 'upcoming') {
      console.log('[BOOKINGS] Raw upcoming bookings:', JSON.stringify(bookings, null, 2))
    }

    // Format upcoming bookings for dashboard
    if (type === 'upcoming') {
      const upcomingBookings = (bookings || []).map(booking => ({
        id: booking.id,
        title: booking.listing?.title || 'Untitled Listing',
        startDate: booking.start_date,
        endDate: booking.end_date,
        status: booking.status
      }))

      console.log('[BOOKINGS] Formatted upcoming bookings:', upcomingBookings)

      return NextResponse.json({
        success: true,
        data: upcomingBookings
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        items: bookings || [],
        total: count || 0,
        page,
        pageSize: limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      listingId,
      startDate,
      endDate,
      quantity = 1,
      deliveryType,
      deliveryAddress,
      deliveryNotes,
      contactDetails,
    } = body

    // Convert deliveryType to uppercase to match enum values
    const normalizedDeliveryType = deliveryType?.toUpperCase()

    if (!listingId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate delivery type
    if (normalizedDeliveryType && !['PICKUP', 'DELIVERY', 'BOTH'].includes(normalizedDeliveryType)) {
      return NextResponse.json({ error: 'Invalid delivery type' }, { status: 400 })
    }

    // Validate contact details
    if (!contactDetails?.name || !contactDetails?.email || !contactDetails?.phone || !contactDetails?.address) {
      return NextResponse.json({ error: 'All contact details (name, email, phone, address) are required' }, { status: 400 })
    }

    // Get listing details - use service role to avoid RLS issues
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    let listingQuery
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      listingQuery = serviceClient
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .in('status', ['ACTIVE', 'PENDING'])
        .single()
    } else {
      listingQuery = supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .in('status', ['ACTIVE', 'PENDING'])
        .single()
    }

    const { data: listing, error: listingError } = await listingQuery

    if (listingError || !listing) {
      console.error('Listing query error:', listingError)
      return NextResponse.json({ error: 'Listing not found or not available' }, { status: 404 })
    }

    // Calculate pricing
    const start = new Date(startDate)
    const end = new Date(endDate)
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    if (duration <= 0) {
      return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
    }

    const unitPrice = parseFloat(listing.price_daily)
    const subtotal = Math.round((unitPrice * duration * quantity) * 100) / 100
    const serviceFee = Math.round((subtotal * 0.05) * 100) / 100 // 5% service fee
    const deliveryFee = deliveryType === 'DELIVERY' ? (listing.delivery_options?.deliveryFee || 0) : 0
    const depositAmount = listing.deposit_type === 'FIXED' 
      ? Math.round((parseFloat(listing.deposit_value) * quantity) * 100) / 100
      : Math.round(((subtotal * parseFloat(listing.deposit_value)) / 100) * 100) / 100
    const totalAmount = Math.round((subtotal + serviceFee + deliveryFee + depositAmount) * 100) / 100

    // Clean up old pending bookings (older than 30 minutes) to prevent database bloat
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    await supabase
      .from('bookings')
      .delete()
      .eq('status', 'PENDING')
      .lt('created_at', thirtyMinutesAgo)

    // Check for booking conflicts (only check CONFIRMED and IN_PROGRESS bookings)
    // PENDING bookings don't block other bookings since they might not be paid
    const { data: conflictingBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('listing_id', listingId)
      .in('status', ['CONFIRMED', 'IN_PROGRESS'])
      .or(`and(start_date.lte.${startDate},end_date.gte.${startDate}),and(start_date.lte.${endDate},end_date.gte.${endDate}),and(start_date.gte.${startDate},end_date.lte.${endDate})`)

    if (conflictingBookings && conflictingBookings.length > 0) {
      return NextResponse.json({ error: 'Selected dates are not available' }, { status: 409 })
    }

    // Create a pending booking (will be confirmed after payment)
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        renter_id: user.id,
        listing_id: listingId,
        start_date: startDate,
        end_date: endDate,
        duration,
        quantity,
        unit_price: unitPrice,
        subtotal,
        service_fee: serviceFee,
        delivery_fee: deliveryFee,
        deposit_amount: depositAmount,
        total_amount: totalAmount,
        status: 'PENDING',
        payment_status: 'PENDING',
        delivery_type: normalizedDeliveryType,
        delivery_address: deliveryAddress,
        delivery_notes: deliveryNotes,
        contact_name: contactDetails?.name,
        contact_email: contactDetails?.email,
        contact_phone: contactDetails?.phone,
        contact_address: contactDetails?.address,
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Create booking error:', bookingError)
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    // Note: Booking confirmation email will be sent after payment is confirmed via webhook

    // Return booking data for payment processing
    return NextResponse.json({
      success: true,
      data: {
        booking,
        paymentData: {
          amount: totalAmount,
          currency: 'ZAR',
          bookingId: booking.id,
          description: `Rental booking for ${listing.title}`,
        },
      },
    })
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}