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

    // Get pricing rules
    const { data: pricingRules, error: rulesError } = await serviceClient
      .from('pricing_rules')
      .select(`
        *,
        listings (
          title
        )
      `)
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })

    if (rulesError) {
      console.error('Error fetching pricing rules:', rulesError)
      return NextResponse.json({ error: 'Failed to fetch pricing rules' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      pricingRules: pricingRules || []
    })

  } catch (error) {
    console.error('Pricing rules GET error:', error)
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

    if (!name || !rule_type || !adjustment_type || adjustment_value === undefined) {
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

    // Create pricing rule
    const { data: newRule, error: insertError } = await serviceClient
      .from('pricing_rules')
      .insert({
        business_id: business.id,
        listing_id: listing_id === 'ALL' ? null : listing_id,
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
        is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating pricing rule:', insertError)
      return NextResponse.json({ error: 'Failed to create pricing rule' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      pricingRule: newRule,
      message: 'Pricing rule created successfully'
    })

  } catch (error) {
    console.error('Pricing rules POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}