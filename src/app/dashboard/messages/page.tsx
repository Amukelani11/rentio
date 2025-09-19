'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  ArrowLeft,
  Phone,
  Video,
  Info,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  mediaUrl?: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  readReceipts: Array<{
    userId: string;
    read: boolean;
    readAt?: string;
  }>;
}

interface Conversation {
  id: string;
  bookingId?: string;
  listingId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  participants: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
  }>;
  booking?: {
    id: string;
    listing: {
      id: string;
      title: string;
      images: string[];
    };
  };
  listing?: {
    id: string;
    title: string;
    images: string[];
  };
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('id') || searchParams.get('conversation');
  const bookingId = searchParams.get('booking');
  const compose = searchParams.get('compose');
  const composeTo = searchParams.get('to');
  const composeText = searchParams.get('text') || '';
  
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time messaging hook
  const { 
    messages: realtimeMessages, 
    sendMessage: sendRealtimeMessage, 
    markAsRead 
  } = useRealtimeMessages({
    bookingId: selectedConversation?.bookingId || '',
    userId: user?.id || '',
    onNewMessage: (message) => {
      console.log('New real-time message received:', message);
      // Auto-scroll to bottom when new message arrives
      setTimeout(() => scrollToBottom(), 100);
    },
    onMessageRead: (messageId) => {
      console.log('Message read:', messageId);
    }
  });

  useEffect(() => {
    fetchData();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchData = async () => {
    try {
      console.log('📱 Messages page: Fetching data...')
      
      const [userResponse, conversationsResponse] = await Promise.all([
        fetch('/api/auth/user'),
        fetch('/api/conversations'),
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('👤 Messages page: User data loaded:', userData.user?.id)
        setUser(userData.user);
      }

      if (conversationsResponse.ok) {
        const conversationsData = await conversationsResponse.json();
        console.log('📋 Messages page: Conversations loaded:', {
          total: conversationsData.data?.items?.length || 0,
          conversations: conversationsData.data?.items?.map((c: any) => ({
            id: c.id,
            bookingId: c.booking_id,
            listingId: c.listing_id,
            title: c.title,
            hasBooking: !!c.booking,
            hasListing: !!c.listing
          }))
        })
        setConversations(conversationsData.data.items);
        
        // Auto-select conversation if ID provided
        if (conversationId) {
          const conversation = conversationsData.data.items.find((c: Conversation) => c.id === conversationId);
          console.log('🎯 Messages page: Auto-selecting conversation:', { conversationId, found: !!conversation })
          if (conversation) {
            selectConversation(conversation);
          } else {
            console.error('❌ Messages page: Conversation not found:', conversationId)
          }
        } else if (compose && composeTo) {
          // Try to find a conversation with target participant
          const conversation = conversationsData.data.items.find((c: Conversation) =>
            c.participants?.some?.(p => String(p.user.id) === String(composeTo))
          );
          console.log('💬 Messages page: Compose mode - finding conversation:', { composeTo, found: !!conversation })
          if (conversation) {
            selectConversation(conversation);
            setNewMessage(composeText);
          }
        }
      } else {
        const errorData = await conversationsResponse.json().catch(() => null)
        console.error('❌ Messages page: Failed to load conversations:', {
          status: conversationsResponse.status,
          errorData
        })
      }
    } catch (error) {
      console.error('💥 Messages page: Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.id);
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('id', conversation.id);
    window.history.pushState({}, '', url.toString());
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData.data.items);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim() || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      // Use real-time messaging
      const result = await sendRealtimeMessage(messageContent, 'TEXT');
      
      if (result) {
        // Update conversation last message
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, lastMessage: messageContent, lastMessageAt: new Date().toISOString() }
            : conv
        ));
      } else {
        // Fallback to regular API if real-time fails
        const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: messageContent,
            type: 'TEXT',
          }),
        });

        if (response.ok) {
          const messageData = await response.json();
          setMessages(prev => [...prev, messageData.data]);
          
          // Update conversation last message
          setConversations(prev => prev.map(conv => 
            conv.id === selectedConversation.id 
              ? { ...conv, lastMessage: messageContent, lastMessageAt: new Date().toISOString() }
              : conv
          ));
        } else {
          console.error('Failed to send message');
          setNewMessage(messageContent); // Restore message if failed
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent); // Restore message if failed
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.user.id !== user?.id)?.user;
  };

  const isMessageRead = (message: Message) => {
    if (message.senderId === user?.id) {
      return message.readReceipts.some(r => r.userId !== user?.id && r.read);
    }
    return false;
  };

  if (loading) {
    return (
      <DashboardLayout user={user} showHeader={false}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} showHeader={false}>
      <div className="h-[calc(100vh-8rem)] flex space-x-6">
        {/* Conversations Sidebar */}
        <div className="w-80 flex flex-col border-r">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                <p className="text-sm mb-4">Start a conversation by booking an item or having someone book your listing.</p>
                <div className="space-y-2">
                  <Link href="/browse">
                    <Button variant="outline" size="sm" className="w-full">
                      Browse Items
                    </Button>
                  </Link>
                  <Link href="/dashboard/listings">
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Listings
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              conversations.map((conversation) => {
                const otherUser = getOtherParticipant(conversation);
                return (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-coral-50' : ''
                    }`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {otherUser?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm truncate">
                            {otherUser?.name || 'Unknown User'}
                          </h3>
                          {conversation.lastMessageAt && (
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          {conversation.booking?.listing?.title || conversation.listing?.title || 'No listing'}
                        </p>
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Link href="/dashboard/messages">
                    <Button variant="outline" size="sm" className="md:hidden">
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {getOtherParticipant(selectedConversation)?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {getOtherParticipant(selectedConversation)?.name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedConversation.booking?.listing?.title || selectedConversation.listing?.title || 'No listing'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(realtimeMessages.length > 0 ? realtimeMessages : messages).map((message) => {
                  const isOwn = message.sender.id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isOwn
                              ? 'bg-coral-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <div className={`flex items-center space-x-1 mt-1 ${
                          isOwn ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.createdAt)}
                          </span>
                          {isOwn && (
                            <span className="text-xs text-gray-500">
                              {isMessageRead(message) ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={sendMessage} className="flex items-center space-x-2">
                  <Button type="button" variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="resize-none"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(e);
                        }
                      }}
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button type="submit" size="sm" disabled={!newMessage.trim() || sending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-gray-600 mb-4">Choose a conversation from the list to start messaging</p>
                {conversations.length === 0 && (
                  <div className="space-y-2">
                    <Link href="/browse">
                      <Button variant="outline" size="sm">
                        Browse Items
                      </Button>
                    </Link>
                    <Link href="/dashboard/listings">
                      <Button variant="outline" size="sm" className="ml-2">
                        Manage Listings
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
