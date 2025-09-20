import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser(supabase)

    if (!user || !user.roles.includes('BUSINESS_LISTER' as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role client to bypass RLS
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get business ID for the current user
    const { data: business, error: businessError } = await serviceClient
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })
    }

    // Get business listings with inventory data
    const { data: listings, error: listingsError } = await serviceClient
      .from('listings')
      .select(`
        *,
        category:categories(name),
        inventory:inventory_items(
          id,
          sku,
          quantity,
          available_quantity,
          status,
          reorder_point,
          last_restocked_at
        ),
        booking_stats:bookings(
          count,
          sum(total_amount)
        )
      `)
      .eq('business_id', business.id)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })

    if (listingsError) {
      console.error('Error fetching inventory:', listingsError)
      return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
    }

    // Format inventory data
    const inventory = listings.map(listing => {
      const inventoryItem = listing.inventory && listing.inventory[0]
      const totalRevenue = listing.booking_stats?.sum || 0
      const totalBookings = listing.booking_stats?.count || 0

      // Determine status based on inventory
      let status = 'AVAILABLE'
      if (inventoryItem) {
        if (inventoryItem.available_quantity === 0) {
          status = 'OUT_OF_STOCK'
        } else if (inventoryItem.available_quantity <= inventoryItem.reorder_point) {
          status = 'LOW_STOCK'
        } else if (inventoryItem.status === 'MAINTENANCE') {
          status = 'MAINTENANCE'
        }
      }

      return {
        id: listing.id,
        name: listing.title,
        sku: inventoryItem?.sku || `LIST-${listing.id.slice(0, 8).toUpperCase()}`,
        category: listing.category?.name || 'Uncategorized',
        quantity: inventoryItem?.quantity || 1,
        available_quantity: inventoryItem?.available_quantity || 1,
        price_daily: parseFloat(listing.price_daily),
        price_weekly: listing.price_weekly ? parseFloat(listing.price_weekly) : null,
        status,
        total_revenue: totalRevenue,
        total_bookings: totalBookings,
        last_booked: null, // TODO: Get from bookings table
        image_url: listing.images?.[0] || listing.image_url
      }
    })

    return NextResponse.json({
      success: true,
      inventory
    })

  } catch (error) {
    console.error('Inventory GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser(supabase)

    if (!user || !user.roles.includes('BUSINESS_LISTER' as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { listing_id, sku, quantity, available_quantity, reorder_point, status } = body

    if (!listing_id || quantity === undefined || available_quantity === undefined) {
      return NextResponse.json({ error: 'Listing ID, quantity, and available quantity are required' }, { status: 400 })
    }

    // Use service role client to bypass RLS
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get business ID for the current user
    const { data: business, error: businessError } = await serviceClient
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })
    }

    // Verify the listing belongs to this business
    const { data: listing, error: listingError } = await serviceClient
      .from('listings')
      .select('id')
      .eq('id', listing_id)
      .eq('business_id', business.id)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found or access denied' }, { status: 404 })
    }

    // Check if inventory item already exists
    const { data: existingInventory, error: existingError } = await serviceClient
      .from('inventory_items')
      .select('id')
      .eq('listing_id', listing_id)
      .single()

    let result

    if (existingInventory) {
      // Update existing inventory item
      const { data: updatedInventory, error: updateError } = await serviceClient
        .from('inventory_items')
        .update({
          sku: sku || undefined,
          quantity,
          available_quantity,
          reorder_point: reorder_point || 1,
          status: status || 'AVAILABLE',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingInventory.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating inventory:', updateError)
        return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 })
      }

      result = updatedInventory
    } else {
      // Create new inventory item
      const { data: newInventory, error: insertError } = await serviceClient
        .from('inventory_items')
        .insert({
          listing_id,
          sku: sku || `INV-${Date.now()}`,
          quantity,
          available_quantity,
          reorder_point: reorder_point || 1,
          status: status || 'AVAILABLE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating inventory:', insertError)
        return NextResponse.json({ error: 'Failed to create inventory' }, { status: 500 })
      }

      result = newInventory
    }

    return NextResponse.json({
      success: true,
      inventory: result
    })

  } catch (error) {
    console.error('Inventory POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}