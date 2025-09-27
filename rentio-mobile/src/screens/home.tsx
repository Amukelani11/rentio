import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import Card from '../components/ui/card';
import Button from '../components/ui/button';
import Badge from '../components/ui/badge';
import { formatPrice, formatRelativeTime } from '../lib/utils';

const categories = [
  { id: 'tools', name: 'Tools', icon: '🔧' },
  { id: 'party-events', name: 'Party & Events', icon: '🎉' },
  { id: 'dresses', name: 'Dresses', icon: '👗' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'trailers', name: 'Trailers', icon: '🚚' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
];

const featuredListings = [
  {
    id: '1',
    title: 'Professional Camera Kit',
    description: 'Complete Sony camera setup with lenses and accessories',
    priceDaily: 350,
    rating: 4.8,
    reviews: 23,
    image: 'https://via.placeholder.com/300x200/FF5A5F/FFFFFF?text=Camera',
    location: 'Cape Town',
    instantBook: true,
  },
  {
    id: '2',
    title: 'Party Tent & Equipment',
    description: 'Large tent for events with tables and chairs',
    priceDaily: 450,
    rating: 4.9,
    reviews: 45,
    image: 'https://via.placeholder.com/300x200/FF5A5F/FFFFFF?text=Tent',
    location: 'Johannesburg',
    instantBook: false,
  },
  {
    id: '3',
    title: 'Power Tools Set',
    description: 'Complete power tools collection for construction',
    priceDaily: 200,
    rating: 4.7,
    reviews: 18,
    image: 'https://via.placeholder.com/300x200/FF5A5F/FFFFFF?text=Tools',
    location: 'Durban',
    instantBook: true,
  },
];

const HomeScreen: React.FC = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');

  const renderFeaturedItem = ({ item }: any) => (
    <TouchableOpacity onPress={() => navigation.navigate('ListingDetail', { id: item.id })}>
      <Card style={styles.listingCard}>
        <Image source={{ uri: item.image }} style={styles.listingImage} />
        <View style={styles.listingContent}>
          <View style={styles.listingHeader}>
            <Text style={styles.listingTitle} numberOfLines={2}>{item.title}</Text>
            {item.instantBook && (
              <Badge text="Instant" variant="success" />
            )}
          </View>
          <Text style={styles.listingDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.listingFooter}>
            <Text style={styles.listingPrice}>{formatPrice(item.priceDaily)}/day</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FCD34D" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={12} color="#6B7280" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#FF5A5F20', '#FFFFFF']}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>Why buy?</Text>
          <Text style={styles.heroSubtitle}>Rent it nearby</Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInput}>
              <Ionicons name="search" size={20} color="#6B7280" />
              <Text style={styles.searchPlaceholder}>What do you need?</Text>
            </View>
            <View style={styles.searchDivider} />
            <View style={styles.searchInput}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <Text style={styles.searchPlaceholder}>Where?</Text>
            </View>
          </View>

          <Button
            title="Search"
            onPress={() => navigation.navigate('Browse')}
            style={styles.searchButton}
          />
        </LinearGradient>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => navigation.navigate('Browse', { category: category.id })}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Listings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Items</Text>
          <FlatList
            data={featuredListings}
            renderItem={renderFeaturedItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Rentio?</Text>
          <View style={styles.benefitsGrid}>
            {[
              { icon: '🛡️', title: 'Secure Payments', desc: 'Protected transactions' },
              { icon: '✓', title: 'Verified Users', desc: 'Trusted community' },
              { icon: '💰', title: 'Save Money', desc: 'Affordable rentals' },
              { icon: '🌟', title: 'Ratings', desc: 'Build reputation' },
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitCard}>
                <Text style={styles.benefitIcon}>{benefit.icon}</Text>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDesc}>{benefit.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroSection: {
    padding: 24,
    paddingTop: 48,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  heroSubtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E53237',
    marginBottom: 24,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 4,
    marginBottom: 16,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: '#9CA3AF',
    fontSize: 16,
  },
  searchDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  searchButton: {
    marginTop: 0,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  featuredList: {
    paddingRight: 24,
  },
  listingCard: {
    width: 280,
    marginRight: 16,
  },
  listingImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  listingContent: {
    padding: 12,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  listingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E53237',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  benefitCard: {
    width: '48%',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
  },
  benefitIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default HomeScreen;