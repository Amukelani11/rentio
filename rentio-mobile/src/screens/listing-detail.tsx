import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import Card from '../components/ui/card';
import Button from '../components/ui/button';
import Badge from '../components/ui/badge';
import { formatPrice, formatDate } from '../lib/utils';

const mockListing = {
  id: '1',
  title: 'Professional Camera Kit',
  description: `Complete Sony camera setup perfect for professional photography and videography. This kit includes:

  • Sony A7 III Camera Body
  • 24-70mm f/2.8 Lens
  • 70-200mm f/2.8 Lens
  • Extra Battery and Charger
  • Professional Camera Bag
  • Memory Cards (2x 64GB)
  • Lens Cleaning Kit

  Perfect for weddings, events, portraits, and commercial photography. The camera produces stunning 4K video and high-resolution still images.`,
  priceDaily: 350,
  priceWeekly: 2100,
  priceMonthly: 6300,
  depositValue: 1000,
  location: 'Cape Town, Western Cape',
  latitude: -33.9249,
  longitude: 18.4241,
  rating: 4.8,
  reviewCount: 23,
  instantBook: true,
  verified: true,
  availability: [
    { date: '2024-01-15', available: false },
    { date: '2024-01-16', available: false },
    { date: '2024-01-17', available: true },
    { date: '2024-01-18', available: true },
    { date: '2024-01-19', available: true },
  ],
  owner: {
    id: 'owner1',
    name: 'Sarah Johnson',
    avatar: 'https://via.placeholder.com/50/FF5A5F/FFFFFF?text=SJ',
    rating: 4.9,
    responseTime: '1 hour',
    memberSince: '2022',
    verified: true,
  },
  reviews: [
    {
      id: '1',
      user: 'John D.',
      rating: 5,
      date: '2024-01-10',
      comment: 'Excellent camera! Sarah was very helpful and the equipment was in perfect condition.',
    },
    {
      id: '2',
      user: 'Maria K.',
      rating: 5,
      date: '2024-01-05',
      comment: 'Great experience! The camera worked perfectly for our event.',
    },
  ],
  deliveryOptions: {
    deliveryAvailable: true,
    deliveryRadius: 25,
    deliveryFee: 50,
    pickupAvailable: true,
  },
  category: 'Electronics',
  tags: ['Professional', '4K Video', 'Weddings', 'Events'],
};

const images = [
  'https://via.placeholder.com/400x300/FF5A5F/FFFFFF?text=Camera+1',
  'https://via.placeholder.com/400x300/FF5A5F/FFFFFF?text=Camera+2',
  'https://via.placeholder.com/400x300/FF5A5F/FFFFFF?text=Camera+3',
  'https://via.placeholder.com/400x300/FF5A5F/FFFFFF?text=Camera+4',
];

const ListingDetailScreen: React.FC = ({ route, navigation }: any) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${mockListing.title} on Rentio!`,
        url: 'https://rentio.app/listing/1',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleBookNow = () => {
    navigation.navigate('Booking', {
      listingId: mockListing.id,
      title: mockListing.title,
      priceDaily: mockListing.priceDaily,
      depositValue: mockListing.depositValue,
    });
  };

  const handleMessageOwner = () => {
    navigation.navigate('Chat', {
      userId: mockListing.owner.id,
      userName: mockListing.owner.name,
      listingId: mockListing.id,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Text style={styles.mainImage}>📸 {images[selectedImageIndex]}</Text>
          <View style={styles.imageThumbnails}>
            {images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.thumbnail,
                  selectedImageIndex === index && styles.thumbnailSelected,
                ]}
                onPress={() => setSelectedImageIndex(index)}
              >
                <Text style={styles.thumbnailText}>📸</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.imageActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setIsFavorite(!isFavorite)}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? '#E53237' : '#FFFFFF'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          </View>
        </View>

        {/* Title and Basic Info */}
        <View style={styles.header}>
          <Text style={styles.title}>{mockListing.title}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FCD34D" />
            <Text style={styles.ratingText}>
              {mockListing.rating} ({mockListing.reviewCount} reviews)
            </Text>
          </View>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.locationText}>{mockListing.location}</Text>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.badgesContainer}>
          {mockListing.instantBook && (
            <Badge text="Instant Book" variant="success" style={styles.badge} />
          )}
          {mockListing.verified && (
            <Badge text="Verified" variant="default" style={styles.badge} />
          )}
          <Badge text={mockListing.category} variant="secondary" style={styles.badge} />
        </View>

        {/* Owner Info */}
        <Card style={styles.ownerCard}>
          <View style={styles.ownerHeader}>
            <Text style={styles.ownerAvatar}>{mockListing.owner.avatar}</Text>
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{mockListing.owner.name}</Text>
              <Text style={styles.ownerStats}>
                ⭐ {mockListing.owner.rating} • Responds in {mockListing.owner.responseTime}
              </Text>
            </View>
          </View>
          <View style={styles.ownerActions}>
            <Button
              title="Message"
              variant="outline"
              onPress={handleMessageOwner}
              style={styles.messageButton}
            />
            <TouchableOpacity style={styles.viewProfileButton}>
              <Text style={styles.viewProfileText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{mockListing.description}</Text>
        </View>

        {/* Pricing */}
        <Card style={styles.pricingCard}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.priceRow}>
            <Text style={styles.pricingLabel}>Daily</Text>
            <Text style={styles.priceValue}>{formatPrice(mockListing.priceDaily)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.pricingLabel}>Weekly</Text>
            <Text style={styles.priceValue}>{formatPrice(mockListing.priceWeekly)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.pricingLabel}>Monthly</Text>
            <Text style={styles.priceValue}>{formatPrice(mockListing.priceMonthly)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.pricingLabel}>Security Deposit</Text>
            <Text style={styles.priceValue}>{formatPrice(mockListing.depositValue)}</Text>
          </View>
        </Card>

        {/* Delivery Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Options</Text>
          <View style={styles.deliveryOption}>
            <Text style={styles.deliveryCheck}>✓</Text>
            <Text style={styles.deliveryText}>
              Delivery available ({mockListing.deliveryOptions.deliveryRadius}km radius)
            </Text>
          </View>
          <View style={styles.deliveryOption}>
            <Text style={styles.deliveryCheck}>✓</Text>
            <Text style={styles.deliveryText}>
              Pickup available at owner's location
            </Text>
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews ({mockListing.reviewCount})</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          {mockListing.reviews.map((review) => (
            <Card key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.user}</Text>
              <View style={styles.reviewRating}>
                <Ionicons name="star" size={14} color="#FCD34D" />
                <Text style={styles.reviewRatingText}>{review.rating}</Text>
              </View>
              </View>
              <Text style={styles.reviewDate}>{formatDate(review.date)}</Text>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <LinearGradient colors={['#FFFFFF00', '#FFFFFF']} style={styles.bottomGradient}>
        <View style={styles.bottomBar}>
          <View style={styles.priceInfo}>
            <Text style={styles.currentPrice}>{formatPrice(mockListing.priceDaily)}</Text>
            <Text style={styles.pricingLabel}>per day</Text>
          </View>
          <Button title="Book Now" onPress={handleBookNow} style={styles.bookButton} />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mainImage: {
    fontSize: 48,
  },
  imageThumbnails: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF80',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: '#E53237',
  },
  thumbnailText: {
    fontSize: 20,
  },
  imageActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#00000050',
    borderRadius: 20,
    padding: 8,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  badge: {
    marginBottom: 0,
  },
  ownerCard: {
    margin: 16,
    marginBottom: 0,
  },
  ownerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ownerAvatar: {
    fontSize: 40,
    marginRight: 12,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  ownerStats: {
    fontSize: 14,
    color: '#6B7280',
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  messageButton: {
    flex: 1,
  },
  viewProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewProfileText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  pricingCard: {
    margin: 16,
    marginBottom: 0,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryCheck: {
    fontSize: 16,
    marginRight: 8,
    color: '#10B981',
  },
  deliveryText: {
    fontSize: 16,
    color: '#374151',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    color: '#E53237',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewCard: {
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    paddingTop: 50,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  priceInfo: {
    flex: 1,
    marginRight: 16,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E53237',
  },
  pricingLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  bookButton: {
    flex: 1,
  },
});

export default ListingDetailScreen;