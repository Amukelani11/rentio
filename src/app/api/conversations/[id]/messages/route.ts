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
    console.log('📨 [MESSAGES] Fetching messages for conversation:', conversationId)

    // Check if user is a participant in this conversation
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (!participant) {
      return NextResponse.json({ error: 'Unauthorized to view this conversation' }, { status: 403 })
    }

    // Get messages for this conversation
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!from_user_id(id, name, avatar)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ [MESSAGES] Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    console.log('📨 [MESSAGES] Found messages:', messages?.length || 0)

    return NextResponse.json({
      success: true,
      data: {
        items: messages || [],
        total: messages?.length || 0
      }
    })
  } catch (error) {
    console.error('💥 [MESSAGES] Get messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
    const { content, message_type = 'TEXT' } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    console.log('📤 [MESSAGES] Sending message to conversation:', conversationId)

    // Check if user is a participant in this conversation
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (!participant) {
      return NextResponse.json({ error: 'Unauthorized to send messages to this conversation' }, { status: 403 })
    }

    // Get conversation details to find booking_id
    const { data: conversation } = await supabase
      .from('conversations')
      .select('booking_id')
      .eq('id', conversationId)
      .single()

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        booking_id: conversation?.booking_id,
        from_user_id: user.id,
        content: content.trim(),
        message_type
      })
      .select(`
        *,
        sender:users!from_user_id(id, name, avatar)
      `)
      .single()

    if (error) {
      console.error('❌ [MESSAGES] Error creating message:', error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    console.log('✅ [MESSAGES] Message sent successfully:', message.id)

    return NextResponse.json({
      success: true,
      data: { message }
    })
  } catch (error) {
    console.error('💥 [MESSAGES] Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}