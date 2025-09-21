'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  Mail, 
  Globe, 
  Calendar,
  User,
  Building2,
  ShoppingBag,
  Heart,
  Share2,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react'

export default function BusinessStorePage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const slug = params?.slug
  
  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('products')

  useEffect(() => {
    if (!slug) return
    fetchBusiness()
    fetchFavorites()
  }, [slug])

  const fetchBusiness = async () => {
    try {
      const response = await fetch(`/api/businesses/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setBusiness(data.data)
      } else {
        console.error('Business not found')
      }
    } catch (error) {
      console.error('Failed to fetch business:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(price);
  }

  const formatBusinessHours = (hours: any) => {
    if (!hours) return 'Hours not available'
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    const today = new Date().getDay()
    const currentDay = days[(today + 6) % 7] // Convert Sunday=0 to Monday=0
    
    const todayHours = hours[currentDay]
    if (!todayHours) return 'Hours not available'
    
    if (!todayHours.isOpen) return 'Closed today'
    
    return `Open ${todayHours.openTime} - ${todayHours.closeTime}`
  }

  const handleFavoriteToggle = async (listingId: string) => {
    try {
      if (favorites.includes(listingId)) {
        await fetch(`/api/favorites?listingId=${listingId}`, { method: 'DELETE' })
        setFavorites(prev => prev.filter(id => id !== listingId))
      } else {
        await fetch('/api/favorites', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ listingId }) 
        })
        setFavorites(prev => [...prev, listingId])
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Store Not Found</h1>
            <p className="text-gray-600 mb-4">The business store you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/browse')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse All Listings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Business Header with Banner */}
      <div className="relative">
        {/* Cover Image/Banner */}
        <div className="h-64 md:h-80 bg-gradient-to-r from-coral-600 to-coral-700 relative overflow-hidden">
          {business.cover_image_url ? (
            <img 
              src={business.cover_image_url} 
              alt={`${business.name} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-coral-600 via-coral-500 to-orange-500" />
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Back Button */}
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => router.back()}
            className="absolute top-4 left-4 bg-white/90 hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Share Button */}
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => navigator.share?.({ 
              title: business.name, 
              url: window.location.href 
            })}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Business Logo and Info Overlay */}
        <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
          <div className="w-32 h-32 bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-white">
            {business.logo_url ? (
              <img 
                src={business.logo_url} 
                alt={`${business.name} logo`}
                className="w-full h-full object-contain bg-gray-50"
              />
            ) : (
              <div className="w-full h-full bg-coral-100 flex items-center justify-center">
                <Building2 className="h-12 w-12 text-coral-600" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Business Title and Basic Info */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{business.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                  <span className="font-medium">
                    {business.averageRating > 0 ? business.averageRating.toFixed(1) : 'New'}
                  </span>
                  <span className="ml-1">
                    ({business.totalReviews} review{business.totalReviews !== 1 ? 's' : ''})
                  </span>
                </div>
                
                {business.address && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-1" />
                    <span>{business.address}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-1" />
                  <span>{formatBusinessHours(business.business_hours)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-blue-600">
                  <Building2 className="h-3 w-3 mr-1" />
                  Business
                </Badge>
                {business.is_verified && (
                  <Badge className="bg-green-600">Verified</Badge>
                )}
                <Badge variant="outline">
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  {business.listings?.length || 0} Products
                </Badge>
              </div>

              {business.description && (
                <p className="text-gray-700 leading-relaxed">{business.description}</p>
              )}
            </div>

            {/* Tabs for Products and Reviews */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="products">
                  Products ({business.listings?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews ({business.totalReviews})
                </TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products" className="mt-6">
                {business.listings && business.listings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {business.listings.map((listing: any) => (
                      <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative">
                          {listing.images && listing.images.length > 0 ? (
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title}
                              className="h-48 w-full object-contain bg-gray-50"
                            />
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
                          
                          <button
                            onClick={() => handleFavoriteToggle(listing.id)}
                            className={`absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white transition-colors ${
                              favorites.includes(listing.id) ? 'text-coral-600' : 'text-gray-600'
                            }`}
                          >
                            <Heart className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <CardContent className="p-4">
                          <Link 
                            href={`/browse/${listing.slug}`}
                            className="font-semibold text-lg hover:underline line-clamp-1 mb-2 block"
                          >
                            {listing.title}
                          </Link>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {listing.description}
                          </p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="text-2xl font-bold text-coral-600">
                                {formatPrice(listing.price_daily)}
                                <span className="text-sm font-normal text-gray-600">/day</span>
                              </div>
                              {listing.price_weekly && (
                                <div className="text-sm text-gray-600">
                                  {formatPrice(listing.price_weekly)}/week
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right">
                              {listing.instant_book && (
                                <Badge variant="secondary" className="text-xs mb-1">
                                  Instant Book
                                </Badge>
                              )}
                              <div className="text-xs text-gray-500">
                                {listing.category?.name}
                              </div>
                            </div>
                          </div>
                          
                          <Button size="sm" asChild className="w-full">
                            <Link href={`/browse/${listing.slug}`}>
                              View Details
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Products Available</h3>
                    <p className="text-gray-600">
                      This business hasn't listed any products for rent yet.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-6">
                {business.reviews && business.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {business.reviews.map((review: any) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                              {review.from_user?.avatar ? (
                                <img 
                                  src={review.from_user.avatar} 
                                  alt={review.from_user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-full h-full p-2 text-gray-400" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold">{review.from_user?.name || 'Anonymous'}</h4>
                                  <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <h5 className="font-medium mb-2">{review.title}</h5>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600">
                      Be the first to rent from {business.name} and leave a review!
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {business.contact_email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <a 
                        href={`mailto:${business.contact_email}`}
                        className="text-coral-600 hover:underline"
                      >
                        {business.contact_email}
                      </a>
                    </div>
                  )}
                  
                  {business.contact_phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <a 
                        href={`tel:${business.contact_phone}`}
                        className="text-coral-600 hover:underline"
                      >
                        {business.contact_phone}
                      </a>
                    </div>
                  )}
                  
                  {business.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <a 
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-coral-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">
                      Joined {new Date(business.created_at).toLocaleDateString('en-ZA', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Business Hours */}
              {business.business_hours && (
                <Card>
                  <CardHeader>
                    <CardTitle>Business Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                        const dayKey = day.toLowerCase()
                        const hours = business.business_hours?.[dayKey]
                        
                        return (
                          <div key={day} className="flex justify-between items-center">
                            <span className="font-medium">{day}</span>
                            <span className="text-sm text-gray-600">
                              {hours?.isOpen 
                                ? `${hours.openTime} - ${hours.closeTime}`
                                : 'Closed'
                              }
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Store Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Products</span>
                    <span className="font-semibold">{business.listings?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reviews</span>
                    <span className="font-semibold">{business.totalReviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-semibold">
                        {business.averageRating > 0 ? business.averageRating.toFixed(1) : 'New'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
