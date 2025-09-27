import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

import Card from '../components/ui/card';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import Badge from '../components/ui/badge';
import { formatPrice, formatDate } from '../lib/utils';
import { apiService } from '../services/api';
import { Listing } from '../types';

const BookingScreen: React.FC = ({ navigation, route }: any) => {
  const { listingId, title, priceDaily, depositValue } = route?.params || {};

  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    deliveryOption: 'pickup',
    specialRequests: '',
  });
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loadingListing, setLoadingListing] = useState(true);

  useEffect(() => {
    if (listingId) {
      loadListing();
    }
  }, [listingId]);

  const loadListing = async () => {
    setLoadingListing(true);
    try {
      const { data, error } = await apiService.getListingById(listingId);

      if (error) {
        console.error('Error loading listing:', error);
        Alert.alert('Error', 'Failed to load listing details');
      } else {
        setListing(data);
      }
    } catch (error) {
      console.error('Error loading listing:', error);
      Alert.alert('Error', 'Failed to load listing details');
    } finally {
      setLoadingListing(false);
    }
  };

  const calculateTotal = (): {
    days: number;
    subtotal: number;
    serviceFee: number;
    deliveryFee: number;
    depositAmount: number;
    total: number;
    deposit: number;
  } | null => {
    if (!bookingData.startDate || !bookingData.endDate) return null;

    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (days <= 0) return null;

    const actualPriceDaily = listing?.priceDaily || priceDaily || 0;
    const actualDepositValue = listing?.depositValue || depositValue || 0;

    let subtotal = days * actualPriceDaily;

    // Apply weekly discount if applicable
    if (days >= 7 && listing?.priceWeekly) {
      subtotal = listing.priceWeekly;
    }

    // Apply monthly discount if applicable
    if (days >= 30 && listing?.priceMonthly) {
      subtotal = listing.priceMonthly;
    }

    const serviceFee = subtotal * 0.1; // 10% service fee
    const deliveryFee = bookingData.deliveryOption === 'delivery' ? 50 : 0;
    const depositAmount = listing?.depositType === 'PERCENTAGE'
      ? subtotal * (actualDepositValue / 100)
      : actualDepositValue;

    const total = subtotal + serviceFee + deliveryFee + depositAmount;

    return {
      days,
      subtotal,
      serviceFee,
      deliveryFee,
      depositAmount,
      total,
      deposit: actualDepositValue,
    };
  };

  const handleConfirmBooking = async () => {
    if (!bookingData.startDate || !bookingData.endDate) {
      Alert.alert('Error', 'Please select both start and end dates');
      return;
    }

    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);

    if (start >= end) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    const calculation = calculateTotal();
    if (!calculation) {
      Alert.alert('Error', 'Invalid date range');
      return;
    }

    if (!listing) {
      Alert.alert('Error', 'Listing information not available');
      return;
    }

    setLoading(true);

    try {
      const { data: booking, error } = await apiService.createBooking({
        listingId: listing.id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        quantity: 1,
        deliveryType: bookingData.deliveryOption === 'delivery' ? 'DELIVERY' : 'PICKUP',
        deliveryAddress: bookingData.deliveryOption === 'delivery' ? 'User address to be confirmed' : undefined,
        deliveryNotes: '',
        notes: bookingData.specialRequests,
      });

      if (error) {
        console.error('Error creating booking:', error);
        Alert.alert('Error', 'Failed to create booking. Please try again.');
        return;
      }

      Alert.alert(
        'Booking Confirmed!',
        `Your booking for ${title} has been confirmed. Booking ID: ${booking?.bookingNumber}. Total: ${formatPrice(calculation.total)}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Main', { screen: 'Dashboard' }),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculation = calculateTotal();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Book Now</Text>
          <Text style={styles.subtitle}>{title}</Text>
        </View>

        {/* Listing Summary */}
        <Card style={styles.card}>
          <View style={styles.listingSummary}>
            <Text style={styles.listingTitle}>{title}</Text>
            <Text style={styles.listingPrice}>{formatPrice(priceDaily)}/day</Text>
          </View>
        </Card>

        {/* Date Selection */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Select Dates</Text>
          <Input
            value={bookingData.startDate}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, startDate: text }))}
            placeholder="Start Date (YYYY-MM-DD)"
          />
          <Input
            value={bookingData.endDate}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, endDate: text }))}
            placeholder="End Date (YYYY-MM-DD)"
          />
        </Card>

        {/* Delivery Options */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Options</Text>
          <View style={styles.deliveryOptions}>
            {[
              { id: 'pickup', label: 'Pickup', price: 'Free', description: 'Pick up from owner' },
              { id: 'delivery', label: 'Delivery', price: 'R50', description: 'Delivered to your location' },
            ].map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.deliveryOption,
                  bookingData.deliveryOption === option.id && styles.deliveryOptionSelected,
                ]}
                onPress={() => setBookingData(prev => ({ ...prev, deliveryOption: option.id }))}
              >
                <View style={styles.deliveryOptionHeader}>
                  <Text style={styles.deliveryOptionLabel}>{option.label}</Text>
                  <Badge text={option.price} variant="secondary" />
                </View>
                <Text style={styles.deliveryOptionDesc}>{option.description}</Text>
                {bookingData.deliveryOption === option.id && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedCheck}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Special Requests */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
          <Input
            value={bookingData.specialRequests}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, specialRequests: text }))}
            placeholder="Any special requirements or questions..."
            multiline
          />
        </Card>

        {/* Price Breakdown */}
        {calculation && calculation.days > 0 && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Price Breakdown</Text>
            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{formatPrice(priceDaily)} × {calculation.days} days</Text>
                <Text style={styles.priceValue}>{formatPrice(calculation.subtotal)}</Text>
              </View>
              {calculation.deliveryFee > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Delivery Fee</Text>
                  <Text style={styles.priceValue}>{formatPrice(calculation.deliveryFee)}</Text>
                </View>
              )}
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Security Deposit</Text>
                <Text style={styles.priceValue}>{formatPrice(calculation.deposit)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(calculation.total + calculation.deposit)}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Terms and Conditions */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Rental Agreement</Text>
          <Text style={styles.termsText}>
            By confirming this booking, you agree to:
            {'\n'}• Return the item in the same condition
            {'\n'}• Pay for any damages beyond normal wear
            {'\n'}• Follow the owner's usage guidelines
            {'\n'}• Comply with Rentio's rental policies
          </Text>
        </Card>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <View style={styles.priceInfo}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>
            {calculation && calculation.days > 0 ? formatPrice(calculation.total + calculation.deposit) : formatPrice(0)}
          </Text>
        </View>
        <Button
          title="Confirm Booking"
          onPress={handleConfirmBooking}
          loading={loading}
          disabled={!calculation || calculation.days === 0}
          style={styles.confirmButton}
        />
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  card: {
    margin: 16,
    marginTop: 0,
  },
  listingSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53237',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  deliveryOptions: {
    gap: 12,
  },
  deliveryOption: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  deliveryOptionSelected: {
    borderColor: '#E53237',
    backgroundColor: '#FF5A5F10',
  },
  deliveryOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deliveryOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  deliveryOptionDesc: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E53237',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceBreakdown: {
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E53237',
  },
  termsText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceInfo: {
    flex: 1,
    marginRight: 16,
  },
  confirmButton: {
    flex: 1,
  },
});

export default BookingScreen;