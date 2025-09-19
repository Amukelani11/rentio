import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser(supabase)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase.from('support_tickets').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ tickets: data })
  } catch (err: any) {
    console.error('Support tickets GET error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser(supabase)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    if (!body.subject || !body.message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const ticketRes = await supabase.from('support_tickets').insert([{ user_id: user.id, subject: body.subject, status: 'OPEN' }]).select().single()
    if (ticketRes.error) throw ticketRes.error

    const msgRes = await supabase.from('support_messages').insert([{ ticket_id: ticketRes.data.id, user_id: user.id, message: body.message }])
    if (msgRes.error) throw msgRes.error

    return NextResponse.json({ ticket: ticketRes.data }, { status: 201 })
  } catch (err: any) {
    console.error('Support tickets POST error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}




