import { useLayoutEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText, ThemedView } from '../components';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

type MessagesNav = NativeStackNavigationProp<RootStackParamList, 'Messages'>;

export default function MessagesScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MessagesNav>();

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions?.({ headerShown: false });
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="title" weight="bold" style={styles.title}>
            Messages
          </ThemedText>
          <ThemedText variant="body" style={styles.subtitle}>
            Chat with renters and owners
          </ThemedText>
        </View>

        {/* Content Placeholder */}
        <View style={styles.content}>
          <View style={styles.placeholder}>
            <Ionicons name="chatbubbles-outline" size={48} color="#E5E7EB" />
            <ThemedText variant="body" style={styles.placeholderText}>
              No messages yet
            </ThemedText>
            <ThemedText variant="caption" style={styles.placeholderSubtext}>
              Start a conversation when you rent or list items
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    color: '#0B1220',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  placeholderSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

