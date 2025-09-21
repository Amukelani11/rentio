// User types
export interface User {
  id: string;
  email: string;
  username?: string;
  phone?: string;
  name: string;
  avatar?: string;
  bio?: string;
  roles: Role[];
  status: UserStatus;
  kycStatus: KycStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  totalReviews?: number;
  averageRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  idNumber?: string;
  idDocument?: string;
  proofOfAddress?: string;
  businessName?: string;
  businessReg?: string;
  vatNumber?: string;
  currency: string;
  language: string;
  timezone: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  type: AddressType;
  isDefault: boolean;
  street: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Business types
export interface Business {
  id: string;
  userId: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  deliveryRadius: number;
  status: BusinessStatus;
  isVerified: boolean;
  businessHours?: BusinessHours;
  totalReviews?: number;
  averageRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessHours {
  [key: string]: {
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
  };
}

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  slug: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  createdAt: Date;
  updatedAt: Date;
}

// Listing types
export interface Listing {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  category: Category;
  userId?: string;
  user?: User;
  businessId?: string;
  business?: Business;
  priceDaily: number;
  priceWeekly?: number;
  priceMonthly?: number;
  weeklyDiscount: number;
  monthlyDiscount: number;
  weekendMultiplier: number;
  depositType: DepositType;
  depositValue: number;
  minDays: number;
  maxDays?: number;
  instantBook: boolean;
  requiresKyc: boolean;
  maxDistance?: number;
  location: string;
  latitude?: number;
  longitude?: number;
  pickupAddress?: string;
  deliveryOptions?: DeliveryOptions;
  availabilityRules?: AvailabilityRules;
  specifications?: Record<string, any>;
  tags: string[];
  cancellationPolicy: CancellationPolicy;
  status: ListingStatus;
  featured: boolean;
  verified: boolean;
  views: number;
  bookingsCount: number;
  totalReviews: number;
  averageRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryOptions {
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  deliveryFeeType: 'fixed' | 'per_km';
  deliveryFee: number;
  deliveryRadius: number;
  pickupInstructions?: string;
  deliveryInstructions?: string;
}

export interface AvailabilityRules {
  advanceNoticeDays: number;
  minStayDays: number;
  maxStayDays?: number;
  blackoutDates: DateRange[];
  customRules: CustomRule[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface CustomRule {
  name: string;
  condition: string;
  action: string;
  value: number;
}

// Inventory types
export interface InventoryItem {
  id: string;
  listingId: string;
  listing: Listing;
  sku?: string;
  name?: string;
  variant?: string;
  quantity: number;
  available: number;
  createdAt: Date;
  updatedAt: Date;
}

// Package types
export interface Package {
  id: string;
  businessId: string;
  business: Business;
  name: string;
  description?: string;
  price: number;
  minLeadTime: number;
  maxQuantity?: number;
  createdAt: Date;
  updatedAt: Date;
  items: PackageItem[];
}

export interface PackageItem {
  id: string;
  packageId: string;
  package: Package;
  listingId: string;
  listing: Listing;
  quantity: number;
}

// Booking types
export interface Booking {
  id: string;
  bookingNumber: string;
  renterId: string;
  renter: User;
  listingId?: string;
  listing?: Listing;
  packageId?: string;
  package?: Package;
  startDate: Date;
  endDate: Date;
  duration: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  depositAmount: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  deliveryType?: DeliveryType;
  deliveryAddress?: string;
  deliveryNotes?: string;
  checkInReport?: CheckReport;
  checkOutReport?: CheckReport;
  confirmedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckReport {
  timestamp: Date;
  photos: string[];
  notes?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  damageReport?: DamageReport;
}

export interface DamageReport {
  items: DamageItem[];
  totalEstimatedCost: number;
  description?: string;
}

export interface DamageItem {
  description: string;
  estimatedCost: number;
  photoUrl?: string;
}

export interface BookingExtension {
  id: string;
  bookingId: string;
  booking: Booking;
  newEndDate: Date;
  additionalDays: number;
  additionalPrice: number;
  status: ExtensionStatus;
  requestedAt: Date;
  approvedAt?: Date;
}

// Payment types
export interface Payment {
  id: string;
  bookingId: string;
  booking: Booking;
  provider: PaymentProvider;
  providerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  escrowReleased: boolean;
  escrowReleasedAt?: Date;
  depositHold: boolean;
  depositReleased: boolean;
  depositReleasedAt?: Date;
  depositRetained: number;
  depositReason?: string;
  refundAmount: number;
  refundReason?: string;
  refundedAt?: Date;
  platformFee: number;
  paymentFee: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payout {
  id: string;
  userId: string;
  user: User;
  bookingId?: string;
  booking?: Booking;
  amount: number;
  currency: string;
  status: PayoutStatus;
  bankName?: string;
  bankAccount?: string;
  bankRef?: string;
  platformFee: number;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Review types
export interface Review {
  id: string;
  bookingId: string;
  booking: Booking;
  fromUserId: string;
  fromUser: User;
  toUserId: string;
  toUser: User;
  rating: number;
  title?: string;
  comment?: string;
  isPublic: boolean;
  isFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Dispute types
export interface Dispute {
  id: string;
  bookingId: string;
  booking: Booking;
  openedBy: string;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  resolution?: DisputeResolution;
  settlement?: any;
  openedAt: Date;
  respondedAt?: Date;
  resolvedAt?: Date;
  adminId?: string;
  adminNotes?: string;
  evidence?: EvidenceItem[];
}

export interface EvidenceItem {
  type: 'photo' | 'document' | 'message' | 'other';
  url: string;
  description?: string;
  uploadedAt: Date;
}

// Message types
export interface Message {
  id: string;
  bookingId: string;
  booking: Booking;
  fromUserId: string;
  fromUser: User;
  toUserId: string;
  toUser: User;
  content: string;
  type: MessageType;
  attachments?: MessageAttachment[];
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface MessageAttachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  user: User;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

// Search types
export interface SavedSearch {
  id: string;
  userId: string;
  user: User;
  name?: string;
  query: string;
  filters?: SearchFilters;
  location?: string;
  hasAlert: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  category?: string;
  priceRange?: [number, number];
  dateRange?: [Date, Date];
  distance?: number;
  deliveryAvailable?: boolean;
  instantBook?: boolean;
  minRating?: number;
  businessOnly?: boolean;
  verifiedOnly?: boolean;
}

// Team types
export interface TeamMember {
  id: string;
  businessId: string;
  business: Business;
  userId: string;
  user: User;
  role: TeamRole;
  permissions?: string[];
  status: TeamStatus;
  joinedAt: Date;
}

// Enums
export enum Role {
  CUSTOMER = 'CUSTOMER',
  INDIVIDUAL_LISTER = 'INDIVIDUAL_LISTER',
  BUSINESS_LISTER = 'BUSINESS_LISTER',
  ADMIN = 'ADMIN'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED'
}

export enum KycStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
  MORE_INFO_REQUIRED = 'MORE_INFO_REQUIRED'
}

export enum AddressType {
  HOME = 'HOME',
  WORK = 'WORK',
  BILLING = 'BILLING',
  SHIPPING = 'SHIPPING'
}

export enum BusinessStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum DepositType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE'
}

export enum CancellationPolicy {
  FLEXIBLE = 'FLEXIBLE',
  MODERATE = 'MODERATE',
  STRICT = 'STRICT'
}

export enum ListingStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYFAST = 'PAYFAST',
  PAYSTACK = 'PAYSTACK',
  YOCO = 'YOCO'
}

export enum DeliveryType {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
  BOTH = 'BOTH'
}

export enum ExtensionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum DisputeReason {
  DAMAGE = 'DAMAGE',
  LATE_RETURN = 'LATE_RETURN',
  NO_SHOW = 'NO_SHOW',
  ITEM_NOT_AS_DESCRIBED = 'ITEM_NOT_AS_DESCRIBED',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
  OTHER = 'OTHER'
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum DisputeResolution {
  FULL_REFUND = 'FULL_REFUND',
  PARTIAL_REFUND = 'PARTIAL_REFUND',
  NO_REFUND = 'NO_REFUND',
  SPLIT = 'SPLIT'
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM'
}

export enum NotificationType {
  BOOKING_REQUEST = 'BOOKING_REQUEST',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  DEPOSIT_RELEASED = 'DEPOSIT_RELEASED',
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  KYC_APPROVED = 'KYC_APPROVED',
  KYC_REJECTED = 'KYC_REJECTED',
  DISPUTE_OPENED = 'DISPUTE_OPENED',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
  PAYOUT_SENT = 'PAYOUT_SENT',
  REMINDER = 'REMINDER',
  MARKETING = 'MARKETING'
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  SMS = 'SMS'
}

export enum TeamRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  OPERATIONS = 'OPERATIONS',
  FINANCE = 'FINANCE',
  SUPPORT = 'SUPPORT'
}

export enum TeamStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REMOVED = 'REMOVED'
}

// Form types
export interface CreateListingForm {
  title: string;
  description: string;
  categoryId: string;
  priceDaily: number;
  priceWeekly?: number;
  priceMonthly?: number;
  weeklyDiscount: number;
  monthlyDiscount: number;
  weekendMultiplier: number;
  depositType: DepositType;
  depositValue: number;
  minDays: number;
  maxDays?: number;
  instantBook: boolean;
  requiresKyc: boolean;
  maxDistance?: number;
  location: string;
  latitude?: number;
  longitude?: number;
  deliveryOptions: DeliveryOptions;
  availabilityRules: AvailabilityRules;
  specifications?: Record<string, any>;
  tags: string[];
  cancellationPolicy: CancellationPolicy;
}

export interface BookingForm {
  listingId: string;
  startDate: Date;
  endDate: Date;
  quantity: number;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  deliveryNotes?: string;
  notes?: string;
}

export interface PaymentForm {
  paymentMethodId: string;
  savePaymentMethod: boolean;
}

export interface KycForm {
  idNumber: string;
  idDocument: File;
  proofOfAddress: File;
  businessName?: string;
  businessReg?: string;
  vatNumber?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Search and filter types
export interface ListingSearchParams {
  query?: string;
  category?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  startDate?: Date;
  endDate?: Date;
  minPrice?: number;
  maxPrice?: number;
  deliveryAvailable?: boolean;
  instantBook?: boolean;
  minRating?: number;
  businessOnly?: boolean;
  verifiedOnly?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'price' | 'rating' | 'distance' | 'newest';
  sortOrder?: 'asc' | 'desc';
}