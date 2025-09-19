import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    if (!q || q.trim().length === 0) return NextResponse.json({ success: true, data: [] })

    const API_KEY = process.env.GOOGLE_API_KEY
    if (!API_KEY) {
      console.warn('Places autocomplete called but GOOGLE_API_KEY not set')
      return NextResponse.json({ success: false, error: 'Missing API key' }, { status: 500 })
    }

    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json')
    url.searchParams.set('input', q)
    url.searchParams.set('key', API_KEY)
    // allow client to request different types (e.g. 'city')
    const requestedType = (new URL(request.url)).searchParams.get('type') || 'address'
    if (requestedType === 'city') {
      // request city/locality results
      url.searchParams.set('types', '(cities)')
      // also prefer locality results by using components or type
    } else {
      url.searchParams.set('types', 'address')
    }
    // optional: restrict to a country if needed
    // url.searchParams.set('components', 'country:za')

    console.log('[places.autocomplete] request:', q)
    const res = await fetch(url.toString())
    if (!res.ok) {
      const text = await res.text()
      console.error('Places autocomplete error', text)
      return NextResponse.json({ success: false, error: 'Places API error' }, { status: 502 })
    }

    const json = await res.json()
    const preds = (json.predictions || []).map((p: any) => ({ description: p.description, place_id: p.place_id }))
    console.log(`[places.autocomplete] response count=${preds.length}`)
    return NextResponse.json({ success: true, data: preds })
  } catch (e: any) {
    console.error('Autocomplete exception', e)
    return NextResponse.json({ success: false, error: e?.message ?? String(e) }, { status: 500 })
  }
}


