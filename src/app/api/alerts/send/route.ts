import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sendEmail } from '@/lib/resend'
import { stockAlertEmail } from '@/emails/templates'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Auth required
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await request.json()
    const alertId: string | undefined = payload?.alertId

    if (!alertId) return NextResponse.json({ error: 'alertId required' }, { status: 400 })

    // Load alert, item, business, and recipient email
    const { data: alert, error: alertErr } = await supabase
      .from('stock_alerts')
      .select(`
        id, alert_type, threshold_quantity, threshold_percentage, notify_email, notify_sms,
        business:businesses(id, name, user_id),
        item:inventory_items(id, sku, name, quantity, listing:listings(title))
      `)
      .eq('id', alertId)
      .single()

    if (alertErr || !alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 })

    // Resolve recipient email from business owner profile
    const { data: owner, error: ownerErr } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', (alert as any).business.user_id)
      .single()

    if (ownerErr || !owner?.email) return NextResponse.json({ error: 'Owner email not found' }, { status: 404 })

    // Compose email
    const html = stockAlertEmail({
      recipientName: owner.name || owner.email,
      businessName: (alert as any).business.name,
      itemName: (alert as any).item.name || (alert as any).item.listing?.title || 'Inventory Item',
      sku: (alert as any).item.sku || undefined,
      currentQuantity: (alert as any).item.quantity ?? 0,
      alertType: alert.alert_type,
      thresholdText:
        (alert.threshold_quantity ? `Qty ≤ ${alert.threshold_quantity}` : undefined) ||
        (alert.threshold_percentage ? `≤ ${alert.threshold_percentage}%` : undefined),
      manageUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard/inventory`
    })

    if (alert.notify_email) {
      await sendEmail({
        to: owner.email,
        subject: `Inventory Alert: ${alert.alert_type} - ${(alert as any).item.name || (alert as any).item.listing?.title || 'Item'}`,
        html,
      })
    }

    // Optionally: mark notification log
    await supabase.from('alert_notifications').insert({
      stock_alert_id: alert.id,
      notification_type: 'EMAIL',
      recipient: owner.email,
      message: `Email sent for ${alert.alert_type}`,
      status: 'SENT',
      sent_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[alerts/send] error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}




