import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser(supabase)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase.from('withdrawals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ withdrawals: data })
  } catch (err: any) {
    console.error('Withdrawals GET error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser(supabase)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const amount = body.amount
    if (!amount || isNaN(Number(amount))) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const insert = await supabase.from('withdrawals').insert([{
      user_id: user.id,
      amount: Number(amount),
      currency: body.currency || 'ZAR',
      status: 'PENDING'
    }]).select().single()

    if (insert.error) throw insert.error
    return NextResponse.json({ withdrawal: insert.data }, { status: 201 })
  } catch (err: any) {
    console.error('Withdrawals POST error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}




