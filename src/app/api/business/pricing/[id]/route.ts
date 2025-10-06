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
    const { id } = await params
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()

    if (!user || !user.roles.includes('BUSINESS_LISTER' as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      rule_type,
      adjustment_type,
      adjustment_value,
      start_date,
      end_date,
      weekend_days,
      holiday_date,
      is_recurring_holiday,
      min_stay_days,
      max_stay_days,
      listing_id,
      is_active
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

    // Verify the pricing rule belongs to this business
    const { data: existingRule, error: ruleError } = await serviceClient
      .from('pricing_rules')
      .select('id')
      .eq('id', id)
      .eq('business_id', business.id)
      .single()

    if (ruleError || !existingRule) {
      return NextResponse.json({ error: 'Pricing rule not found or access denied' }, { status: 404 })
    }

    // Update pricing rule
    const { data: updatedRule, error: updateError } = await serviceClient
      .from('pricing_rules')
      .update({
        name,
        description,
        rule_type,
        adjustment_type,
        adjustment_value,
        start_date,
        end_date,
        weekend_days,
        holiday_date,
        is_recurring_holiday,
        min_stay_days,
        max_stay_days,
        listing_id: listing_id === 'ALL' ? null : listing_id,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating pricing rule:', updateError)
      return NextResponse.json({ error: 'Failed to update pricing rule' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      pricingRule: updatedRule,
      message: 'Pricing rule updated successfully'
    })

  } catch (error) {
    console.error('Pricing rules PUT error:', error)
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
    const { id } = await params
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

    // Verify the pricing rule belongs to this business and delete it
    const { error: deleteError } = await serviceClient
      .from('pricing_rules')
      .delete()
      .eq('id', id)
      .eq('business_id', business.id)

    if (deleteError) {
      console.error('Error deleting pricing rule:', deleteError)
      return NextResponse.json({ error: 'Failed to delete pricing rule' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Pricing rule deleted successfully'
    })

  } catch (error) {
    console.error('Pricing rules DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}