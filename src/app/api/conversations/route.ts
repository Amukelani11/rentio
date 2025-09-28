import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

function extractListingImage(listing: any): string | null {
  if (!listing) return null

  const candidates: string[] = []
  const pushIfString = (value: unknown) => {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed.length > 0) candidates.push(trimmed)
    }
  }

  if (Array.isArray(listing.images)) {
    listing.images.forEach(pushIfString)
  }

  return candidates.length > 0 ? candidates[0] : null
}

function selectLatestMessageState(messages: any[]): { content: string | null; createdAt: string | null; readAt: string | null; fromUserId: string | null } {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { content: null, createdAt: null, readAt: null, fromUserId: null }
  }

  const sorted = [...messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const latest = sorted[0]

  return {
    content: latest?.content ?? null,
    createdAt: latest?.created_at ?? null,
    readAt: latest?.read_at ?? null,
    fromUserId: latest?.from_user_id ?? null,
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    const hasServiceCreds = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    const serviceClient = hasServiceCreds
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string)
      : null
    const bookingId = searchParams.get('bookingId')
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const from = (page - 1) * limit
    const to = from + limit - 1

    console.log('🔍 [CONVERSATIONS] Starting conversation lookup for user:', user.id)

    // Get conversation IDs where user is a participant
    const { data: userParticipantConversations, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id)

    if (participantError) {
      console.error('❌ [CONVERSATIONS] Error fetching participant conversations:', participantError)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    const conversationIds = userParticipantConversations?.map(p => p.conversation_id) || []
    console.log('🔍 [CONVERSATIONS] Found conversation IDs:', conversationIds)

    if (conversationIds.length === 0) {
      console.log('📭 [CONVERSATIONS] No conversations found for user')
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

    // Get conversations
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select(`
        *,
        listing:listings!conversations_listing_id_fkey (
          id,
          title,
          slug,
          images,
          user:users(id, name),
          business:businesses(id, name)
        )
      `)
      .in('id', conversationIds)
      .order('updated_at', { ascending: false })
      .range(from, to)

    if (conversationsError) {
      console.error('❌ [CONVERSATIONS] Error fetching conversations:', conversationsError)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    console.log('📋 [CONVERSATIONS] Found conversations:', conversations?.length || 0)

    // Filter by booking if specified
    let filteredConversations = conversations
    if (bookingId) {
      filteredConversations = conversations?.filter(c => c.booking_id === bookingId)
      console.log('🎯 [CONVERSATIONS] Filtered by booking:', bookingId, 'found:', filteredConversations?.length || 0)
    }

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

        let listingDetails: any = null

        const buildListingDetails = (listingData?: any) => {
          if (!listingData) return null
          return {
            id: listingData.id,
            title: listingData.title ?? null,
            slug: listingData.slug ?? null,
            image: extractListingImage(listingData),
            ownerName: listingData.business?.name ?? listingData.user?.name ?? null,
            ownerType: listingData.business?.name ? 'business' : 'individual',
            ownerUserId: listingData.user?.id ?? null
          }
        }

        const conversationListing = (conversation as any).listing

        if (conversationListing) {
          listingDetails = buildListingDetails(conversationListing)
        } else if (conversation.listing_id && serviceClient) {
          const { data: listingData } = await serviceClient
            .from('listings')
            .select(`
              id,
              title,
              slug,
              images,
              user:users(id, name),
              business:businesses(id, name)
            `)
            .eq('id', conversation.listing_id)
            .maybeSingle()

          listingDetails = buildListingDetails(listingData)
        }

        return {
          ...conversation,
          conversation_participants: participants || [],
          listing_details: listingDetails,
        }
      })
    )

    const conversationsWithMessages = await Promise.all(
      (conversationsWithParticipants || []).map(async (conversation) => {
        let messageQuery = supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            is_read,
            read_at,
            from_user_id,
            to_user_id,
            sender:users!from_user_id(id, name, avatar)
          `)
          .order('created_at', { ascending: false })
          .limit(1)

        if (conversation.booking_id) {
          messageQuery = messageQuery.eq('booking_id', conversation.booking_id)
        } else {
          messageQuery = messageQuery.eq('conversation_id', conversation.id)
        }

        const { data: latestMessage } = await messageQuery.single()

        const { count: unreadCount } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conversation.id)
          .eq('is_read', false)
          .eq('to_user_id', user.id)

        return {
          ...conversation,
          lastMessage: latestMessage?.content || null,
          lastMessageAt: latestMessage?.created_at || null,
          lastMessageReadAt: latestMessage?.read_at || null,
          lastMessageFrom: latestMessage?.from_user_id || null,
          unreadCount: unreadCount ?? 0,
          messages: latestMessage ? [latestMessage] : []
        }
      })
    )

    console.log('✅ [CONVERSATIONS] Returning conversations:', conversationsWithMessages.length)

    return NextResponse.json({
      success: true,
      data: {
        items: conversationsWithMessages,
        total: conversationsWithMessages.length,
        page,
        pageSize: limit,
        totalPages: Math.ceil(conversationsWithMessages.length / limit),
      },
    })
  } catch (error) {
    console.error('💥 [CONVERSATIONS] Get conversations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
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

    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('booking_id', bookingId)
      .single()

    if (existingConversation) {
      return NextResponse.json({ 
        success: true, 
        data: { conversation: existingConversation } 
      })
    }

    // Create conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        booking_id: bookingId,
        listing_id: booking.listing.id,
        title: `Chat about ${booking.listing.title}`
      })
      .select('id')
      .single()

    if (conversationError || !conversation) {
      console.error('❌ Create conversation error:', conversationError)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    // Add participants
    const participants = participantIds.map((participantId: string) => ({
      conversation_id: conversation.id,
      user_id: participantId
    }))

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participants)

    if (participantsError) {
      console.error('❌ Add participants error:', participantsError)
      return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 })
    }

    // Send initial message if provided
    if (initialMessage) {
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          booking_id: bookingId,
          from_user_id: user.id,
          content: initialMessage,
          message_type: 'TEXT'
        })
    }

    return NextResponse.json({
      success: true,
      data: { conversation }
    })
  } catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}