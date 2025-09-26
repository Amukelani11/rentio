'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useUserActivity } from '@/hooks/useUserActivity'
import DashboardLayout from '@/components/layout/DashboardLayout'

type User = {
  id: string
  name: string | null
  email: string | null
  avatar?: string | null
}

type ConversationParticipant = {
  user_id: string
  user: User
}

type Conversation = {
  id: string
  title?: string | null
  booking_id?: string | null
  listing_id?: string | null
  lastMessage?: string | null
  lastMessageAt?: string | null
  conversation_participants?: ConversationParticipant[]
  business_details?: {
    id: string
    name: string | null
    email: string | null
  } | null
}

type Message = {
  id: string
  content: string
  created_at: string
  from_user_id: string
  sender?: {
    id: string
    name: string | null
    avatar?: string | null
  } | null
}

type ApiResponse<T> = {
  success?: boolean
  data?: T
  error?: string
}

type ConversationsPayload = {
  items: Conversation[]
}

type MessagesPayload = {
  items: Message[]
}

type UserPayload = {
  user: User
}

const PAGE_HEIGHT = 'h-[calc(100vh-8rem)]' // Adjusted for dashboard layout

function formatTime(timestamp?: string | null) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatLastSeen(timestamp?: string | null) {
  if (!timestamp) return 'Online status unknown'
  
  const now = new Date()
  const lastSeen = new Date(timestamp)
  
  // Check if timestamp is valid
  if (isNaN(lastSeen.getTime())) return 'Online status unknown'
  
  const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Active now'
  if (diffInMinutes < 5) return 'Active recently'
  if (diffInMinutes < 60) return `Last seen ${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `Last seen ${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `Last seen ${diffInDays}d ago`
  
  return `Last seen ${lastSeen.toLocaleDateString()}`
}

function getActivityStatus(timestamp?: string | null) {
  if (!timestamp) return { status: 'offline', color: 'bg-gray-400' }
  
  const now = new Date()
  const lastSeen = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 5) return { status: 'online', color: 'bg-green-500' }
  if (diffInMinutes < 30) return { status: 'away', color: 'bg-yellow-500' }
  return { status: 'offline', color: 'bg-gray-400' }
}

function formatRelativeDate(timestamp?: string | null) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''
  const now = new Date()
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  if (sameDay) {
    return date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
  }

  return date.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })
}

function getOtherParticipant(conversation: Conversation, currentUserId?: string | null) {
  if (conversation.business_details) {
    return {
      id: conversation.business_details.id,
      name: conversation.business_details.name ?? 'Business',
      email: conversation.business_details.email,
      avatar: null
    }
  }

  const participants = conversation.conversation_participants ?? []
  const participant = participants.find((item) => item.user_id !== currentUserId)
  return participant?.user ?? null
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const conversationIdParam = searchParams.get('id')
  const bookingIdParam = searchParams.get('booking')
  const composeToParam = searchParams.get('to')

  const [user, setUser] = useState<User | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [rtChannel, setRtChannel] = useState<RealtimeChannel | null>(null)
  const [participantActivity, setParticipantActivity] = useState<{[userId: string]: string}>({}) // userId -> last_seen_at

  const supabase = useMemo(() => createClient(), [])

  // Track user activity for smart email notifications
  useUserActivity({
    userId: user?.id || null,
    conversationId: selectedConversationId,
    activityType: 'MESSAGES_PAGE'
  })

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId]
  )

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setLoadingMessages(true)
      setErrorMessage(null)

      try {
        const response = await fetch(`/api/conversations/${conversationId}/messages`)
        if (!response.ok) {
          throw new Error('Failed to load messages')
        }

        const payload: ApiResponse<MessagesPayload> = await response.json()
        setMessages(payload.data?.items ?? [])
      } catch (error) {
        console.error('[MESSAGES] Failed to load messages', error)
        setMessages([])
        setErrorMessage('Unable to load messages for this conversation.')
      } finally {
        setLoadingMessages(false)
      }
    },
    []
  )

  const fetchParticipantActivity = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/activity`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const activityMap: {[userId: string]: string} = {}
          data.data.forEach((activity: any) => {
            activityMap[activity.user_id] = activity.last_seen_at
          })
          setParticipantActivity(prev => ({ ...prev, ...activityMap }))
        }
      } else {
        console.warn('[MESSAGES] Failed to fetch participant activity:', response.status)
      }
    } catch (error) {
      console.error('[MESSAGES] Failed to fetch participant activity', error)
    }
  }, [])

  const refreshConversations = useCallback(async () => {
    setLoadingConversations(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/conversations')
      if (!response.ok) {
        throw new Error('Failed to load conversations')
      }

      const payload: ApiResponse<ConversationsPayload> = await response.json()
      const items = payload.data?.items ?? []
      setConversations(items)
      return items
    } catch (error) {
      console.error('[MESSAGES] Failed to load conversations', error)
      setConversations([])
      setErrorMessage('Unable to load your conversations right now.')
      return []
    } finally {
      setLoadingConversations(false)
    }
  }, [])

  const updateUrl = useCallback((conversationId: string) => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    url.searchParams.set('id', conversationId)
    url.searchParams.delete('booking')
    url.searchParams.delete('compose')
    url.searchParams.delete('to')
    window.history.replaceState({}, '', url.toString())
  }, [])

  const handleSelectConversation = useCallback(
    async (conversationId: string) => {
      if (!conversationId) return
      setSelectedConversationId(conversationId)
      updateUrl(conversationId)
      await loadMessages(conversationId)
      await fetchParticipantActivity(conversationId)
    },
    [loadMessages, updateUrl, fetchParticipantActivity]
  )

  const bootstrap = useCallback(async () => {
    setLoadingConversations(true)
    setErrorMessage(null)

    try {
      const [userResponse, conversationsResponse] = await Promise.all([
        fetch('/api/auth/user'),
        fetch('/api/conversations')
      ])

      if (userResponse.ok) {
        const userPayload: UserPayload = await userResponse.json()
        setUser(userPayload.user)
      }

      let conversationItems: Conversation[] = []
      if (conversationsResponse.ok) {
        const payload: ApiResponse<ConversationsPayload> = await conversationsResponse.json()
        conversationItems = payload.data?.items ?? []
        setConversations(conversationItems)
      }

      const findAndSelectConversation = async (conversationId?: string | null) => {
        if (!conversationId) return false
        const conversationMatch = conversationItems.find((item) => item.id === conversationId)
        if (conversationMatch) {
          await handleSelectConversation(conversationMatch.id)
          return true
        }
        return false
      }

      const selectedById = await findAndSelectConversation(conversationIdParam)
      if (selectedById) return

      if (composeToParam) {
        const matchingConversation = conversationItems.find((item) =>
          (item.conversation_participants ?? []).some((participant) => participant.user_id === composeToParam)
        )
        if (matchingConversation) {
          await handleSelectConversation(matchingConversation.id)
          return
        }
      }

      if (bookingIdParam) {
        const conversationForBooking = conversationItems.find(
          (item) => item.booking_id && item.booking_id === bookingIdParam
        )

        if (conversationForBooking) {
          await handleSelectConversation(conversationForBooking.id)
          return
        }

        try {
          const response = await fetch(`/api/bookings/${bookingIdParam}/conversation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })

          if (response.ok) {
            const payload: ApiResponse<{ conversation: Conversation }> = await response.json()
            const createdConversationId = payload.data?.conversation?.id

            const updatedConversations = await refreshConversations()
            const conversationToSelect =
              updatedConversations.find((item) => item.id === createdConversationId) ??
              updatedConversations.find((item) => item.booking_id === bookingIdParam)

            if (conversationToSelect) {
              await handleSelectConversation(conversationToSelect.id)
              return
            }
          } else {
            console.error('[MESSAGES] Unable to create booking conversation', await response.text())
            setErrorMessage('Unable to start a new conversation for this booking.')
          }
        } catch (error) {
          console.error('[MESSAGES] Failed to create booking conversation', error)
          setErrorMessage('Unable to start a new conversation for this booking.')
        }
      }

      if (conversationItems.length > 0) {
        await handleSelectConversation(conversationItems[0].id)
      } else {
        setSelectedConversationId(null)
        setMessages([])
      }
    } catch (error) {
      console.error('[MESSAGES] Failed to initialise messages page', error)
      setErrorMessage('Something went wrong while loading your messages.')
    } finally {
      setLoadingConversations(false)
    }
  }, [
    bookingIdParam,
    composeToParam,
    conversationIdParam,
    handleSelectConversation,
    refreshConversations
  ])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  // Simple per-conversation realtime subscription (INSERT only)
  useEffect(() => {
    if (!selectedConversationId) return

    // Cleanup any previous channel
    if (rtChannel) {
      rtChannel.unsubscribe()
      setRtChannel(null)
    }

    const channel = supabase
      .channel(`conv_${selectedConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversationId}`
        },
        (payload) => {
          const msg = payload.new as Message
          // Avoid duplicates
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
        }
      )
      .subscribe()

    setRtChannel(channel)

    return () => {
      channel.unsubscribe()
      setRtChannel(null)
    }
  }, [selectedConversationId, supabase])

  // Refresh activity data periodically
  useEffect(() => {
    if (!selectedConversationId) return

    const refreshActivity = () => {
      fetchParticipantActivity(selectedConversationId)
    }

    // Refresh activity every 30 seconds
    const interval = setInterval(refreshActivity, 30000)
    
    return () => clearInterval(interval)
  }, [selectedConversationId, fetchParticipantActivity])

  const handleSendMessage = useCallback(async () => {
    if (!selectedConversation || !newMessage.trim() || sending) return

    const content = newMessage.trim()
    setSending(true)
    setErrorMessage(null)
    setNewMessage('')

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type: 'TEXT' })
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        throw new Error(errorPayload?.error ?? 'Failed to send message')
      }

      const payload: ApiResponse<{ message: Message }> = await response.json()
      const createdMessage = payload.data?.message

      if (createdMessage) {
        setMessages((previous) => [...previous, createdMessage])
      } else {
        await loadMessages(selectedConversation.id)
      }
    } catch (error) {
      console.error('[MESSAGES] Failed to send message', error)
      const fallbackMessage =
        error instanceof Error ? error.message : 'Unable to send this message. Please try again.'
      setErrorMessage(fallbackMessage)
      setNewMessage(content)
    } finally {
      setSending(false)
    }
  }, [loadMessages, newMessage, selectedConversation, sending])

  const renderConversationList = () => {
    if (loadingConversations && conversations.length === 0) {
      return (
        <div className="p-4 text-sm text-gray-500">
          Loading conversations...
        </div>
      )
    }

    if (!loadingConversations && conversations.length === 0) {
      return (
        <div className="p-8 text-center text-sm text-gray-500">
          <MessageSquare className="mx-auto mb-3 h-8 w-8 text-gray-400" />
          <p>No conversations yet.</p>
        </div>
      )
    }

    return conversations.map((conversation) => {
      const other = getOtherParticipant(conversation, user?.id)
      const isSelected = conversation.id === selectedConversationId

      return (
        <button
          key={conversation.id}
          onClick={() => handleSelectConversation(conversation.id)}
          className={`flex w-full items-center gap-3 border-b px-4 py-3 text-left transition ${
            isSelected ? 'bg-coral-50' : 'hover:bg-gray-100'
          }`}
        >
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={other?.avatar ?? undefined} alt={other?.name ?? 'User avatar'} />
              <AvatarFallback>{(other?.name ?? 'U').charAt(0)}</AvatarFallback>
            </Avatar>
            {other?.id && (
              <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${getActivityStatus(participantActivity[other.id]).color}`} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between">
              <span className="truncate text-sm font-medium text-gray-900">
                {other?.name ?? conversation.title ?? 'Conversation'}
              </span>
              <span className="ml-2 shrink-0 text-xs text-gray-500">
                {formatRelativeDate(conversation.lastMessageAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="truncate text-xs text-gray-500">
                {conversation.lastMessage ?? 'No messages yet'}
              </p>
              {other?.id && (
                <span className="ml-2 shrink-0 text-xs text-gray-400">
                  {formatLastSeen(participantActivity[other.id])}
                </span>
              )}
            </div>
          </div>
        </button>
      )
    })
  }

  const renderMessageList = () => {
    if (!selectedConversation) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center text-gray-500">
          <MessageSquare className="mb-3 h-10 w-10 text-gray-400" />
          <h3 className="text-base font-medium">No conversation selected</h3>
          <p className="mt-1 text-sm text-gray-500">Choose a conversation to get started.</p>
        </div>
      )
    }

    if (loadingMessages) {
      return (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
          Loading messages...
        </div>
      )
    }

    if (messages.length === 0) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center text-gray-500">
          <MessageSquare className="mb-3 h-10 w-10 text-gray-400" />
          <p>No messages yet. Start the conversation!</p>
        </div>
      )
    }

    return (
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        {messages.map((message) => {
          const isOwn = message.from_user_id === user?.id
          return (
            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-lg px-4 py-3 text-sm ${
                  isOwn ? 'bg-coral-600 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{message.content}</p>
                <span
                  className={`mt-2 block text-xs ${
                    isOwn ? 'text-coral-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.created_at)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <DashboardLayout user={user} showHeader={false}>
      <div className={`flex ${PAGE_HEIGHT}`}>
      <aside className="flex w-full max-w-sm flex-col border-r bg-gray-50">
        <div className="border-b px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">{renderConversationList()}</div>
      </aside>

      <section className="flex flex-1 flex-col bg-white">
        {errorMessage && (
          <div className="border-b bg-red-50 px-4 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {selectedConversation && (
          <header className="flex items-center gap-3 border-b px-6 py-4">
            {(() => {
              const other = getOtherParticipant(selectedConversation, user?.id)
              return (
                <>
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={other?.avatar ?? undefined} />
                      <AvatarFallback>{(other?.name ?? 'U').charAt(0)}</AvatarFallback>
                    </Avatar>
                    {other?.id && (
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${getActivityStatus(participantActivity[other.id]).color}`} />
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      {other?.name ?? selectedConversation.title ?? 'Conversation'}
                    </h2>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">
                        {selectedConversation.booking_id ? 'Booking conversation' : 'Direct message'}
                      </p>
                      {other?.id && (
                        <>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            {formatLastSeen(participantActivity[other.id])}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )
            })()}
          </header>
        )}

        {renderMessageList()}

        {selectedConversation && (
          <footer className="border-t px-6 py-4">
            <div className="flex items-center gap-3">
              <Input
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Type a message..."
                disabled={sending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="bg-coral-600 hover:bg-coral-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </footer>
        )}
      </section>
      </div>
    </DashboardLayout>
  )
}

