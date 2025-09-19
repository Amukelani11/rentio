import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface Message {
  id: string
  content: string
  type: string
  from_user_id: string
  to_user_id: string
  booking_id: string
  created_at: string
  is_read: boolean
  sender?: {
    id: string
    name: string
    avatar?: string
  }
}

interface UseRealtimeMessagesProps {
  bookingId: string
  userId: string
  onNewMessage?: (message: Message) => void
  onMessageRead?: (messageId: string) => void
}

export function useRealtimeMessages({
  bookingId,
  userId,
  onNewMessage,
  onMessageRead,
}: UseRealtimeMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const supabase = createClient()

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/conversations?bookingId=${bookingId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.items.length > 0) {
          const conversationId = data.data.items[0].id
          const messagesResponse = await fetch(`/api/conversations/${conversationId}/messages`)
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json()
            if (messagesData.success) {
              setMessages(messagesData.data.items)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  // Send a message
  const sendMessage = useCallback(async (content: string, type: string = 'TEXT', mediaUrl?: string) => {
    try {
      // First get the conversation ID
      const response = await fetch(`/api/conversations?bookingId=${bookingId}`)
      if (!response.ok) return null

      const data = await response.json()
      if (!data.success || data.data.items.length === 0) return null

      const conversationId = data.data.items[0].id
      const messageResponse = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, type, mediaUrl }),
      })

      if (messageResponse.ok) {
        const messageData = await messageResponse.json()
        if (messageData.success) {
          return messageData.data
        }
      }
      return null
    } catch (error) {
      console.error('Error sending message:', error)
      return null
    }
  }, [bookingId])

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds: string[]) => {
    try {
      const response = await fetch('/api/messages/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageIds }),
      })
      return response.ok
    } catch (error) {
      console.error('Error marking messages as read:', error)
      return false
    }
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    if (!bookingId || !userId) return

    // Fetch initial messages
    fetchMessages()

    // Create real-time channel for this booking
    const messageChannel = supabase
      .channel(`booking_${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          
          // Don't add the message if it's from the current user (they already see it)
          if (newMessage.from_user_id !== userId) {
            setMessages(prev => [...prev, newMessage])
            onNewMessage?.(newMessage)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          )
          onMessageRead?.(updatedMessage.id)
        }
      )
      .subscribe()

    setChannel(messageChannel)

    return () => {
      messageChannel.unsubscribe()
    }
  }, [bookingId, userId, fetchMessages, onNewMessage, onMessageRead])

  return {
    messages,
    loading,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
  }
}


