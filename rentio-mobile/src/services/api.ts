import { supabase } from '../lib/supabase';
import { Listing, Booking, Message, Conversation, Review, User } from '../types';

export const apiService = {
  // Listings
  async getListings(params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Listing[]; error: any }> {
    let query = supabase
      .from('listings')
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          icon
        ),
        users (
          id,
          name,
          avatar
        ),
        businesses (
          id,
          name,
          logo,
          is_verified
        )
      `)
      .eq('status', 'ACTIVE');

    if (params?.category) {
      query = query.eq('categories.slug', params.category);
    }

    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    if (params?.minPrice) {
      query = query.gte('price_daily', params.minPrice);
    }

    if (params?.maxPrice) {
      query = query.lte('price_daily', params.maxPrice);
    }

    if (params?.latitude && params?.longitude && params?.radius) {
      // For spatial queries, you'd need PostGIS extension
      // For now, we'll use a simple bounding box approach
      const radius = params.radius / 111; // Convert km to degrees (approximate)
      query = query
        .gte('latitude', params.latitude - radius)
        .lte('latitude', params.latitude + radius)
        .gte('longitude', params.longitude - radius)
        .lte('longitude', params.longitude + radius);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params?.limit || 20) - 1);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching listings:', error);
      return { data: [], error };
    }

    const listings: Listing[] = data.map((item: any) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      categoryId: item.category_id,
      userId: item.user_id,
      businessId: item.business_id,
      priceDaily: item.price_daily,
      priceWeekly: item.price_weekly,
      priceMonthly: item.price_monthly,
      weeklyDiscount: item.weekly_discount,
      monthlyDiscount: item.monthly_discount,
      weekendMultiplier: item.weekend_multiplier,
      depositType: item.deposit_type,
      depositValue: item.deposit_value,
      minDays: item.min_days,
      maxDays: item.max_days,
      instantBook: item.instant_book,
      requiresKyc: item.requires_kyc,
      location: item.location,
      latitude: item.latitude,
      longitude: item.longitude,
      deliveryOptions: item.delivery_options,
      availabilityRules: item.availability_rules,
      specifications: item.specifications,
      tags: item.tags,
      cancellationPolicy: item.cancellation_policy,
      status: item.status,
      featured: item.featured,
      verified: item.verified,
      views: item.views,
      bookingsCount: item.bookings_count,
      images: item.images,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      category: item.categories
        ? {
          id: item.categories.id,
          name: item.categories.name,
          slug: item.categories.slug,
          icon: item.categories.icon,
        }
        : undefined,
      owner: item.users
        ? {
          id: item.users.id,
          name: item.users.name,
          avatar: item.users.avatar,
        }
        : undefined,
      business: item.businesses
        ? {
          id: item.businesses.id,
          name: item.businesses.name,
          logo: item.businesses.logo,
          isVerified: item.businesses.is_verified,
        }
        : undefined,
    }));

    return { data: listings, error: null };
  },

  async getListingById(id: string): Promise<{ data: Listing | null; error: any }> {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          icon
        ),
        users (
          id,
          name,
          avatar,
          email,
          phone
        ),
        businesses (
          id,
          name,
          logo,
          is_verified,
          phone,
          email
        ),
        inventory_items (
          id,
          sku,
          name,
          variant,
          quantity,
          available
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching listing:', error);
      return { data: null, error };
    }

    const listing: Listing = {
      id: data.id,
      slug: data.slug,
      title: data.title,
      description: data.description,
      categoryId: data.category_id,
      userId: data.user_id,
      businessId: data.business_id,
      priceDaily: data.price_daily,
      priceWeekly: data.price_weekly,
      priceMonthly: data.price_monthly,
      weeklyDiscount: data.weekly_discount,
      monthlyDiscount: data.monthly_discount,
      weekendMultiplier: data.weekend_multiplier,
      depositType: data.deposit_type,
      depositValue: data.deposit_value,
      minDays: data.min_days,
      maxDays: data.max_days,
      instantBook: data.instant_book,
      requiresKyc: data.requires_kyc,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      deliveryOptions: data.delivery_options,
      availabilityRules: data.availability_rules,
      specifications: data.specifications,
      tags: data.tags,
      cancellationPolicy: data.cancellation_policy,
      status: data.status,
      featured: data.featured,
      verified: data.verified,
      views: data.views,
      bookingsCount: data.bookings_count,
      images: data.images,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      category: data.categories
        ? {
          id: data.categories.id,
          name: data.categories.name,
          slug: data.categories.slug,
          icon: data.categories.icon,
        }
        : undefined,
      owner: data.users
        ? {
          id: data.users.id,
          name: data.users.name,
          avatar: data.users.avatar,
          email: data.users.email,
          phone: data.users.phone,
        }
        : undefined,
      business: data.businesses
        ? {
          id: data.businesses.id,
          name: data.businesses.name,
          logo: data.businesses.logo,
          isVerified: data.businesses.is_verified,
          phone: data.businesses.phone,
          email: data.businesses.email,
        }
        : undefined,
      inventoryItems: data.inventory_items || [],
    };

    return { data: listing, error: null };
  },

  // Bookings
  async createBooking(booking: {
    listingId: string;
    startDate: string;
    endDate: string;
    quantity: number;
    deliveryType: 'PICKUP' | 'DELIVERY' | 'BOTH';
    deliveryAddress?: string;
    deliveryNotes?: string;
    notes?: string;
  }): Promise<{ data: Booking | null; error: any }> {
    const { data: listingData } = await this.getListingById(booking.listingId);

    if (!listingData) {
      return { data: null, error: 'Listing not found' };
    }

    // Calculate pricing
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    let unitPrice = listingData.priceDaily;
    if (duration >= 7 && listingData.priceWeekly) {
      unitPrice = listingData.priceWeekly / 7;
    } else if (duration >= 30 && listingData.priceMonthly) {
      unitPrice = listingData.priceMonthly / 30;
    }

    const subtotal = unitPrice * duration * booking.quantity;
    const serviceFee = subtotal * 0.1; // 10% service fee
    const deliveryFee = booking.deliveryType === 'DELIVERY' ? 50 : 0; // Fixed delivery fee
    const depositAmount = listingData.depositType === 'FIXED'
      ? (listingData.depositValue || 0)
      : subtotal * ((listingData.depositValue || 0) / 100);

    const totalAmount = subtotal + serviceFee + deliveryFee + depositAmount;

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        listing_id: booking.listingId,
        start_date: booking.startDate,
        end_date: booking.endDate,
        duration,
        quantity: booking.quantity,
        unit_price: unitPrice,
        subtotal,
        service_fee: serviceFee,
        delivery_fee: deliveryFee,
        deposit_amount: depositAmount,
        total_amount: totalAmount,
        delivery_type: booking.deliveryType,
        delivery_address: booking.deliveryAddress,
        delivery_notes: booking.deliveryNotes,
        notes: booking.notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      return { data: null, error };
    }

    const bookingResult: Booking = {
      id: data.id,
      bookingNumber: data.booking_number,
      renterId: data.renter_id,
      listingId: data.listing_id,
      packageId: data.package_id,
      startDate: data.start_date,
      endDate: data.end_date,
      duration: data.duration,
      quantity: data.quantity,
      unitPrice: data.unit_price,
      subtotal: data.subtotal,
      serviceFee: data.service_fee,
      deliveryFee: data.delivery_fee,
      depositAmount: data.deposit_amount,
      totalAmount: data.total_amount,
      status: data.status,
      paymentStatus: data.payment_status,
      deliveryType: data.delivery_type,
      deliveryAddress: data.delivery_address,
      deliveryNotes: data.delivery_notes,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { data: bookingResult, error: null };
  },

  async getUserBookings(userId: string): Promise<{ data: Booking[]; error: any }> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        listings (
          id,
          title,
          slug,
          price_daily,
          images
        ),
        users (
          name,
          avatar
        )
      `)
      .or(`renter_id.eq.${userId},listings.user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return { data: [], error };
    }

    const bookings: Booking[] = data.map((item: any) => ({
      id: item.id,
      bookingNumber: item.booking_number,
      renterId: item.renter_id,
      listingId: item.listing_id,
      packageId: item.package_id,
      startDate: item.start_date,
      endDate: item.end_date,
      duration: item.duration,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      subtotal: item.subtotal,
      serviceFee: item.service_fee,
      deliveryFee: item.delivery_fee,
      depositAmount: item.deposit_amount,
      totalAmount: item.total_amount,
      status: item.status,
      paymentStatus: item.payment_status,
      deliveryType: item.delivery_type,
      deliveryAddress: item.delivery_address,
      deliveryNotes: item.delivery_notes,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      listing: item.listings,
      renter: item.users,
    }));

    return { data: bookings, error: null };
  },

  // Conversations
  async getConversations(userId: string): Promise<{ data: Conversation[]; error: any }> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants (
          user_id,
          joined_at
        ),
        bookings (
          id,
          booking_number,
          listings (
            id,
            title,
            slug,
            price_daily,
            images
          )
        ),
        messages (
          id,
          content,
          created_at,
          from_user_id,
          is_read
        )
      `)
      .in('id', (
        await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', userId)
      ).data?.map(item => item.conversation_id) || [])
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return { data: [], error };
    }

    const conversations: Conversation[] = data.map((item: any) => ({
      id: item.id,
      bookingId: item.booking_id,
      title: item.title,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      participants: item.conversation_participants || [],
      booking: item.bookings,
      lastMessage: item.messages?.[0] || null,
    }));

    return { data: conversations, error: null };
  },

  async getMessages(conversationId: string): Promise<{ data: Message[]; error: any }> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        users (
          name,
          avatar
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return { data: [], error };
    }

    const messages: Message[] = data.map((item: any) => ({
      id: item.id,
      conversationId: item.conversation_id,
      bookingId: item.booking_id,
      fromUserId: item.from_user_id,
      toUserId: item.to_user_id,
      content: item.content,
      type: item.type,
      attachments: item.attachments,
      isRead: item.is_read,
      readAt: item.read_at,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      fromUser: item.users,
    }));

    return { data: messages, error: null };
  },

  async sendMessage(message: {
    conversationId: string;
    bookingId: string;
    fromUserId: string;
    toUserId: string;
    content: string;
    type: 'TEXT' | 'IMAGE' | 'FILE';
    attachments?: any[];
  }): Promise<{ data: Message | null; error: any }> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: message.conversationId,
        booking_id: message.bookingId,
        from_user_id: message.fromUserId,
        to_user_id: message.toUserId,
        content: message.content,
        type: message.type,
        attachments: message.attachments || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return { data: null, error };
    }

    const messageResult: Message = {
      id: data.id,
      conversationId: data.conversation_id,
      bookingId: data.booking_id,
      fromUserId: data.from_user_id,
      toUserId: data.to_user_id,
      content: data.content,
      type: data.type,
      attachments: data.attachments,
      isRead: data.is_read,
      readAt: data.read_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { data: messageResult, error: null };
  },

  // Reviews
  async getReviews(listingId?: string, userId?: string): Promise<{ data: Review[]; error: any }> {
    let query = supabase
      .from('reviews')
      .select(`
        *,
        bookings (
          booking_number,
          listings (
            title,
            slug
          )
        ),
        from_user (
          name,
          avatar
        ),
        to_user (
          name,
          avatar
        )
      `)
      .eq('is_public', true);

    if (listingId) {
      query = query.eq('bookings.listing_id', listingId);
    }

    if (userId) {
      query = query.or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      return { data: [], error };
    }

    const reviews: Review[] = data.map((item: any) => ({
      id: item.id,
      bookingId: item.booking_id,
      fromUserId: item.from_user_id,
      toUserId: item.to_user_id,
      rating: item.rating,
      title: item.title,
      comment: item.comment,
      isPublic: item.is_public,
      isFlagged: item.is_flagged,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      booking: item.bookings,
      fromUser: item.from_user,
      toUser: item.to_user,
    }));

    return { data: reviews, error: null };
  },

  // Categories
  async getCategories(): Promise<{ data: any[]; error: any }> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return { data: [], error };
    }

    return { data, error: null };
  },

  // User Profile
  async updateUserProfile(userId: string, profile: {
    name?: string;
    phone?: string;
    bio?: string;
    avatar?: string;
  }): Promise<{ data: User | null; error: any }> {
    const { data, error } = await supabase
      .from('users')
      .update(profile)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error };
    }

    return { data: data, error: null };
  },

  // Real-time subscriptions
  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  },

  subscribeToBookingUpdates(bookingId: string, callback: (booking: Booking) => void) {
    return supabase
      .channel(`bookings:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          callback(payload.new as Booking);
        }
      )
      .subscribe();
  },
};