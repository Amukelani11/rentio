import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    // If no explicit redirect provided, decide based on user roles
    if (!redirect) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const roles = Array.isArray(user?.user_metadata?.roles) ? user?.user_metadata?.roles : []
        if (roles.length === 0) {
          return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
        }
        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      } catch {
        // fall through to origin
      }
    }
  }

  // URL to redirect to after sign in process completes
  const destination = redirect ? new URL(redirect, requestUrl.origin).toString() : requestUrl.origin
  return NextResponse.redirect(destination)
}
