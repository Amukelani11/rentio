import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const form = await request.formData()
    const file = form.get('file') as File | null
    const type = (form.get('type') as string) || 'logo' // 'logo' | 'cover'
    if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })
    if (!['logo', 'cover'].includes(type)) return NextResponse.json({ error: 'invalid type' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `business/${user.id}/${type}.${Date.now()}.${ext}`

    const { data: upload, error: uploadErr } = await supabase.storage
      .from('public')
      .upload(path, file, { upsert: true, cacheControl: '3600', contentType: file.type || undefined })

    if (uploadErr) {
      console.error('[business/media] upload error', uploadErr)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from('public').getPublicUrl(upload.path)

    // Update businesses row for this user
    const column = type === 'logo' ? 'logo_url' : 'cover_image_url'
    await supabase
      .from('businesses')
      .update({ [column]: publicUrl, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

    return NextResponse.json({ success: true, url: publicUrl })
  } catch (e) {
    console.error('[business/media] exception', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


