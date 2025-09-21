import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Role } from '@/lib/types'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Compute current path and check for skip cookie early
  const currentPath = req.nextUrl.pathname
  const skipCookie = req.cookies.get('onboarding_skipped')?.value

  // If there's a session and no skip cookie, check onboarding status and possibly redirect
  // NOTE: we use a direct SELECT (read-only) instead of calling the RPC which may perform
  // an INSERT and thus fail inside read-only transactions (error 25006).
  if (session && session.user && !skipCookie) {
    // If user already has any role assigned (metadata or DB), allow access without forcing onboarding
    let metaRoles = Array.isArray(session.user.user_metadata?.roles) ? session.user.user_metadata.roles : []
    if (metaRoles.length === 0) {
      try {
        const { data: rows } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
        metaRoles = (rows || []).map((r: any) => r.role)
      } catch {}
    }
    console.log('[mw] onboarding check', { path: currentPath, skipCookie: !!skipCookie, roles: metaRoles })
    if (metaRoles.length > 0) {
      if (currentPath.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return res
    }
    try {
      const { data: row, error: readErr } = await supabase
        .from('onboarding_progress')
        .select('last_flow, renter_step, renter_completed, lister_step, lister_completed, business_step, business_completed')
        .eq('user_id', session.user.id)
        .single()

      if (!readErr) {
        const lastFlow = row?.last_flow || null
        const renter = { step: row?.renter_step ?? 0, completed: !!row?.renter_completed }
        const lister = { step: row?.lister_step ?? 0, completed: !!row?.lister_completed }
        const business = { step: row?.business_step ?? 0, completed: !!row?.business_completed }
        const has_any_completed = renter.completed || lister.completed || business.completed
        const needsSelector = !has_any_completed && !lastFlow

        // If user needs selector and isn't on onboarding path, redirect to /onboarding
        if (needsSelector && !currentPath.startsWith('/onboarding')) {
          return NextResponse.redirect(new URL('/onboarding', req.url))
        }

        // If user has chosen a flow but hasn't completed it, redirect to that flow's page
        if (lastFlow === 'RENTER' && !renter.completed && !currentPath.startsWith('/onboarding')) {
          return NextResponse.redirect(new URL('/onboarding/renter', req.url))
        }
        if (lastFlow === 'INDIVIDUAL_LISTER' && !lister.completed && !currentPath.startsWith('/onboarding')) {
          return NextResponse.redirect(new URL('/onboarding/lister', req.url))
        }
        if (lastFlow === 'BUSINESS_LISTER' && !business.completed && !currentPath.startsWith('/onboarding')) {
          return NextResponse.redirect(new URL('/onboarding/business', req.url))
        }
      }
    } catch (e) {
      // ignore read errors and continue
    }
  }

  // Define protected routes and required roles
  const protectedRoutes = {
    '/dashboard': [Role.CUSTOMER, Role.INDIVIDUAL_LISTER, Role.BUSINESS_LISTER, Role.ADMIN],
    '/dashboard/individual': [Role.INDIVIDUAL_LISTER, Role.ADMIN],
    '/dashboard/business': [Role.BUSINESS_LISTER, Role.ADMIN],
    '/dashboard/listings/new': [Role.INDIVIDUAL_LISTER, Role.BUSINESS_LISTER, Role.ADMIN],
    '/admin': [Role.ADMIN],
  }

  // Check if current path is protected (reuse currentPath)
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => 
    currentPath.startsWith(route)
  )

  if (isProtectedRoute) {
    if (!session) {
      // Redirect to login if no session
      const redirectUrl = new URL('/auth/signin', req.url)
      redirectUrl.searchParams.set('redirectTo', currentPath)
      return NextResponse.redirect(redirectUrl)
    }

    // Get user roles from database (you'll need to implement this)
    // For now, we'll check the user's metadata or use a simpler approach
    let userRoles = Array.isArray(session.user.user_metadata?.roles) ? session.user.user_metadata.roles : []
    if (userRoles.length === 0) {
      try {
        const { data: rows } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
        userRoles = (rows || []).map((r: any) => r.role)
      } catch {}
    }
    if (userRoles.length === 0) {
      // Treat as CUSTOMER by default to allow basic dashboard access
      userRoles = [Role.CUSTOMER]
    }
    
    // Check required roles for the current route
    const requiredRoles = Object.entries(protectedRoutes).find(([route]) => 
      currentPath.startsWith(route)
    )?.[1]

    console.log('[mw] protected route', { path: currentPath, requiredRoles, userRoles })
    if (requiredRoles && !requiredRoles.some(role => userRoles.includes(role))) {
      // Redirect to unauthorized page if user doesn't have required role
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
