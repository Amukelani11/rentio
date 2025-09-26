import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { toUserId, listingId, content, listingTitle } = body

    console.log('🚀 Direct message API called:', {
      fromUserId: user.id,
      fromUserName: user.name,
      toUserId,
      listingId,
      content: content.substring(0, 50) + '...',
      listingTitle
    })

    if (!toUserId || !content || !listingId) {
      console.error('❌ Missing required fields:', { toUserId, content: !!content, listingId })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if the recipient exists
    const { data: recipient } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', toUserId)
      .single()

    console.log('👤 Recipient lookup:', { recipient })

    if (!recipient) {
      console.error('❌ Recipient not found:', toUserId)
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    // Check if the listing exists and belongs to the recipient
    const { data: listing } = await supabase
      .from('listings')
      .select('id, title, user_id, business_id')
      .eq('id', listingId)
      .single()

    console.log('🏠 Listing lookup:', { listing })

    if (!listing) {
      console.error('❌ Listing not found:', listingId)
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const isOwner = listing.user_id === toUserId || listing.business_id === toUserId
    console.log('🔐 Owner check:', { 
      listingUserId: listing.user_id, 
      listingBusinessId: listing.business_id, 
      toUserId, 
      isOwner 
    })
    
    if (!isOwner) {
      console.error('❌ User is not the owner of this listing')
      return NextResponse.json({ error: 'User is not the owner of this listing' }, { status: 403 })
    }

    // Check if a conversation already exists between these users for this listing
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select(`
        id,
        booking_id,
        listing_id,
        participants:conversation_participants(user_id)
      `)
      .eq('listing_id', listingId)

    console.log('💬 Conversation lookup:', { 
      conversations, 
      conversationsError, 
      listingId 
    })

    // Find conversation where both users are participants
    let existingConversation = null
    if (conversations && conversations.length > 0) {
      console.log('🔍 Checking existing conversations...')
      for (const conv of conversations) {
        const participantIds = conv.participants?.map((p: any) => p.user_id) || []
        console.log(`  Conversation ${conv.id}: participants =`, participantIds)
        if (participantIds.includes(user.id) && participantIds.includes(toUserId)) {
          existingConversation = conv
          console.log('✅ Found existing conversation:', conv.id)
          break
        }
      }
    }

    if (!existingConversation) {
      console.log('🆕 No existing conversation found, will create new one')
    }

    let conversationId: string
    let bookingId: string | null = null

    if (existingConversation) {
      // Use existing conversation
      conversationId = existingConversation.id
      bookingId = existingConversation.booking_id
      console.log('📞 Using existing conversation:', conversationId)
    } else {
      // Create a new conversation for this listing (without booking)
      console.log('🆕 Creating new conversation...')
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          listing_id: listingId,
          title: `Chat about ${listing.title}`,
          booking_id: null, // No booking required for direct messages
        })
        .select()
        .single()

      console.log('💾 Conversation creation result:', { newConversation, conversationError })

      if (conversationError) {
        console.error('❌ Create conversation error:', conversationError)
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
      }

      conversationId = newConversation.id
      console.log('✅ New conversation created:', conversationId)

      // Add participants
      const participantInserts = [
        { conversation_id: conversationId, user_id: user.id },
        { conversation_id: conversationId, user_id: toUserId },
      ]

      console.log('👥 Adding participants:', participantInserts)

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participantInserts)

      console.log('👥 Participants insertion result:', { participantsError })

      if (participantsError) {
        console.error('❌ Add participants error:', participantsError)
        return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 })
      }

      console.log('✅ Participants added successfully')
    }

    // Create the message
    console.log('💌 Creating message...')
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        booking_id: bookingId,
        conversation_id: conversationId,
        from_user_id: user.id,
        to_user_id: toUserId,
        content,
        type: 'TEXT',
        topic: `listing_${listingId}`,
        extension: 'chat',
        is_read: false,
      })
      .select(`
        *,
        sender:users!from_user_id(id, name, avatar)
      `)
      .single()

    console.log('💌 Message creation result:', { message, messageError })

    if (messageError) {
      console.error('❌ Send message error:', messageError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    console.log('✅ Message created successfully:', message.id)

    // Update conversation last message
    await supabase
      .from('conversations')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)

    // Create notification for recipient
    await supabase
      .from('notifications')
      .insert({
        user_id: toUserId,
        type: 'MESSAGE_RECEIVED',
        title: 'New Message',
        message: `You have a new message from ${user.name} about "${listing.title}"`,
        data: {
          conversationId,
          messageId: message.id,
          listingId,
        },
        channels: ['PUSH'],
      })

    console.log('🎉 Direct message API completed successfully:', {
      conversationId,
      messageId: message.id,
      fromUserId: user.id,
      toUserId,
      listingId
    })

    return NextResponse.json({
      success: true,
      data: {
        message,
        conversationId,
      },
    })
  } catch (error) {
    console.error('Send direct message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


