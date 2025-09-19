import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser, hasPermission } from '@/lib/auth'
import { Role } from '@/lib/types'

export async function GET() {
  try {
    // Fetch categories via Supabase using the public anon key (RLS allows SELECT)
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    const { data: allCats, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Supabase categories error', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 })
    }

    // Build parent -> children structure
    const byId: Record<string, any> = {}
    ;(allCats || []).forEach((c: any) => {
      byId[c.id] = { ...c, children: [] }
    })

    const roots: any[] = []
    ;(allCats || []).forEach((c: any) => {
      if (c.parent_id && byId[c.parent_id]) {
        byId[c.parent_id].children.push(byId[c.id])
      } else {
        roots.push(byId[c.id])
      }
    })

    return NextResponse.json({ success: true, data: roots })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(user.roles, Role.ADMIN)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, icon, slug, parentId } = body

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    // Generate slug if not provided
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Check if slug already exists
    const { data: existing, error: existErr } = await admin
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle()

    if (existErr) {
      console.error('Check category exists error', existErr)
      return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 })
    }

    const { data: created, error: insertErr } = await admin
      .from('categories')
      .insert([{
        name,
        description,
        icon,
        slug: categorySlug,
        parent_id: parentId || null,
      }])
      .select('*')
      .single()

    if (insertErr) {
      console.error('Insert category error', insertErr)
      return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: created })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}