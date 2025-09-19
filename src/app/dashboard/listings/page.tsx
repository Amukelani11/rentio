'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  Star,
  MoreHorizontal,
  Image as ImageIcon,
  Package,
  BarChart
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Listing {
  id: string;
  title: string;
  slug: string;
  description: string;
  priceDaily: number;
  priceWeekly?: number;
  status: string;
  featured: boolean;
  verified: boolean;
  views: number;
  bookingsCount: number;
  averageRating: number;
  totalReviews: number;
  categories: {
    id: string;
    name: string;
    icon?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ListingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [currentPage, statusFilter]);

  const fetchData = async () => {
    try {
      const [userResponse, listingsResponse] = await Promise.all([
        fetch('/api/auth/user'),
        fetch(`/api/listings?page=${currentPage}&status=${statusFilter}`),
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      }

      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json();
        setListings(listingsData.data.items);
        setTotalPages(listingsData.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('An error occurred while deleting the listing');
    }
  };

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
            <h1 className="text-3xl font-bold">My Listings</h1>
            <p className="text-gray-600">Manage your rental items and their availability</p>
          </div>
          <Button onClick={() => router.push('/dashboard/listings/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listings.length}</div>
              <p className="text-xs text-muted-foreground">
                {listings.filter(l => l.status === 'ACTIVE').length} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {listings.reduce((sum, l) => sum + l.views, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {listings.reduce((sum, l) => sum + l.bookingsCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {listings.length > 0 
                  ? (listings.reduce((sum, l) => sum + l.averageRating, 0) / listings.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Based on {listings.reduce((sum, l) => sum + l.totalReviews, 0)} reviews
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
                  placeholder="Search listings..."
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
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-200 flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-gray-400" />
                {listing.images && listing.images.length > 0 && (
                  <img src={listing.images[0]} alt={listing.title} className="object-cover w-full h-full absolute inset-0" />
                )}
                <div className="absolute top-2 left-2 flex space-x-2">
                  {listing.featured && (
                    <Badge className="bg-coral-600">Featured</Badge>
                  )}
                  {listing.verified && (
                    <Badge className="bg-green-600">Verified</Badge>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <Badge className={getStatusColor(listing.status)}>
                    {listing.status}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{listing.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span className="flex items-center">
                      {listing.categories?.icon ? (
                        <span className="mr-1">{listing.categories.icon}</span>
                      ) : (
                        <Package className="h-4 w-4 mr-1" />
                      )}
                      {listing.categories?.name || 'Uncategorized'}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{listing.totalReviews} reviews</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xl font-bold text-coral-600">
                      {formatPrice(listing.priceDaily)}
                      <span className="text-sm font-normal text-gray-600">/day</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>{listing.averageRating ? listing.averageRating.toFixed(1) : '0.0'}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {listing.views} views • {listing.bookingsCount} bookings
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/browse/${listing.slug}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/listings/${listing.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/listings/${listing.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/listings/${listing.id}/analytics`}>
                          <BarChart className="h-4 w-4 mr-2" />
                          Analytics
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(listing.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No listings found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Start by creating your first listing.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/dashboard/listings/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Listing
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
