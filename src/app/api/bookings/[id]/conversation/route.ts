import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = params.id

    // Get booking details with listing and owner info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(
          *,
          user:user_id(*),
          business:business_id(*)
        )
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if user is involved in this booking
    const isRenter = booking.renter_id === user.id
    const isOwner = booking.listing?.user?.id === user.id || booking.listing?.business?.id === user.id

    if (!isRenter && !isOwner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if conversation already exists for this booking
    const { data: existingConversations, error: existingError } = await supabase
      .from('conversations')
      .select('id, booking_id')
      .eq('booking_id', bookingId)

    if (existingError) {
      console.error('Error checking existing conversation:', existingError)
    }

    if (existingConversations && existingConversations.length > 0) {
      // Return existing conversation
      const existingConversation = existingConversations[0]

      // Get full conversation data with participants
      const { data: fullConversation, error: fullConvError } = await supabase
        .from('conversations')
        .select(`
          *,
          booking:bookings(
            *,
            listing:listings(*)
          ),
          conversation_participants(
            user:user_id(id, name, email, avatar)
          )
        `)
        .eq('id', existingConversation.id)
        .single()

      if (fullConvError || !fullConversation) {
        return NextResponse.json({ error: 'Failed to load conversation' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        data: {
          conversation: fullConversation,
          message: 'Conversation already exists'
        }
      })
    }

    // Determine the other participant
    let otherUserId: string | undefined

    if (isRenter) {
      // For renter, find the business owner or user
      if (booking.listing?.user?.id) {
        // Individual listing
        otherUserId = booking.listing.user.id
      } else if (booking.listing?.business?.id) {
        // Business listing - find a business representative
        const { data: teamMembers } = await supabase
          .from('team_members')
          .select('user_id')
          .eq('business_id', booking.listing.business.id)
          .limit(1)

        if (teamMembers && teamMembers.length > 0) {
          otherUserId = teamMembers[0].user_id
        } else {
          // Fallback: use any admin user or the system user
          // For now, use a default admin user (you should customize this)
          const { data: adminUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', 'kgahliso.sample@rentio.test')
            .single()

          otherUserId = adminUser?.id
        }
      }
    } else {
      // For owner/business user, the other participant is the renter
      otherUserId = booking.renter_id
    }

    if (!otherUserId) {
      return NextResponse.json({ error: 'Other participant not found' }, { status: 404 })
    }

    // Create new conversation
    const { data: newConversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        booking_id: bookingId,
        listing_id: booking.listing_id,
        title: `Chat about ${booking.listing.title}`,
      })
      .select(`
        *,
        booking:bookings(
          *,
          listing:listings(*)
        )
      `)
      .single()

    if (conversationError || !newConversation) {
      console.error('Error creating conversation:', conversationError)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    // Add participants
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: newConversation.id, user_id: user.id },
        { conversation_id: newConversation.id, user_id: otherUserId }
      ])

    if (participantsError) {
      console.error('Error adding participants:', participantsError)
      return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 })
    }

    // Get conversation with participants
    const { data: conversationWithParticipants, error: participantsFetchError } = await supabase
      .from('conversations')
      .select(`
        *,
        booking:bookings(
          *,
          listing:listings(*)
        ),
        conversation_participants(
          user:user_id(id, name, email, avatar)
        )
      `)
      .eq('id', newConversation.id)
      .single()

    if (participantsFetchError || !conversationWithParticipants) {
      return NextResponse.json({ error: 'Failed to load conversation with participants' }, { status: 500 })
    }

    // Send initial message
    const initialMessage = isRenter
      ? `Hi! I have a question about my booking for "${booking.listing.title}"`
      : `Hi! I have a question about your booking for "${booking.listing.title}"`

    const { data: newMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        booking_id: bookingId,
        from_user_id: user.id,
        to_user_id: otherUserId,
        content: initialMessage,
        type: 'TEXT'
      })
      .select(`
        id,
        content,
        type,
        created_at,
        from_user_id,
        to_user_id,
        sender:from_user_id(id, name, email)
      `)
      .single()

    if (messageError) {
      console.error('Error sending initial message:', messageError)
      // Don't fail the whole operation if message fails
    }

    return NextResponse.json({
      success: true,
      data: {
        conversation: conversationWithParticipants,
        message: newMessage || null
      }
    })

  } catch (error) {
    console.error('Error creating conversation from booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}