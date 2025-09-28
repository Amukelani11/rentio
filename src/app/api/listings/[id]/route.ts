import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { Role as UserRole } from '@/lib/types'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/resend'
import { listingReviewEmail } from '@/emails/templates'

async function ensureOwnershipOrAdmin(user: any, listing: any) {
  if (!listing) return false
  const isAdmin = user.roles?.includes(UserRole.ADMIN)
  const isOwner = listing.user_id === user.id || listing.business_id === user.id
  return isAdmin || isOwner
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Create Supabase admin client
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { id: id } = await params
    const { data: listing, error } = await admin
      .from('listings')
      .select(`
        *,
        category:categories(id, name, icon),
        owner_user:users!user_id(id, email, name, avatar),
        owner_business:businesses!business_id(id, name, contact_email, contact_name)
      `)
      .eq('id', id)
      .single()

    if (error || !listing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!(await ensureOwnershipOrAdmin(user, listing))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: listing })
  } catch (e) {
    console.error('GET listing by id error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Create Supabase admin client
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { id: id } = await params
    const { data: existing, error: fetchError } = await admin
      .from('listings')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!(await ensureOwnershipOrAdmin(user, existing))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const toUpdate: any = {}

    // Map known fields (camelCase -> snake_case)
    if (body.title !== undefined) toUpdate.title = body.title
    if (body.description !== undefined) toUpdate.description = body.description
    if (body.categoryId !== undefined) toUpdate.category_id = body.categoryId
    if (body.priceDaily !== undefined) toUpdate.price_daily = parseFloat(body.priceDaily)
    if (body.priceWeekly !== undefined) toUpdate.price_weekly = body.priceWeekly ? parseFloat(body.priceWeekly) : null
    if (body.weeklyDiscount !== undefined) toUpdate.weekly_discount = body.weeklyDiscount
    if (body.weekendMultiplier !== undefined) toUpdate.weekend_multiplier = body.weekendMultiplier
    if (body.depositType !== undefined) toUpdate.deposit_type = body.depositType
    if (body.depositValue !== undefined) toUpdate.deposit_value = parseFloat(body.depositValue)
    if (body.minDays !== undefined) toUpdate.min_days = body.minDays
    if (body.maxDays !== undefined) toUpdate.max_days = body.maxDays ?? null
    if (body.instantBook !== undefined) toUpdate.instant_book = body.instantBook
    if (body.requiresKyc !== undefined) toUpdate.requires_kyc = body.requiresKyc
    if (body.maxDistance !== undefined) toUpdate.max_distance = body.maxDistance ?? null
    if (body.location !== undefined) toUpdate.location = body.location
    if (body.latitude !== undefined) toUpdate.latitude = body.latitude ?? null
    if (body.longitude !== undefined) toUpdate.longitude = body.longitude ?? null
    if (body.deliveryOptions !== undefined) toUpdate.delivery_options = JSON.stringify(body.deliveryOptions)
    if (body.availabilityRules !== undefined) toUpdate.availability_rules = JSON.stringify(body.availabilityRules)
    if (body.specifications !== undefined) toUpdate.specifications = JSON.stringify(body.specifications)
    if (body.tags !== undefined) toUpdate.tags = JSON.stringify(body.tags)
    if (body.cancellationPolicy !== undefined) toUpdate.cancellation_policy = body.cancellationPolicy
    if (body.status !== undefined) toUpdate.status = body.status
    toUpdate.updated_at = new Date().toISOString()

    const { data: updated, error: updateError } = await admin
      .from('listings')
      .update(toUpdate)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
    }

    // Send email to owner on moderation decisions
    try {
      if (body.status === 'ACTIVE' || body.status === 'REJECTED') {
        // Fetch owner email
        const ownerId = updated.user_id || updated.business_id
        if (ownerId) {
          const { data: owner } = await admin.from('users').select('email, name').eq('id', ownerId).single()
          if (owner?.email) {
            const html = listingReviewEmail({ ownerName: owner.name || 'there', listingTitle: updated.title, status: body.status === 'ACTIVE' ? 'APPROVED' : 'REJECTED', note: body.note || undefined })
            await sendEmail({ to: owner.email, subject: `Listing ${body.status === 'ACTIVE' ? 'Approved' : 'Rejected'}`, html })
          }
        }
      }
    } catch (e) { console.debug('[email] listing moderation skipped', e) }

    return NextResponse.json({ success: true, data: updated })
  } catch (e) {
    console.error('PATCH listing error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Create Supabase admin client
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { id: id } = await params
    const { data: existing, error: fetchError } = await admin
      .from('listings')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!(await ensureOwnershipOrAdmin(user, existing))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error: deleteError } = await admin
      .from('listings')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE listing error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

