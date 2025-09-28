import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()

    if (!user || !user.roles.includes('BUSINESS_LISTER' as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      alert_type,
      threshold_quantity,
      threshold_percentage,
      notify_email,
      notify_sms,
      notification_frequency,
      is_active,
      is_resolved
    } = body

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

    // Verify the stock alert belongs to this business
    const { data: existingAlert, error: alertError } = await serviceClient
      .from('stock_alerts')
      .select('id')
      .eq('id', params.id)
      .eq('business_id', business.id)
      .single()

    if (alertError || !existingAlert) {
      return NextResponse.json({ error: 'Stock alert not found or access denied' }, { status: 404 })
    }

    // Update stock alert
    const { data: updatedAlert, error: updateError } = await serviceClient
      .from('stock_alerts')
      .update({
        alert_type,
        threshold_quantity,
        threshold_percentage,
        notify_email,
        notify_sms,
        notification_frequency,
        is_active,
        is_resolved: is_resolved !== undefined ? is_resolved : false,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating stock alert:', updateError)
      return NextResponse.json({ error: 'Failed to update stock alert' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      stockAlert: updatedAlert,
      message: 'Stock alert updated successfully'
    })

  } catch (error) {
    console.error('Stock alerts PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Verify the stock alert belongs to this business and delete it
    const { error: deleteError } = await serviceClient
      .from('stock_alerts')
      .delete()
      .eq('id', params.id)
      .eq('business_id', business.id)

    if (deleteError) {
      console.error('Error deleting stock alert:', deleteError)
      return NextResponse.json({ error: 'Failed to delete stock alert' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Stock alert deleted successfully'
    })

  } catch (error) {
    console.error('Stock alerts DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}