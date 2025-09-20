'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, View, ChevronLeft, ChevronRight, Filter, MapPin, Users, DollarSign } from 'lucide-react';
import { Role } from '@/lib/types';

interface Booking {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_image?: string;
  start_date: string;
  end_date: string;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  total_amount: number;
  guest_name: string;
  guest_email: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  bookings: Booking[];
}

export default function CalendarPage() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedListing, setSelectedListing] = useState<string>('ALL');

  useEffect(() => {
    fetchUserData();
    fetchBookings();
  }, [currentDate, selectedListing]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/business/calendar');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  // Generate calendar days for the current month
  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const currentDateIter = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = currentDateIter.getMonth() === month;
      const dateStr = currentDateIter.toISOString().split('T')[0];

      const dayBookings = bookings.filter(booking => {
        const bookingStart = new Date(booking.start_date);
        const bookingEnd = new Date(booking.end_date);
        return currentDateIter >= bookingStart && currentDateIter <= bookingEnd;
      });

      days.push({
        date: new Date(currentDateIter),
        isCurrentMonth,
        bookings: dayBookings,
      });

      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const calendarDays = getCalendarDays();

  // Calculate statistics
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => b.status === 'ACTIVE' || b.status === 'CONFIRMED').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.total_amount, 0);
  const occupancyRate = totalBookings > 0 ? (activeBookings / totalBookings * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || !user.roles.includes(Role.BUSINESS_LISTER)) {
    return (
      <DashboardLayout user={user}>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You need a Business Lister account to access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Calendar</h1>
            <p className="text-gray-600 mt-1">Visualize and manage your rental bookings</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('week')}
              className={viewMode === 'week' ? 'bg-coral-100 text-coral-700' : ''}
            >
              Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('month')}
              className={viewMode === 'month' ? 'bg-coral-100 text-coral-700' : ''}
            >
              Month
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold">{totalBookings}</p>
                </div>
                <Calendar className="h-8 w-8 text-coral-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{activeBookings}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{occupancyRate}%</p>
                </div>
                <View className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Navigation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {monthName}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-medium text-sm text-gray-600 py-2">
                  {day}
                </div>
              ))}

              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`
                    min-h-[100px] p-2 border border-gray-100 rounded-lg
                    ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                    ${day.date.toDateString() === new Date().toDateString() ? 'ring-2 ring-coral-500' : ''}
                  `}
                >
                  <div className="font-medium text-sm mb-1">
                    {day.date.getDate()}
                  </div>

                  <div className="space-y-1 max-h-[80px] overflow-y-auto">
                    {day.bookings.slice(0, 3).map((booking) => (
                      <div
                        key={booking.id}
                        className="text-xs p-1 rounded cursor-pointer hover:opacity-80"
                        style={{
                          backgroundColor: booking.status === 'ACTIVE' ? '#10b981' :
                                          booking.status === 'CONFIRMED' ? '#3b82f6' :
                                          booking.status === 'COMPLETED' ? '#6b7280' :
                                          booking.status === 'PENDING' ? '#f59e0b' : '#ef4444',
                          color: 'white'
                        }}
                        title={`${booking.listing_title} - ${booking.guest_name}`}
                      >
                        <div className="font-medium truncate">{booking.listing_title}</div>
                        <div className="opacity-80">{formatCurrency(booking.total_amount)}</div>
                      </div>
                    ))}

                    {day.bookings.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{day.bookings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>
              Your next 7 days of rental activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings
                .filter(booking => new Date(booking.start_date) >= new Date())
                .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                .slice(0, 5)
                .map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        {booking.listing_image ? (
                          <img
                            src={booking.listing_image}
                            alt={booking.listing_title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <MapPin className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{booking.listing_title}</h4>
                        <p className="text-sm text-gray-600">{booking.guest_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <p className="text-sm font-medium mt-1">
                        {formatCurrency(booking.total_amount)}
                      </p>
                    </div>
                  </div>
                ))}

              {bookings.filter(booking => new Date(booking.start_date) >= new Date()).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No upcoming bookings found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}