import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const placeId = searchParams.get('place_id')
    if (!placeId) return NextResponse.json({ success: false, error: 'place_id required' }, { status: 400 })

    const API_KEY = process.env.GOOGLE_API_KEY
    if (!API_KEY) {
      console.warn('Places details called but GOOGLE_API_KEY not set')
      return NextResponse.json({ success: false, error: 'Missing API key' }, { status: 500 })
    }

    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.set('place_id', placeId)
    url.searchParams.set('key', API_KEY)
    url.searchParams.set('fields', 'formatted_address,address_component,geometry')

    const res = await fetch(url.toString())
    if (!res.ok) {
      const text = await res.text()
      console.error('Places details error', text)
      return NextResponse.json({ success: false, error: 'Places API error' }, { status: 502 })
    }

    const json = await res.json()
    const result = json.result || {}
    const components: Array<any> = result.address_components || []

    const getComp = (type: string) => components.find(c => (c.types || []).includes(type))?.long_name || ''
    const streetNumber = getComp('street_number')
    const route = getComp('route')
    const locality = getComp('locality') || getComp('sublocality') || getComp('administrative_area_level_2')
    const province = getComp('administrative_area_level_1')
    const postalCode = getComp('postal_code')

    const address = (streetNumber || route) ? `${streetNumber ? streetNumber + ' ' : ''}${route}`.trim() : (result.formatted_address || '')
    const lat = result.geometry?.location?.lat ?? null
    const lng = result.geometry?.location?.lng ?? null

    return NextResponse.json({
      success: true,
      data: {
        formatted_address: result.formatted_address || '',
        address,
        city: locality || '',
        province: province || '',
        postal_code: postalCode || '',
        latitude: lat,
        longitude: lng,
      }
    })
  } catch (e: any) {
    console.error('Details exception', e)
    return NextResponse.json({ success: false, error: e?.message ?? String(e) }, { status: 500 })
  }
}




