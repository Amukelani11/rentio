import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const admin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null

export async function POST() {
  try {
    if (admin) {
      const { data: existingRows } = await admin.from('categories').select('*').limit(1)
      if (existingRows && existingRows.length > 0) {
        const { data: rows } = await admin.from('categories').select('*').order('name')
        return NextResponse.json({ success: true, data: rows })
      }
    }

    const seed = [
      { name: 'Tools', description: 'Hand and power tools for hire', icon: 'tool', slug: 'tools' },
      { name: 'Tents & Camping', description: 'Tents, camping gear and outdoor equipment', icon: 'tent', slug: 'tents-camping' },
      { name: 'Clothing & Dresses', description: 'Formal wear, costumes and dresses', icon: 'dress', slug: 'clothing-dresses' },
      { name: 'Electronics', description: 'Cameras, projectors, drones and more', icon: 'camera', slug: 'electronics' },
      { name: 'Trailers & Transport', description: 'Trailers, tow equipment and transport', icon: 'truck', slug: 'trailers-transport' },
      { name: 'Sports & Fitness', description: 'Sports gear and fitness equipment', icon: 'sports', slug: 'sports-fitness' },
      { name: 'Furniture', description: 'Short-term furniture rentals', icon: 'chair', slug: 'furniture' },
      { name: 'Baby & Kids', description: 'Baby equipment and kids gear', icon: 'baby', slug: 'baby-kids' },
      { name: 'Audio & Music', description: 'Speakers, instruments and PA systems', icon: 'music', slug: 'audio-music' },
      { name: 'Gardening', description: 'Garden tools and outdoor maintenance', icon: 'leaf', slug: 'gardening' },
      { name: 'Vehicles', description: 'Short-term vehicle rentals', icon: 'car', slug: 'vehicles' },
      { name: 'Party & Events', description: 'Chairs, tables, sound and lighting', icon: 'party', slug: 'party-events' },
      { name: 'Bikes & Scooters', description: 'Bicycles and scooters', icon: 'bike', slug: 'bikes-scooters' },
      { name: 'Water Sports', description: 'Kayaks, SUPs and water gear', icon: 'water', slug: 'water-sports' },
    ]

    if (admin) {
      for (const c of seed) {
        await admin.from('categories').insert([{ name: c.name, description: c.description, icon: c.icon, slug: c.slug, parent_id: null }])
      }
      const { data: rows } = await admin.from('categories').select('*').order('name')
      return NextResponse.json({ success: true, data: rows })
    }
    return NextResponse.json({ success: false, error: 'Supabase admin client not configured' }, { status: 500 })
  } catch (e: any) {
    console.error('Seed categories error', e)
    return NextResponse.json({ error: 'Server error', details: e?.message ?? String(e) }, { status: 500 })
  }
}


