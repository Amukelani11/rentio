import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const supabaseAuth = createRouteHandlerClient({ cookies })
    const authUser = await getAuthUser(supabaseAuth)
    if (!authUser || !authUser.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const from = (page - 1) * limit
    const to = from + limit - 1

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    let query = db
      .from('kyc_verifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status) query = query.eq('status', status)
    if (type) query = query.eq('type', type)

    const { data: rows, error, count } = await query
    if (error) {
      console.error('[admin/kyc] query error', error)
      return NextResponse.json({ error: 'Failed to fetch verifications' }, { status: 500 })
    }

    const verifications = await Promise.all((rows || []).map(async (v: any) => {
      const { data: u } = await db
        .from('users')
        .select('id, name, email, kyc_status, email_verified, phone_verified, avatar, created_at')
        .eq('id', v.user_id)
        .single()

      let reviewerData: any = null
      if (v.reviewer_id) {
        const { data: r } = await db
          .from('users')
          .select('id, name')
          .eq('id', v.reviewer_id)
          .single()
        reviewerData = r
      }

      return {
        id: v.id,
        type: v.type,
        status: v.status,
        documents: v.documents || [],
        additionalInfo: v.additional_info || null,
        rejectionReason: v.rejection_reason || null,
        notes: v.notes || null,
        createdAt: v.created_at,
        reviewedAt: v.reviewed_at || null,
        reviewer: reviewerData ? { name: reviewerData.name } : undefined,
        user: u ? {
          id: u.id,
          name: u.name || u.email,
          email: u.email,
          kyc_status: u.kyc_status,
          email_verified: u.email_verified,
          phone_verified: u.phone_verified,
          avatar: u.avatar || null,
          created_at: u.created_at,
        } : null,
      }
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: verifications,
        total: count || 0,
        page,
        pageSize: limit,
        totalPages: Math.ceil((count || 0) / limit),
      }
    })
  } catch (e) {
    console.error('[admin/kyc] error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


