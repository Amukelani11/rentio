'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, ArrowLeft, Menu, Paperclip, X, Image as ImageIcon } from 'lucide-react'
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
  attachments?: Array<{
    id: string
    url: string
    filename: string
    size: number
    type: string
  }>
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
  
  if (diffInMinutes < 5) return { status: 'online', color: 'bg-coral-500' }
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
  const [showConversationList, setShowConversationList] = useState(true)
  const [messagesEndRef, setMessagesEndRef] = useState<HTMLDivElement | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)

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
      // On mobile, show the conversation view instead of list
      setShowConversationList(false)
    },
    [loadMessages, updateUrl, fetchParticipantActivity]
  )

  const handleBackToConversations = useCallback(() => {
    setShowConversationList(true)
    setSelectedConversationId(null)
    setMessages([])
  }, [])

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
      if (selectedById) {
        setShowConversationList(false)
        return
      }

      if (composeToParam) {
        const matchingConversation = conversationItems.find((item) =>
          (item.conversation_participants ?? []).some((participant) => participant.user_id === composeToParam)
        )
        if (matchingConversation) {
          await handleSelectConversation(matchingConversation.id)
          setShowConversationList(false)
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
              setShowConversationList(false)
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

      if (conversationItems.length > 0 && !selectedConversationId) {
        // On desktop, auto-select first conversation. On mobile, keep showing list.
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
        if (!isMobile) {
          await handleSelectConversation(conversationItems[0].id)
        }
      } else if (!selectedConversationId) {
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, messagesEndRef])

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isDocument = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
      ].includes(file.type)

      return isImage || isDocument
    })

    setUploadingFiles(prev => [...prev, ...validFiles])
  }, [])

  const removeFile = useCallback((index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const uploadFile = useCallback(async (file: File): Promise<{ attachment: any; messageType: string } | null> => {
    if (!selectedConversation) return null

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        throw new Error(errorPayload?.error ?? 'Failed to upload file')
      }

      const payload = await response.json()
      return payload.data
    } catch (error) {
      console.error('[FILE_UPLOAD] Failed to upload file', error)
      return null
    }
  }, [selectedConversation])

  const handleSendMessage = useCallback(async () => {
    if (!selectedConversation || (!newMessage.trim() && uploadingFiles.length === 0) || sending) return

    const content = newMessage.trim()
    setSending(true)
    setErrorMessage(null)

    try {
      let attachments: any[] = []

      // Upload any files first
      if (uploadingFiles.length > 0) {
        const uploadPromises = uploadingFiles.map(uploadFile)
        const uploadResults = await Promise.all(uploadPromises)

        attachments = uploadResults.filter(result => result !== null) as any[]

        if (attachments.length === 0 && !content) {
          throw new Error('Failed to upload files')
        }
      }

      // Determine message type
      let messageType = 'TEXT'
      if (attachments.length > 0) {
        const hasImages = attachments.some(att => att.messageType === 'IMAGE')
        const hasFiles = attachments.some(att => att.messageType === 'FILE')

        if (hasImages && !hasFiles) {
          messageType = 'IMAGE'
        } else if (hasFiles && !hasImages) {
          messageType = 'FILE'
        } else if (hasImages && hasFiles) {
          messageType = 'FILE' // Default to FILE if mixed
        }
      }

      const messagePayload: any = {
        content: content || (messageType === 'TEXT' ? '' : 'Attachment'),
        type: messageType
      }

      if (attachments.length > 0) {
        messagePayload.attachments = attachments
      }

      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messagePayload)
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        throw new Error(errorPayload?.error ?? 'Failed to send message')
      }

      const payload: ApiResponse<{ message: Message }> = await response.json()
      const createdMessage = payload.data?.message

      if (createdMessage) {
        setMessages((previous) => [...previous, createdMessage])
        setNewMessage('')
        setUploadingFiles([])
        // Auto-scroll to bottom after sending message
        setTimeout(() => {
          messagesEndRef?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        await loadMessages(selectedConversation.id)
      }
    } catch (error) {
      console.error('[MESSAGES] Failed to send message', error)
      const fallbackMessage =
        error instanceof Error ? error.message : 'Unable to send this message. Please try again.'
      setErrorMessage(fallbackMessage)
      if (content) setNewMessage(content)
    } finally {
      setSending(false)
    }
  }, [loadMessages, newMessage, selectedConversation, sending, uploadingFiles, uploadFile, messagesEndRef])

  const renderConversationList = () => {
    if (loadingConversations && conversations.length === 0) {
      return (
        <div className="flex h-full items-center justify-center p-4 text-sm text-gray-500">
          Loading conversations...
        </div>
      )
    }

    if (!loadingConversations && conversations.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center text-sm text-gray-500">
          <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <p className="mb-2 text-base font-medium">No conversations yet</p>
          <p className="text-gray-400">Start a conversation to get started</p>
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
          className={`flex w-full items-center gap-3 border-b border-gray-100 px-4 py-4 text-left transition ${
            isSelected ? 'bg-coral-50 border-coral-200' : 'hover:bg-gray-50 active:bg-gray-100'
          }`}
        >
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={other?.avatar ?? undefined} alt={other?.name ?? 'User avatar'} />
              <AvatarFallback className="bg-gray-200 text-gray-600">
                {(other?.name ?? 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {other?.id && (
              <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${getActivityStatus(participantActivity[other.id]).color}`} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between">
              <span className={`truncate text-sm font-medium ${
                isSelected ? 'text-coral-700' : 'text-gray-900'
              }`}>
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
        <div className="flex h-full flex-col items-center justify-center text-gray-500 px-6">
          <MessageSquare className="mb-4 h-16 w-16 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            Choose a conversation from the list to start messaging
          </p>
        </div>
      )
    }

    if (loadingMessages) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-gray-500">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500 mx-auto mb-2"></div>
            <p>Loading messages...</p>
          </div>
        </div>
      )
    }

    if (messages.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center text-gray-500 px-6">
          <MessageSquare className="mb-4 h-16 w-16 text-gray-300" />
          <p className="text-center text-gray-400">No messages yet</p>
          <p className="text-center text-sm text-gray-400 mt-1">Start the conversation!</p>
        </div>
      )
    }

    return (
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="space-y-1 p-4">
          {messages.map((message, index) => {
            const isOwn = message.from_user_id === user?.id
            const showAvatar = !isOwn && (index === 0 || messages[index - 1].from_user_id !== message.from_user_id)

            return (
              <div key={message.id} className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                {!isOwn && showAvatar && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={message.sender?.avatar ?? undefined} />
                    <AvatarFallback className="bg-gray-200 text-xs">
                      {(message.sender?.name ?? 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                {!isOwn && !showAvatar && <div className="w-10" />}

                <div className={`max-w-[85%] ${isOwn ? 'ml-auto' : ''}`}>
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      isOwn
                        ? 'bg-coral-600 text-white rounded-br-md'
                        : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                    }`}
                  >
                    {message.content && <p className="whitespace-pre-wrap break-words mb-2">{message.content}</p>}

                    {/* Display attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="space-y-2">
                        {message.attachments.map((attachment: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            {attachment.type?.startsWith('image/') ? (
                              <div className="relative">
                                <img
                                  src={attachment.url}
                                  alt={attachment.name}
                                  className="max-w-48 max-h-32 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => window.open(attachment.url, '_blank')}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
                                  <ImageIcon className="h-6 w-6 text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Paperclip className="h-4 w-4 text-gray-500" />
                                <div>
                                  <p className="text-xs font-medium text-gray-900">{attachment.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(attachment.url, '_blank')}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-coral-500"
                                >
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l4-4m-4 4l-4-4m8 2h3m-3 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span>{formatTime(message.created_at)}</span>
                    {isOwn && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-coral-500 rounded-full opacity-60 ml-1"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={(el) => setMessagesEndRef(el)} />
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user} showHeader={false}>
      <div className={`flex h-screen bg-gray-50`}>
        {/* Mobile Conversation List - Default View */}
        {showConversationList && (
          <div className="flex h-full w-full flex-col md:hidden">
            <div className="border-b bg-white px-4 py-4">
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            </div>
            <div className="flex-1 overflow-y-auto bg-white">
              {renderConversationList()}
            </div>
          </div>
        )}

        {/* Mobile Conversation View */}
        {!showConversationList && selectedConversation && (
          <div className="flex h-full w-full flex-col md:hidden">
            {/* Mobile Header with Back Button */}
            <div className="flex items-center gap-3 border-b bg-white p-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToConversations}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              {(() => {
                const other = getOtherParticipant(selectedConversation, user?.id)
                return (
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={other?.avatar ?? undefined} />
                        <AvatarFallback className="bg-gray-200">
                          {(other?.name ?? 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {other?.id && (
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${getActivityStatus(participantActivity[other.id]).color}`} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-semibold text-gray-900 truncate">
                        {other?.name ?? selectedConversation.title ?? 'Conversation'}
                      </h2>
                      {other?.id && (
                        <p className="text-xs text-gray-500 truncate">
                          {formatLastSeen(participantActivity[other.id])}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>

            {renderMessageList()}

            {/* Message Input */}
            <footer className="border-t bg-white p-4">
              {/* File Preview */}
              {uploadingFiles.length > 0 && (
                <div className="mb-3 space-y-2">
                  {uploadingFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="h-5 w-5 text-coral-500" />
                        ) : (
                          <Paperclip className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`flex items-end gap-3 transition-colors ${
                  dragOver ? 'bg-coral-50 border-2 border-dashed border-coral-300' : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder={uploadingFiles.length > 0 ? "Add a message..." : "Type a message..."}
                    disabled={sending}
                    className="min-h-[44px] py-3 px-4 pr-20 rounded-full border-gray-300 focus:border-coral-500 focus:ring-coral-500 resize-none"
                  />

                  {/* File Upload Button */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <input
                      type="file"
                      id="file-upload-mobile"
                      className="hidden"
                      multiple
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv"
                      onChange={(e) => handleFileSelect(e.target.files)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-coral-500"
                      onClick={() => document.getElementById('file-upload-mobile')?.click()}
                      disabled={sending}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && uploadingFiles.length === 0) || sending}
                  className="h-11 w-11 rounded-full bg-coral-600 hover:bg-coral-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  size="sm"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-coral-200"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {dragOver && (
                <div className="text-center mt-2 text-sm text-coral-600">
                  Drop files here to attach them
                </div>
              )}
            </footer>
          </div>
        )}

        {/* Desktop Layout */}
        <aside className="hidden md:flex md:w-80 md:flex-col md:border-r md:bg-white">
          <div className="border-b px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            {renderConversationList()}
          </div>
        </aside>

        {/* Desktop Chat Area */}
        <section className="hidden md:flex md:flex-1 md:flex-col md:bg-white">
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
                        <AvatarFallback className="bg-gray-200">
                          {(other?.name ?? 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {other?.id && (
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${getActivityStatus(participantActivity[other.id]).color}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm font-semibold text-gray-900 truncate">
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
            <footer className="border-t bg-white px-6 py-4">
              {/* File Preview */}
              {uploadingFiles.length > 0 && (
                <div className="mb-3 space-y-2">
                  {uploadingFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="h-5 w-5 text-coral-500" />
                        ) : (
                          <Paperclip className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`flex items-center gap-3 transition-colors ${
                  dragOver ? 'bg-coral-50 border-2 border-dashed border-coral-300 rounded-md p-2' : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder={uploadingFiles.length > 0 ? "Add a message..." : "Type a message..."}
                    disabled={sending}
                    className="pr-16"
                  />

                  {/* File Upload Button */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <input
                      type="file"
                      id="file-upload-desktop"
                      className="hidden"
                      multiple
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv"
                      onChange={(e) => handleFileSelect(e.target.files)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-coral-500"
                      onClick={() => document.getElementById('file-upload-desktop')?.click()}
                      disabled={sending}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && uploadingFiles.length === 0) || sending}
                  className="bg-coral-600 hover:bg-coral-700"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-coral-200"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {dragOver && (
                <div className="text-center mt-2 text-sm text-coral-600">
                  Drop files here to attach them
                </div>
              )}
            </footer>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}

