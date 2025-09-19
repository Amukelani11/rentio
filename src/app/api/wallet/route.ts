import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser(supabase)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase.from('wallets').select('*').eq('user_id', user.id).single()
    if (error) throw error
    return NextResponse.json({ wallet: data })
  } catch (err: any) {
    console.error('Wallet GET error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser(supabase)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { type, amount, meta } = body
    if (!type || !amount) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Ensure wallet exists
    const wRes = await supabase.from('wallets').upsert([{ user_id: user.id }], { onConflict: 'user_id' }).select().single()
    if (wRes.error) throw wRes.error
    const wallet = wRes.data

    const txRes = await supabase.from('wallet_transactions').insert([{
      wallet_id: wallet.id,
      user_id: user.id,
      type,
      amount: Number(amount),
      meta: meta || null
    }]).select().single()
    if (txRes.error) throw txRes.error

    // Update balance (simple additive/subtractive logic)
    const newBalance = Number(wallet.balance || 0) + (type === 'CREDIT' ? Number(amount) : -Number(amount))
    const upd = await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet.id)
    if (upd.error) throw upd.error

    return NextResponse.json({ transaction: txRes.data, balance: newBalance })
  } catch (err: any) {
    console.error('Wallet POST error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}




