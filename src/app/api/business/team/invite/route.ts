import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser(supabase)

    if (!user || !user.roles.includes('BUSINESS_LISTER' as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, role, permissions } = body

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
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

    // Find the user to invite by email
    const { data: targetUser, error: userError } = await serviceClient
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'User not found with this email' }, { status: 404 })
    }

    // Check if user is already a team member
    const { data: existingMember, error: existingError } = await serviceClient
      .from('team_members')
      .select('id')
      .eq('business_id', business.id)
      .eq('user_id', targetUser.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a team member' }, { status: 400 })
    }

    // Create team member invitation
    const { data: newMember, error: insertError } = await serviceClient
      .from('team_members')
      .insert({
        business_id: business.id,
        user_id: targetUser.id,
        role,
        permissions: permissions || [],
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating team member:', insertError)
      return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 })
    }

    // TODO: Send invitation email to the user
    // This would integrate with your email service (Resend, etc.)

    return NextResponse.json({
      success: true,
      teamMember: newMember,
      message: 'Team member invited successfully'
    })

  } catch (error) {
    console.error('Team invitation POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}