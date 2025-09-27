import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Card from '../components/ui/card';
import Button from '../components/ui/button';
import Badge from '../components/ui/badge';
import { formatPrice, formatDate } from '../lib/utils';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/auth-context';
import { Booking, Listing, Review } from '../types';

interface DashboardStats {
  totalListings: number;
  activeBookings: number;
  totalRevenue: number;
  averageRating: number;
  pendingMessages: number;
}

const DashboardScreen: React.FC = ({ navigation }: any) => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'bookings' | 'listings'>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    pendingMessages: 0,
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load user's bookings
      const { data: userBookings, error: bookingsError } = await apiService.getUserBookings(user.id);

      if (bookingsError) {
        console.error('Error loading bookings:', bookingsError);
      } else {
        setBookings(userBookings);

        // Calculate stats from bookings
        const activeBookings = userBookings.filter(b =>
          ['CONFIRMED', 'ACTIVE'].includes(b.status)
        ).length;

        const totalRevenue = userBookings
          .filter(b => b.status === 'COMPLETED')
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        setStats(prev => ({
          ...prev,
          activeBookings,
          totalRevenue,
        }));
      }

      // Load user's listings
      const { data: userListings, error: listingsError } = await apiService.getListings({
        limit: 50,
      });

      if (listingsError) {
        console.error('Error loading listings:', listingsError);
      } else {
        // Filter listings owned by current user
        const ownerListings = userListings.filter(l => l.userId === user.id);
        setListings(ownerListings);

        setStats(prev => ({
          ...prev,
          totalListings: ownerListings.length,
        }));
      }

      // Load user's reviews
      const { data: userReviews, error: reviewsError } = await apiService.getReviews(undefined, user.id);

      if (reviewsError) {
        console.error('Error loading reviews:', reviewsError);
      } else {
        setReviews(userReviews);

        // Calculate average rating
        if (userReviews.length > 0) {
          const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
          setStats(prev => ({
            ...prev,
            averageRating: Math.round(avgRating * 10) / 10,
          }));
        }
      }

      // Load conversations for message count
      const { data: conversations, error: conversationsError } = await apiService.getConversations(user.id);

      if (conversationsError) {
        console.error('Error loading conversations:', conversationsError);
      } else {
        // Count unread messages (simplified)
        const pendingMessages = conversations.length; // This could be enhanced with actual unread count
        setStats(prev => ({
          ...prev,
          pendingMessages,
        }));
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'CONFIRMED':
      case 'COMPLETED':
        return '#10B981';
      case 'PENDING':
        return '#F59E0B';
      case 'CANCELLED':
        return '#EF4444';
      case 'PAUSED':
      case 'DRAFT':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'COMPLETED':
        return 'Completed';
      case 'PENDING':
        return 'Pending';
      case 'CANCELLED':
        return 'Cancelled';
      case 'PAUSED':
        return 'Paused';
      case 'DRAFT':
        return 'Draft';
      default:
        return status;
    }
  };

  const renderStatsGrid = () => (
    <View style={styles.statsGrid}>
      <Card style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <Ionicons name="cube-outline" size={24} color="#E53237" />
        </View>
        <Text style={styles.statValue}>{stats.totalListings}</Text>
        <Text style={styles.statLabel}>Total Listings</Text>
      </Card>

      <Card style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <Ionicons name="calendar-outline" size={24} color="#10B981" />
        </View>
        <Text style={styles.statValue}>{stats.activeBookings}</Text>
        <Text style={styles.statLabel}>Active Bookings</Text>
      </Card>

      <Card style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <Ionicons name="cash-outline" size={24} color="#3B82F6" />
        </View>
        <Text style={styles.statValue}>{formatPrice(stats.totalRevenue)}</Text>
        <Text style={styles.statLabel}>Total Revenue</Text>
      </Card>

      <Card style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <Ionicons name="star-outline" size={24} color="#F59E0B" />
        </View>
        <Text style={styles.statValue}>{stats.averageRating || 'N/A'}</Text>
        <Text style={styles.statLabel}>Avg Rating</Text>
      </Card>
    </View>
  );

  const renderQuickActions = () => (
    <Card style={styles.actionsCard}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ListingDetail')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>New Listing</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Messages')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
            <Ionicons name="chatbubble-outline" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>Messages</Text>
          {stats.pendingMessages > 0 && (
            <Badge text={stats.pendingMessages.toString()} variant="error" style={styles.actionBadge} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Browse')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#3B82F6' }]}>
            <Ionicons name="trending-up-outline" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>Browse</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#F59E0B' }]}>
            <Ionicons name="people-outline" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderBookings = () => (
    <Card style={styles.bookingsCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Bookings</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bookingsList}>
        {bookings.slice(0, 5).map((booking) => (
          <TouchableOpacity key={booking.id} style={styles.bookingItem}>
            <Text style={styles.bookingImage}>📷</Text>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingTitle} numberOfLines={1}>
                {booking.listing?.title || 'Unknown Listing'}
              </Text>
              <Text style={styles.bookingRenter}>
                {booking.renter?.name || 'Unknown Renter'}
              </Text>
              <View style={styles.bookingDates}>
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text style={styles.bookingDateText}>
                  {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                </Text>
              </View>
            </View>
            <View style={styles.bookingRight}>
              <Badge
                text={getStatusText(booking.status)}
                variant="default"
                style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}
              />
              <Text style={styles.bookingAmount}>{formatPrice(booking.totalAmount || 0)}</Text>
            </View>
          </TouchableOpacity>
        ))}
        {bookings.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No bookings yet</Text>
          </View>
        )}
      </View>
    </Card>
  );

  const renderListings = () => (
    <Card style={styles.listingsCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Listings</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.listingsList}>
        {listings.slice(0, 5).map((listing) => (
          <TouchableOpacity key={listing.id} style={styles.listingItem}>
            <Text style={styles.listingImage}>📷</Text>
            <View style={styles.listingInfo}>
              <Text style={styles.listingTitle} numberOfLines={1}>
                {listing.title}
              </Text>
              <Text style={styles.listingPrice}>{formatPrice(listing.priceDaily)}/day</Text>
              <View style={styles.listingStats}>
                <View style={styles.listingStat}>
                  <Text style={styles.statValueSmall}>{listing.views || 0}</Text>
                  <Text style={styles.statLabelSmall}>views</Text>
                </View>
                <View style={styles.listingStat}>
                  <Text style={styles.statValueSmall}>{listing.bookingsCount || 0}</Text>
                  <Text style={styles.statLabelSmall}>bookings</Text>
                </View>
                <View style={styles.listingStat}>
                  <Ionicons name="star" size={12} color="#FCD34D" />
                  <Text style={styles.statValueSmall}>4.8</Text>
                </View>
              </View>
            </View>
            <View style={styles.listingRight}>
              <Badge
                text={getStatusText(listing.status)}
                variant="default"
                style={[styles.statusBadge, { backgroundColor: getStatusColor(listing.status) + '20' }]}
              />
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-vertical" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
        {listings.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No listings yet</Text>
          </View>
        )}
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53237" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back, {user?.name?.split(' ')[0]}!</Text>
          <Text style={styles.title}>Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#1F2937" />
          {stats.pendingMessages > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{stats.pendingMessages}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E53237']}
          />
        }
      >
        {selectedTab === 'overview' && (
          <>
            {renderStatsGrid()}
            {renderQuickActions()}
            {renderBookings()}
            {renderListings()}
          </>
        )}

        {selectedTab === 'bookings' && (
          <>
            {renderStatsGrid()}
            {renderBookings()}
          </>
        )}

        {selectedTab === 'listings' && (
          <>
            {renderStatsGrid()}
            {renderListings()}
          </>
        )}
      </ScrollView>

      <View style={styles.tabBar}>
        {[
          { id: 'overview', label: 'Overview', iconName: 'home-outline' },
          { id: 'bookings', label: 'Bookings', iconName: 'calendar-outline' },
          { id: 'listings', label: 'Listings', iconName: 'cube-outline' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              selectedTab === tab.id && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab(tab.id as any)}
          >
            <Ionicons
              name={tab.iconName as any}
              size={20}
              color={selectedTab === tab.id ? '#E53237' : '#6B7280'}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.id && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  notificationButton: {
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#E53237',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF5A5F20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionsCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#E53237',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E53237',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '500',
  },
  actionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  bookingsCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  bookingsList: {
    gap: 12,
  },
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  bookingImage: {
    fontSize: 24,
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  bookingRenter: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  bookingDates: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingDateText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  bookingRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    marginBottom: 4,
  },
  bookingAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53237',
  },
  listingsCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  listingsList: {
    gap: 12,
  },
  listingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  listingImage: {
    fontSize: 32,
    marginRight: 12,
  },
  listingInfo: {
    flex: 1,
    marginRight: 12,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  listingPrice: {
    fontSize: 12,
    color: '#E53237',
    fontWeight: '600',
    marginBottom: 4,
  },
  listingStats: {
    flexDirection: 'row',
    gap: 12,
  },
  listingStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValueSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 2,
  },
  statLabelSmall: {
    fontSize: 10,
    color: '#6B7280',
  },
  listingRight: {
    alignItems: 'flex-end',
  },
  moreButton: {
    padding: 4,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#E53237',
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#E53237',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
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

export default DashboardScreen;