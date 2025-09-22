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
    const bookingId = url.searchParams.get('bookingId')
    const sessionId = url.searchParams.get('session_id')

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    let targetBookingId = bookingId

    if (sessionId && !targetBookingId) {
      const { data: payments, error: paymentError } = await supabaseAdmin
        .from('payments')
        .select('booking_id')
        .or(`checkout_id.eq.${sessionId},provider_id.eq.${sessionId}`)
        .single()

      if (paymentError || !payments) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }

      targetBookingId = payments.booking_id
    }

    if (!targetBookingId) {
      return NextResponse.json({ error: 'Missing booking identifier' }, { status: 400 })
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select(`*, listing:listings(*), renter:users!renter_id(*)`)
      .eq('id', targetBookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('booking_id', targetBookingId)
      .single()

    return NextResponse.json({ booking, payment })
  } catch (err) {
    console.error('Public booking fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



