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

import Button from '../components/ui/button';
import { formatDate } from '../lib/utils';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/auth-context';
import { Message } from '../types';

const ChatScreen: React.FC = ({ route, navigation }: any) => {
  const { userId, userName, listingId } = route.params || {};
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    // In a real app, you would load the conversation and messages here
    // For now, we'll just show a placeholder
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      // Mock messages for now - in real app, load from conversation
      const mockMessages: Message[] = [
        {
          id: '1',
          conversationId: 'conv-1',
          fromUserId: userId,
          content: 'Hi! I\'m interested in renting your item.',
          type: 'TEXT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          conversationId: 'conv-1',
          fromUserId: user?.id || '',
          content: 'Great! When would you like to rent it?',
          type: 'TEXT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const message: Message = {
        id: Date.now().toString(),
        conversationId: 'conv-1',
        fromUserId: user?.id || '',
        content: newMessage.trim(),
        type: 'TEXT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // In real app, send to API
      // await apiService.sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isOwn = item.fromUserId === user?.id;

    return (
      <View style={[
        styles.messageItem,
        isOwn ? styles.ownMessage : styles.otherMessage,
      ]}>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{userName || 'Unknown User'}</Text>
          <Text style={styles.userStatus}>Online</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {loading ? (
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
          showsVerticalScrollIndicator={false}
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
          maxLength={500}
        />
        <Button
          title=""
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
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
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  userStatus: {
    fontSize: 12,
    color: '#6B7280',
  },
  moreButton: {
    padding: 4,
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
    borderRadius: 20,
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

export default ChatScreen;
