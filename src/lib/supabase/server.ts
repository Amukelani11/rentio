import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function createClient() {
  // Use the auth-helpers server component client and pass Next's cookies()
  return createServerComponentClient({ cookies })
}
