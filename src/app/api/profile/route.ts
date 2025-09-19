import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const supabaseAuth = createRouteHandlerClient({ cookies })
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const admin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : supabaseAuth

  const { data: profile, error } = await admin.from('profiles').select('*').eq('user_id', user.id).single()
  if (error) return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  return NextResponse.json({ success: true, data: profile })
}

export async function POST(request: NextRequest) {
  const supabaseAuth = createRouteHandlerClient({ cookies })
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { pickupLocation } = body

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const admin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : supabaseAuth

  const { data: existing } = await admin.from('profiles').select('*').eq('user_id', user.id).single()
  if (existing) {
    const { data: res, error } = await admin.from('profiles').update({ pickup_location: pickupLocation }).eq('id', existing.id).select().single()
    if (error) return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    return NextResponse.json({ success: true, data: res })
  }

  const { data: created, error } = await admin.from('profiles').insert([{ user_id: user.id, pickup_location: pickupLocation }]).select().single()
  if (error) return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  return NextResponse.json({ success: true, data: created })
}


