import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Get conversations where user is a participant (either through bookings or direct conversations)
    // First get conversation IDs where user is a participant
    const { data: userParticipantConversations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id)

    const conversationIds = userParticipantConversations?.map(p => p.conversation_id) || []

    console.log('🔍 User conversations lookup:', {
      userId: user.id,
      conversationIds,
      total: conversationIds.length
    })

    if (conversationIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          total: 0,
          page,
          pageSize: limit,
          totalPages: 0,
        },
      })
    }

    // First get the conversations
    const { data: conversations, error, count } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('updated_at', { ascending: false })
      .range(from, to)

    // Filter by booking if specified
    let filteredConversations = conversations
    if (bookingId) {
      filteredConversations = conversations?.filter(c => c.booking_id === bookingId)
    }

    // Filter by user if specified
    if (userId) {
      // This would need additional logic to check participants
    }

    console.log('📋 Conversations query result:', {
      conversationIds,
      conversations: conversations?.length || 0,
      error,
      count,
      conversationsData: conversations
    })

    if (error) {
      console.error('❌ Get conversations error:', error)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    // Get participants for each conversation
    const conversationsWithParticipants = await Promise.all(
      (filteredConversations || []).map(async (conversation) => {
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select(`
            user_id,
            joined_at,
            user:users(id, name, email, avatar)
          `)
          .eq('conversation_id', conversation.id)

        return {
          ...conversation,
          conversation_participants: participants || []
        }
      })
    )

    // Get latest message for each conversation
    const conversationsWithMessages = await Promise.all(
      (conversationsWithParticipants || []).map(async (conversation) => {
        let messageQuery = supabase
          .from('messages')
          .select(`
            *,
            sender:users!from_user_id(id, name, avatar)
          `)
          .order('created_at', { ascending: false })
          .limit(1)

        // Handle both booking-based and direct conversations
        if (conversation.booking_id) {
          messageQuery = messageQuery.eq('booking_id', conversation.booking_id)
        } else {
          messageQuery = messageQuery.eq('conversation_id', conversation.id)
        }

        const { data: latestMessage } = await messageQuery.single()

        return {
          ...conversation,
          messages: latestMessage ? [latestMessage] : []
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        items: conversationsWithMessages,
        total: count || 0,
        page,
        pageSize: limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, participantIds, initialMessage } = body

    if (!bookingId || !participantIds || participantIds.length < 2) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user is part of the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(id, title, user_id, business_id),
        renter:users!renter_id(id, name)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const isOwner = booking.listing.user_id === user.id || booking.listing.business_id === user.id
    const isRenter = booking.renter_id === user.id

    if (!isOwner && !isRenter) {
      return NextResponse.json({ error: 'Unauthorized to create conversation for this booking' }, { status: 403 })
    }

    // Check if conversation already exists for this booking
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('booking_id', bookingId)
      .single()

    if (existingConversation) {
      return NextResponse.json({ error: 'Conversation already exists for this booking' }, { status: 400 })
    }

    // Create conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        booking_id: bookingId,
        title: `Chat about ${booking.listing.title}`,
      })
      .select()
      .single()

    if (conversationError) {
      console.error('Create conversation error:', conversationError)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    // Add participants
    const participantInserts = participantIds.map((userId: string) => ({
      conversation_id: conversation.id,
      user_id: userId,
    }))

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participantInserts)

    if (participantsError) {
      console.error('Add participants error:', participantsError)
      return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 })
    }

    // Send initial message if provided
    if (initialMessage) {
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          booking_id: bookingId,
          from_user_id: user.id,
          to_user_id: participantIds.find((id: string) => id !== user.id),
          content: initialMessage,
          type: 'TEXT',
          topic: `booking_${bookingId}`,
          extension: 'chat',
        })

      if (messageError) {
        console.error('Send initial message error:', messageError)
        // Don't fail the entire operation
      }
    }

    // Create notifications for other participants
    const otherParticipants = participantIds.filter((id: string) => id !== user.id)
    for (const participantId of otherParticipants) {
      await supabase
        .from('notifications')
        .insert({
          user_id: participantId,
          type: 'MESSAGE_RECEIVED',
          title: 'New Conversation Started',
          message: `You have a new conversation about "${booking.listing.title}"`,
          data: {
            conversationId: conversation.id,
            bookingId,
          },
          channels: ['EMAIL', 'PUSH'],
        })
    }

    return NextResponse.json({
      success: true,
      data: conversation,
    })
  } catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
