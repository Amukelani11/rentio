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

    // Get team members
    const { data: teamMembers, error: teamError } = await serviceClient
      .from('team_members')
      .select(`
        *,
        user:users(
          id,
          name,
          email,
          phone,
          last_sign_in_at
        )
      `)
      .eq('business_id', business.id)
      .order('created_at', { ascending: true })

    if (teamError) {
      console.error('Error fetching team members:', teamError)
      return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
    }

    // Format team member data
    const formattedTeamMembers = teamMembers.map(member => ({
      id: member.id,
      user_id: member.user_id,
      name: member.user.name || member.user.email,
      email: member.user.email,
      phone: member.user.phone,
      role: member.role,
      status: member.status,
      permissions: member.permissions || [],
      joined_at: member.created_at,
      last_login: member.user.last_sign_in_at
    }))

    return NextResponse.json({
      success: true,
      teamMembers: formattedTeamMembers
    })

  } catch (error) {
    console.error('Team members GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

