// Database schema types and enums based on the original Prisma schema

export enum Role {
  CUSTOMER = 'CUSTOMER',
  INDIVIDUAL_LISTER = 'INDIVIDUAL_LISTER',
  BUSINESS_LISTER = 'BUSINESS_LISTER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
}

export enum KycStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
  MORE_INFO_REQUIRED = 'MORE_INFO_REQUIRED',
}

export enum AddressType {
  HOME = 'HOME',
  WORK = 'WORK',
  BILLING = 'BILLING',
  SHIPPING = 'SHIPPING',
}

export enum BusinessStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum DepositType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export enum CancellationPolicy {
  FLEXIBLE = 'FLEXIBLE',
  MODERATE = 'MODERATE',
  STRICT = 'STRICT',
}

export enum ListingStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYFAST = 'PAYFAST',
  PAYSTACK = 'PAYSTACK',
  YOCO = 'YOCO',
}

export enum DeliveryType {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
  BOTH = 'BOTH',
}

export enum ExtensionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum DisputeReason {
  DAMAGE = 'DAMAGE',
  LATE_RETURN = 'LATE_RETURN',
  NO_SHOW = 'NO_SHOW',
  ITEM_NOT_AS_DESCRIBED = 'ITEM_NOT_AS_DESCRIBED',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
  OTHER = 'OTHER',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum DisputeResolution {
  FULL_REFUND = 'FULL_REFUND',
  PARTIAL_REFUND = 'PARTIAL_REFUND',
  NO_REFUND = 'NO_REFUND',
  SPLIT = 'SPLIT',
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM',
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
  MARKETING = 'MARKETING',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  SMS = 'SMS',
}

export enum TeamRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  OPERATIONS = 'OPERATIONS',
  FINANCE = 'FINANCE',
  SUPPORT = 'SUPPORT',
}

export enum TeamStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REMOVED = 'REMOVED',
}

// Type definitions for database tables
export interface User {
  id: string
  email: string
  username?: string
  phone?: string
  password?: string
  name: string
  avatar?: string
  bio?: string
  status: UserStatus
  kycStatus: KycStatus
  emailVerified: boolean
  phoneVerified: boolean
  isBlocked: boolean
  blockedReason?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserRole {
  id: string
  userId: string
  role: Role
}

export interface Profile {
  id: string
  userId: string
  idNumber?: string
  idDocument?: string
  proofOfAddress?: string
  businessName?: string
  businessReg?: string
  vatNumber?: string
  currency: string
  language: string
  timezone: string
  isAdmin: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  id: string
  userId: string
  type: AddressType
  isDefault: boolean
  street: string
  suburb: string
  city: string
  province: string
  postalCode: string
  country: string
  latitude?: number
  longitude?: number
  createdAt: Date
  updatedAt: Date
}

export interface Listing {
  id: string
  title: string
  slug: string
  description: string
  categoryId: string
  userId?: string
  businessId?: string
  priceDaily: number
  priceWeekly?: number
  priceMonthly?: number
  weeklyDiscount: number
  monthlyDiscount: number
  weekendMultiplier: number
  depositType: DepositType
  depositValue: number
  minDays: number
  maxDays?: number
  instantBook: boolean
  requiresKyc: boolean
  maxDistance?: number
  location: string
  latitude?: number
  longitude?: number
  deliveryOptions?: any
  availabilityRules?: any
  specifications?: any
  tags: string[]
  cancellationPolicy: CancellationPolicy
  status: ListingStatus
  featured: boolean
  verified: boolean
  views: number
  bookingsCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  id: string
  bookingNumber: string
  renterId: string
  listingId?: string
  packageId?: string
  startDate: Date
  endDate: Date
  duration: number
  quantity: number
  unitPrice: number
  subtotal: number
  serviceFee: number
  deliveryFee: number
  depositAmount: number
  totalAmount: number
  status: BookingStatus
  paymentStatus: PaymentStatus
  deliveryType?: DeliveryType
  deliveryAddress?: string
  deliveryNotes?: string
  checkInReport?: any
  checkOutReport?: any
  confirmedAt?: Date
  startedAt?: Date
  completedAt?: Date
  cancelledAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  bookingId: string
  provider: PaymentProvider
  providerId: string
  amount: number
  currency: string
  status: PaymentStatus
  escrowReleased: boolean
  escrowReleasedAt?: Date
  depositHold: boolean
  depositReleased: boolean
  depositReleasedAt?: Date
  depositRetained: number
  depositReason?: string
  refundAmount: number
  refundReason?: string
  refundedAt?: Date
  platformFee: number
  paymentFee: number
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  bookingId: string
  fromUserId: string
  toUserId: string
  content: string
  type: MessageType
  attachments?: any
  isRead: boolean
  readAt?: Date
  createdAt: Date
}

// Auth user interface for the application
export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar?: string
  roles: Role[]
  kycStatus: KycStatus
  isAdmin: boolean
}