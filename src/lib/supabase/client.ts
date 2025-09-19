import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error(
      'Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.'
    )
  }
  // The helper reads NEXT_PUBLIC_SUPABASE_* from env; no args needed
  return createClientComponentClient()
}
