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

    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    // Get booking details with listing and owner info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(
          *,
          user:users(*),
          business:businesses(*)
        )
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if user is the renter of this booking
    if (booking.renter_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to access this booking' }, { status: 403 })
    }

    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('booking_id', bookingId)
      .single()

    if (existingConversation) {
      return NextResponse.json({ 
        conversationId: existingConversation.id,
        message: 'Conversation already exists'
      })
    }

    // Create new conversation
    const listingTitle = booking.listing?.title || 'Unknown Item'
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        booking_id: bookingId,
        title: `Chat about ${listingTitle}`,
      })
      .select()
      .single()

    if (conversationError || !conversation) {
      console.error('Error creating conversation:', conversationError)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    // Add participants to conversation
    const ownerId = booking.listing?.user_id || booking.listing?.business_id
    if (ownerId) {
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversation.id, user_id: booking.renter_id },
          { conversation_id: conversation.id, user_id: ownerId },
        ])

      if (participantsError) {
        console.error('Error adding participants:', participantsError)
        // Don't fail the request, conversation is created
      }
    }

    return NextResponse.json({ 
      conversationId: conversation.id,
      message: 'Conversation created successfully'
    })

  } catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
