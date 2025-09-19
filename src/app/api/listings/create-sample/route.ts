import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const admin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null

export async function POST() {
  try {
    if (!admin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // First, get a category and a user
    const { data: categories } = await admin.from('categories').select('*').limit(1)
    const { data: users } = await admin.from('users').select('*').limit(1)

    if (!categories || categories.length === 0) {
      return NextResponse.json({ error: 'No categories found. Please seed categories first.' }, { status: 400 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'No users found. Please create a user first.' }, { status: 400 })
    }

    const category = categories[0]
    const user = users[0]

    // Create a sample listing
    const sampleListing = {
      title: 'Sample Power Drill',
      slug: 'sample-power-drill',
      description: 'A powerful cordless drill perfect for DIY projects and construction work.',
      category_id: category.id,
      user_id: user.id,
      price_daily: 150.00,
      price_weekly: 900.00,
      weekly_discount: 20,
      deposit_type: 'FIXED',
      deposit_value: 500.00,
      min_days: 1,
      max_days: 7,
      instant_book: true,
      requires_kyc: false,
      location: 'Cape Town, South Africa',
      latitude: -33.9249,
      longitude: 18.4241,
      delivery_options: {
        pickupAvailable: true,
        pickupInstructions: 'Available for pickup from Monday to Friday, 9 AM to 5 PM'
      },
      availability_rules: {},
      specifications: {
        included: ['Cordless drill', '2 batteries', 'Charger', 'Carrying case'],
        features: ['Variable speed', 'Hammer function', 'LED light']
      },
      tags: ['tools', 'drill', 'cordless'],
      images: [],
      cancellation_policy: 'MODERATE',
      status: 'ACTIVE'
    }

    const { data: listing, error } = await admin
      .from('listings')
      .insert([sampleListing])
      .select()
      .single()

    if (error) {
      console.error('Error creating sample listing:', error)
      return NextResponse.json({ error: 'Failed to create sample listing' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sample listing created successfully',
      data: listing 
    })
  } catch (error) {
    console.error('Error in sample listing creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}