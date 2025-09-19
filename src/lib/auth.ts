import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { Role, UserStatus, KycStatus, AuthUser, User, UserRole } from '@/lib/types'

export async function getAuthUser(providedClient?: ReturnType<typeof createServerComponentClient>): Promise<AuthUser | null> {
  try {
    const supabase = providedClient ?? createServerComponentClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.email) {
      return null
    }

    // Set RLS context variables for the session
    await supabase.rpc('set_config', { name: 'app.current_user_id', value: session.user.id })
    const userRoles = session.user.user_metadata?.roles || []
    await supabase.rpc('set_config', { name: 'app.current_user_role', value: userRoles.includes('ADMIN') ? 'ADMIN' : userRoles[0] || 'CUSTOMER' })

    // Use the server-side supabase client for all DB operations (do NOT use service role here)
    const admin = supabase

    // Look up user by email
    const { data: users, error: usersErr } = await admin.from('users').select('*').eq('email', session.user.email).limit(1)
    if (usersErr) throw usersErr
    const user = users && users[0]

    if (!user) {
      // Create user if doesn't exist in our database
      const { data: syncData, error: syncError } = await admin.rpc('sync_auth_user', {
        auth_id: session.user.id,
        auth_email: session.user.email,
        auth_name: session.user.user_metadata?.name || session.user.email,
        auth_avatar: session.user.user_metadata?.avatar_url || null,
      })
      if (syncError) throw syncError
      const newUser = Array.isArray(syncData) ? syncData[0] : syncData

      // Do NOT auto-assign a default role here.
      // New users should go through onboarding and select a role first.

      // Create profile (upsert to handle duplicates gracefully)
      try {
        const profileRes = await admin.from('profiles').upsert([{ 
          user_id: newUser.id, 
          currency: 'ZAR', 
          language: 'en-ZA', 
          timezone: 'Africa/Johannesburg' 
        }], {
          onConflict: 'user_id'
        })
        if (profileRes.error) {
          console.debug('[auth] DEBUG upsert profile failed', profileRes.error)
        }
      } catch (e) {
        console.debug('[auth] DEBUG upsert profile exception', e)
      }

      // Fetch created user and roles (best-effort from auth metadata)
      const createdUserRes = await admin.from('users').select('*').eq('id', newUser.id).single()
      let rolesList: Role[] = []
      const metaRoles = session.user.user_metadata?.roles
      rolesList = Array.isArray(metaRoles) && metaRoles.length > 0 ? metaRoles : []

      // Get profile data including is_admin for new user
      let isAdmin = false
      try {
        const profileRes = await admin.from('profiles').select('is_admin').eq('user_id', newUser.id).single()
        if (!profileRes.error && profileRes.data) {
          isAdmin = Boolean(profileRes.data.is_admin)
        }
      } catch (e) {
        // Silent fail for profile fetch
      }

      return {
        id: createdUserRes.data.id,
        email: createdUserRes.data.email,
        name: createdUserRes.data.name,
        avatar: createdUserRes.data.avatar,
        roles: rolesList,
        kycStatus: createdUserRes.data.kyc_status,
        isAdmin: isAdmin,
      }
    }

    // Get user roles from auth metadata (avoid RLS issues on user_roles).
    let rolesList: Role[] = []
    const metaRoles = session.user.user_metadata?.roles
    rolesList = Array.isArray(metaRoles) ? metaRoles : []

    // Get profile data including is_admin using regular client (not admin)
    let isAdmin = false
    try {
      const profileRes = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).single()
      if (!profileRes.error && profileRes.data) {
        isAdmin = Boolean(profileRes.data.is_admin)
      }
    } catch (e) {
      // Silent fail for profile fetch
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      roles: rolesList,
      kycStatus: user.kyc_status,
      isAdmin: isAdmin,
    }
  } catch (error) {
    console.error('Error getting auth user:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getAuthUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireRole(requiredRole: Role) {
  const user = await requireAuth()
  if (!user.roles.includes(requiredRole)) {
    throw new Error(`Role ${requiredRole} required`)
  }
  return user
}

export async function requireAnyRole(requiredRoles: Role[]) {
  const user = await requireAuth()
  if (!requiredRoles.some(role => user.roles.includes(role))) {
    throw new Error(`One of the following roles required: ${requiredRoles.join(', ')}`)
  }
  return user
}

export function hasPermission(userRoles: Role[], requiredRole: Role): boolean {
  return userRoles.includes(requiredRole)
}

export function hasAnyRole(userRoles: Role[], requiredRoles: Role[]): boolean {
  return userRoles.some(role => requiredRoles.includes(role))
}

export function hasAllRoles(userRoles: Role[], requiredRoles: Role[]): boolean {
  return requiredRoles.every(role => userRoles.includes(role))
}

export function isAdmin(userRoles: Role[]): boolean {
  return userRoles.includes(Role.ADMIN)
}

export function isLister(userRoles: Role[]): boolean {
  return userRoles.includes(Role.INDIVIDUAL_LISTER) || 
         userRoles.includes(Role.BUSINESS_LISTER)
}

export function isBusinessLister(userRoles: Role[]): boolean {
  return userRoles.includes(Role.BUSINESS_LISTER)
}

export function isCustomer(userRoles: Role[]): boolean {
  return userRoles.includes(Role.CUSTOMER)
}
