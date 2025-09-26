import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const from = (page - 1) * limit
    const to = from + limit - 1

    // For admins, use service role client to bypass RLS for wide queries
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    const dbClient = (user.isAdmin && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : supabase

    // First, get the verifications
    let query = dbClient
      .from('kyc_verifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    // Users can only see their own verifications unless they're admin
    if (!user.isAdmin) {
      query = query.eq('user_id', user.id)
    } else if (userId) {
      query = query.eq('user_id', userId)
    }

    if (status) query = query.eq('status', status)
    if (type) query = query.eq('type', type)

    const { data: verifications, error, count } = await query

    if (error) {
      console.error('Get KYC verifications error:', error)
      return NextResponse.json({ error: 'Failed to fetch verifications' }, { status: 500 })
    }

    // Now fetch user data for each verification
    const verificationsWithUsers = await Promise.all(
      (verifications || []).map(async (v: any) => {
        // Get user data
        const { data: u } = await dbClient
          .from('users')
          .select('id, name, email, kyc_status, email_verified, phone_verified, avatar, created_at')
          .eq('id', v.user_id)
          .single()

        // Get reviewer data if exists
        let reviewerData: any = null
        if (v.reviewer_id) {
          const { data: reviewer } = await dbClient
            .from('users')
            .select('id, name')
            .eq('id', v.reviewer_id)
            .single()
          reviewerData = reviewer
        }

        return {
          id: v.id,
          type: v.type,
          status: v.status,
          documents: v.documents || [],
          additionalInfo: v.additional_info || null,
          rejectionReason: v.rejection_reason || null,
          notes: v.notes || null,
          createdAt: v.created_at,
          reviewedAt: v.reviewed_at || null,
          reviewer: reviewerData ? { name: reviewerData.name } : undefined,
          user: u ? {
            id: u.id,
            name: u.name || u.email,
            email: u.email,
            kyc_status: u.kyc_status,
            email_verified: u.email_verified,
            phone_verified: u.phone_verified,
            avatar: u.avatar || null,
            created_at: u.created_at,
          } : null,
        }
      })
    )

    console.log('[api/kyc] items:', verificationsWithUsers?.length || 0, 'count:', count)
    return NextResponse.json({
      success: true,
      data: {
        items: verificationsWithUsers || [],
        total: count || 0,
        page,
        pageSize: limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Get KYC verifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, documents, additionalInfo } = body

    if (!type || !documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate document requirements based on type
    const requiredDocs = getRequiredDocuments(type)
    const validationResult = validateDocuments(documents, requiredDocs)
    if (!validationResult.valid) {
      return NextResponse.json({ 
        error: validationResult.error 
      }, { status: 400 })
    }

    // Check if user already has a pending verification of this type
    const { data: existingVerification } = await supabase
      .from('kyc_verifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', type)
      .eq('status', 'PENDING')
      .single()

    if (existingVerification) {
      return NextResponse.json({ 
        error: 'You already have a pending verification of this type' 
      }, { status: 400 })
    }

    // Create verification
    const { data: verification, error: createError } = await supabase
      .from('kyc_verifications')
      .insert({
        user_id: user.id,
        type,
        status: 'PENDING',
        documents,
        additional_info: additionalInfo,
      })
      .select()
      .single()

    if (createError) {
      console.error('Create KYC verification error:', createError)
      return NextResponse.json({ error: 'Failed to create verification' }, { status: 500 })
    }

    // Create notification for admins
    const { data: admins } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('is_admin', true)

    if (admins) {
      for (const admin of admins) {
        await supabase
          .from('notifications')
          .insert({
            user_id: admin.user_id,
            type: 'KYC_SUBMITTED',
            title: 'New KYC Verification Submitted',
            message: `${user.name} has submitted ${type} verification for review`,
            data: {
              verificationId: verification.id,
              userId: user.id,
              type,
            },
            channels: ['EMAIL', 'PUSH'],
          })
      }
    }

    return NextResponse.json({
      success: true,
      data: verification,
      message: 'KYC verification submitted successfully',
    })
  } catch (error) {
    console.error('Create KYC verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getRequiredDocuments(type: string) {
  switch (type) {
    case 'IDENTITY':
      return [
        { type: 'ID_FRONT', name: 'ID Document (Front)' },
        { type: 'ID_BACK', name: 'ID Document (Back)' },
        { type: 'SELFIE', name: 'Selfie with ID' },
      ]
    case 'ADDRESS':
      return [
        { 
          type: 'ADDRESS_PROOF', 
          name: 'Address Proof (Bank Statement OR Utility Bill)', 
          alternatives: ['BANK_STATEMENT', 'UTILITY_BILL'] 
        },
      ]
    case 'BUSINESS':
      return [
        { type: 'BUSINESS_REGISTRATION', name: 'Business Registration Certificate' },
        { type: 'TAX_CLEARANCE', name: 'Tax Clearance Certificate' },
        { type: 'BUSINESS_ADDRESS', name: 'Business Address Proof' },
      ]
    default:
      return []
  }
}

function validateDocuments(documents: any[], requiredDocs: any[]) {
  for (const reqDoc of requiredDocs) {
    if (reqDoc.alternatives) {
      // Handle either/or requirements
      const hasAnyAlternative = reqDoc.alternatives.some((altType: string) => 
        documents.some((doc: any) => doc.type === altType)
      )
      if (!hasAnyAlternative) {
        return {
          valid: false,
          error: `Missing required document: ${reqDoc.name}`
        }
      }
    } else {
      // Handle single required document
      const hasDoc = documents.some((doc: any) => doc.type === reqDoc.type)
      if (!hasDoc) {
        return {
          valid: false,
          error: `Missing required document: ${reqDoc.name}`
        }
      }
    }
  }
  return { valid: true }
}
