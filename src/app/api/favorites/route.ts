import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase.from('favorites').select('listing_id').eq('user_id', user.id)
    if (error) throw error
    return NextResponse.json({ favorites: (data || []).map((d: any) => d.listing_id) })
  } catch (e: any) {
    console.error('Favorites GET error', e)
    return NextResponse.json({ error: e.message || 'Internal' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const listingId = body.listingId
    if (!listingId) return NextResponse.json({ error: 'listingId required' }, { status: 400 })

    const { data, error } = await supabase.from('favorites').insert([{ user_id: user.id, listing_id: listingId }])
    if (error) {
      // ignore unique constraint errors
      if (error.code === '23505') return NextResponse.json({ success: true })
      throw error
    }
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Favorites POST error', e)
    return NextResponse.json({ error: e.message || 'Internal' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const listingId = url.searchParams.get('listingId')
    if (!listingId) return NextResponse.json({ error: 'listingId required' }, { status: 400 })

    const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('listing_id', listingId)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Favorites DELETE error', e)
    return NextResponse.json({ error: e.message || 'Internal' }, { status: 500 })
  }
}




