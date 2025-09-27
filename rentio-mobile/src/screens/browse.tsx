import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  FlatList,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Card from '../components/ui/card';
import Button from '../components/ui/button';
import Badge from '../components/ui/badge';
import Input from '../components/ui/input';
import { formatPrice } from '../lib/utils';
import { apiService } from '../services/api';
import { Listing } from '../types';

const categories = [
  { id: 'all', name: 'All' },
  { id: 'tools', name: 'Tools' },
  { id: 'party-events', name: 'Party & Events' },
  { id: 'dresses', name: 'Dresses' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'trailers', name: 'Trailers' },
  { id: 'sports', name: 'Sports' },
];

const BrowseScreen: React.FC = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    deliveryOnly: false,
    instantBook: false,
    verifiedOnly: false,
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadListings();
  }, [searchQuery, selectedCategory, filters]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const params: any = {
        search: searchQuery || undefined,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        limit: 50,
      };

      const { data, error } = await apiService.getListings(params);

      if (error) {
        console.error('Error loading listings:', error);
      } else {
        setListings(data);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };

  const renderListingItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ListingDetail', { id: item.id })}>
      <Card style={styles.listingCard}>
        <View style={styles.listingImageContainer}>
          <Text style={styles.listingImage}>📷 {item.title.substring(0, 10)}...</Text>
          <View style={styles.listingBadges}>
            {item.instantBook && (
              <Badge text="Instant" variant="success" style={styles.badge} />
            )}
            {item.verified && (
              <Badge text="Verified" variant="default" style={styles.badge} />
            )}
          </View>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <View style={styles.listingContent}>
          <Text style={styles.listingTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.listingDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.listingLocation}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
          <View style={styles.listingFooter}>
            <View>
              <Text style={styles.listingPrice}>{formatPrice(item.priceDaily)}/day</Text>
              {item.priceWeekly && (
                <Text style={styles.listingWeeklyPrice}>
                  {formatPrice(item.priceWeekly)}/week
                </Text>
              )}
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FCD34D" />
              <Text style={styles.ratingText}>4.8 (23)</Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search items..."
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <Ionicons name="filter" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.categoryChipTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53237" />
          <Text style={styles.loadingText}>Loading listings...</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderListingItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.listingRow}
          contentContainerStyle={styles.listingsContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#E53237']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No listings found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            </View>
          }
        />
      )}

      <Modal visible={showFilters} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filters</Text>

            <Input
              value={filters.minPrice}
              onChangeText={(text) => setFilters(prev => ({ ...prev, minPrice: text }))}
              placeholder="Min price per day"
              keyboardType="numeric"
            />
            <Input
              value={filters.maxPrice}
              onChangeText={(text) => setFilters(prev => ({ ...prev, maxPrice: text }))}
              placeholder="Max price per day"
              keyboardType="numeric"
            />

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setFilters(prev => ({ ...prev, instantBook: !prev.instantBook }))}
              >
                <View style={[
                  styles.checkboxBox,
                  filters.instantBook && styles.checkboxBoxChecked,
                ]}>
                  {filters.instantBook && <Text style={styles.checkboxCheck}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Instant book only</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setFilters(prev => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))}
              >
                <View style={[
                  styles.checkboxBox,
                  filters.verifiedOnly && styles.checkboxBoxChecked,
                ]}>
                  {filters.verifiedOnly && <Text style={styles.checkboxCheck}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Verified only</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Clear Filters"
                variant="outline"
                onPress={() => setFilters({
                  minPrice: '',
                  maxPrice: '',
                  deliveryOnly: false,
                  instantBook: false,
                  verifiedOnly: false,
                })}
                style={styles.modalButton}
              />
              <Button
                title="Apply Filters"
                onPress={() => setShowFilters(false)}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  categoriesContainer: {
    padding: 16,
    paddingTop: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#E53237',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  listingsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  listingRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  listingCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  listingImageContainer: {
    height: 120,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  listingImage: {
    fontSize: 16,
  },
  listingBadges: {
    position: 'absolute',
    top: 8,
    left: 8,
    gap: 4,
  },
  badge: {
    marginBottom: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF80',
    borderRadius: 20,
    padding: 4,
  },
  listingContent: {
    padding: 12,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  listingDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  listingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53237',
  },
  listingWeeklyPrice: {
    fontSize: 10,
    color: '#6B7280',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#00000050',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  checkboxContainer: {
    gap: 16,
    marginVertical: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#E53237',
    borderColor: '#E53237',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
  },
});

export default BrowseScreen;