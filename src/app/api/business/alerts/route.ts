import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()

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

    // Get stock alerts with inventory item details
    const { data: stockAlerts, error: alertsError } = await serviceClient
      .from('stock_alerts')
      .select(`
        *,
        inventory_items (
          id,
          sku,
          quantity,
          available_quantity,
          listings (
            title
          )
        )
      `)
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })

    if (alertsError) {
      console.error('Error fetching stock alerts:', alertsError)
      return NextResponse.json({ error: 'Failed to fetch stock alerts' }, { status: 500 })
    }

    // Format stock alerts data
    const formattedAlerts = stockAlerts.map(alert => ({
      id: alert.id,
      alert_type: alert.alert_type,
      threshold_quantity: alert.threshold_quantity,
      threshold_percentage: alert.threshold_percentage,
      notify_email: alert.notify_email,
      notify_sms: alert.notify_sms,
      notification_frequency: alert.notification_frequency,
      is_active: alert.is_active,
      last_triggered_at: alert.last_triggered_at,
      is_resolved: alert.is_resolved,
      item_name: alert.inventory_items?.listings?.title || 'Unknown Item',
      current_quantity: alert.inventory_items?.available_quantity || 0,
      sku: alert.inventory_items?.sku || 'UNKNOWN'
    }))

    return NextResponse.json({
      success: true,
      stockAlerts: formattedAlerts
    })

  } catch (error) {
    console.error('Stock alerts GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()

    if (!user || !user.roles.includes('BUSINESS_LISTER' as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      inventory_item_id,
      alert_type,
      threshold_quantity,
      threshold_percentage,
      notify_email,
      notify_sms,
      notification_frequency,
      is_active
    } = body

    if (!inventory_item_id || !alert_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    // Verify the inventory item belongs to this business
    const { data: inventoryItem, error: itemError } = await serviceClient
      .from('inventory_items')
      .select('id')
      .eq('id', inventory_item_id)
      .single()

    if (itemError || !inventoryItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    // Create stock alert
    const { data: newAlert, error: insertError } = await serviceClient
      .from('stock_alerts')
      .insert({
        business_id: business.id,
        inventory_item_id,
        alert_type,
        threshold_quantity,
        threshold_percentage,
        notify_email,
        notify_sms,
        notification_frequency,
        is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating stock alert:', insertError)
      return NextResponse.json({ error: 'Failed to create stock alert' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      stockAlert: newAlert,
      message: 'Stock alert created successfully'
    })

  } catch (error) {
    console.error('Stock alerts POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}