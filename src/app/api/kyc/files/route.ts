import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    console.log('[KYC Files] Starting request...')
    
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
    
    if (!user) {
      console.log('[KYC Files] No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[KYC Files] User authenticated:', user.id, 'isAdmin:', user.isAdmin)

    const body = await request.json()
    const { filePaths } = body

    console.log('[KYC Files] File paths requested:', filePaths)

    if (!filePaths || !Array.isArray(filePaths)) {
      return NextResponse.json({ error: 'Invalid file paths' }, { status: 400 })
    }

    // Use service role client for private bucket operations
    const supabaseAdminUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseAdminUrl || !supabaseServiceRole) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
    }

    const adminClient = createClient(supabaseAdminUrl, supabaseServiceRole)
    const bucket = 'kyc-documents'
    const signedUrls: string[] = []

    for (const filePath of filePaths) {
      console.log('[KYC Files] Processing file path:', filePath)
      
      // Security check: users can only access their own files, admins can access all files
      if (!user.isAdmin && !filePath.startsWith(`users/${user.id}/`)) {
        console.log('[KYC Files] Access denied for non-admin user')
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      console.log('[KYC Files] Creating signed URL for:', filePath)
      const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
        .from(bucket)
        .createSignedUrl(filePath, 60 * 60) // 1 hour expiry

      if (signedUrlError) {
        console.error('[KYC Files] Signed URL error for', filePath, signedUrlError)
        signedUrls.push('ERROR')
        continue
      }

      console.log('[KYC Files] Successfully created signed URL for:', filePath)
      signedUrls.push(signedUrlData.signedUrl)
    }

    console.log('[KYC Files] Returning signed URLs:', signedUrls)
    return NextResponse.json({ success: true, signedUrls })
  } catch (error) {
    console.error('[KYC Files] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
