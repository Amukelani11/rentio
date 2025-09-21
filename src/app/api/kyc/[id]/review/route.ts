import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'
import { sendEmail } from '@/lib/resend'
import { kycStatusEmail } from '@/emails/templates'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser(supabase)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { action, rejectionReason, notes } = body

    if (!action || !['approve', 'reject', 'request_more'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if ((action === 'reject' || action === 'request_more') && !rejectionReason) {
      return NextResponse.json({ error: 'Rejection reason required' }, { status: 400 })
    }

    // For admin reviewers use service-role client to bypass RLS so they can see any verification
    const { createClient } = await import('@supabase/supabase-js')
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    const db = (user.isAdmin && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : supabase

    // Get the verification to ensure it exists and is pending
    const { data: verification, error: fetchError } = await db
      .from('kyc_verifications')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 })
    }

    if (verification.status !== 'PENDING') {
      return NextResponse.json({ error: 'Verification is not pending' }, { status: 400 })
    }

    // Determine the new status based on action
    let newStatus: string
    let userKycStatus: 'VERIFIED' | 'REJECTED' | 'PENDING' | null = null
    switch (action) {
      case 'approve':
        newStatus = 'VERIFIED'
        userKycStatus = 'VERIFIED'
        break
      case 'reject':
        newStatus = 'REJECTED'
        userKycStatus = 'REJECTED'
        break
      case 'request_more':
        // Keep verification open but mark as pending until user resubmits
        newStatus = 'PENDING'
        userKycStatus = 'PENDING'
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update the verification
    const updateData: any = {
      status: newStatus,
      reviewed_at: new Date().toISOString(),
      reviewer_id: user.id,
      notes: notes || null,
    }

    // Only set rejection_reason for reject/request_more actions
    if (action === 'reject' || action === 'request_more') {
      updateData.rejection_reason = rejectionReason
    }

    const { data: updatedVerification, error: updateError } = await db
      .from('kyc_verifications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update verification error:', updateError)
      return NextResponse.json({ error: 'Failed to update verification' }, { status: 500 })
    }

    // Email the user about KYC decision (best-effort)
    try {
      const html = kycStatusEmail({
        name: verification?.user?.name || 'there',
        status: newStatus as any,
        reason: action !== 'approve' ? rejectionReason : undefined,
      })
      // Need user's email; fetch quickly
      const { data: u } = await db.from('users').select('email').eq('id', updatedVerification.user_id).single()
      if (u?.email) {
        await sendEmail({ to: u.email, subject: `KYC ${action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Update'}`, html })
      }
    } catch (e) {
      console.debug('[email] kyc notification skipped', e)
    }

    // Update the user's KYC status based on the action
    if (userKycStatus) {
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ kyc_status: userKycStatus })
        .eq('id', updatedVerification.user_id)

      if (userUpdateError) {
        console.error('Update user KYC status error:', userUpdateError)
        // Don't fail the entire operation, just log the error
      }
    }

    // Create notification for the user
    const notificationData = {
      user_id: updatedVerification.user_id,
      type: action === 'approve' ? 'KYC_APPROVED' : action === 'reject' ? 'KYC_REJECTED' : 'KYC_MORE_INFO_REQUIRED',
      title: action === 'approve' ? 'KYC Verification Approved' : 
             action === 'reject' ? 'KYC Verification Rejected' : 
             'KYC Verification - More Information Required',
      message: action === 'approve' ? 'Your KYC verification has been approved!' :
               action === 'reject' ? `Your KYC verification was rejected: ${rejectionReason}` :
               `Your KYC verification requires more information: ${rejectionReason}`,
      data: {
        verificationId: id,
        action,
        rejectionReason: action !== 'approve' ? rejectionReason : null,
        notes: notes || null,
      },
      channels: ['EMAIL', 'PUSH'],
    }

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notificationData)

    if (notificationError) {
      console.error('Create notification error:', notificationError)
      // Don't fail the entire operation, just log the error
    }

    return NextResponse.json({
      success: true,
      data: updatedVerification,
      message: `Verification ${action}d successfully`,
    })

  } catch (error) {
    console.error('Review verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}