import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversationId = params.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Check if user is participant in the conversation
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (!participant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get the conversation details
    const { data: conversation } = await supabase
      .from('conversations')
      .select('booking_id, listing_id')
      .eq('id', conversationId)
      .single()

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Mark messages as read
    let readQuery = supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('to_user_id', user.id)
      .eq('is_read', false)

    if (conversation.booking_id) {
      readQuery = readQuery.eq('booking_id', conversation.booking_id)
    } else {
      readQuery = readQuery.eq('conversation_id', conversationId)
    }

    await readQuery

    // Get messages for this conversation
    let messagesQuery = supabase
      .from('messages')
      .select(`
        *,
        sender:users!from_user_id(id, name, avatar)
      `)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (conversation.booking_id) {
      messagesQuery = messagesQuery.eq('booking_id', conversation.booking_id)
    } else {
      messagesQuery = messagesQuery.eq('conversation_id', conversationId)
    }

    const { data: messages, error, count } = await messagesQuery

    if (error) {
      console.error('Get messages error:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        items: (messages || []).reverse(), // Reverse to show oldest first
        total: count || 0,
        page,
        pageSize: limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversationId = params.id
    const body = await request.json()
    const { content, type = 'TEXT', mediaUrl } = body

    if (!content && !mediaUrl) {
      return NextResponse.json({ error: 'Message content or media required' }, { status: 400 })
    }

    // Check if user is participant in the conversation
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (!participant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get conversation details
    const { data: conversation } = await supabase
      .from('conversations')
      .select('booking_id, listing_id')
      .eq('id', conversationId)
      .single()

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Get other participants
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', user.id)

    const otherParticipants = participants || []
    const toUserId = otherParticipants[0]?.user_id

    // Create message
    const messageData: any = {
      conversation_id: conversationId,
      from_user_id: user.id,
      to_user_id: toUserId,
      content: content || 'Media message',
      type,
      attachments: mediaUrl ? [{ url: mediaUrl, type: 'image' }] : null,
      is_read: false,
    }

    // Add booking_id if it exists, otherwise use listing-based topic
    if (conversation.booking_id) {
      messageData.booking_id = conversation.booking_id
      messageData.topic = `booking_${conversation.booking_id}`
    } else {
      messageData.topic = `listing_${conversation.listing_id}`
    }

    messageData.extension = 'chat'

    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert(messageData)
      .select(`
        *,
        sender:users!from_user_id(id, name, avatar)
      `)
      .single()

    if (messageError) {
      console.error('Send message error:', messageError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Update conversation last message
    await supabase
      .from('conversations')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)

    // Create notifications for other participants
    for (const participant of otherParticipants) {
      const notificationData: any = {
        user_id: participant.user_id,
        type: 'MESSAGE_RECEIVED',
        title: 'New Message',
        message: `You have a new message from ${user.name}`,
        data: {
          conversationId,
          messageId: message.id,
        },
        channels: ['PUSH'],
      }

      // Add booking or listing reference
      if (conversation.booking_id) {
        notificationData.data.bookingId = conversation.booking_id
      } else {
        notificationData.data.listingId = conversation.listing_id
      }

      await supabase
        .from('notifications')
        .insert(notificationData)
    }

    return NextResponse.json({
      success: true,
      data: message,
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}