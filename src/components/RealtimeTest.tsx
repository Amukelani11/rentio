'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

type RealtimePayload<T> = {
  eventType: string
  new: Partial<T> | null
  old: Partial<T> | null
}

type MessageRow = {
  content?: string
}

type ConversationRow = {
  title?: string
}

interface RealtimeTestProps {
  userId: string
}

export function RealtimeTest({ userId }: RealtimeTestProps) {
  const [events, setEvents] = useState<string[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    console.log('🧪 [REALTIME_TEST] Setting up test subscriptions for user:', userId)

    const testChannel = supabase
      .channel(`test_${userId}`)
      .on<MessageRow>('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
      }, (payload: RealtimePayload<MessageRow>) => {
        const messageContent = payload.new?.content ?? payload.old?.content ?? 'Unknown'
        const event = `📨 Message ${payload.eventType}: ${messageContent}`
        setEvents(prev => [event, ...prev.slice(0, 9)])
        console.log('🧪 [REALTIME_TEST] Message event:', payload)
      })
      .on<ConversationRow>('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
      }, (payload: RealtimePayload<ConversationRow>) => {
        const title = payload.new?.title ?? payload.old?.title ?? 'Unknown'
        const event = `📋 Conversation ${payload.eventType}: ${title}`
        setEvents(prev => [event, ...prev.slice(0, 9)])
        console.log('🧪 [REALTIME_TEST] Conversation event:', payload)
      })
      .subscribe()

    setChannel(testChannel)

    return () => {
      console.log('🧹 [REALTIME_TEST] Cleaning up test subscriptions')
      testChannel.unsubscribe()
    }
  }, [userId, supabase])

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="font-semibold text-sm mb-2">Real-time Events</h3>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-xs text-gray-500">No events yet...</p>
        ) : (
          events.map((event, index) => (
            <p key={index} className="text-xs text-gray-700">
              {event}
            </p>
          ))
        )}
      </div>
    </div>
  )
}

