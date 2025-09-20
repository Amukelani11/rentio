import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { flow, step } = body
    const supabase = await createClient()

    // Ensure user is authenticated and call RPC to update step
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('authError', authError)
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message || null }, { status: 401 })
    }

    // Mark the flow as completed for "Maybe Later" so middleware won't redirect back
    const completeRes = await supabase.rpc('complete_onboarding', { flow })
    if (completeRes.error) {
      console.error('complete_onboarding error', completeRes.error)
      return NextResponse.json({ error: 'RPC error', details: completeRes.error.message }, { status: 500 })
    }

    // Set a cookie so middleware can allow redirect to /dashboard and avoid loops
    // Keep it for 30 days
    const res = NextResponse.json({ success: true })
    res.cookies.set('onboarding_skipped', String(flow), { path: '/', maxAge: 60 * 60 * 24 * 30 })
    return res
  } catch (e: any) {
    console.error('onboarding/skip exception', e)
    return NextResponse.json({ error: 'Server error', details: e?.message ?? String(e) }, { status: 500 })
  }
}


