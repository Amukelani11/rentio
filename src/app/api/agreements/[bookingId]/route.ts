import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'
import { generateAgreement, saveAgreement, getAgreement } from '@/lib/agreements'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get booking details to verify user has access
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, renter_id, listing_id')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if user is the renter or the lister
    const { data: listing } = await supabase
      .from('listings')
      .select('user_id, business_id')
      .eq('id', booking.listing_id)
      .single()

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const isRenter = booking.renter_id === user.id
    const isLister = listing.user_id === user.id || listing.business_id === user.id
    const isAdmin = user.roles?.includes('ADMIN')

    if (!isRenter && !isLister && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get or generate agreement
    let agreement = await getAgreement(bookingId)

    if (!agreement) {
      // Generate new agreement
      const generatedAgreement = await generateAgreement(bookingId)
      await saveAgreement(bookingId, generatedAgreement)
      agreement = await getAgreement(bookingId)
    }

    return NextResponse.json({
      success: true,
      data: agreement
    })

  } catch (error) {
    console.error('Get agreement error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { signature, signatureType } = body

    if (!signature) {
      return NextResponse.json({ error: 'Signature is required' }, { status: 400 })
    }

    // Get booking details to verify user has access
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, renter_id, listing_id')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if user is the renter or the lister
    const { data: listing } = await supabase
      .from('listings')
      .select('user_id, business_id')
      .eq('id', booking.listing_id)
      .single()

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const isRenter = booking.renter_id === user.id
    const isLister = listing.user_id === user.id || listing.business_id === user.id

    if (!isRenter && !isLister) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update agreement with signature
    const signatureField = isRenter ? 'renter_signature' : 'lister_signature'

    const { error } = await supabase
      .from('rental_agreements')
      .update({
        [signatureField]: signature,
        signed_at: new Date().toISOString(),
        status: 'SIGNED'
      })
      .eq('booking_id', bookingId)

    if (error) {
      throw new Error(`Failed to save signature: ${error.message}`)
    }

    // Check if both parties have signed
    const { data: agreement } = await supabase
      .from('rental_agreements')
      .select('renter_signature, lister_signature')
      .eq('booking_id', bookingId)
      .single()

    if (agreement?.renter_signature && agreement?.lister_signature) {
      // Both parties have signed, update status to ACTIVE
      await supabase
        .from('rental_agreements')
        .update({ status: 'ACTIVE' })
        .eq('booking_id', bookingId)
    }

    return NextResponse.json({
      success: true,
      message: 'Agreement signed successfully'
    })

  } catch (error) {
    console.error('Sign agreement error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
