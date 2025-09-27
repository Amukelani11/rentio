'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Star, 
  Users, 
  Plus,
  Package,
  AlertCircle,
  CheckCircle,
  Search,
  MessageCircle
} from 'lucide-react';
import { Role } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardData {
  totalEarnings: number;
  activeListings: number;
  totalBookings: number;
  averageRating: number;
  upcomingBookings: Array<{
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    status: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
  }>;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get user data
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          return data;
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
      return null;
    };

    // Check if user has roles, redirect to role selection if not
    const checkUserRoles = async () => {
      const userData = await fetchUserData();

      // If we couldn't fetch user data (server error), don't redirect to onboarding
      if (!userData) {
        setLoading(false)
        return
      }

      const roles = userData?.user?.roles || [];
      console.log('Dashboard roles check:', { userData: userData?.user, roles });
      if (Array.isArray(roles) && roles.length === 0) {
        console.log('No roles found, redirecting to onboarding');
        router.push('/onboarding');
        return;
      }
    };

    checkUserRoles();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch data for dashboard
      const [upcomingBookingsResponse, bookingsResponse, listingsResponse] = await Promise.all([
        fetch('/api/bookings?type=upcoming'),
        fetch('/api/bookings'),
        fetch('/api/listings')
      ])

      let upcomingBookings: any[] = []
      let totalBookings = 0
      let activeListings = 0

      if (upcomingBookingsResponse.ok) {
        const upcomingData = await upcomingBookingsResponse.json()
        upcomingBookings = upcomingData.data || []
        console.log('[DASHBOARD] Upcoming bookings response:', upcomingData)
      console.log('[DASHBOARD] Upcoming bookings array length:', upcomingBookings.length)
      } else {
        console.error('[DASHBOARD] Failed to fetch upcoming bookings:', upcomingBookingsResponse.status)
      }

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        totalBookings = bookingsData.data?.total || 0
      }

      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json()
        activeListings = listingsData.data?.items?.filter((listing: any) => listing.status === 'ACTIVE').length || 0
      }

      // Mock other dashboard data for now
      setDashboardData({
        totalEarnings: 0, // TODO: Calculate from payment data
        activeListings,
        totalBookings,
        averageRating: 4.5, // TODO: Calculate from reviews
        upcomingBookings,
        recentActivity: [] // TODO: Fetch recent activity
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(null)
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Dashboard metrics for listers and business owners
  const getRoleBasedContent = () => {
    if (!dashboardData) return null

    const isLister = user.roles.includes(Role.INDIVIDUAL_LISTER) || user.roles.includes(Role.BUSINESS_LISTER)

    if (!isLister) return null

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <Card className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm sm:rounded-2xl dark:border-charcoal-600 dark:bg-charcoal-600/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Total Earnings</CardTitle>
            <DollarSign className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">R{dashboardData.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From all bookings
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm sm:rounded-2xl dark:border-charcoal-600 dark:bg-charcoal-600/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Active Listings</CardTitle>
            <Package className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">{dashboardData.activeListings}</div>
            <p className="text-xs text-muted-foreground">
              Currently available
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm sm:rounded-2xl dark:border-charcoal-600 dark:bg-charcoal-600/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Total Bookings</CardTitle>
            <Users className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">{dashboardData.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              All time bookings
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm sm:rounded-2xl dark:border-charcoal-600 dark:bg-charcoal-600/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Average Rating</CardTitle>
            <Star className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">{dashboardData.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              From customer reviews
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading && user) {
    return (
      <DashboardLayout user={user} showHeader={false}>
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-36 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
                <div className="flex items-center justify-between pb-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="mt-2 h-3 w-32" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-2 h-4 w-56" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="mt-2 h-4 w-64" />
                <div className="mt-4 space-y-3">
                  {[0, 1, 2].map((k) => (
                    <div key={k} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-52" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access your dashboard.</p>
          <Button onClick={() => router.push('/auth/signin')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} showHeader={false}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:rounded-3xl sm:p-6 dark:border-charcoal-600 dark:bg-charcoal-600/60">
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-slate-50">
                {getGreeting()}, {user.name || user.email}!
              </h1>
              <p className="text-sm text-gray-600 sm:text-base dark:text-slate-200">Here’s your latest activity and insights.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                user.roles.includes(Role.INDIVIDUAL_LISTER) || user.roles.includes(Role.BUSINESS_LISTER)
              ) ? (
                <Button onClick={() => router.push('/dashboard/listings')} className="whitespace-nowrap bg-coral-600 hover:bg-coral-700 text-white text-sm sm:text-base" size="sm">
                  Listings
                </Button>
              ) : (
                <Button onClick={() => router.push('/dashboard/listings/new')} className="whitespace-nowrap bg-coral-600 hover:bg-coral-700 text-white text-sm sm:text-base" size="sm">
                  List Item
                </Button>
              )}
              <Button variant="outline" onClick={() => router.push('/browse')} className="whitespace-nowrap border-coral-300 text-coral-700 hover:bg-coral-50 text-sm sm:text-base" size="sm">
                Browse more items
              </Button>
              <Button onClick={() => router.push('/dashboard/messages')} className="whitespace-nowrap text-sm sm:text-base" size="sm">
                <MessageCircle className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" /> Messages
              </Button>
            </div>
          </div>
        </div>

        {/* KYC Status Alert */}
        {user.kycStatus !== 'VERIFIED' && user.kycStatus !== 'APPROVED' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800">
                <AlertCircle className="mr-2 h-5 w-5" />
                Verify Your Identity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700 mb-4">
                {user.kycStatus === 'PENDING' 
                  ? 'Your KYC verification is being reviewed. We\'ll notify you once it\'s complete.'
                  : user.kycStatus === 'REJECTED'
                  ? 'Your KYC verification was rejected. Please resubmit with the required information.'
                  : 'Complete your KYC verification to unlock all features and start renting or listing items.'
                }
              </p>
              {user.kycStatus !== 'PENDING' && (
                <Button onClick={() => router.push('/dashboard/kyc')}>
                  {user.kycStatus === 'REJECTED' ? 'Resubmit Verification' : 'Start Verification'}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dashboard Metrics */}
        {getRoleBasedContent()}

        {/* Upcoming Rental removed per request */}

        {/* Quick Actions — Customer only (no lister/admin actions on dashboard) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 sm:gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-all rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm sm:rounded-2xl dark:border-charcoal-600 dark:bg-charcoal-600/60" onClick={() => router.push('/dashboard/bookings')}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center text-sm sm:text-base">
                <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Bookings
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View and manage your rental bookings
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-all rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm sm:rounded-2xl dark:border-charcoal-600 dark:bg-charcoal-600/60" onClick={() => router.push('/browse')}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center text-sm sm:text-base">
                <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Browse Items
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Find items to rent in your area
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-all rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm sm:rounded-2xl dark:border-charcoal-600 dark:bg-charcoal-600/60" onClick={() => router.push('/dashboard/rentals')}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center text-sm sm:text-base">
                <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                My Rentals
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View and manage your rentals
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Conversion CTA: suggest listing if not a lister yet */}
          {!(user.roles.includes(Role.INDIVIDUAL_LISTER) || user.roles.includes(Role.BUSINESS_LISTER)) && (
            <Card className="cursor-pointer hover:shadow-md transition-all rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm sm:rounded-2xl dark:border-charcoal-600 dark:bg-charcoal-600/60" onClick={() => router.push('/onboarding/lister')}>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center text-sm sm:text-base">
                  <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  List an Item
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Earn with your stuff — start listing
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <Card className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm sm:rounded-2xl dark:border-charcoal-600 dark:bg-charcoal-600/60">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base">Upcoming Bookings</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your next rental pickups and returns
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {dashboardData?.upcomingBookings.length ? (
                <div className="space-y-3 sm:space-y-4">
                  {dashboardData.upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{booking.title}</p>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'} className="ml-2 text-xs">
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming bookings</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm sm:rounded-2xl dark:border-charcoal-600 dark:bg-charcoal-600/60">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base">Recent Activity</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Latest updates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {dashboardData?.recentActivity.length ? (
                <div className="space-y-3 sm:space-y-4">
                  {dashboardData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-2 sm:space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-coral-500 rounded-full mt-1.5 sm:mt-2"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
