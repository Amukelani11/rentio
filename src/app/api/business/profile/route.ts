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

    // Use service role client to bypass RLS for business data
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Try to find existing business profile
    const { data: business, error } = await serviceClient
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching business profile:', error)
      return NextResponse.json({ error: 'Failed to fetch business profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      business: business ? { ...business, verified: (business as any).is_verified } : {
        name: '',
        description: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        business_hours: {
          monday: '09:00-17:00',
          tuesday: '09:00-17:00',
          wednesday: '09:00-17:00',
          thursday: '09:00-17:00',
          friday: '09:00-17:00',
          saturday: '09:00-13:00',
          sunday: 'Closed'
        },
        delivery_radius: 10,
        status: 'ACTIVE',
        verified: false
      }
    })

  } catch (error) {
    console.error('Business profile GET error:', error)
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
      name,
      description,
      phone,
      email,
      address,
      city,
      province,
      postal_code,
      business_hours,
      delivery_radius,
      status
    } = body

    // Use service role client to bypass RLS
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Check if business profile already exists
    const { data: existingBusiness, error: checkError } = await serviceClient
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let result

    if (existingBusiness) {
      // Update existing business
      const { data: updatedBusiness, error: updateError } = await serviceClient
        .from('businesses')
        .update({
          name,
          description,
          phone,
          email,
          address,
          city,
          province,
          postal_code,
          business_hours,
          delivery_radius,
          status: status || 'ACTIVE',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingBusiness.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating business profile:', updateError)
        return NextResponse.json({ error: 'Failed to update business profile' }, { status: 500 })
      }

      result = { ...updatedBusiness, verified: (updatedBusiness as any).is_verified }
    } else {
      // Create new business profile
      const { data: newBusiness, error: insertError } = await serviceClient
        .from('businesses')
        .insert({
          user_id: user.id,
          name,
          description,
          phone,
          email,
          address,
          city,
          province,
          postal_code,
          business_hours,
          delivery_radius,
          status: status || 'ACTIVE',
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating business profile:', insertError)
        return NextResponse.json({ error: 'Failed to create business profile' }, { status: 500 })
      }

      result = { ...newBusiness, verified: (newBusiness as any).is_verified }
    }

    return NextResponse.json({
      success: true,
      business: result
    })

  } catch (error) {
    console.error('Business profile POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}