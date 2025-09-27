"use client";

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExtendBookingModal } from '@/components/ExtendBookingModal'

interface Booking {
  id: string;
  booking_number: string;
  status: string;
  payment_status: string;
  start_date: string;
  end_date: string;
  duration: number;
  quantity: number;
  subtotal: number;
  service_fee: number;
  delivery_fee: number;
  deposit_amount: number;
  total_amount: number;
  delivery_type: string;
  delivery_address?: string;
  delivery_notes?: string;
  notes?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    slug: string;
    description?: string;
    price_daily: string;
    price_weekly?: string;
    price_monthly?: string;
    images: string[];
    location: string;
    category: {
      id: string;
      name: string;
      icon: string;
    };
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      avatar?: string;
    };
    business?: {
      id: string;
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
    phone?: string;
    avatar?: string;
  };
  payments: Array<{
    id: string;
    provider: string;
    provider_id: string;
    amount: string;
    currency: string;
    status: string;
    created_at: string;
  }>;
}

export default function RentalsPage() {
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [extendModalOpen, setExtendModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [extendMessage, setExtendMessage] = useState<{ title: string; description?: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Starting to fetch rentals data...');
        
        const [userResponse, bookingsResponse] = await Promise.all([
          fetch('/api/auth/user'),
          fetch('/api/bookings?status=ALL'),
        ]);

        console.log('📡 API responses received:', {
          userResponse: userResponse.status,
          bookingsResponse: bookingsResponse.status
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('👤 User data:', userData);
          setUser(userData.user);
        } else {
          console.error('❌ User fetch failed:', await userResponse.json());
        }

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          console.log('📋 Bookings API response:', bookingsData);
          console.log('📊 Bookings count:', bookingsData.data?.items?.length || 0);
          console.log('📝 Raw bookings data:', bookingsData.data?.items);

          // Debug the first booking's listing structure
          if (bookingsData.data?.items?.length > 0) {
            const firstBooking = bookingsData.data.items[0];
            console.log('🔍 First booking detailed structure:', {
              id: firstBooking.id,
              status: firstBooking.status,
              renter_id: firstBooking.renter_id,
              listingId: firstBooking.listing_id,
              listing: firstBooking.listing,
              listingUser: firstBooking.listing?.user,
              listingBusiness: firstBooking.listing?.business,
              listingUserId: firstBooking.listing?.user_id,
              listingBusinessId: firstBooking.listing?.business_id,
            });
          }

          const bookings = bookingsData.data?.items || [];
          console.log('📋 Setting bookings:', bookings.length, 'bookings');
          setBookings(bookings);
        } else {
          const errorData = await bookingsResponse.json();
          console.error('❌ Bookings fetch failed:', errorData);
        }
      } catch (error) {
        console.error('💥 Error fetching data:', error);
      } finally {
        setLoading(false);
        console.log('✅ Fetch completed, loading set to false');
      }
    };

    fetchData();
  }, [])

  // Categorize bookings
  const rentals = {
    active: bookings.filter(b => ['CONFIRMED', 'IN_PROGRESS'].includes(b.status)),
    past: bookings.filter(b => ['COMPLETED', 'CANCELLED'].includes(b.status)),
    requests: bookings.filter(b => ['PENDING'].includes(b.status))
  }

  // Debug logging for categorized rentals
  console.log('📊 Categorized rentals:', {
    totalBookings: bookings.length,
    active: rentals.active.length,
    past: rentals.past.length,
    requests: rentals.requests.length,
    allBookings: bookings.map(b => ({ id: b.id, status: b.status, title: b.listing?.title }))
  });

  // Debug each booking's categorization
  bookings.forEach(booking => {
    const isActive = ['CONFIRMED', 'IN_PROGRESS'].includes(booking.status);
    const isPast = ['COMPLETED', 'CANCELLED'].includes(booking.status);
    const isRequest = ['PENDING'].includes(booking.status);

    console.log('🔍 Booking categorization:', {
      id: booking.id,
      status: booking.status,
      isActive,
      isPast,
      isRequest,
      title: booking.listing?.title,
      endDate: booking.end_date
    });
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const getVariant = (status: string) => {
      switch (status) {
        case 'CONFIRMED':
        case 'IN_PROGRESS':
          return 'default';
        case 'PENDING':
          return 'secondary';
        case 'COMPLETED':
          return 'outline';
        case 'CANCELLED':
          return 'destructive';
        default:
          return 'outline';
      }
    }
    return <Badge variant={getVariant(status) as any}>{status}</Badge>
  }

  const router = useRouter()

  async function handleChat(item: Booking) {
    try {
      console.log('💬 Chat button clicked for booking:', {
        bookingId: item.id,
        listingId: item.listing.id,
        listingTitle: item.listing.title,
        listingUserId: item.listing.user?.id,
        listingBusinessId: item.listing.business?.id
      })

      const ownerId = item.listing.user?.id || item.listing.business?.id
      console.log('👤 Owner ID determined:', ownerId)
      
      if (!ownerId) {
        console.error('❌ No owner ID found for listing')
        return
      }

      // Use direct message API which will create a conversation if missing and return conversationId
      const message = `Hi, I have a question about my rental "${item.listing.title}"`;
      console.log('📨 Sending direct message:', {
        toUserId: ownerId,
        listingId: item.listing.id,
        content: message,
        listingTitle: item.listing.title
      })

      const res = await fetch('/api/messages/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: ownerId, listingId: item.listing.id, content: message, listingTitle: item.listing.title })
      })

      console.log('📡 Direct message API response status:', res.status)

      if (res.ok) {
        const json = await res.json()
        console.log('✅ Direct message API response:', json)
        
        const convId = json.data?.conversationId
        if (convId) {
          console.log('🎉 Got conversation ID, redirecting:', convId)
          router.push(`/dashboard/messages?id=${convId}`)
          return
        } else {
          console.error('❌ No conversationId in response:', json)
        }
      } else {
        const errorData = await res.json().catch(() => null)
        console.error('❌ Direct message API failed:', {
          status: res.status,
          statusText: res.statusText,
          errorData
        })
      }

      // Fallback: open messages composer to recipient
      console.log('🔄 Falling back to compose mode with recipient:', ownerId)
      router.push(`/dashboard/messages?compose=1&to=${ownerId}`)
    } catch (e) {
      console.error('💥 Chat action error:', e)
    }
  }

  async function handleExtend(item: Booking) {
    try {
      setSelectedBooking(item)
      setExtendModalOpen(true)
    } catch (e) {
      console.error('Extend action error', e)
    }
  }

  function handleExtendSuccess(payload?: { message: string; details?: string; booking?: any; extension?: { days: number; cost: number; newEndDate: string } }) {
    // Refresh bookings data after successful extension
    const refreshBookings = async () => {
      try {
        const bookingsResponse = await fetch('/api/bookings?status=ALL')
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json()
          setBookings(bookingsData.data?.items || [])
        }
      } catch (error) {
        console.error('Failed to refresh bookings:', error)
      }
    }
    refreshBookings()

    if (payload?.message) {
      setExtendMessage({
        title: payload.message,
        description: payload.details
      })
    }
  }

  async function handleReturn(item: Booking) {
    try {
      // Call API to mark booking as complete (owner action) or renter return flow
      const res = await fetch(`/api/bookings/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        console.error('Return API error', err)
        return
      }

      // Refresh list
      const r2 = await fetch('/api/bookings?status=ALL')
      if (r2.ok) {
        const d = await r2.json()
        setBookings(d.data?.items || [])
      }
    } catch (e) {
      console.error('Return action error', e)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return `${start} – ${end}`;
  }

  const RentalCard = ({ item }: { item: Booking }) => (
    <Card className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm sm:rounded-2xl dark:border-charcoal-600 dark:bg-charcoal-600/60">
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
            {item.listing.images && item.listing.images.length > 0 ? (
              <img
                src={item.listing.images[0]}
                alt={item.listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm sm:text-base break-words line-clamp-1" title={item.listing.title}>{item.listing.title}</h3>
                <p className="text-xs text-muted-foreground sm:text-sm break-words">
                  {formatDateRange(item.start_date, item.end_date)}
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm break-words">
                  R{item.total_amount} • Deposit R{item.deposit_amount}
                </p>
                <p className="text-xs text-muted-foreground break-words truncate" title={item.listing.location}>
                  {item.listing.location}
                </p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <div className="mt-2 sm:mt-3 flex flex-wrap gap-1 sm:gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/rentals/${item.id}`)} className="text-xs sm:text-sm">View</Button>
              <Button variant="outline" size="sm" onClick={() => handleChat(item)} className="text-xs sm:text-sm">Chat</Button>
              <Button variant="outline" size="sm" onClick={() => handleExtend(item)} className="text-xs sm:text-sm">Extend</Button>
              {['CONFIRMED', 'IN_PROGRESS'].includes(item.status) && (
                <Button size="sm" onClick={() => handleReturn(item)} className="text-xs sm:text-sm">Return</Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <DashboardLayout user={user} showHeader={false}>
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user} showHeader={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">My Rentals</h1>
        </div>
        {extendMessage && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <div className="font-medium">{extendMessage.title}</div>
            {extendMessage.description && <p className="mt-1">{extendMessage.description}</p>}
          </div>
        )}
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({rentals.active.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({rentals.past.length})</TabsTrigger>
            <TabsTrigger value="requests">Requests ({rentals.requests.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <div className="grid gap-4">
              {rentals.active.length > 0 ? (
                rentals.active.map((r) => <RentalCard key={r.id} item={r} />)
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No active rentals</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="past">
            <div className="grid gap-4">
              {rentals.past.length > 0 ? (
                rentals.past.map((r) => <RentalCard key={r.id} item={r} />)
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No past rentals</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="requests">
            <div className="grid gap-4">
              {rentals.requests.length > 0 ? (
                rentals.requests.map((r) => <RentalCard key={r.id} item={r} />)
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No pending requests</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ExtendBookingModal
        booking={selectedBooking}
        open={extendModalOpen}
        onOpenChange={setExtendModalOpen}
        onSuccess={handleExtendSuccess}
      />
    </DashboardLayout>
  )
}
