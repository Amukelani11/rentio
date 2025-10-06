import { useLayoutEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ScrollView, TextInput } from 'react-native';
import { ThemedText, ThemedView } from '../components';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

type BrowseNav = NativeStackNavigationProp<RootStackParamList, 'Browse'>;

export default function BrowseScreen() {
  const theme = useTheme();
  const navigation = useNavigation<BrowseNav>();

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
            Browse Items
          </ThemedText>
          <ThemedText variant="body" style={styles.subtitle}>
            Discover items to rent in your area
          </ThemedText>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={16} color="#9CA3AF" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search items to rent..."
              placeholderTextColor="#9CA3AF"
            />
            <Ionicons name="filter-outline" size={16} color="#9CA3AF" />
          </View>
        </View>

        {/* Content Placeholder */}
        <View style={styles.content}>
          <View style={styles.placeholder}>
            <Ionicons name="search-outline" size={48} color="#E5E7EB" />
            <ThemedText variant="body" style={styles.placeholderText}>
              Start searching for items to rent
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0B1220',
    marginHorizontal: 8,
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
  },
});

