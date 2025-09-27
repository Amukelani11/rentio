export interface User {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  avatar?: string | null;
  bio?: string | null;
  roles: Role[];
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | null;
  kycStatus?: 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | null;
  emailVerified?: boolean | null;
  phoneVerified?: boolean | null;
  isBlocked?: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export enum Role {
  CUSTOMER = 'CUSTOMER',
  INDIVIDUAL_LISTER = 'INDIVIDUAL_LISTER',
  BUSINESS_LISTER = 'BUSINESS_LISTER',
  ADMIN = 'ADMIN',
}

export interface Listing {
  id: string;
  slug?: string | null;
  title: string;
  description: string;
  categoryId?: string | null;
  userId?: string | null;
  businessId?: string | null;
  priceDaily: number;
  priceWeekly?: number | null;
  priceMonthly?: number | null;
  weeklyDiscount?: number | null;
  monthlyDiscount?: number | null;
  weekendMultiplier?: number | null;
  depositType?: 'FIXED' | 'PERCENTAGE' | null;
  depositValue?: number | null;
  minDays?: number | null;
  maxDays?: number | null;
  instantBook: boolean;
  requiresKyc?: boolean | null;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  deliveryOptions?: ListingDeliveryOptions | null;
  availabilityRules?: any;
  specifications?: any;
  tags?: string[] | null;
  cancellationPolicy?: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  featured: boolean;
  verified: boolean;
  views?: number | null;
  bookingsCount?: number | null;
  images?: string[] | null;
  inventoryItems?: ListingInventoryItem[];
  category?: ListingCategory;
  owner?: ListingOwner;
  business?: ListingBusiness;
  averageRating?: number | null;
  reviewCount?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListingDeliveryOptions {
  deliveryAvailable: boolean;
  deliveryRadius?: number | null;
  deliveryFee?: number | null;
  pickupAvailable?: boolean | null;
}

export interface ListingInventoryItem {
  id: string;
  sku?: string | null;
  name?: string | null;
  variant?: string | null;
  quantity?: number | null;
  available?: boolean | null;
}

export interface ListingCategory {
  id: string;
  name: string;
  slug?: string | null;
  icon?: string | null;
}

export interface ListingOwner {
  id: string;
  name?: string | null;
  avatar?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface ListingBusiness {
  id: string;
  name?: string | null;
  logo?: string | null;
  isVerified?: boolean | null;
  phone?: string | null;
  email?: string | null;
}

export interface Booking {
  id: string;
  bookingNumber?: string | null;
  renterId?: string | null;
  listingId: string;
  packageId?: string | null;
  startDate: string;
  endDate: string;
  duration?: number | null;
  quantity?: number | null;
  unitPrice?: number | null;
  subtotal?: number | null;
  serviceFee?: number | null;
  deliveryFee?: number | null;
  depositAmount: number;
  totalAmount?: number | null;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'PARTIAL_REFUND';
  deliveryType?: 'PICKUP' | 'DELIVERY' | 'BOTH' | null;
  deliveryAddress?: string | null;
  deliveryNotes?: string | null;
  notes?: string | null;
  listing?: Listing | null;
  renter?: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  bookingId?: string | null;
  fromUserId: string;
  toUserId?: string | null;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  attachments?: Attachment[];
  isRead?: boolean | null;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    name: string | null;
    avatar?: string | null;
  };
  fromUser?: {
    name?: string | null;
    avatar?: string | null;
  };
}

export interface Attachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
}

export interface Conversation {
  id: string;
  title?: string | null;
  bookingId?: string | null;
  participants: ConversationParticipant[];
  booking?: Booking | null;
  lastMessage?: Message | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  userId: string;
  joinedAt?: string | null;
  users?: User | null;
}

export interface Review {
  id: string;
  bookingId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  isPublic?: boolean | null;
  isFlagged?: boolean | null;
  createdAt: string;
  updatedAt: string;
  booking?: Booking | null;
  fromUser?: User | null;
  toUser?: User | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}