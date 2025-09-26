import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const supabaseAuth = createRouteHandlerClient({ cookies })
    const authUser = await getAuthUser()
    if (!authUser || !authUser.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = (searchParams.get('search') || '').trim()
    const roleFilter = searchParams.get('role') || 'ALL'
    const statusFilter = searchParams.get('status') || 'ALL'
    const verificationFilter = searchParams.get('verification') || 'ALL'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Use service role for broad admin reads (bypasses RLS)
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    const db = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : supabaseAuth

    // Base users query
    let usersQuery = db
      .from('users')
      .select('id, name, email, phone, avatar, created_at, last_sign_in_at, kyc_status, email_verified, status', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search) {
      usersQuery = usersQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }
    if (statusFilter !== 'ALL') {
      usersQuery = usersQuery.eq('status', statusFilter)
    }

    // Execute users query with pagination
    const { data: users, count: total, error: usersErr } = await usersQuery.range(from, to)
    if (usersErr) {
      console.error('[admin/users] users query error', usersErr)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    const userIds = (users || []).map(u => u.id)

    // Fetch roles for these users
    let rolesByUser: Record<string, string[]> = {}
    if (userIds.length > 0) {
      const { data: rolesRows } = await db
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds)
      rolesByUser = (rolesRows || []).reduce((acc: Record<string, string[]>, row: any) => {
        acc[row.user_id] = acc[row.user_id] || []
        acc[row.user_id].push(row.role)
        return acc
      }, {})
    }

    // Role filter (apply in memory if provided)
    let filtered = (users || []).filter(u => {
      const roles = rolesByUser[u.id] || []
      if (roleFilter !== 'ALL' && !roles.includes(roleFilter)) return false
      // verification filter
      const emailVerified = !!u.email_verified
      const kycVerified = (u.kyc_status || '').toUpperCase() === 'VERIFIED'
      if (verificationFilter === 'VERIFIED' && !(emailVerified && kycVerified)) return false
      if (verificationFilter === 'PARTIAL' && !(emailVerified && !kycVerified)) return false
      if (verificationFilter === 'UNVERIFIED' && emailVerified) return false
      return true
    })

    // Stats: listings counts per user
    let statsByUser: Record<string, { totalListings: number; activeListings: number; totalBookings: number; completedBookings: number; totalSpent: number; totalEarned: number; averageRating: number; totalReviews: number }>
      = {}

    if (userIds.length > 0) {
      // Listings total - use raw SQL for aggregation
      const { data: listingCounts } = await db
        .from('listings')
        .select('user_id')
        .in('user_id', userIds)

      // Listings active
      const { data: activeListingCounts } = await db
        .from('listings')
        .select('user_id')
        .eq('status', 'ACTIVE')
        .in('user_id', userIds)

      // Count listings per user manually
      const listingTotalMap = new Map()
      const listingActiveMap = new Map()

      if (listingCounts) {
        for (const listing of listingCounts) {
          const count = listingTotalMap.get(listing.user_id) || 0
          listingTotalMap.set(listing.user_id, count + 1)
        }
      }

      if (activeListingCounts) {
        for (const listing of activeListingCounts) {
          const count = listingActiveMap.get(listing.user_id) || 0
          listingActiveMap.set(listing.user_id, count + 1)
        }
      }

      // Initialize stats
      for (const id of userIds) {
        statsByUser[id] = {
          totalListings: listingTotalMap.get(id) || 0,
          activeListings: listingActiveMap.get(id) || 0,
          totalBookings: 0,
          completedBookings: 0,
          totalSpent: 0,
          totalEarned: 0,
          averageRating: 0,
          totalReviews: 0,
        }
      }
    }

    // Build response items
    const items = filtered.map(u => ({
      id: u.id,
      name: u.name || u.email,
      email: u.email,
      phone: u.phone || null,
      avatar: u.avatar || null,
      roles: rolesByUser[u.id] || [],
      verified: !!u.email_verified,
      kycVerified: (u.kyc_status || '').toUpperCase() === 'VERIFIED',
      status: (u.status || 'ACTIVE') as 'ACTIVE' | 'SUSPENDED' | 'BANNED',
      createdAt: u.created_at,
      lastLogin: u.last_sign_in_at || null,
      stats: statsByUser[u.id] || {
        totalListings: 0,
        activeListings: 0,
        totalBookings: 0,
        completedBookings: 0,
        totalSpent: 0,
        totalEarned: 0,
        averageRating: 0,
        totalReviews: 0,
      },
    }))

    return NextResponse.json({
      success: true,
      data: {
        items,
        total: total || 0,
        page,
        pageSize: limit,
        totalPages: Math.ceil((total || 0) / limit),
      }
    })
  } catch (error) {
    console.error('[admin/users] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


