'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Search, 
  Filter, 
  Check, 
  X, 
  Trash2, 
  Mail,
  MessageSquare,
  Calendar,
  DollarSign,
  Star,
  AlertTriangle,
  Info,
  User,
  Package,
  CheckCircle,
  Clock,
  MoreVertical
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  channels: string[];
  data?: any;
}

export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, [typeFilter]);

  const fetchData = async () => {
    try {
      const [userResponse, notificationsResponse] = await Promise.all([
        fetch('/api/auth/user'),
        fetch(`/api/notifications?type=${typeFilter !== 'ALL' ? typeFilter : ''}`),
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      }

      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData.data.items);
        setUnreadCount(notificationsData.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'unread' && !notification.read) ||
      (activeTab === 'read' && notification.read);
    
    return matchesSearch && matchesTab;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_MESSAGE':
        return <MessageSquare className="h-5 w-5" />;
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_COMPLETED':
      case 'BOOKING_CANCELLED':
        return <Calendar className="h-5 w-5" />;
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_FAILED':
        return <DollarSign className="h-5 w-5" />;
      case 'NEW_REVIEW':
        return <Star className="h-5 w-5" />;
      case 'VERIFICATION_APPROVED':
      case 'VERIFICATION_REJECTED':
        return <CheckCircle className="h-5 w-5" />;
      case 'ACCOUNT_UPDATED':
        return <User className="h-5 w-5" />;
      case 'LISTING_APPROVED':
      case 'LISTING_REJECTED':
        return <Package className="h-5 w-5" />;
      case 'SYSTEM':
        return <Info className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'BOOKING_CANCELLED':
      case 'PAYMENT_FAILED':
      case 'VERIFICATION_REJECTED':
      case 'LISTING_REJECTED':
        return 'text-red-600 bg-red-50';
      case 'BOOKING_CONFIRMED':
      case 'PAYMENT_RECEIVED':
      case 'VERIFICATION_APPROVED':
      case 'LISTING_APPROVED':
        return 'text-green-600 bg-green-50';
      case 'NEW_MESSAGE':
      case 'NEW_REVIEW':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
    }
  };

  const handleNotificationAction = async (notificationIds: string[], action: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds,
          action,
        }),
      });

      if (response.ok) {
        fetchData(); // Refresh notifications
        setSelectedNotifications([]);
      } else {
        console.error('Failed to update notifications');
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleBulkAction = (action: string) => {
    if (selectedNotifications.length === 0) return;
    handleNotificationAction(selectedNotifications, action);
  };

  const markAsRead = async (notificationId: string) => {
    await handleNotificationAction([notificationId], 'mark_read');
  };

  const getStats = () => {
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      messages: notifications.filter(n => n.type === 'NEW_MESSAGE').length,
      bookings: notifications.filter(n => n.type.startsWith('BOOKING_')).length,
      payments: notifications.filter(n => n.type.startsWith('PAYMENT_')).length,
    };
  };

  const stats = getStats();

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
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-gray-600">Stay updated with your account activity</p>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unread}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.messages}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bookings}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.payments}</div>
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
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="NEW_MESSAGE">Messages</SelectItem>
                    <SelectItem value="BOOKING_CONFIRMED">Bookings</SelectItem>
                    <SelectItem value="PAYMENT_RECEIVED">Payments</SelectItem>
                    <SelectItem value="NEW_REVIEW">Reviews</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {selectedNotifications.length} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('mark_read')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedNotifications([])}>
                  Clear Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Notifications</TabsTrigger>
            <TabsTrigger value="unread">Unread ({stats.unread})</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {/* Notifications List */}
            <div className="space-y-2">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
                    <p className="text-gray-600">
                      {searchTerm ? 'Try adjusting your search terms.' : 'You\'re all caught up!'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === filteredNotifications.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-coral-600 focus:ring-coral-500"
                  />
                  <span className="text-sm text-gray-600">Select all</span>
                </div>
              )}

              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-colors ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="mt-1 rounded border-gray-300 text-coral-600 focus:ring-coral-500"
                      />
                      
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                            <p className={`text-sm ${!notification.read ? 'text-gray-800' : 'text-gray-600'} mb-2`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{formatDate(notification.createdAt)}</span>
                              <div className="flex items-center space-x-1">
                                {notification.channels.includes('EMAIL') && <Mail className="h-3 w-3" />}
                                {notification.channels.includes('PUSH') && <Bell className="h-3 w-3" />}
                                {notification.channels.includes('SMS') && <MessageSquare className="h-3 w-3" />}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                  <Check className="h-4 w-4 mr-2" />
                                  Mark as Read
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleNotificationAction([notification.id], 'delete')}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
