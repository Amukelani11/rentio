import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { role } = await request.json()
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use Supabase user metadata to store roles
    const meta = user.user_metadata || {}
    const roles: string[] = Array.isArray(meta.roles) ? meta.roles : []
    if (roles.includes(role)) {
      return NextResponse.json({ error: 'User already has this role' }, { status: 400 })
    }
    const newRoles = [...roles, role]
    const { error: updateError } = await supabase.auth.updateUser({ data: { roles: newRoles } })
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Role ${role} added successfully` 
    })

  } catch (error) {
    console.error('Add role error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
