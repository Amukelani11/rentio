import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request: NextRequest) {
  try {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const url = new URL(request.url)
    const listingId = url.searchParams.get('listingId')

    if (!listingId) {
      return NextResponse.json({ error: 'Missing listingId' }, { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // Fetch all confirmed bookings for this listing
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('start_date, end_date')
      .eq('listing_id', listingId)
      .in('status', ['CONFIRMED', 'PENDING'])
      .gte('start_date', new Date().toISOString()) // Only future bookings
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }

    // Convert bookings to date ranges
    const bookedDates = bookings?.map(booking => ({
      start: new Date(booking.start_date),
      end: new Date(booking.end_date)
    })) || []

    return NextResponse.json({
      bookedDates,
      listingId
    })

  } catch (error) {
    console.error('Availability check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}