import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { Role as UserRole } from '@/lib/types'
import { getAuthUser } from '@/lib/auth'
import { sendEmail } from '@/lib/resend'
import { listingReviewEmail } from '@/emails/templates'

export async function GET(request: NextRequest) {
  try {
    // Route handler client to ensure RLS/auth session is consistent
    const supabaseAuth = createRouteHandlerClient({ cookies })
    // Use internal auth user (ensures user exists in our users table)
    const user = await getAuthUser(supabaseAuth)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'ALL'
    const skip = (page - 1) * limit

    // Admin client for DB reads/writes (server-side service role)
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    const admin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : supabaseAuth

    // Build base query with select to enable filters and count
    let query = admin.from('listings').select('*', { count: 'exact' })

    // Filter by user's listings
    const isBusiness = Array.isArray(user.roles) ? user.roles.includes(UserRole.BUSINESS_LISTER) : false
    if (isBusiness) {
      // For business users, get their business ID first
      const { data: business } = await admin
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (business) {
        query = query.eq('business_id', business.id)
      } else {
        // Business user without business profile - return empty results
        return NextResponse.json({
          success: true,
          data: {
            items: [],
            total: 0,
            page,
            pageSize: limit,
            totalPages: 0,
          },
        })
      }
    } else {
      query = query.eq('user_id', user.id)
    }

    if (status !== 'ALL') {
      query = query.eq('status', status)
    }

    // Apply ordering, pagination and execute
    const { data: items, count, error } = await query
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1)
    if (error) {
      console.error('Supabase listings GET error', error)
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
    }

    // Get all categories at once to avoid N+1 queries
    const categoryIds = Array.from(new Set((items || []).map((item: any) => item.category_id).filter(Boolean)))
    console.log('Category IDs to fetch:', categoryIds)
    
    // Fetch categories via the route handler client so RLS applies consistently
    const { data: categories, error: categoryError } = await supabaseAuth
      .from('categories')
      .select('id, name, icon')
      .in('id', categoryIds)
    
    console.log('Categories fetched:', categories)
    if (categoryError) {
      console.error('Category fetch error:', categoryError)
    }

    const categoryMap = new Map(categories?.map(cat => [cat.id, cat]) || [])
    console.log('Category map:', categoryMap)

    // Process the results
    const enrichedItems = (items || []).map((listing: any) => {
      const category = categoryMap.get(listing.category_id)
      
      return {
        ...listing,
        categories: category || null,
        images: listing.images || [],
        depositValue: listing.deposit_value ? parseFloat(listing.deposit_value) : (listing.depositValue || 0),
        averageRating: 0, // Default for now
        totalReviews: 0, // Default for now
        bookingsCount: listing.bookings_count || 0,
        priceDaily: parseFloat(listing.price_daily) || 0,
        priceWeekly: listing.price_weekly ? parseFloat(listing.price_weekly) : null,
      }
    })

    const total = typeof count === 'number' ? count : (items ? items.length : 0)

    return NextResponse.json({
      success: true,
      data: {
        items: enrichedItems,
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get listings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Use internal auth user (ensures user exists in our users table)
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin client for DB writes
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseAuth = createRouteHandlerClient({ cookies })
    const admin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : supabaseAuth

    // Ensure a corresponding `users` row exists (use email) and get its id
    const routeAuth = createRouteHandlerClient({ cookies })
    const { data: { user: sessionUser } } = await routeAuth.auth.getUser()
    const userEmail = sessionUser?.email || user.email

    // fetch or create users table row
    let dbUserId = user.id
    try {
      const { data: foundUsers } = await admin.from('users').select('id').eq('email', userEmail).limit(1)
      if (foundUsers && foundUsers.length > 0) {
        dbUserId = foundUsers[0].id
      } else {
        const { data: createdUser, error: createErr } = await admin.from('users').insert([{ email: userEmail, name: user.name || userEmail }]).select('id').single()
        if (createErr) throw createErr
        dbUserId = createdUser.id
      }
    } catch (e) {
      console.error('Failed to ensure users row for listing insert', e)
      return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 })
    }

    const body = await request.json()
    const {
      title,
      description,
      categoryId,
      priceDaily,
      priceWeekly,
      weeklyDiscount,
      weekendMultiplier,
      depositType,
      depositValue,
      minDays,
      maxDays,
      instantBook,
      requiresKyc,
      maxDistance,
      location,
      latitude,
      longitude,
      pickupAddress,
      deliveryOptions,
      availabilityRules,
      specifications,
      tags,
      cancellationPolicy,
    } = body

    // Validate required fields
    if (!title || !description || !categoryId || !priceDaily || !depositType || !depositValue || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate slug
    const slug = (title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()

    const statusToSave = (body.status === 'ACTIVE') ? 'PENDING' : (body.status || 'DRAFT')

    const isBusinessForPost = Array.isArray(user.roles) ? user.roles.includes(UserRole.BUSINESS_LISTER) : false
    let businessId: string | null = null
    let userId: string | null = dbUserId

    if (isBusinessForPost) {
      // For business users, get their business ID
      const { data: business } = await admin
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (business) {
        businessId = business.id
        userId = null
      } else {
        return NextResponse.json({ error: 'Business profile not found. Please complete your business profile first.' }, { status: 400 })
      }
    }

    const dataToInsert: any = {
      title,
      slug,
      description,
      category_id: categoryId,
      user_id: userId,
      business_id: businessId,
      price_daily: parseFloat(priceDaily),
      price_weekly: priceWeekly ? parseFloat(priceWeekly) : null,
      weekly_discount: weeklyDiscount || 0,
      weekend_multiplier: weekendMultiplier || 1,
      deposit_type: depositType,
      deposit_value: parseFloat(depositValue),
      min_days: minDays || 1,
      max_days: maxDays,
      instant_book: instantBook || false,
      requires_kyc: requiresKyc || false,
      max_distance: maxDistance ? parseFloat(maxDistance) : null,
      location,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      pickup_address: pickupAddress || null,
      delivery_options: deliveryOptions || {},
      availability_rules: availabilityRules || {},
      specifications: specifications || {},
      tags: tags || [],
      images: body.images || [],
      cancellation_policy: cancellationPolicy || 'MODERATE',
      status: statusToSave,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Insert via admin client
    const { data: inserted, error } = await admin.from('listings').insert([dataToInsert]).select().single()
    if (error) {
      console.error('Supabase insert listing error', error)
      return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
    }

    // Email: listing submitted for review (when status saved is PENDING)
    try {
      if (statusToSave === 'PENDING') {
        const ownerId = inserted.user_id || inserted.business_id
        if (ownerId) {
          const { data: owner } = await admin.from('users').select('email, name').eq('id', ownerId).single()
          if (owner?.email) {
            const html = listingReviewEmail({ ownerName: owner.name || 'there', listingTitle: inserted.title, status: 'SUBMITTED' })
            await sendEmail({ to: owner.email, subject: 'Listing submitted for review', html })
          }
        }
      }
    } catch (e) {
      console.debug('[email] listing submitted skipped', e)
    }

    return NextResponse.json({ success: true, data: inserted })
  } catch (error) {
    console.error('Create listing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
