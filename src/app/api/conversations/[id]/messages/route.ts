import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'
import { sendEmail } from '@/lib/resend'
import { notifyParticipantsByEmail } from '@/lib/messaging'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://rentio.co.za'

const ALLOWED_MESSAGE_TYPES = new Set(['TEXT', 'IMAGE', 'FILE', 'SYSTEM'])

type ParticipantRecord = {
  user_id: string
  user: {
    id: string
    name: string | null
    email: string | null
    avatar?: string | null
  } | null
}

type ConversationRecord = {
  id: string
  booking_id?: string | null
  title?: string | null
  conversation_participants?: ParticipantRecord[]
}

function normalizeMessageType(type: unknown) {
  if (typeof type === 'string') {
    const formatted = type.toUpperCase()
    if (ALLOWED_MESSAGE_TYPES.has(formatted)) {
      return formatted
    }
  }
  return 'TEXT'
}

function mapParticipants(rows: any[] | null | undefined): ParticipantRecord[] {
  if (!rows) {
    return []
  }

  return rows
    .filter((row) => row && row.user_id)
    .map((row) => ({
      user_id: String(row.user_id),
      user: row.user
        ? {
            id: String(row.user.id),
            name: row.user.name ?? null,
            email: row.user.email ?? null,
            avatar: row.user.avatar ?? null
          }
        : null
    }))
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversationId = params.id

    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (participantError || !participant) {
      console.error('[MESSAGES][GET] Participant check failed:', { participantError, participant })
      return NextResponse.json({ error: 'Unauthorized to view this conversation' }, { status: 403 })
    }


    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!from_user_id(id, name, avatar)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        items: messages ?? [],
        total: messages?.length ?? 0
      }
    })
  } catch (error) {
    console.error('[MESSAGES] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversationId = params.id
    const body = await request.json().catch(() => ({}))
    const content = typeof body.content === 'string' ? body.content.trim() : ''
    const messageType = normalizeMessageType(body.type)

    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select(`
        id,
        booking_id,
        title,
        conversation_participants (
          user_id,
          user:users(id, name, email, avatar)
        )
      `)
      .eq('id', conversationId)
      .maybeSingle()

    if (conversationError || !conversation) {
      console.error('[MESSAGES][POST] Conversation lookup failed:', { conversationError, conversation })
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    console.log('[MESSAGES][POST] Conversation found:', conversation.id)

    const conversationRecord: ConversationRecord = {
      id: conversation.id,
      booking_id: conversation.booking_id,
      title: conversation.title,
      conversation_participants: mapParticipants(conversation.conversation_participants)
    }

    let participants = mapParticipants(conversationRecord.conversation_participants)
    let recipients = participants.filter((participant) => participant.user_id !== user.id)

    if (recipients.length === 0) {
      console.log('[MESSAGES][POST] No initial recipients, attempting to resolve...')
      const resolution = await ensureRecipients(supabase, conversationRecord, user.id)
      participants = resolution.participants
      recipients = resolution.recipients
    }

    console.log('[MESSAGES][POST] Recipients found:', recipients.length)

    if (recipients.length === 0) {
      console.error('[MESSAGES][POST] No recipients after resolution attempt')
      return NextResponse.json({ error: 'No other participants found in conversation' }, { status: 400 })
    }

    const messagePayload: Record<string, unknown> = {
      conversation_id: conversationId,
      from_user_id: user.id,
      to_user_id: recipients[0].user_id,
      content,
      type: messageType
    }

    if (conversationRecord.booking_id) {
      messagePayload.booking_id = conversationRecord.booking_id
    }

    console.log('[MESSAGES][POST] Creating message with payload:', messagePayload)

    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert(messagePayload)
      .select(`
        *,
        sender:users!from_user_id(id, name, avatar)
      `)
      .single()

    if (messageError || !message) {
      console.error('[MESSAGES][POST] Message creation failed:', messageError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    console.log('[MESSAGES][POST] Message created successfully:', message.id)

    conversationRecord.conversation_participants = participants

    // For testing, you can temporarily enable forceSend to bypass activity checks
    notifyParticipantsByEmail(supabase, conversationRecord, message, user, { forceSend: false }).catch((emailError) => {
      console.error('[EMAIL] Failed to send notification', emailError)
    })

    // For immediate testing, uncomment the line below to force send emails
    // notifyParticipantsByEmail(supabase, conversationRecord, message, user, { forceSend: true }).catch((emailError) => {
    //   console.error('[EMAIL] Failed to force send notification', emailError)
    // })

    return NextResponse.json({
      success: true,
      data: { message }
    })
  } catch (error) {
    console.error('[MESSAGES] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function ensureRecipients(
  supabase: any,
  conversation: ConversationRecord,
  currentUserId: string
): Promise<{ participants: ParticipantRecord[]; recipients: ParticipantRecord[] }> {
  // Start with any nested participants present
  let participants = mapParticipants(conversation.conversation_participants)

  // Also fetch direct participants (more reliable under RLS than nested selects)
  const { data: directRows } = await supabase
    .from('conversation_participants')
    .select(`
      user_id,
      user:users(id, name, email, avatar)
    `)
    .eq('conversation_id', conversation.id)

  const directParticipants = mapParticipants(directRows)
  // Merge (by user_id)
  const mergedById = new Map<string, ParticipantRecord>()
  for (const p of [...participants, ...directParticipants]) {
    mergedById.set(p.user_id, mergedById.get(p.user_id) ?? p)
  }
  participants = Array.from(mergedById.values())

  let recipients = participants.filter((participant) => participant.user_id !== currentUserId)

  if (recipients.length > 0) {
    return { participants, recipients }
  }

  if (!conversation.booking_id) {
    console.warn('[MESSAGES] Cannot derive participants without booking context for conversation %s', conversation.id)
    return { participants, recipients: [] }
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id,
      renter_id,
      listing:listings(
        id,
        user_id,
        business_id
      )
    `)
    .eq('id', conversation.booking_id)
    .maybeSingle()

  if (!booking) {
    console.warn('[MESSAGES] Booking %s not found for conversation %s', conversation.booking_id, conversation.id)
    return { participants, recipients: [] }
  }

  console.log('[MESSAGES] Found booking:', booking.id)

  const candidateUserIds = new Set<string>()

  console.log('[MESSAGES] Current user ID:', currentUserId)
  console.log('[MESSAGES] Booking renter ID:', booking.renter_id)
  console.log('[MESSAGES] Listing user ID:', booking.listing?.user_id)
  console.log('[MESSAGES] Listing business ID:', booking.listing?.business_id)

  if (booking.renter_id && booking.renter_id !== currentUserId) {
    candidateUserIds.add(String(booking.renter_id))
  }

  const listing = booking.listing ?? null

  if (listing?.user_id && listing.user_id !== currentUserId) {
    candidateUserIds.add(String(listing.user_id))
  }

  if ((!listing?.user_id || candidateUserIds.size === 0) && listing?.business_id) {
    console.log('[MESSAGES] Looking for team members for business:', listing.business_id)
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('business_id', listing.business_id)

    console.log('[MESSAGES] Found team members:', teamMembers?.length || 0)

    for (const member of teamMembers ?? []) {
      const memberId = member?.user_id
      if (memberId && memberId !== currentUserId) {
        candidateUserIds.add(String(memberId))
      }
    }

    // Fallback: include business owner if still no candidates
    if (candidateUserIds.size === 0) {
      console.log('[MESSAGES] No team members found, trying business owner')
      const { data: businessOwner } = await supabase
        .from('businesses')
        .select('user_id')
        .eq('id', listing.business_id)
        .maybeSingle()

      if (businessOwner?.user_id && businessOwner.user_id !== currentUserId) {
        console.log('[MESSAGES] Found business owner:', businessOwner.user_id)
        candidateUserIds.add(String(businessOwner.user_id))
      } else {
        console.log('[MESSAGES] No business owner found')
      }
    }
  }

  console.log('[MESSAGES] Final candidate user IDs:', Array.from(candidateUserIds))

  if (candidateUserIds.size === 0) {
    console.warn('[MESSAGES] No candidates found for conversation %s', conversation.id)
    // Return existing participants (even if only current user); no recipients
    return { participants, recipients: [] }
  }

  const newParticipants = Array.from(candidateUserIds)
    .filter((userId) => !participants.some((participant) => participant.user_id === userId))
    .map((userId) => ({
      conversation_id: conversation.id,
      user_id: userId
    }))

  if (newParticipants.length > 0) {
    await supabase
      .from('conversation_participants')
      .upsert(newParticipants, { onConflict: 'conversation_id,user_id' })
  }

  // Build recipients from candidate IDs even if RLS hides them
  for (const uid of candidateUserIds) {
    if (!participants.some((p) => p.user_id === uid)) {
      participants.push({ user_id: uid, user: null })
    }
  }

  const updatedRecipients = participants.filter((p) => p.user_id !== currentUserId)
  conversation.conversation_participants = participants
  return { participants, recipients: updatedRecipients }
}

