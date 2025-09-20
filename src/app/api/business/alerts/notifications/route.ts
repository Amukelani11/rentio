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

    // Get alert notifications with stock alert details
    const { data: notifications, error: notificationsError } = await serviceClient
      .from('alert_notifications')
      .select(`
        *,
        stock_alerts (
          alert_type,
          inventory_items (
            listings (
              title
            )
          )
        )
      `)
      .in('stock_alert_id', (
        serviceClient
          .from('stock_alerts')
          .select('id')
          .eq('business_id', business.id)
      ))
      .order('created_at', { ascending: false })
      .limit(100)

    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    // Format notifications data
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      notification_type: notification.notification_type,
      recipient: notification.recipient,
      message: notification.message,
      status: notification.status,
      sent_at: notification.sent_at,
      delivered_at: notification.delivered_at,
      error_message: notification.error_message,
      alert_type: notification.stock_alerts?.alert_type || 'UNKNOWN',
      item_name: notification.stock_alerts?.inventory_items?.listings?.title || 'Unknown Item',
      created_at: notification.created_at
    }))

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications
    })

  } catch (error) {
    console.error('Alert notifications GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}