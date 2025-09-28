'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBusinessSlug } from '@/lib/utils/slugify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  DollarSign, 
  Calendar,
  Users,
  Truck,
  Clock,
  Heart,
  Image as ImageIcon
} from 'lucide-react';
import { Listing, ListingSearchParams } from '@/types';

const categories = [
  { id: 'tools', name: 'Tools', icon: '🔧' },
  { id: 'party-events', name: 'Party & Events', icon: '🎉' },
  { id: 'dresses', name: 'Dresses', icon: '👗' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'trailers', name: 'Trailers', icon: '🚚' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'furniture', name: 'Furniture', icon: '🪑' },
  { id: 'appliances', name: 'Appliances', icon: '🏠' },
];

// Listings will be fetched from the server (active listings)

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(false);

  // Initialize filters with static defaults to avoid SSR/CSR mismatch,
  // then sync from search params on client mount.
  const [filters, setFilters] = useState({
    query: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    deliveryAvailable: false,
    instantBook: false,
    verifiedOnly: false,
  });

  useEffect(() => {
    // Sync search params into filters on client only to keep markup deterministic
    const q = searchParams?.get('q') ?? '';
    const c = searchParams?.get('category') ?? '';
    const loc = searchParams?.get('location') ?? '';
    setFilters(prev => ({ ...prev, query: q, category: c, location: loc }));
    // Fetch active listings from server with current filters
    fetchListings({ query: q, category: c, location: loc });
    // Fetch favorites for current user (best-effort)
    fetch('/api/favorites').then(r => r.ok ? r.json().then(d => setFavorites(d.favorites || [])) : null).catch(()=>{})
  }, [searchParams]);

  async function fetchListings(f?: any) {
    try {
      const params = new URLSearchParams();
      params.set('limit', '24');
      if (f?.query) params.set('query', f.query)
      if (f?.category) params.set('category', f.category)
      if (f?.location) params.set('location', f.location)
      if (f?.minPrice) params.set('minPrice', f.minPrice)
      if (f?.maxPrice) params.set('maxPrice', f.maxPrice)
      if (f?.deliveryAvailable) params.set('deliveryAvailable', 'true')
      if (f?.instantBook) params.set('instantBook', 'true')
      if (f?.verifiedOnly) params.set('verifiedOnly', 'true')
      const res = await fetch(`/api/listings/search?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setListings(data.data.items || [])
      }
    } catch (e) {
      console.error('Failed to fetch listings', e)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings(filters);
  };

  const updateFilter = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredListings = listings.filter(listing => {
    const cats = (listing as any).categories
    if (filters.category && cats?.id !== filters.category) return false;
    if (filters.minPrice && listing.priceDaily < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && listing.priceDaily > parseFloat(filters.maxPrice)) return false;
    if (filters.deliveryAvailable && !listing.deliveryOptions?.deliveryAvailable) return false;
    if (filters.instantBook && !listing.instantBook) return false;
    if (filters.verifiedOnly && !listing.verified) return false;
    if (filters.query && !listing.title.toLowerCase().includes(filters.query.toLowerCase())) return false;
    return true;
  });

  const getCover = (listing: any): string | null => {
    const imgs = (listing as any).images || (listing as any).imageUrls || []
    if (Array.isArray(imgs) && imgs.length > 0 && typeof imgs[0] === 'string') return imgs[0]
    if (typeof (listing as any).image === 'string') return (listing as any).image
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Inline search (use main site header only) */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="What do you need to rent?"
              className="pl-10"
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
            />
          </div>
          <div className="w-64 relative hidden md:block">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Where?"
              className="pl-10"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button type="submit" className="md:w-auto">
              Search
            </Button>
            <Button variant="ghost" onClick={() => setFilters({
              query: '',
              category: '',
              minPrice: '',
              maxPrice: '',
              location: '',
              deliveryAvailable: false,
              instantBook: false,
              verifiedOnly: false,
            })}>
              Clear
            </Button>
          </div>
        </form>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Filter className="mr-2 h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="font-medium mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={filters.category === category.id}
                          onChange={() => updateFilter('category', filters.category === category.id ? '' : category.id)}
                          className="text-coral-600"
                        />
                        <span className="flex items-center">
                          <span className="mr-2">{category.icon}</span>
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-medium mb-3">Price Range (per day)</h3>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    />
                  </div>
                </div>

                {/* Quick Filters */}
                <div>
                  <h3 className="font-medium mb-3">Quick Filters</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.deliveryAvailable}
                        onChange={(e) => updateFilter('deliveryAvailable', e.target.checked)}
                        className="text-coral-600"
                      />
                      <span className="flex items-center">
                        <Truck className="mr-2 h-4 w-4" />
                        Delivery Available
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.instantBook}
                        onChange={(e) => updateFilter('instantBook', e.target.checked)}
                        className="text-coral-600"
                      />
                      <span className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        Instant Book
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.verifiedOnly}
                        onChange={(e) => updateFilter('verifiedOnly', e.target.checked)}
                        className="text-coral-600"
                      />
                      <span className="flex items-center">
                        <Star className="mr-2 h-4 w-4" />
                        Verified Only
                      </span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Listings Grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Browse Rentals</h1>
                <p className="text-gray-600">
                  {filteredListings.length} items found
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select className="border rounded-md px-3 py-1 text-sm">
                  <option>Relevance</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                  <option>Rating</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <Link key={listing.id} href={`/browse/${listing.slug}`} className="block">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <div className="relative">
                        {getCover(listing) ? (
                          <img src={getCover(listing)!} alt={listing.title} className="h-48 w-full object-contain bg-gray-50" />
                        ) : (
                          <div className="h-48 bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                        {listing.featured && (
                          <Badge className="absolute top-2 left-2 bg-coral-600">
                            Featured
                          </Badge>
                        )}
                        {listing.instantBook && (
                          <Badge className="absolute top-2 left-2 bg-green-600 text-white flex items-center" style={{ marginTop: listing.featured ? '2.5rem' : '0' }}>
                            <Clock className="h-3 w-3 mr-1" />
                            Instant Book
                          </Badge>
                        )}
                        {listing.verified && (
                          <Badge className="absolute top-2 right-2 bg-green-600/30 border border-green-600 text-green-800">
                            Verified
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg line-clamp-1 hover:underline">{listing.title}</h3>
                          <div className="flex items-center text-sm text-gray-600">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span>{listing.averageRating ? listing.averageRating.toFixed(1) : 'New'}</span>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {listing.description}
                        </p>

                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="line-clamp-1">{listing.location}</span>
                        </div>


                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-2xl font-bold text-coral-600">
                              {formatPrice(listing.priceDaily)}
                              <span className="text-sm font-normal text-gray-600">/day</span>
                            </div>
                            {listing.priceWeekly ? (
                              <div className="text-sm text-gray-600">
                                {formatPrice(listing.priceWeekly)}/week
                              </div>
                            ) : (
                              <div className="text-sm text-gray-600">
                                {formatPrice(listing.priceDaily * 7 * (1 - (((listing as any).weekly_discount ?? listing.weeklyDiscount ?? 0) / 100)) )}/week
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              Deposit: {formatPrice(typeof listing.depositValue === 'number' ? listing.depositValue : ((listing as any).deposit_value ? parseFloat((listing as any).deposit_value) : 0))}
                            </div>
                            {listing.instantBook && (
                              <Badge className="text-xs bg-green-600 text-white">
                                <Clock className="h-3 w-3 mr-1" />
                                Instant Book
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {listing.deliveryOptions?.deliveryAvailable && (
                              <Badge variant="outline" className="text-xs">
                                <Truck className="h-3 w-3 mr-1" />
                                Delivery
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {(listing as any).categories?.name || 'Uncategorized'}
                            </Badge>
                            {(listing as any).business_id && (
                              <Link
                                href={`/store/${createBusinessSlug((listing as any).business?.name || '')}`}
                                className="text-xs"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                                  🏪 Store
                                </Badge>
                              </Link>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                              <Link href={`/browse/${listing.slug}`}>View Details</Link>
                            </Button>
                            <button
                              aria-label="wishlist"
                              className={`text-gray-600 hover:text-coral-600 ${favorites.includes(listing.id) ? 'text-coral-600' : ''}`}
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  if (favorites.includes(listing.id)) {
                                    await fetch(`/api/favorites?listingId=${listing.id}`, { method: 'DELETE' })
                                    setFavorites(prev => prev.filter(id => id !== listing.id))
                                  } else {
                                    await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: listing.id }) })
                                    setFavorites(prev => [...prev, listing.id])
                                  }
                                } catch (err) {
                                  console.error('Wishlist toggle failed', err)
                                }
                              }}
                            >
                              <Heart className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {filteredListings.length === 0 && !loading && (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No listings found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search criteria
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({
                    query: '',
                    category: '',
                    minPrice: '',
                    maxPrice: '',
                    location: '',
                    deliveryAvailable: false,
                    instantBook: false,
                    verifiedOnly: false,
                  })}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
