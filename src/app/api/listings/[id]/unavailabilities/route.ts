import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '')
    const { data: rows, error } = await supabase.from('listing_unavailabilities').select('id, listing_id, start_date, end_date, reason, recurring, recurrence_rule, created_at, updated_at').eq('listing_id', listingId).order('start_date')
    if (error) throw error
    return NextResponse.json({ success: true, data: rows })
  } catch (e) {
    console.error('Get unavailabilities error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    const admin = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '')

    // Verify ownership: listing must belong to user_id or business_id
    const { data: listing } = await admin.from('listings').select('*').eq('id', listingId).single()
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

    const isOwner = listing.user_id === user.id || listing.business_id === user.id
    if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const items = Array.isArray(body.items) ? body.items : [body]
    const inserted: any[] = []

    for (const it of items) {
      const { startDate, endDate, reason, recurring, recurrenceRule } = it
      // allow recurring rules without explicit start/end by using a sensible default window
      if (!startDate && !(recurring && recurrenceRule)) continue
      const start = startDate || new Date().toISOString()
      const end = endDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      const { data: row, error } = await admin.from('listing_unavailabilities').insert([{ listing_id: listingId, start_date: start, end_date: end, reason: reason || null, recurring: recurring ? true : false, recurrence_rule: recurrenceRule || null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]).select().single()
      if (error) throw error
      inserted.push(row)
    }

    return NextResponse.json({ success: true, data: inserted })
  } catch (e) {
    console.error('Create unavailabilities error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const unavailabilityId = body.id
    if (!unavailabilityId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    const admin = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '')

    const { data: row } = await admin.from('listing_unavailabilities').select('*').eq('id', unavailabilityId).single()
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Verify ownership via listing
    const { data: listing } = await admin.from('listings').select('*').eq('id', listingId).single()
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

    const isOwner = listing.user_id === user.id || listing.business_id === user.id
    if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await admin.from('listing_unavailabilities').delete().eq('id', unavailabilityId)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Delete unavailability error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


