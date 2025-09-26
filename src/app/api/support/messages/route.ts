import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const ticketId = url.searchParams.get('ticket_id')
    if (!ticketId) return NextResponse.json({ error: 'ticket_id required' }, { status: 400 })

    const { data, error } = await supabase.from('support_messages').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true })
    if (error) throw error
    return NextResponse.json({ messages: data })
  } catch (err: any) {
    console.error('Support messages GET error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    if (!body.ticket_id || !body.message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const insert = await supabase.from('support_messages').insert([{
      ticket_id: body.ticket_id,
      user_id: user.id,
      message: body.message,
      attachments: body.attachments || null
    }]).select().single()

    if (insert.error) throw insert.error
    return NextResponse.json({ message: insert.data }, { status: 201 })
  } catch (err: any) {
    console.error('Support messages POST error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}




