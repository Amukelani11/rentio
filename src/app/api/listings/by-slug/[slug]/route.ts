import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

function toCamel(listing: any) {
  if (!listing) return null
  return {
    ...listing,
    categoryId: listing.category_id,
    userId: listing.user_id,
    businessId: listing.business_id,
    priceDaily: listing.price_daily ? parseFloat(listing.price_daily) : 0,
    priceWeekly: listing.price_weekly ? parseFloat(listing.price_weekly) : null,
    weeklyDiscount: listing.weekly_discount ?? 0,
    weekendMultiplier: listing.weekend_multiplier ?? 1,
    depositType: listing.deposit_type,
    depositValue: listing.deposit_value ? parseFloat(listing.deposit_value) : 0,
    minDays: listing.min_days ?? 1,
    maxDays: listing.max_days ?? null,
    instantBook: listing.instant_book ?? false,
    requiresKyc: listing.requires_kyc ?? false,
    maxDistance: listing.max_distance !== undefined && listing.max_distance !== null ? parseFloat(listing.max_distance) : null,
    pickupAddress: listing.pickup_address ?? null,
    deliveryOptions: listing.delivery_options || {},
    availabilityRules: listing.availability_rules || {},
    specifications: listing.specifications || {},
    tags: listing.tags || [],
    images: listing.images || [],
    cancellationPolicy: listing.cancellation_policy || 'MODERATE',
    bookingsCount: listing.bookings_count || 0,
    createdAt: listing.created_at,
    updatedAt: listing.updated_at,
    // Owner information
    ownerName: listing.business?.name || listing.user?.name || 'Owner',
    ownerAvatar: listing.business?.logo || listing.user?.avatar,
    ownerType: listing.business_id ? 'business' : 'individual',
    isVerified: listing.business?.is_verified || false,
  }
}

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params || {}
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseAuth = createRouteHandlerClient({ cookies })
    const db = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : supabaseAuth

    // Identify requester for owner checks
    let requesterId: string | null = null
    try {
      const { data: { session } } = await supabaseAuth.auth.getSession()
      requesterId = session?.user?.id ?? null
    } catch {}

    // Try fetch listing by slug without forcing single() to avoid PGRST116
    const { data: basicData, error: basicError } = await db
      .from('listings')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (basicError) {
      console.log('Basic listing query failed:', basicError)
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (!basicData) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Enforce visibility: allow public access only for ACTIVE listings.
    // Allow owner (user_id) to view their non-ACTIVE draft.
    const isOwner = requesterId && basicData.user_id && requesterId === basicData.user_id
    if (basicData.status !== 'ACTIVE' && !isOwner) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // If listing exists, attempt to attach owner info
    let listingData: any = basicData

    try {
      if (basicData.user_id) {
        const { data: userData } = await db
          .from('users')
          .select('name, avatar')
          .eq('id', basicData.user_id)
          .maybeSingle()
        if (userData) listingData.user = userData
      }

      if (basicData.business_id) {
        const { data: businessData } = await db
          .from('businesses')
          .select('name, logo, is_verified')
          .eq('id', basicData.business_id)
          .maybeSingle()
        if (businessData) listingData.business = businessData
      }

      console.log('Owner data fetched:', {
        user: listingData.user,
        business: listingData.business,
        userId: basicData.user_id,
        businessId: basicData.business_id,
        status: basicData.status,
        isOwner,
      })
    } catch (joinError) {
      console.log('Owner data query failed, using basic data:', joinError)
    }

    const listing = toCamel(listingData)
    return NextResponse.json({ success: true, data: listing })
  } catch (e) {
    console.error('[by-slug] GET error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

