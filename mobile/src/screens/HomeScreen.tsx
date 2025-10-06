import { useLayoutEffect } from 'react';
import { FlatList, TouchableOpacity, View, Image, StyleSheet, SafeAreaView, StatusBar, ScrollView, TextInput } from 'react-native';
import { ThemedText, ThemedView, Button, Stack } from '../components';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const categories = [
  {
    id: 'electronics',
    title: 'Electronics',
    icon: () => <Ionicons name="phone-portrait-outline" size={20} color="#3B82F6" />,
  },
  {
    id: 'tools',
    title: 'Tools',
    icon: () => <MaterialIcons name="build" size={20} color="#10B981" />,
  },
  {
    id: 'furniture',
    title: 'Furniture',
    icon: () => <Ionicons name="bed-outline" size={20} color="#F59E0B" />,
  },
  {
    id: 'vehicles',
    title: 'Vehicles',
    icon: () => <Ionicons name="car-outline" size={20} color="#EF4444" />,
  },
  {
    id: 'sports',
    title: 'Sports',
    icon: () => <Ionicons name="football-outline" size={20} color="#8B5CF6" />,
  },
  {
    id: 'events',
    title: 'Events',
    icon: () => <Ionicons name="calendar-outline" size={20} color="#F97316" />,
  },
];

const featuredItems = [
  {
    id: '1',
    title: 'Canon EOS R5 Camera',
    price: 'R 150/day',
    location: 'Cape Town',
    rating: 4.9,
    image: require('../../assets/icon.png'),
  },
  {
    id: '2',
    title: 'MacBook Pro M2',
    price: 'R 200/day',
    location: 'Johannesburg',
    rating: 4.8,
    image: require('../../assets/icon.png'),
  },
  {
    id: '3',
    title: 'Dewalt Drill Set',
    price: 'R 80/day',
    location: 'Durban',
    rating: 4.7,
    image: require('../../assets/icon.png'),
  },
];

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<HomeNav>();

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions?.({ headerShown: false });
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <ThemedText variant="caption" style={styles.greeting}>
                Good morning
              </ThemedText>
              <ThemedText variant="title" weight="bold" style={styles.welcomeText}>
                What can we help you find?
          </ThemedText>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Image source={require('../../assets/icon.png')} style={styles.profileImage} />
            </TouchableOpacity>
          </View>
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
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <ThemedText variant="subtitle" weight="semibold" style={styles.sectionTitle}>
            Browse Categories
          </ThemedText>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryIconContainer}>
                  {category.icon()}
                </View>
                <ThemedText variant="caption" weight="semibold" style={styles.categoryTitle}>
                  {category.title}
          </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="subtitle" weight="semibold" style={styles.sectionTitle}>
              Featured Items
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.seeAllText}>See all</ThemedText>
            </TouchableOpacity>
          </View>
        <FlatList
            data={featuredItems}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.itemsList}
            ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
          renderItem={({ item }) => (
              <TouchableOpacity style={styles.itemCard}>
                <View style={styles.itemImageContainer}>
                  <Image source={item.image} style={styles.itemImage} />
                </View>
                <View style={styles.itemInfo}>
                  <ThemedText variant="caption" weight="semibold" style={styles.itemTitle}>
                  {item.title}
                </ThemedText>
                  <ThemedText variant="caption" style={styles.itemPrice}>
                    {item.price}
                  </ThemedText>
                  <View style={styles.itemMeta}>
                    <ThemedText variant="caption" style={styles.itemLocation}>
                      {item.location}
                    </ThemedText>
                    <View style={styles.ratingContainer}>
                      <AntDesign name="star" size={10} color="#F59E0B" />
                      <ThemedText variant="caption" style={styles.itemRating}>
                        {item.rating}
                      </ThemedText>
                    </View>
                  </View>
                </View>
                </TouchableOpacity>
            )}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText variant="subtitle" weight="semibold" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="add-outline" size={16} color="#6B7280" />
              </View>
              <ThemedText variant="caption" weight="semibold" style={styles.actionText}>
                List Item
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="search-outline" size={16} color="#6B7280" />
              </View>
              <ThemedText variant="caption" weight="semibold" style={styles.actionText}>
                Browse
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="list-outline" size={16} color="#6B7280" />
              </View>
              <ThemedText variant="caption" weight="semibold" style={styles.actionText}>
                My Items
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
              </View>
              <ThemedText variant="caption" weight="semibold" style={styles.actionText}>
                Messages
              </ThemedText>
            </TouchableOpacity>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 4,
  },
  welcomeText: {
    color: '#0B1220',
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
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
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#0B1220',
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    color: '#E94A4A',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryCard: {
    width: '30%',
    margin: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    color: '#0B1220',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  itemsList: {
    paddingRight: 20,
  },
  itemCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  itemImageContainer: {
    height: 100,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  itemInfo: {
    padding: 12,
  },
  itemTitle: {
    color: '#0B1220',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    color: '#E94A4A',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLocation: {
    color: '#6B7280',
    fontSize: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRating: {
    color: '#6B7280',
    fontSize: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  actionButton: {
    width: '48%',
    margin: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionText: {
    color: '#0B1220',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
