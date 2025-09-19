import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    if (!q || q.trim().length === 0) return NextResponse.json({ success: false, data: [] })

    const API_KEY = process.env.GOOGLE_CSE_API_KEY
    const CX = process.env.GOOGLE_CSE_ID
    if (!API_KEY || !CX) {
      console.error('Google CSE not configured')
      return NextResponse.json({ success: false, error: 'Service not configured' }, { status: 500 })
    }

    const url = new URL('https://www.googleapis.com/customsearch/v1')
    url.searchParams.set('key', API_KEY)
    url.searchParams.set('cx', CX)
    url.searchParams.set('q', q)
    url.searchParams.set('searchType', 'image')
    // Request larger, photo-style results to favor high-quality images
    url.searchParams.set('num', '12')
    url.searchParams.set('imgSize', 'xxlarge')
    url.searchParams.set('imgType', 'photo')
    url.searchParams.set('safe', 'high')

    const res = await fetch(url.toString())
    if (!res.ok) {
      const text = await res.text()
      console.error('Google CSE error', text)
      return NextResponse.json({ success: false, error: 'Search failed' }, { status: 502 })
    }

    const json = await res.json()
    const items = (json.items || []).map((it: any) => ({ link: it.link, thumbnail: it.image?.thumbnailLink || it.link }))
    return NextResponse.json({ success: true, data: items })
  } catch (e: any) {
    console.error('Image search error', e)
    return NextResponse.json({ success: false, error: e?.message ?? String(e) }, { status: 500 })
  }
}


