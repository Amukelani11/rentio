'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  DollarSign,
  Package,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  notes?: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    slug: string;
    priceDaily: number;
    images: string[];
    category: {
      name: string;
      icon?: string;
    };
    user?: {
      name: string;
      avatar?: string;
    };
    business?: {
      name: string;
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
  }>;
  reviews?: Array<{
    id: string;
    rating: number;
    title: string;
  }>;
}

export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [extensionModalOpen, setExtensionModalOpen] = useState(false);
  const [extensionBooking, setExtensionBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  // Check for extension requests in URL parameters
  useEffect(() => {
    const extensionId = searchParams.get('extension');
    const listingId = searchParams.get('listing');

    if (extensionId && bookings.length > 0) {
      const booking = bookings.find(b => b.id === extensionId);
      if (booking) {
        setExtensionBooking(booking);
        setExtensionModalOpen(true);
        // Clear URL parameters after showing modal
        router.replace('/dashboard/bookings', { scroll: false });
      }
    }
  }, [searchParams, bookings, router]);

  const fetchData = async () => {
    try {
      const [userResponse, bookingsResponse] = await Promise.all([
        fetch('/api/auth/user'),
        fetch(`/api/bookings?status=${statusFilter}`),
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      }

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.data.items);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);

      const response = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh bookings data
        fetchData();
        // Show success message (you could use a toast library here)
        console.log('Booking confirmed successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to confirm booking:', errorData.error);
        alert(`Failed to confirm booking: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('An error occurred while confirming the booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      const reason = prompt('Please provide a reason for rejecting this booking:');
      if (!reason) return; // User cancelled

      setActionLoading(bookingId);

      const response = await fetch(`/api/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        // Refresh bookings data
        fetchData();
        // Show success message
        console.log('Booking rejected successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to reject booking:', errorData.error);
        alert(`Failed to reject booking: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('An error occurred while rejecting the booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptExtension = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);

      const response = await fetch(`/api/bookings/${bookingId}/extension-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (response.ok) {
        // Refresh bookings data
        fetchData();
        setExtensionModalOpen(false);
        setExtensionBooking(null);
        console.log('Extension accepted successfully');
        alert('Extension accepted successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to accept extension:', errorData.error);
        alert(`Failed to accept extension: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error accepting extension:', error);
      alert('An error occurred while accepting the extension');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineExtension = async (bookingId: string) => {
    try {
      const reason = prompt('Please provide a reason for declining this extension request:');
      if (!reason) return; // User cancelled

      setActionLoading(bookingId);

      const response = await fetch(`/api/bookings/${bookingId}/extension-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'decline', reason }),
      });

      if (response.ok) {
        // Refresh bookings data
        fetchData();
        setExtensionModalOpen(false);
        setExtensionBooking(null);
        console.log('Extension declined successfully');
        alert('Extension declined successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to decline extension:', errorData.error);
        alert(`Failed to decline extension: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error declining extension:', error);
      alert('An error occurred while declining the extension');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.renter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'upcoming' && ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(booking.status)) ||
      (activeTab === 'completed' && ['COMPLETED'].includes(booking.status)) ||
      (activeTab === 'cancelled' && ['CANCELLED'].includes(booking.status));
    
    return matchesSearch && matchesTab;
  });

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getBookingStats = () => {
    return {
      total: bookings.length,
      upcoming: bookings.filter(b => ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length,
      completed: bookings.filter(b => ['COMPLETED'].includes(b.status)).length,
      cancelled: bookings.filter(b => ['CANCELLED'].includes(b.status)).length,
    };
  };

  const stats = getBookingStats();

  if (loading) {
    return (
      <DashboardLayout user={user} showHeader={false}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} showHeader={false}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bookings</h1>
            <p className="text-gray-600">Manage your rental bookings and reservations</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcoming}</div>
              <p className="text-xs text-muted-foreground">
                Active bookings
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cancelled}</div>
              <p className="text-xs text-muted-foreground">
                Cancelled bookings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Bookings</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {/* Bookings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <Badge variant="outline" className={getPaymentStatusColor(booking.paymentStatus)}>
                            {booking.paymentStatus}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                          {booking.listing.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Booking #{booking.bookingNumber}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/messages/${booking.id}`)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </DropdownMenuItem>
                          {booking.status === 'COMPLETED' && !booking.reviews?.length && (
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/reviews/new/${booking.id}`)}>
                              <Star className="h-4 w-4 mr-2" />
                              Leave Review
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{booking.duration} days</span>
                      </div>
                      {booking.deliveryAddress && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="line-clamp-1">{booking.deliveryAddress}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>{booking.renter.name}</span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="border-t pt-3 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Rental:</span>
                        <span>{formatPrice(booking.subtotal)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Service Fee:</span>
                        <span>{formatPrice(booking.serviceFee)}</span>
                      </div>
                      {booking.deliveryFee > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span>Delivery:</span>
                          <span>{formatPrice(booking.deliveryFee)}</span>
                        </div>
                      )}
                      {booking.depositAmount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span>Deposit:</span>
                          <span>{formatPrice(booking.depositAmount)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between font-semibold pt-2 border-t">
                        <span>Total:</span>
                        <span className="text-coral-600">{formatPrice(booking.totalAmount)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {/* Show confirm/reject buttons for pending bookings */}
                      {booking.status === 'PENDING' && booking.paymentStatus === 'COMPLETED' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleConfirmBooking(booking.id)}
                            disabled={actionLoading === booking.id}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {actionLoading === booking.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                            ) : (
                              <ThumbsUp className="h-4 w-4 mr-1" />
                            )}
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectBooking(booking.id)}
                            disabled={actionLoading === booking.id}
                            className="flex-1"
                          >
                            {actionLoading === booking.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                            ) : (
                              <ThumbsDown className="h-4 w-4 mr-1" />
                            )}
                            Reject
                          </Button>
                        </>
                      )}

                      {/* Show default actions for non-pending bookings */}
                      {booking.status !== 'PENDING' && (
                        <>
                          <Button size="sm" variant="outline" asChild className="flex-1">
                            <button onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <button onClick={() => router.push(`/dashboard/messages/${booking.id}`)}>
                              <MessageSquare className="h-4 w-4 mr-1" />
                            </button>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredBookings.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Start by browsing available items.'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => router.push('/browse')}>
                      Browse Items
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Extension Review Modal */}
      {extensionModalOpen && extensionBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Extension Request Review</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Renter:</span>
                <span className="font-medium">{extensionBooking.renter.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Listing:</span>
                <span className="font-medium">{extensionBooking.listing.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current End:</span>
                <span className="font-medium">{formatDate(extensionBooking.endDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-medium text-coral-600">{formatPrice(extensionBooking.totalAmount)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleDeclineExtension(extensionBooking.id)}
                disabled={actionLoading === extensionBooking.id}
                className="flex-1"
              >
                {actionLoading === extensionBooking.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-1" />
                ) : (
                  <ThumbsDown className="h-4 w-4 mr-1" />
                )}
                Decline
              </Button>
              <Button
                onClick={() => handleAcceptExtension(extensionBooking.id)}
                disabled={actionLoading === extensionBooking.id}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {actionLoading === extensionBooking.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                ) : (
                  <ThumbsUp className="h-4 w-4 mr-1" />
                )}
                Accept
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => setExtensionModalOpen(false)}
              disabled={actionLoading === extensionBooking.id}
              className="w-full mt-3"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
