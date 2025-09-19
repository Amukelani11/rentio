import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    // Route-handler client to authenticate using request cookies
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // allow caller to override bucket via form field or query param; default to 'previews'
    const overrideBucketFromForm = formData.get('bucket')
    const url = new URL(request.url)
    const overrideBucketFromQuery = url.searchParams.get('bucket')
    const bucket = String(overrideBucketFromForm || overrideBucketFromQuery || process.env.SUPABASE_STORAGE_BUCKET || 'previews')
    const uploadedUrls: string[] = []

    // If a service role is configured, ensure bucket exists (best-effort)
    // Accept either SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL for admin client URL
    const supabaseAdminUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
    let adminClient: ReturnType<typeof createClient> | null = null
    if (supabaseAdminUrl && supabaseServiceRole) {
      try {
        adminClient = createClient(supabaseAdminUrl, supabaseServiceRole)
        const { data: bucketInfo, error: bucketErr } = await adminClient.storage.getBucket(bucket)
        if (bucketErr || !bucketInfo) {
          // create bucket (public)
          await adminClient.storage.createBucket(bucket, { public: true })
        }
      } catch (e) {
        console.debug('Bucket ensure failed (may already exist)', e)
        adminClient = null
      }
    }
    // choose upload client: admin (service role) if configured, otherwise the authenticated route client
    const uploadClient = adminClient || supabase
    // Debug: show whether service role env is present (masked) and which client is used
    try {
      const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
      const masked = hasServiceRole ? 'present' : 'absent'
      console.debug(`[listings/upload] DEBUG serviceRole=${masked} supabaseAdminUrl=${Boolean(supabaseAdminUrl)} bucket=${bucket} usingAdmin=${Boolean(adminClient)}`)
    } catch (e) {
      console.debug('[listings/upload] DEBUG could not read env for logs', e)
    }

    for (const file of files) {
      if (!(file instanceof File)) continue
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const filename = `${Date.now()}_${file.name.replace(/[^a-z0-9.\-]/gi, '_')}`
      const path = `listings/${user.id}/${filename}`

      const uploadRes = await uploadClient.storage.from(bucket).upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      })

      if (uploadRes.error) {
        console.error('Storage upload error', uploadRes.error)
        continue
      }

      const { data: publicData } = uploadClient.storage.from(bucket).getPublicUrl(path)
      uploadedUrls.push(publicData.publicUrl)
    }

    return NextResponse.json({ success: true, urls: uploadedUrls })
  } catch (e: any) {
    console.error('Upload error', e)
    return NextResponse.json({ error: 'Server error', details: e?.message ?? String(e) }, { status: 500 })
  }
}


