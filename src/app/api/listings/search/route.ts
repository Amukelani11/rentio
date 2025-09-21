import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const query = searchParams.get('query') || undefined
    const category = searchParams.get('category') || undefined
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
    const deliveryAvailable = searchParams.get('deliveryAvailable') === 'true'
    const instantBook = searchParams.get('instantBook') === 'true'
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true'
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 12

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    const routeClient = createRouteHandlerClient({ cookies })
    const db = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : routeClient

    // Base query: public ACTIVE listings with business info
    let q = db.from('listings').select(`
      *,
      categories(id, name, icon),
      user:users(id, name, avatar),
      business:businesses(id, name, logo, is_verified)
    `, { count: 'exact' }).eq('status', 'ACTIVE')

    if (query) {
      const term = `%${query}%`
      q = q.or(`title.ilike.${term},description.ilike.${term}`)
    }
    if (category) {
      q = q.eq('category_id', category)
    }
    if (typeof minPrice === 'number') {
      q = q.gte('price_daily', minPrice)
    }
    if (typeof maxPrice === 'number') {
      q = q.lte('price_daily', maxPrice)
    }
    if (deliveryAvailable) {
      q = q.contains('delivery_options', { deliveryAvailable: true })
    }
    if (instantBook) {
      q = q.eq('instant_book', true)
    }
    if (verifiedOnly) {
      q = q.eq('verified', true)
    }

    // Order results
    if (query) {
      q = q.order('created_at', { ascending: false })
    } else {
      q = q.order('featured', { ascending: false }).order('created_at', { ascending: false })
    }

    const from = (page - 1) * limit
    const to = from + limit - 1
    q = q.range(from, to)

    const { data: items, count, error } = await q
    if (error) {
      console.error('Supabase search error', error)
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
    }

    // Debug: Log the raw items to see what business data is being fetched
    console.log('Raw search results:', items?.[0])

    const normalized = (items || []).map((listing: any) => ({
      ...listing,
      categories: listing.categories || null,
      user: listing.user || null,
      business: listing.business || null,
      ownerName: listing.business?.name || listing.user?.name || 'Owner',
      ownerAvatar: listing.business?.logo || listing.user?.avatar,
      ownerType: listing.business_id ? 'business' : 'individual',
      isVerified: listing.business?.is_verified || false,
      images: listing.images || [],
      depositValue: listing.deposit_value ? parseFloat(listing.deposit_value) : (listing.depositValue || 0),
      priceDaily: parseFloat(listing.price_daily) || 0,
      priceWeekly: listing.price_weekly ? parseFloat(listing.price_weekly) : null,
      bookingsCount: listing.bookings_count || 0,
    }))

    const total = typeof count === 'number' ? count : normalized.length

    return NextResponse.json({
      success: true,
      data: {
        items: normalized,
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

