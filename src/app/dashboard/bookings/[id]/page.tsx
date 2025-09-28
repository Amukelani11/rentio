'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  DollarSign, 
  Package, 
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  CreditCard,
  Truck,
  FileText,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import RentalAgreementModal from '@/components/RentalAgreementModal';

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  paymentStatus: string;
  startDate: string;
  endDate: string;
  duration: number;
  quantity: number;
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  depositAmount: number;
  totalAmount: number;
  deliveryType: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  notes?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  createdAt: string;
  updatedAt: string;
  listing: {
    id: string;
    title: string;
    slug: string;
    description: string;
    priceDaily: number;
    images: string[];
    category: {
      name: string;
      icon?: string;
    };
    user?: {
      name: string;
      email: string;
      phone?: string;
      avatar?: string;
    };
    business?: {
      name: string;
      email: string;
      phone?: string;
      logo?: string;
    };
  };
  renter: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
  };
  payments: Array<{
    id: string;
    status: string;
    amount: number;
    provider: string;
    depositHold: boolean;
    depositReleased: boolean;
    createdAt: string;
    amountCaptured?: number;
  }>;
  reviews?: Array<{
    id: string;
    rating: number;
    title: string;
    comment: string;
    createdAt: string;
  }>;
}

export default function BookingDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');
  const paymentStatus = searchParams.get('payment');
  const [user, setUser] = useState<any>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreementModalOpen, setAgreementModalOpen] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      router.push('/dashboard/bookings');
      return;
    }
    fetchData();
  }, [bookingId]);

  // Handle payment success confirmation
  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (paymentStatus === 'success' && bookingId) {
        const checkoutId = searchParams.get('checkoutId');
        if (checkoutId) {
          try {
            const response = await fetch('/api/payments/yoco/confirm', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                bookingId,
                checkoutId,
              }),
            });

            if (response.ok) {
              // Refresh booking data to show updated status
              fetchData();
              // Clean up URL parameters
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete('payment');
              newUrl.searchParams.delete('checkoutId');
              window.history.replaceState({}, '', newUrl.toString());
            }
          } catch (error) {
            console.error('Error confirming payment:', error);
          }
        }
      }
    };

    handlePaymentSuccess();
  }, [paymentStatus, bookingId, searchParams]);

  const fetchData = async () => {
    try {
      console.log('Fetching data for booking ID:', bookingId);
      const [userResponse, bookingResponse] = await Promise.all([
        fetch('/api/auth/user'),
        fetch(`/api/bookings/${bookingId}`),
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      }

      if (bookingResponse.ok) {
        const bookingData = await bookingResponse.json();
        console.log('Booking data received:', bookingData);
        setBooking(bookingData.data);
      } else {
        const errorData = await bookingResponse.json();
        console.error('Booking fetch error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-orange-100 text-orange-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'REFUNDED': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAction = async (action: string) => {
    if (!booking) return;

    try {
      const response = await fetch('/api/payments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: booking.payments[0]?.id,
          action,
          // Add additional data based on action
          ...(action === 'refund' && {
            refundAmount: booking.totalAmount,
            refundReason: 'User requested refund'
          }),
          ...(action === 'retain_deposit' && {
            retainAmount: booking.depositAmount,
            retainReason: 'Damage reported'
          })
        }),
      });

      if (response.ok) {
        fetchData(); // Refresh booking data
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('An error occurred while performing the action');
    }
  };

  const isOwner = user && booking && (
    (booking.listing as any).user?.id === user.id || (booking.listing as any).business?.id === user.id
  );
  const isRenter = user && booking && booking.renter.id === user.id;

  if (loading) {
    return (
      <DashboardLayout user={user} showHeader={false}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!booking) {
    return (
      <DashboardLayout user={user} showHeader={false}>
        <div className="text-center py-12">
          <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Booking not found</h3>
          <Link href="/dashboard/bookings">
            <Button>Back to Bookings</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} showHeader={false}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <Link href="/dashboard/bookings">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl truncate">Booking Details</h1>
              <p className="text-sm text-gray-600 sm:text-base truncate">Booking #{booking.bookingNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Badge className={`${getStatusColor(booking.status)} text-xs sm:text-sm`}>
              {booking.status}
            </Badge>
            <Badge variant="outline" className={`${getPaymentStatusColor(booking.paymentStatus)} text-xs sm:text-sm`}>
              {booking.paymentStatus}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Info */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Package className="h-4 w-4 sm:h-5 sm:mr-2" />
                  Booking Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600 sm:text-sm">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span>Rental Period</span>
                    </div>
                    <p className="font-semibold text-sm sm:text-base break-words">
                      {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                    </p>
                    <p className="text-xs text-gray-600 sm:text-sm">{booking.duration} days</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600 sm:text-sm">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span>Booking Created</span>
                    </div>
                    <p className="font-semibold text-sm sm:text-base break-words">{formatDateTime(booking.createdAt)}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600 sm:text-sm">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span>Renter</span>
                    </div>
                    <p className="font-semibold text-sm sm:text-base break-words truncate" title={booking.renter.name}>{booking.renter.name}</p>
                    <p className="text-xs text-gray-600 sm:text-sm break-words truncate" title={booking.renter.email}>{booking.renter.email}</p>
                    {booking.renter.phone && (
                      <p className="text-xs text-gray-600 sm:text-sm break-words truncate" title={booking.renter.phone}>{booking.renter.phone}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600 sm:text-sm">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span>Owner</span>
                    </div>
                    <p className="font-semibold text-sm sm:text-base break-words truncate" title={booking.listing.user?.name || booking.listing.business?.name}>
                      {booking.listing.user?.name || booking.listing.business?.name}
                    </p>
                    <p className="text-xs text-gray-600 sm:text-sm break-words truncate" title={booking.listing.user?.email || booking.listing.business?.email}>
                      {booking.listing.user?.email || booking.listing.business?.email}
                    </p>
                  </div>
                </div>

                {booking.deliveryAddress && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-600 mb-2 sm:text-sm">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span>Delivery Address</span>
                    </div>
                    <p className="font-semibold text-sm sm:text-base break-words" title={booking.deliveryAddress}>{booking.deliveryAddress}</p>
                    {booking.deliveryNotes && (
                      <p className="text-xs text-gray-600 mt-1 sm:text-sm break-words" title={booking.deliveryNotes}>{booking.deliveryNotes}</p>
                    )}
                  </div>
                )}

                {booking.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-600 mb-2 sm:text-sm">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span>Notes</span>
                    </div>
                    <p className="text-xs sm:text-sm break-words" title={booking.notes}>{booking.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Item Details */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg">Rented Item</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg break-words truncate" title={booking.listing.title}>{booking.listing.title}</h3>
                    <p className="text-gray-600 mb-2 text-xs sm:text-sm break-words line-clamp-2" title={booking.listing.description}>{booking.listing.description}</p>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                      <span className="truncate">{booking.listing.category.name}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{formatPrice(booking.listing.priceDaily)}/day</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Qty: {booking.quantity}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base">Booking Created</p>
                      <p className="text-xs text-gray-600 sm:text-sm break-words">{formatDateTime(booking.createdAt)}</p>
                    </div>
                  </div>

                  {booking.payments.map((payment, index) => (
                    <div key={payment.id} className="flex items-start space-x-3 sm:space-x-4">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        payment.status === 'COMPLETED' ? 'bg-green-100' :
                        payment.status === 'PROCESSING' ? 'bg-orange-100' :
                        'bg-yellow-100'
                      }`}>
                        <CreditCard className={`h-3 w-3 sm:h-4 sm:w-4 ${
                          payment.status === 'COMPLETED' ? 'text-green-600' :
                          payment.status === 'PROCESSING' ? 'text-orange-600' :
                          'text-yellow-600'
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm sm:text-base">Payment {payment.status}</p>
                        <p className="text-xs text-gray-600 sm:text-sm break-words">
                          {formatDateTime(payment.createdAt)} • {formatPrice(payment.amount)}
                        </p>
                        {payment.depositHold && (
                          <p className="text-xs text-blue-600 sm:text-sm break-words">
                            Deposit held: {formatPrice(booking.depositAmount)}
                          </p>
                        )}
                        {payment.depositReleased && (
                          <p className="text-xs text-green-600 sm:text-sm break-words">
                            Deposit released
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {booking.status === 'IN_PROGRESS' && (
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm sm:text-base">Rental in Progress</p>
                        <p className="text-xs text-gray-600 sm:text-sm break-words">Item is currently being rented</p>
                      </div>
                    </div>
                  )}

                  {booking.status === 'COMPLETED' && (
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm sm:text-base">Rental Completed</p>
                        <p className="text-xs text-gray-600 sm:text-sm break-words">Rental period ended successfully</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center text-sm sm:text-base">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:mr-2" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="truncate pr-2">Rental Fee</span>
                  <span className="flex-shrink-0">{formatPrice(booking.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="truncate pr-2">Service Fee</span>
                  <span className="flex-shrink-0">{formatPrice(booking.serviceFee)}</span>
                </div>
                {booking.deliveryFee > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="truncate pr-2">Delivery Fee</span>
                    <span className="flex-shrink-0">{formatPrice(booking.deliveryFee)}</span>
                  </div>
                )}
                {booking.depositAmount > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="truncate pr-2">Deposit</span>
                    <span className="flex-shrink-0">{formatPrice(booking.depositAmount)}</span>
                  </div>
                )}
                <div className="border-t pt-2 sm:pt-3">
                  <div className="flex justify-between font-semibold text-sm sm:text-base">
                    <span className="truncate pr-2">Total Paid</span>
                    <span className="text-coral-600 flex-shrink-0">{formatPrice(booking.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-sm sm:text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button asChild className="w-full text-xs sm:text-sm" size="sm">
                    <Link href={`/dashboard/messages/${booking.id}`}>
                      <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Message
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full text-xs sm:text-sm"
                    size="sm"
                    onClick={() => setAgreementModalOpen(true)}
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Rental Agreement
                  </Button>

                  {booking.status === 'COMPLETED' && !booking.reviews?.length && (
                    <Button variant="outline" asChild className="w-full text-xs sm:text-sm" size="sm">
                      <Link href={`/dashboard/reviews/new/${booking.id}`}>
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Leave Review
                      </Link>
                    </Button>
                  )}

                  {booking.status === 'PENDING' && isOwner && (
                    <Button variant="outline" asChild className="w-full text-xs sm:text-sm" size="sm">
                      <Link href={`/dashboard/listings/${booking.listing.id}/calendar`}>
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Manage Calendar
                      </Link>
                    </Button>
                  )}

                  {booking.payments[0]?.depositHold && !booking.payments[0].depositReleased && isOwner && (
                    <div className="space-y-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        className="w-full text-xs sm:text-sm"
                        size="sm"
                        onClick={() => handleAction('release_deposit')}
                      >
                        <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Release Deposit
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full text-red-600 text-xs sm:text-sm"
                        size="sm"
                        onClick={() => handleAction('retain_deposit')}
                      >
                        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Retain Deposit
                      </Button>
                    </div>
                  )}

                  {booking.status === 'CONFIRMED' && isRenter && (
                    <Button
                      variant="outline"
                      className="w-full text-red-600 text-xs sm:text-sm"
                      size="sm"
                      onClick={() => handleAction('refund')}
                    >
                      <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Request Refund
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Review */}
            {booking.reviews && booking.reviews.length > 0 && (
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-sm sm:text-base">Review</CardTitle>
                </CardHeader>
                <CardContent>
                  {booking.reviews.map((review) => (
                    <div key={review.id} className="flex items-start space-x-2">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <span className="font-semibold text-xs sm:text-sm">{review.rating}/5</span>
                          <span className="text-xs text-gray-600 sm:text-sm truncate">• {review.title}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 sm:text-sm break-words" title={review.comment}>{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Rental Agreement Modal */}
      <RentalAgreementModal
        bookingId={booking.id}
        isOpen={agreementModalOpen}
        onClose={() => setAgreementModalOpen(false)}
        userType={isRenter ? 'renter' : 'lister'}
      />
    </DashboardLayout>
  );
}
