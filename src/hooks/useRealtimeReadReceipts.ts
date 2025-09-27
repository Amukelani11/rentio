import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface ReadReceipt {
  messageId: string
  userId: string
  userName: string
  readAt: string
}

interface UseRealtimeReadReceiptsProps {
  conversationId: string
  userId: string
  onMessageRead?: (receipt: ReadReceipt) => void
}

export function useRealtimeReadReceipts({
  conversationId,
  userId,
  onMessageRead,
}: UseRealtimeReadReceiptsProps) {
  const [readReceipts, setReadReceipts] = useState<ReadReceipt[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const supabase = createClient()

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

  // Set up real-time subscription for read receipts
  useEffect(() => {
    if (!conversationId || !userId) return

    console.log('📖 [READ_RECEIPTS] Setting up read receipts for conversation:', conversationId)

    const readReceiptsChannel = supabase
      .channel(`read_receipts_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_read',
        },
        (payload) => {
          const readReceipt = payload.new as any
          console.log('📖 [READ_RECEIPTS] New read receipt:', readReceipt)
          
          // Check if this read receipt is for a message in this conversation
          // We'll need to verify this by checking the message's conversation_id
          // For now, we'll assume all read receipts in this channel are relevant
          const receipt: ReadReceipt = {
            messageId: readReceipt.message_id,
            userId: readReceipt.user_id,
            userName: readReceipt.user_name || 'Unknown User',
            readAt: readReceipt.read_at,
          }
          
          setReadReceipts(prev => {
            const filtered = prev.filter(r => 
              !(r.messageId === receipt.messageId && r.userId === receipt.userId)
            )
            return [...filtered, receipt]
          })
          
          onMessageRead?.(receipt)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'message_read',
        },
        (payload) => {
          const updatedReceipt = payload.new as any
          console.log('📖 [READ_RECEIPTS] Read receipt updated:', updatedReceipt)
          
          const receipt: ReadReceipt = {
            messageId: updatedReceipt.message_id,
            userId: updatedReceipt.user_id,
            userName: updatedReceipt.user_name || 'Unknown User',
            readAt: updatedReceipt.read_at,
          }
          
          setReadReceipts(prev => 
            prev.map(r => 
              r.messageId === receipt.messageId && r.userId === receipt.userId 
                ? receipt 
                : r
            )
          )
        }
      )
      .subscribe()

    setChannel(readReceiptsChannel)

    return () => {
      console.log('🧹 [READ_RECEIPTS] Cleaning up read receipts subscription')
      readReceiptsChannel.unsubscribe()
    }
  }, [conversationId, userId, onMessageRead])

  return {
    readReceipts,
    markAsRead,
  }
}









