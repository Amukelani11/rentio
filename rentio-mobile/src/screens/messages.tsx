import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Card from '../components/ui/card';
import Button from '../components/ui/button';
import Badge from '../components/ui/badge';
import { formatPrice, formatDate } from '../lib/utils';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/auth-context';
import { Conversation, Message } from '../types';

const MessagesScreen: React.FC = ({ navigation }: any) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
      // Set up real-time subscription for new messages
      const subscription = apiService.subscribeToMessages(
        selectedConversation.id,
        (message: Message) => {
          setMessages(prev => [...prev, message]);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await apiService.getConversations(user.id);

      if (error) {
        console.error('Error loading conversations:', error);
        Alert.alert('Error', 'Failed to load conversations');
      } else {
        setConversations(data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedConversation) return;

    setLoadingMessages(true);
    try {
      const { data, error } = await apiService.getMessages(selectedConversation.id);

      if (error) {
        console.error('Error loading messages:', error);
        Alert.alert('Error', 'Failed to load messages');
      } else {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSendingMessage(true);
    try {
      const otherParticipant = selectedConversation.participants?.find(
        (p: any) => p.user_id !== user.id
      );

      if (!otherParticipant) {
        Alert.alert('Error', 'Could not find recipient');
        return;
      }

      const { data: message, error } = await apiService.sendMessage({
        conversationId: selectedConversation.id,
        bookingId: selectedConversation.bookingId || '',
        fromUserId: user.id,
        toUserId: otherParticipant.userId,
        content: newMessage.trim(),
        type: 'TEXT',
      });

      if (error) {
        console.error('Error sending message:', error);
        Alert.alert('Error', 'Failed to send message');
      } else {
        setNewMessage('');
        // The message will be added via real-time subscription
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants?.find((p: any) => p.user_id !== user?.id);
    const userName = otherParticipant?.users?.name || '';
    const lastMessage = conv.lastMessage?.content || '';

    return (
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const otherParticipant = item.participants?.find((p: any) => p.userId !== user?.id);
    const userInfo = otherParticipant?.users;
    const userName = userInfo?.name || 'Unknown User';
    const userAvatar = userInfo?.name?.charAt(0).toUpperCase() || 'U';
    const lastMessage = item.lastMessage?.content || 'No messages yet';
    const lastMessageTime = item.lastMessage?.createdAt || item.updatedAt;
    const unreadCount = messages.filter(msg =>
      !msg.isRead && msg.fromUserId !== user?.id
    ).length;

    return (
      <TouchableOpacity
        onPress={() => setSelectedConversation(item)}
        style={styles.conversationItem}
      >
        <View style={styles.conversationContent}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{userAvatar}</Text>
            {/* Online status could be added later */}
          </View>
          <View style={styles.conversationInfo}>
            <View style={styles.conversationHeader}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.messageTime}>{formatDate(lastMessageTime)}</Text>
            </View>
            <Text style={styles.lastMessage} numberOfLines={2}>
              {lastMessage}
            </Text>
            {item.booking?.listing && (
              <View style={styles.listingReference}>
                <Text style={styles.listingTitle} numberOfLines={1}>
                  {item.booking.listing?.title}
                </Text>
                <Text style={styles.listingPrice}>
                  {formatPrice(item.booking.listing?.priceDaily)}/day
                </Text>
              </View>
            )}
          </View>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isOwn = item.fromUserId === user?.id;
    const senderName = isOwn ? 'You' : item.fromUser?.name || 'Unknown';

    return (
      <View style={[
        styles.messageItem,
        isOwn ? styles.ownMessage : styles.otherMessage,
      ]}>
        {!isOwn && (
          <Text style={styles.messageSender}>{senderName}</Text>
        )}
        <View style={[
          styles.messageBubble,
          isOwn ? styles.ownBubble : styles.otherBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isOwn ? styles.ownMessageText : styles.otherMessageText,
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTimestamp,
            isOwn ? styles.ownTimestamp : styles.otherTimestamp,
          ]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (selectedConversation) {
    const otherParticipant = selectedConversation.participants?.find(
      (p: any) => p.user_id !== user?.id
    );
    const userInfo = otherParticipant?.users;
    const userName = userInfo?.name || 'Unknown User';
    const userAvatar = userInfo?.name?.charAt(0).toUpperCase() || 'U';

    return (
      <View style={styles.container}>
        <View style={styles.chatHeader}>
        <TouchableOpacity
          onPress={() => setSelectedConversation(null)}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
          <View style={styles.chatUserInfo}>
            <Text style={styles.chatAvatar}>{userAvatar}</Text>
            <View>
              <Text style={styles.chatUserName}>{userName}</Text>
              <Text style={styles.chatUserStatus}>Online</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {selectedConversation.booking?.listing && (
          <Card style={styles.listingCard}>
            <View style={styles.listingCardContent}>
              <Text style={styles.listingCardImage}>📷</Text>
              <View style={styles.listingCardInfo}>
                <Text style={styles.listingCardTitle} numberOfLines={1}>
                  {selectedConversation.booking?.listing?.title}
                </Text>
                <Text style={styles.listingCardPrice}>
                  {formatPrice(selectedConversation.booking?.listing?.priceDaily)}/day
                </Text>
              </View>
              <Button
                title="Book Now"
                size="sm"
                onPress={() => {
                  setSelectedConversation(null);
                  navigation.navigate('Booking', {
                    listingId: selectedConversation.booking?.listing?.id,
                    title: selectedConversation.booking?.listing?.title,
                    priceDaily: selectedConversation.booking?.listing?.priceDaily,
                  });
                }}
              />
            </View>
          </Card>
        )}

        {loadingMessages ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E53237" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
          />
        )}

        <View style={styles.messageInputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={20} color="#6B7280" />
          </TouchableOpacity>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            style={styles.messageInput}
            multiline
          />
          <Button
            title={newMessage.trim() ? '' : ''}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
            loading={sendingMessage}
            size="sm"
            style={styles.sendButton}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </Button>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53237" />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search conversations..."
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        style={styles.conversationsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
              Start a conversation by messaging a listing owner
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  conversationContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#E53237',
    backgroundColor: '#FEE2E2',
    width: 50,
    height: 50,
    borderRadius: 25,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  listingReference: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listingTitle: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
  },
  listingPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E53237',
  },
  unreadBadge: {
    backgroundColor: '#E53237',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  chatUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  chatAvatar: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E53237',
    backgroundColor: '#FEE2E2',
    width: 40,
    height: 40,
    borderRadius: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: 12,
  },
  chatUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  chatUserStatus: {
    fontSize: 12,
    color: '#6B7280',
  },
  moreButton: {
    padding: 4,
  },
  listingCard: {
    margin: 16,
    marginTop: 8,
  },
  listingCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  listingCardImage: {
    fontSize: 24,
    marginRight: 12,
  },
  listingCardInfo: {
    flex: 1,
    marginRight: 12,
  },
  listingCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  listingCardPrice: {
    fontSize: 12,
    color: '#E53237',
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageItem: {
    marginBottom: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageSender: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '70%',
    minWidth: 100,
  },
  ownBubble: {
    backgroundColor: '#E53237',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#1F2937',
  },
  messageTimestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  ownTimestamp: {
    color: '#FFFFFF80',
    textAlign: 'right',
  },
  otherTimestamp: {
    color: '#9CA3AF',
    textAlign: 'left',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    marginLeft: 8,
    minWidth: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default MessagesScreen;