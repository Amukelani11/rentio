import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface Conversation {
  id: string
  title: string
  booking_id?: string
  listing_id?: string
  conversation_participants?: Array<{
    user_id: string
    user: {
      id: string
      name: string
      email: string
      avatar?: string
    }
  }>
  business_details?: {
    id: string
    name: string
    email: string
  }
  lastMessage?: string
  lastMessageAt?: string
}

interface UseRealtimeConversationsProps {
  userId: string
  onConversationUpdate?: (conversations: Conversation[]) => void
  onNewMessage?: (message: any) => void
}

export function useRealtimeConversations({
  userId,
  onConversationUpdate,
  onNewMessage,
}: UseRealtimeConversationsProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const supabase = createClient()

  // Fetch initial conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setConversations(data.data.items || [])
          onConversationUpdate?.(data.data.items || [])
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }, [onConversationUpdate])

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return

    console.log('🔄 [REALTIME] Setting up conversations subscription for user:', userId)

    // Fetch initial conversations
    fetchConversations()

    // Create real-time channel for conversations
    const conversationsChannel = supabase
      .channel(`user_conversations_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          console.log('📋 [REALTIME] Conversations update:', payload)
          // Refresh conversations list
          fetchConversations()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_participants',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('👥 [REALTIME] Conversation participants update:', payload)
          // Refresh conversations list
          fetchConversations()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as any
          console.log('📨 [REALTIME] New message received:', newMessage)
          
          // Check if this message is for a conversation the user is part of
          const isRelevant = conversations.some(conv => 
            conv.id === newMessage.conversation_id || 
            (conv.booking_id && newMessage.booking_id === conv.booking_id)
          )
          
          if (isRelevant) {
            onNewMessage?.(newMessage)
            // Refresh conversations to update last message
            fetchConversations()
          }
        }
      )
      .subscribe()

    setChannel(conversationsChannel)

    return () => {
      console.log('🧹 [REALTIME] Cleaning up conversations subscription')
      conversationsChannel.unsubscribe()
    }
  }, [userId, fetchConversations, onConversationUpdate, onNewMessage, conversations])

  return {
    conversations,
    loading,
    refetch: fetchConversations,
  }
}








