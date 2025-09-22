'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, MessageSquare, User, Clock, CheckCircle } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface Message {
  id: string
  content: string
  created_at: string
  from_user_id: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
}

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
  lastMessage?: string
  lastMessageAt?: string
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const conversationId = searchParams.get('id')
  const bookingId = searchParams.get('booking')
  const compose = searchParams.get('compose')
  const composeTo = searchParams.get('to')

  const [user, setUser] = useState<User | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchData()
  }, [conversationId, bookingId])

  const fetchData = async () => {
    try {
      console.log('📱 [MESSAGES] Fetching data...')
      
      const [userResponse, conversationsResponse] = await Promise.all([
        fetch('/api/auth/user'),
        fetch('/api/conversations')
      ])

      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
      }

      if (conversationsResponse.ok) {
        const conversationsData = await conversationsResponse.json()
        console.log('📋 [MESSAGES] Conversations loaded:', {
          total: conversationsData.data?.items?.length || 0,
          conversations: conversationsData.data?.items
        })
        setConversations(conversationsData.data.items || [])

        // Handle booking parameter - create conversation if needed
        if (bookingId && user) {
          console.log('🎯 [MESSAGES] Booking parameter detected:', bookingId)

          // Check if conversation already exists for this booking
          const existingConversation = conversationsData.data?.items?.find((c: Conversation) =>
            c.booking_id === bookingId
          )

          if (existingConversation) {
            console.log('✅ [MESSAGES] Found existing conversation for booking:', existingConversation.id)
            selectConversation(existingConversation)
          } else {
            console.log('🔄 [MESSAGES] No conversation found for booking, creating one...')
            await createConversationFromBooking(bookingId)
          }
        }
        // Auto-select conversation if ID provided
        else if (conversationId) {
          const conversation = conversationsData.data?.items?.find((c: Conversation) => c.id === conversationId)
          console.log('🎯 [MESSAGES] Auto-selecting conversation:', { conversationId, found: !!conversation })
          if (conversation) {
            selectConversation(conversation)
          }
        }
        // Handle compose mode
        else if (compose && composeTo) {
          // Try to find a conversation with target participant
          const conversation = conversationsData.data?.items?.find((c: Conversation) => {
            const participants = c.conversation_participants || []
            return participants.some(p => String(p.user_id) === String(composeTo))
          })
          console.log('💬 [MESSAGES] Compose mode - finding conversation:', { composeTo, found: !!conversation })
          if (conversation) {
            selectConversation(conversation)
          }
        }
      }
    } catch (error) {
      console.error('💥 [MESSAGES] Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createConversationFromBooking = async (bookingId: string) => {
    try {
      console.log('🔄 [MESSAGES] Creating conversation from booking:', bookingId)

      const response = await fetch(`/api/bookings/${bookingId}/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [MESSAGES] Conversation created successfully:', data)

        // Refresh conversations
        await fetchData()
      } else {
        const errorData = await response.json().catch(() => null)
        console.error('❌ [MESSAGES] Failed to create conversation:', errorData)
      }
    } catch (error) {
      console.error('💥 [MESSAGES] Error creating conversation from booking:', error)
    }
  }

  const selectConversation = async (conversation: Conversation) => {
    console.log('🎯 [MESSAGES] Selecting conversation:', conversation.id)
    setSelectedConversation(conversation)
    await fetchMessages(conversation.id)

    // Update URL
    const url = new URL(window.location.href)
    url.searchParams.set('id', conversation.id)
    url.searchParams.delete('booking')
    url.searchParams.delete('compose')
    url.searchParams.delete('to')
    window.history.replaceState({}, '', url.toString())
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      console.log('📨 [MESSAGES] Fetching messages for conversation:', conversationId)
      
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.data?.items || [])
        console.log('📨 [MESSAGES] Messages loaded:', data.data?.items?.length || 0)
      }
    } catch (error) {
      console.error('💥 [MESSAGES] Error fetching messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return

    setSending(true)
    try {
      console.log('📤 [MESSAGES] Sending message:', newMessage)

      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          message_type: 'TEXT'
        }),
      })

      if (response.ok) {
        setNewMessage('')
        await fetchMessages(selectedConversation.id)
        console.log('✅ [MESSAGES] Message sent successfully')
      } else {
        console.error('❌ [MESSAGES] Failed to send message')
      }
    } catch (error) {
      console.error('💥 [MESSAGES] Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    const participants = conversation.conversation_participants || []
    return participants.find(p => p.user_id !== user?.id)?.user
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">Messages</h1>
        </div>
        
        <div className="overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation)
              return (
                <div
                  key={conversation.id}
                  onClick={() => selectConversation(conversation)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                    selectedConversation?.id === conversation.id ? 'bg-coral-50 border-coral-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={otherParticipant?.avatar} />
                      <AvatarFallback>
                        {otherParticipant?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {otherParticipant?.name || 'Unknown User'}
                        </p>
                        {conversation.lastMessageAt && (
                          <p className="text-xs text-gray-500">
                            {formatTime(conversation.lastMessageAt)}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                      {conversation.booking_id && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Booking Chat
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getOtherParticipant(selectedConversation)?.avatar} />
                  <AvatarFallback>
                    {getOtherParticipant(selectedConversation)?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">
                    {getOtherParticipant(selectedConversation)?.name || 'Unknown User'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.booking_id ? 'Booking conversation' : 'Direct message'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.from_user_id === user?.id
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwn
                            ? 'bg-coral-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwn ? 'text-coral-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={sending}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-coral-600 hover:bg-coral-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}