import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const redirect = requestUrl.searchParams.get('redirect')

  if (code) {
    try {
      const supabase = await createClient()
      
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('OAuth error:', error)
        return NextResponse.redirect(new URL('/auth/signin?error=oauth_error', requestUrl.origin))
      }

      if (data.user) {
        // Check if user has roles, redirect to onboarding if not
        try {
          const { data: { user } } = await supabase.auth.getUser()
          const roles = Array.isArray(user?.user_metadata?.roles) ? user?.user_metadata?.roles : []
          
          if (roles.length === 0) {
            return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
          }
          
          // Redirect to dashboard or specified redirect
          const destination = redirect ? decodeURIComponent(redirect) : '/dashboard'
          return NextResponse.redirect(new URL(destination, requestUrl.origin))
        } catch {
          // Fallback to dashboard
          const destination = redirect ? decodeURIComponent(redirect) : '/dashboard'
          return NextResponse.redirect(new URL(destination, requestUrl.origin))
        }
      }
    } catch (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(new URL('/auth/signin?error=callback_error', requestUrl.origin))
    }
  }

  // If no code, redirect to sign in
  return NextResponse.redirect(new URL('/auth/signin', requestUrl.origin))
}
