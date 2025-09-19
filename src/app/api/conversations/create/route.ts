import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, message, recipientId } = body;

    if (!listingId || !message || !recipientId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get listing details
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, title, user_id')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Check if user is trying to message themselves
    if (user.id === recipientId) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
    }

    // Check if listing owner matches recipient
    if (listing.user_id !== recipientId) {
      return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 });
    }

    // Check if conversation already exists between these users for this listing
    const { data: existingConversations, error: existingError } = await supabase
      .from('conversations')
      .select(`
        id,
        booking_id,
        conversation_participants(user_id)
      `)
      .eq('listing_id', listingId);

    if (existingError) {
      console.error('Error checking existing conversation:', existingError);
    }

    // Find conversation that has both users as participants
    const existingConversation = existingConversations?.find(conv => {
      const participantIds = conv.conversation_participants?.map((p: any) => p.user_id) || [];
      return participantIds.includes(user.id) && participantIds.includes(recipientId);
    });

    let conversationId: string;

    if (existingConversation) {
      // Use existing conversation
      conversationId = existingConversation.id;
    } else {
      // Create new conversation
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          listing_id: listingId,
          title: `Chat about ${listing.title}`,
        })
        .select('id')
        .single();

      if (conversationError || !newConversation) {
        console.error('Error creating conversation:', conversationError);
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
      }

      conversationId = newConversation.id;

      // Add participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversationId, user_id: user.id },
          { conversation_id: conversationId, user_id: recipientId }
        ]);

      if (participantsError) {
        console.error('Error adding participants:', participantsError);
        return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 });
      }
    }

    // Create a temporary booking for the conversation (required by messages table)
    // We'll create a pending booking that can be converted to a real booking later
    const { data: tempBooking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_number: `TEMP-${Date.now()}`,
        listing_id: listingId,
        renter_id: user.id,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
        duration: 1,
        unit_price: 0,
        subtotal: 0,
        deposit_amount: 0,
        total_amount: 0,
        status: 'PENDING',
        payment_status: 'PENDING'
      })
      .select('id')
      .single();

    if (bookingError || !tempBooking) {
      console.error('Error creating temp booking:', bookingError);
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    // Update conversation with booking_id
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ booking_id: tempBooking.id })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation with booking_id:', updateError);
    }

    // Send the message
    const { data: newMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        booking_id: tempBooking.id,
        from_user_id: user.id,
        to_user_id: recipientId,
        content: message,
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
      .single();

    if (messageError || !newMessage) {
      console.error('Error sending message:', messageError);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      conversationId,
      message: newMessage
    });

  } catch (error) {
    console.error('Error in create conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
