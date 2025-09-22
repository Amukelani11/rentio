import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

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

    const bookingId = params.id
    console.log('🔄 [BOOKING-CONVERSATION] Creating conversation for booking:', bookingId)

    // Get booking details with listing and owner info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(
          id, 
          title, 
          user_id, 
          business_id,
          user:users(id, name, email),
          business:businesses(id, name, email)
        ),
        renter:users!renter_id(id, name, email)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      console.error('❌ [BOOKING-CONVERSATION] Booking not found:', bookingError)
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    console.log('📋 [BOOKING-CONVERSATION] Booking found:', {
      id: booking.id,
      renter_id: booking.renter_id,
      listing_user_id: booking.listing?.user_id,
      listing_business_id: booking.listing?.business_id
    })

    // Check if user is authorized (renter or owner)
    const isRenter = booking.renter_id === user.id
    const isOwner = booking.listing?.user_id === user.id || booking.listing?.business_id === user.id

    if (!isRenter && !isOwner) {
      console.error('❌ [BOOKING-CONVERSATION] User not authorized:', user.id)
      return NextResponse.json({ error: 'Unauthorized to create conversation for this booking' }, { status: 403 })
    }

    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id, title')
      .eq('booking_id', bookingId)
      .single()

    if (existingConversation) {
      console.log('✅ [BOOKING-CONVERSATION] Conversation already exists:', existingConversation.id)
      return NextResponse.json({ 
        success: true, 
        data: { conversation: existingConversation } 
      })
    }

    // Determine the other participant
    let otherUserId: string | undefined

    if (isRenter) {
      // For renter, find the business owner or user
      if (booking.listing?.user_id) {
        // Individual listing
        otherUserId = booking.listing.user_id
        console.log('👤 [BOOKING-CONVERSATION] Individual listing owner:', otherUserId)
      } else if (booking.listing?.business_id) {
        // Business listing - find a business representative
        const { data: teamMembers } = await supabase
          .from('team_members')
          .select('user_id')
          .eq('business_id', booking.listing.business_id)
          .limit(1)

        if (teamMembers && teamMembers.length > 0) {
          otherUserId = teamMembers[0].user_id
          console.log('🏢 [BOOKING-CONVERSATION] Business team member:', otherUserId)
        } else {
          // Fallback: use any admin user or the system user
          const { data: adminUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', 'kgahliso.sample@rentio.test')
            .single()

          otherUserId = adminUser?.id
          console.log('👑 [BOOKING-CONVERSATION] Fallback admin user:', otherUserId)
        }
      }
    } else {
      // For owner/business user, the other participant is the renter
      otherUserId = booking.renter_id
      console.log('👤 [BOOKING-CONVERSATION] Renter:', otherUserId)
    }

    if (!otherUserId) {
      console.error('❌ [BOOKING-CONVERSATION] Other participant not found')
      return NextResponse.json({ error: 'Other participant not found' }, { status: 404 })
    }

    // Create conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        booking_id: bookingId,
        listing_id: booking.listing.id,
        title: `Chat about ${booking.listing.title}`
      })
      .select('id, title')
      .single()

    if (conversationError || !conversation) {
      console.error('❌ [BOOKING-CONVERSATION] Create conversation error:', conversationError)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    console.log('✅ [BOOKING-CONVERSATION] Conversation created:', conversation.id)

    // Add participants
    const participants = [
      { conversation_id: conversation.id, user_id: user.id },
      { conversation_id: conversation.id, user_id: otherUserId }
    ]

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participants)

    if (participantsError) {
      console.error('❌ [BOOKING-CONVERSATION] Add participants error:', participantsError)
      return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 })
    }

    console.log('✅ [BOOKING-CONVERSATION] Participants added:', participants.length)

    // Send initial message
    const initialMessage = isRenter 
      ? "Hi! I have a question about my booking. Can you help me?"
      : "Hi! I received your booking request. How can I help you?"

    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        booking_id: bookingId,
        from_user_id: user.id,
        content: initialMessage,
        message_type: 'TEXT'
      })

    if (messageError) {
      console.error('❌ [BOOKING-CONVERSATION] Send initial message error:', messageError)
      // Don't fail the whole operation if message fails
    } else {
      console.log('✅ [BOOKING-CONVERSATION] Initial message sent')
    }

    return NextResponse.json({
      success: true,
      data: { conversation }
    })

  } catch (error) {
    console.error('💥 [BOOKING-CONVERSATION] API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}