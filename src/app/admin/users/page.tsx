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
  Search, 
  Filter, 
  Users, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Star,
  Package,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  MoreHorizontal,
  Download,
  Ban,
  Crown
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  roles: string[];
  verified: boolean;
  kycVerified: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  createdAt: string;
  lastLogin?: string;
  stats: {
    totalListings: number;
    activeListings: number;
    totalBookings: number;
    completedBookings: number;
    totalSpent: number;
    totalEarned: number;
    averageRating: number;
    totalReviews: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Mock data for user management
      setUsers([
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.j@email.com',
          phone: '+27 83 123 4567',
          roles: ['CUSTOMER', 'INDIVIDUAL_LISTER'],
          verified: true,
          kycVerified: true,
          status: 'ACTIVE',
          createdAt: '2023-06-15T10:30:00Z',
          lastLogin: '2024-01-15T08:30:00Z',
          stats: {
            totalListings: 12,
            activeListings: 8,
            totalBookings: 25,
            completedBookings: 23,
            totalSpent: 15420,
            totalEarned: 28500,
            averageRating: 4.8,
            totalReviews: 18,
          },
        },
        {
          id: '2',
          name: 'Mike Chen',
          email: 'mike@techrentals.com',
          phone: '+27 72 987 6543',
          roles: ['BUSINESS_LISTER'],
          verified: true,
          kycVerified: false,
          status: 'ACTIVE',
          createdAt: '2023-08-20T14:15:00Z',
          lastLogin: '2024-01-14T16:45:00Z',
          stats: {
            totalListings: 45,
            activeListings: 38,
            totalBookings: 156,
            completedBookings: 142,
            totalSpent: 0,
            totalEarned: 185000,
            averageRating: 4.6,
            totalReviews: 89,
          },
        },
        {
          id: '3',
          name: 'Emma Wilson',
          email: 'emma.w@email.com',
          phone: '+27 61 456 7890',
          roles: ['CUSTOMER'],
          verified: false,
          kycVerified: false,
          status: 'SUSPENDED',
          createdAt: '2024-01-10T09:20:00Z',
          lastLogin: '2024-01-12T11:30:00Z',
          stats: {
            totalListings: 0,
            activeListings: 0,
            totalBookings: 3,
            completedBookings: 1,
            totalSpent: 2850,
            totalEarned: 0,
            averageRating: 0,
            totalReviews: 0,
          },
        },
      ]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    
    const matchesRole = roleFilter === 'ALL' || user.roles.includes(roleFilter);
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    const matchesVerification = verificationFilter === 'ALL' || 
      (verificationFilter === 'VERIFIED' && user.verified && user.kycVerified) ||
      (verificationFilter === 'PARTIAL' && user.verified && !user.kycVerified) ||
      (verificationFilter === 'UNVERIFIED' && !user.verified);

    return matchesSearch && matchesRole && matchesStatus && matchesVerification;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800';
      case 'BANNED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'BUSINESS_LISTER': return 'bg-blue-100 text-blue-800';
      case 'INDIVIDUAL_LISTER': return 'bg-green-100 text-green-800';
      case 'CUSTOMER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      // Mock action handling
      console.log(`User ${action}: ${userId}`);
      
      // Update user status in local state
      if (action === 'suspend' || action === 'ban' || action === 'activate') {
        setUsers(prev => prev.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              status: action === 'activate' ? 'ACTIVE' : 
                     action === 'suspend' ? 'SUSPENDED' : 'BANNED'
            };
          }
          return user;
        }));
      }
    } catch (error) {
      console.error('Error handling user action:', error);
    }
  };

  const getStats = () => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'ACTIVE').length,
      suspended: users.filter(u => u.status === 'SUSPENDED').length,
      banned: users.filter(u => u.status === 'BANNED').length,
      verified: users.filter(u => u.verified).length,
      kycVerified: users.filter(u => u.kycVerified).length,
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <DashboardLayout user={null}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={null}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage platform users and their activities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspended</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.suspended}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Banned</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.banned}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.verified}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">KYC Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.kycVerified}</div>
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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="BUSINESS_LISTER">Business</SelectItem>
                    <SelectItem value="INDIVIDUAL_LISTER">Individual</SelectItem>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="BANNED">Banned</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Verification</SelectItem>
                    <SelectItem value="VERIFIED">Full KYC</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                    <SelectItem value="UNVERIFIED">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              {filteredUsers.length} users found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">User</th>
                    <th className="text-left p-4">Roles</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Verification</th>
                    <th className="text-left p-4">Activity</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                            {user.phone && (
                              <div className="text-xs text-gray-500">{user.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge key={role} className={getRoleColor(role)}>
                              {role.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${user.verified ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-xs">Email</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${user.kycVerified ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-xs">KYC</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="flex items-center space-x-2">
                            <Package className="h-3 w-3" />
                            <span>{user.stats.activeListings} listings</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-3 w-3" />
                            <span>{user.stats.completedBookings} bookings</span>
                          </div>
                          {user.stats.averageRating > 0 && (
                            <div className="flex items-center space-x-2">
                              <Star className="h-3 w-3" />
                              <span>{user.stats.averageRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            {user.status === 'ACTIVE' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleUserAction(user.id, 'suspend')}
                                  className="text-yellow-600"
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUserAction(user.id, 'ban')}
                                  className="text-red-600"
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Ban User
                                </DropdownMenuItem>
                              </>
                            )}
                            {(user.status === 'SUSPENDED' || user.status === 'BANNED') && (
                              <DropdownMenuItem 
                                onClick={() => handleUserAction(user.id, 'activate')}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Export Data
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2" />
                <p>No users found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Details</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedUser(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="font-semibold mb-3">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <span className="ml-2 font-medium">{selectedUser.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2 font-medium">{selectedUser.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <span className="ml-2 font-medium">{selectedUser.phone || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Member Since:</span>
                        <span className="ml-2 font-medium">{formatDate(selectedUser.createdAt)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Login:</span>
                        <span className="ml-2 font-medium">
                          {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <Badge className={`ml-2 ${getStatusColor(selectedUser.status)}`}>
                          {selectedUser.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Roles */}
                  <div>
                    <h3 className="font-semibold mb-3">Roles</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.roles.map((role) => (
                        <Badge key={role} className={getRoleColor(role)}>
                          {role.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div>
                    <h3 className="font-semibold mb-3">Verification Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${selectedUser.verified ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span>Email Verification: {selectedUser.verified ? 'Verified' : 'Not Verified'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${selectedUser.kycVerified ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span>KYC Verification: {selectedUser.kycVerified ? 'Verified' : 'Not Verified'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div>
                    <h3 className="font-semibold mb-3">Activity Statistics</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>Total Listings: {selectedUser.stats.totalListings}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>Active Listings: {selectedUser.stats.activeListings}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Total Bookings: {selectedUser.stats.totalBookings}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Completed Bookings: {selectedUser.stats.completedBookings}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Total Spent: {formatPrice(selectedUser.stats.totalSpent)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Total Earned: {formatPrice(selectedUser.stats.totalEarned)}</span>
                      </div>
                      {selectedUser.stats.averageRating > 0 && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4" />
                            <span>Average Rating: {selectedUser.stats.averageRating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4" />
                            <span>Total Reviews: {selectedUser.stats.totalReviews}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
