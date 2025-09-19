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
    const { paymentId } = body

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 })
    }

    // Update payment status
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'COMPLETED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)

    if (paymentError) {
      console.error('Update payment error:', paymentError)
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
    }

    // Update booking status
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({
        status: 'CONFIRMED',
        payment_status: 'COMPLETED',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', paymentId)

    if (bookingError) {
      console.error('Update booking error:', bookingError)
      return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Payment confirmed successfully' })
  } catch (error) {
    console.error('Confirm payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


