import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { toUserId, listingId } = body

    if (!toUserId || !listingId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if the listing exists and belongs to the recipient
    const { data: listing } = await supabase
      .from('listings')
      .select('id, title, user_id, business_id')
      .eq('id', listingId)
      .single()

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const isOwner = listing.user_id === toUserId || listing.business_id === toUserId
    if (!isOwner) {
      return NextResponse.json({ error: 'User is not the owner of this listing' }, { status: 403 })
    }

    // Check if a conversation already exists between these users for this listing
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select(`
        id,
        booking_id,
        participants:conversation_participants(user_id)
      `)
      .eq('listing_id', listingId)
      .single()

    let conversationId: string

    if (existingConversation) {
      // Use existing conversation
      conversationId = existingConversation.id
    } else {
      // Create a new conversation for this listing (without booking)
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          listing_id: listingId,
          title: `Chat about ${listing.title}`,
          booking_id: null, // No booking required for direct messages
        })
        .select()
        .single()

      if (conversationError) {
        console.error('Create conversation error:', conversationError)
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
      }

      conversationId = newConversation.id

      // Add participants
      const participantInserts = [
        { conversation_id: conversationId, user_id: user.id },
        { conversation_id: conversationId, user_id: toUserId },
      ]

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participantInserts)

      if (participantsError) {
        console.error('Add participants error:', participantsError)
        return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        conversationId,
        listingId,
        listingTitle: listing.title,
      },
    })
  } catch (error) {
    console.error('Find or create conversation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}