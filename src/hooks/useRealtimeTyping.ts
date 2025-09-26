import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface TypingUser {
  userId: string
  userName: string
  timestamp: number
}

interface UseRealtimeTypingProps {
  conversationId: string
  userId: string
  userName: string
  onTypingStart?: (user: TypingUser) => void
  onTypingStop?: (userId: string) => void
}

export function useRealtimeTyping({
  conversationId,
  userId,
  userName,
  onTypingStart,
  onTypingStop,
}: UseRealtimeTypingProps) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const supabase = createClient()

  // Send typing indicator
  const sendTyping = useCallback(() => {
    if (!conversationId || !userId) return

    setIsTyping(true)
    
    // Send typing event via presence
    const channel = supabase.channel(`typing_${conversationId}`)
    channel.track({
      userId,
      userName,
      isTyping: true,
      timestamp: Date.now(),
    })
  }, [conversationId, userId, userName, supabase])

  // Stop typing indicator
  const stopTyping = useCallback(() => {
    if (!conversationId || !userId) return

    setIsTyping(false)
    
    // Remove typing event via presence
    const channel = supabase.channel(`typing_${conversationId}`)
    channel.track({
      userId,
      userName,
      isTyping: false,
      timestamp: Date.now(),
    })
  }, [conversationId, userId, userName, supabase])

  // Set up real-time subscription for typing indicators
  useEffect(() => {
    if (!conversationId || !userId) return

    console.log('⌨️ [TYPING] Setting up typing indicators for conversation:', conversationId)

    const typingChannel = supabase
      .channel(`typing_${conversationId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = typingChannel.presenceState()
        const users: TypingUser[] = []
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.isTyping && presence.userId !== userId) {
              users.push({
                userId: presence.userId,
                userName: presence.userName,
                timestamp: presence.timestamp,
              })
            }
          })
        })
        
        setTypingUsers(users)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        newPresences.forEach((presence: any) => {
          if (presence.isTyping && presence.userId !== userId) {
            const typingUser: TypingUser = {
              userId: presence.userId,
              userName: presence.userName,
              timestamp: presence.timestamp,
            }
            setTypingUsers(prev => {
              const filtered = prev.filter(u => u.userId !== typingUser.userId)
              return [...filtered, typingUser]
            })
            onTypingStart?.(typingUser)
          }
        })
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        leftPresences.forEach((presence: any) => {
          if (presence.userId !== userId) {
            setTypingUsers(prev => prev.filter(u => u.userId !== presence.userId))
            onTypingStop?.(presence.userId)
          }
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await typingChannel.track({
            userId,
            userName,
            isTyping: false,
            timestamp: Date.now(),
          })
        }
      })

    setChannel(typingChannel)

    // Clean up typing users after 3 seconds of inactivity
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      setTypingUsers(prev => 
        prev.filter(user => now - user.timestamp < 3000)
      )
    }, 1000)

    return () => {
      console.log('🧹 [TYPING] Cleaning up typing indicators')
      typingChannel.unsubscribe()
      clearInterval(cleanupInterval)
    }
  }, [conversationId, userId, userName, onTypingStart, onTypingStop, supabase])

  return {
    typingUsers,
    isTyping,
    sendTyping,
    stopTyping,
  }
}





