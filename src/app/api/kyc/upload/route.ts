import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('[KYC Upload] Starting upload process...')
    
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser(supabase as any)
    if (!user) {
      console.log('[KYC Upload] No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[KYC Upload] User authenticated:', user.id)

    const form = await request.formData()
    const files = form.getAll('files').filter((f): f is File => f instanceof File)
    if (files.length === 0) {
      console.log('[KYC Upload] No files provided')
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    console.log('[KYC Upload] Files to upload:', files.length)

    // Use private KYC bucket
    const bucket = 'kyc-documents'
    const uploaded: Array<{ filename: string; size: number; path: string; url?: string }> = []

    // Use service role client for private bucket operations
    const supabaseAdminUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('[KYC Upload] Environment check:')
    console.log('- SUPABASE_URL exists:', !!supabaseAdminUrl)
    console.log('- SERVICE_ROLE_KEY exists:', !!supabaseServiceRole)
    
    if (!supabaseAdminUrl || !supabaseServiceRole) {
      console.log('[KYC Upload] Storage not configured properly')
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
    }

    const adminClient = createClient(supabaseAdminUrl, supabaseServiceRole)
    console.log('[KYC Upload] Admin client created')

    // Verify bucket exists
    console.log('[KYC Upload] Checking bucket:', bucket)
    const { data: bucketInfo, error: bucketErr } = await adminClient.storage.getBucket(bucket)
    
    console.log('[KYC Upload] Bucket check result:')
    console.log('- Bucket data:', bucketInfo)
    console.log('- Bucket error:', bucketErr)
    
    if (bucketErr || !bucketInfo) {
      console.error('[KYC Upload] Bucket not found:', bucketErr)
      return NextResponse.json({ error: 'Storage bucket not found' }, { status: 500 })
    }
    
    console.log('[KYC Upload] Bucket verified successfully')

    for (const file of files) {
      console.log('[KYC Upload] Processing file:', file.name, 'Type:', file.type, 'Size:', file.size)
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        console.log('[KYC Upload] Invalid file type:', file.type)
        return NextResponse.json({ 
          error: `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}` 
        }, { status: 400 })
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        console.log('[KYC Upload] File too large:', file.size)
        return NextResponse.json({ 
          error: `File too large: ${file.name}. Maximum size is 10MB` 
        }, { status: 400 })
      }

      const arrayBuffer = await file.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
      const path = `users/${user.id}/${Date.now()}_${safeName}`
      
      console.log('[KYC Upload] Uploading to path:', path)
      
      const { error: upErr } = await adminClient.storage.from(bucket).upload(path, bytes, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })
      
      if (upErr) {
        console.error('[KYC Upload] Upload error:', upErr)
        return NextResponse.json({ error: `Upload failed for ${file.name}: ${upErr.message}` }, { status: 500 })
      }
      
      console.log('[KYC Upload] File uploaded successfully:', file.name)
      uploaded.push({ filename: file.name, size: file.size, path })
    }

    console.log('[KYC Upload] Upload process completed successfully')
    return NextResponse.json({ success: true, files: uploaded })
  } catch (e: any) {
    console.error('[KYC Upload] Unexpected error:', e)
    console.error('[KYC Upload] Error stack:', e?.stack)
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 })
  }
}

