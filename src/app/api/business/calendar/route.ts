import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()

    if (!user || !user.roles.includes('BUSINESS_LISTER' as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Use service role client to bypass RLS
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get business ID for the current user
    const { data: business, error: businessError } = await serviceClient
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })
    }

    // Build booking query
    let query = serviceClient
      .from('bookings')
      .select(`
        *,
        listings (
          id,
          title,
          images,
          location
        ),
        users (
          name,
          email
        )
      `)
      .eq('business_id', business.id)

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('start_date', startDate)
    }
    if (endDate) {
      query = query.lte('end_date', endDate)
    }

    const { data: bookings, error: bookingsError } = await query
      .order('start_date', { ascending: true })

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }

    // Format booking data for calendar view
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      listing_id: booking.listings.id,
      listing_title: booking.listings.title,
      listing_image: booking.listings.images?.[0],
      start_date: booking.start_date,
      end_date: booking.end_date,
      status: booking.status,
      total_amount: parseFloat(booking.total_amount),
      guest_name: booking.users.name || booking.users.email,
      guest_email: booking.users.email,
      location: booking.listings.location
    }))

    return NextResponse.json({
      success: true,
      bookings: formattedBookings
    })

  } catch (error) {
    console.error('Calendar GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}