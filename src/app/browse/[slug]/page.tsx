"use client";

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Star, Truck, Image as ImageIcon, Heart, Share2, Calendar, User, CheckCircle, Shield, ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import Head from 'next/head'
import DateRangePicker from '@/components/ui/date-range-picker'

export default function ListingDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug
  const router = useRouter()
  const searchParams = useSearchParams()
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDates, setSelectedDates] = useState<{ start: Date | undefined; end: Date | undefined }>({ start: undefined, end: undefined })
  const [quantity, setQuantity] = useState<number>(1)
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery' | null>(null)
  const [deliveryTouched, setDeliveryTouched] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [kycModalOpen, setKycModalOpen] = useState(false)
  const [kycState, setKycState] = useState<string | null>(null)
  const images = useMemo(() => {
    const arr = (listing?.images as any) || (listing as any)?.imageUrls || []
    return Array.isArray(arr) ? arr.filter(Boolean) : []
  }, [listing])

  useEffect(() => {
    if (currentImage >= images.length) setCurrentImage(0)
  }, [images, currentImage])

  const goPrev = () => setCurrentImage(prev => (images.length ? (prev - 1 + images.length) % images.length : 0))
  const goNext = () => setCurrentImage(prev => (images.length ? (prev + 1) % images.length : 0))
  const onThumb = (idx: number) => setCurrentImage(idx)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0]?.clientX ?? null)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart == null) return
    const dx = (e.changedTouches?.[0]?.clientX ?? touchStart) - touchStart
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext(); else goPrev();
    }
    setTouchStart(null)
  }

  // Lightbox keyboard shortcuts
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen])

  useEffect(() => {
    if (!slug) return
    fetch(`/api/listings/by-slug/${slug}`).then(async (r) => {
      if (r.ok) {
        const d = await r.json();
        console.log('Listing data:', d.data); // Debug log
        setListing(d.data)
      }
      setLoading(false)
    })
  }, [slug])

  // Auto-open compose after redirect from signin
  useEffect(() => {
    if (searchParams?.get('compose') === '1') {
      setComposeOpen(true)
      const t = searchParams.get('text') || ''
      if (t) setComposeText(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const daysBetween = (start: Date | undefined, end: Date | undefined) => {
    if (!start || !end) return 0
    const ms = end.getTime() - start.getTime()
    if (ms <= 0) return 0
    return Math.ceil(ms / (1000 * 60 * 60 * 24))
  }

  const calculateTotalPrice = () => {
    if (!listing) return 0
    const days = daysBetween(selectedDates.start, selectedDates.end)
    const daily = typeof (listing as any).priceDaily === 'number' ? (listing as any).priceDaily : parseFloat((listing as any).price_daily || '0')
    const subtotal = Math.max(0, days) * daily * quantity
    return subtotal
  }

  const handleBooking = async () => {
    if (!listing || !selectedDates.start || !selectedDates.end) return
    const requiresDeliveryChoice = Boolean((listing as any)?.delivery_options?.pickupAvailable || (listing as any)?.delivery_options?.deliveryAvailable)
    if (requiresDeliveryChoice && !deliveryType) {
      setDeliveryTouched(true)
      return
    }
    // Check auth + KYC before proceeding
    try {
      const r = await fetch('/api/auth/user')
      if (!r.ok) {
        const back = `/browse/${encodeURIComponent(String(slug))}`
        router.push(`/auth/signin?redirect=${encodeURIComponent(back)}`)
        return
      }
      const u = await r.json()
      const kyc = (u?.user?.kycStatus || '').toUpperCase(); setKycState(kyc)
      const requiresKyc = Boolean((listing as any)?.requiresKyc)
      if (requiresKyc && kyc !== 'VERIFIED' && kyc !== 'APPROVED') {
        setKycModalOpen(true)
        return
      }
    } catch {
      // if user fetch fails, send to signin
      const back = `/browse/${encodeURIComponent(String(slug))}`
      router.push(`/auth/signin?redirect=${encodeURIComponent(back)}`)
      return
    }
    const start = selectedDates.start.toISOString()
    const end = selectedDates.end.toISOString()
    const url = `/checkout?listing=${encodeURIComponent((listing as any).id)}&slug=${encodeURIComponent((listing as any).slug || '')}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&qty=${encodeURIComponent(String(quantity))}&delivery=${encodeURIComponent(deliveryType || '')}`
    router.push(url)
  }

  const getCancellationPolicyText = (policy: string | undefined) => {
    switch ((policy || '').toUpperCase()) {
      case 'FLEXIBLE':
        return 'Full refund 1 day prior to pickup.'
      case 'MODERATE':
        return 'Full refund 5 days prior to pickup.'
      case 'STRICT':
        return '50% refund up to 7 days prior to pickup.'
      default:
        return 'Refer to listing for cancellation details.'
    }
  }

  const ownerInfo = useMemo(() => {
  const listingData = listing as any;
  console.log('Owner info data:', {
    ownerName: listingData?.ownerName,
    ownerAvatar: listingData?.ownerAvatar,
    ownerType: listingData?.ownerType,
    isVerified: listingData?.isVerified
  });
  
  return {
    name: listingData?.ownerName || 'Owner',
    avatar: listingData?.ownerAvatar,
    type: listingData?.ownerType || 'individual',
    rating: 0, // Default rating since we don't have this data yet
    totalReviews: 0, // Default reviews since we don't have this data yet
    verified: Boolean(listingData?.isVerified),
    memberSince: listingData?.createdAt || listingData?.created_at || new Date().toISOString(),
    responseRate: 100,
    responseTime: 'within an hour',
  };
}, [listing])

  const mockReviews: any[] = []

  // Message compose modal state
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeText, setComposeText] = useState('')

  const sendQuickMessage = async () => {
    if (!composeText.trim()) return;

    try {
      // Check authentication
      const auth = await fetch('/api/auth/user')
      if (!auth.ok) {
        const back = `/browse/${encodeURIComponent(String(slug))}?compose=1&text=${encodeURIComponent(composeText || '')}`
        router.push(`/auth/signin?redirect=${encodeURIComponent(back)}`)
        return
      }
      const user = await auth.json()
      if (!user?.id) {
        router.push('/auth/signin')
        return
      }

      const listerId = (listing as any)?.businessId || (listing as any)?.userId || ''
      const listingId = (listing as any)?.id || ''
      
      if (!listerId || !listingId) {
        alert('Unable to identify listing owner. Please try again.')
        setComposeOpen(false)
        return
      }

      // Send message and create conversation
      const response = await fetch('/api/messages/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toUserId: listerId,
          listingId: listingId,
          content: composeText.trim(),
          listingTitle: listing?.title,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Redirect to the conversation
        router.push(`/dashboard/messages?conversation=${result.data.conversationId}`);
      } else {
        const error = await response.json();
        console.error('Failed to send message:', error);
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setComposeOpen(false);
      setComposeText('');
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }
  
  if (!listing) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Listing not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{listing?.title ? `${listing.title} Â· Rentio` : 'Listing Â· Rentio'}</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <div 
                className="relative h-96 bg-gray-200 flex items-center justify-center overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => images.length && setLightboxOpen(true)}
              >
                {images.length > 0 ? (
                  <>
                    <Image
                      src={images[currentImage]}
                      alt={listing?.title || 'Listing image'}
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover"
                      unoptimized
                      priority
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          aria-label="Previous image"
                          onClick={(e) => { e.stopPropagation(); goPrev(); }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          aria-label="Next image"
                          onClick={(e) => { e.stopPropagation(); goNext(); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                          {images.map((_, i) => (
                            <span key={i} className={`h-1.5 w-3 rounded-full ${i === currentImage ? 'bg-white' : 'bg-white/50'}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <ImageIcon className="h-24 w-24 text-gray-400" />
                )}

                <div className="absolute top-4 left-4 flex space-x-2">
                  {listing?.featured && (
                    <Badge className="bg-coral-600">Featured</Badge>
                  )}
                  {listing?.verified && (
                    <Badge className="bg-green-600">Verified</Badge>
                  )}
                </div>
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                    <Heart className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                    <Share2 className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
              {images.length > 1 && (
                <div className="p-3">
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((src: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => onThumb(i)}
                        className={`relative h-16 w-24 flex-shrink-0 rounded overflow-hidden border ${i === currentImage ? 'ring-2 ring-coral-600' : 'border-gray-200'}`}
                        aria-label={`Go to image ${i+1}`}
                      >
                        <Image src={src} alt={`Thumbnail ${i+1}`} fill className="object-cover" sizes="96px" unoptimized />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Title and Basic Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{listing?.title}</h1>
              <div className="flex items-center space-x-4 text-gray-600 mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                  <span>4.8 (23 reviews)</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-1" />
                  <span>{listing?.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-1" />
                  <span>{listing?.bookingsCount || 0} bookings</span>
                </div>
              </div>
            </div>

            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Listed by {ownerInfo.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {ownerInfo.avatar ? (
                      <img 
                        src={ownerInfo.avatar} 
                        alt={ownerInfo.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="font-medium">{ownerInfo.rating}</span>
                        <span className="text-gray-600 ml-1">({ownerInfo.totalReviews} reviews)</span>
                      </div>
                      {ownerInfo.verified && (
                        <Badge className="bg-green-600">Verified</Badge>
                      )}
                      {ownerInfo.type === 'business' && (
                        <Badge className="bg-blue-600">Business</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Member since {new Date(ownerInfo.memberSince).toLocaleDateString()}</div>
                      <div>Response rate: {ownerInfo.responseRate}%</div>
                      <div>Response time: {ownerInfo.responseTime}</div>
                    </div>
                  </div>
                  <Button onClick={async () => {
                    try {
                      const r = await fetch('/api/auth/user')
                      if (!r.ok) {
                        const back = `/browse/${encodeURIComponent(String(slug))}?compose=1`
                        router.push(`/auth/signin?redirect=${encodeURIComponent(back)}`)
                        return
                      }
                      setComposeOpen(true)
                    } catch {
                      setComposeOpen(true)
                    }
                  }}>Message</Button>
                </div>
              </CardContent>
            </Card>

            {/* Description and Details */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {listing?.description}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>What's Included</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {listing?.specifications?.included?.map((item: any, index: number) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pickup & Delivery</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {listing?.delivery_options?.pickupAvailable && (
                      <div>
                        <div className="flex items-center mb-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span className="font-medium">Pickup available</span>
                        </div>
                      </div>
                    )}
                    {listing?.delivery_options?.deliveryAvailable && (
                      <div>
                        <div className="flex items-center mb-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span className="font-medium">Delivery available</span>
                        </div>
                        <p className="text-gray-600 text-sm ml-7">
                          Delivery fee: {formatPrice(listing?.delivery_options?.deliveryFee || 0)} {(listing?.delivery_options?.deliveryFeeType === 'per_km') ? 'per km' : 'flat rate'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Technical Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries((listing?.specifications || {}) as Record<string, any>).map(([key, value]) => (
                        key !== 'included' && (
                          <div key={key} className="flex justify-between py-2 border-b">
                            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className="text-gray-600">{value}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="availability" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Availability Rules</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Advance notice required:</span>
                      <span>{listing?.availabilityRules?.advanceNoticeDays} day(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minimum rental period:</span>
                      <span>{listing?.availabilityRules?.minStayDays} day(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekend multiplier:</span>
                      <span>{listing?.weekendMultiplier}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekly discount:</span>
                      <span>{listing?.weeklyDiscount}% off</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cancellation Policy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      {getCancellationPolicyText(listing?.cancellationPolicy)}
                    </p>
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Your deposit is protected by our secure payment system and will be released upon successful return of the item.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                    <CardDescription>
                      See what other renters have to say about this item
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {mockReviews.map((review) => (
                        <div key={review.id} className="border-b last:border-b-0 pb-6 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-medium">{review.title}</span>
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-gray-700 mb-2">{review.comment}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">- {review.author}</span>
                            <button className="text-gray-500 hover:text-coral-600">
                              Helpful ({review.helpful})
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {formatPrice(typeof (listing as any)?.priceDaily === 'number' ? (listing as any).priceDaily : parseFloat((listing as any)?.price_daily || '0'))}
                  <span className="text-lg font-normal text-gray-600">/day</span>
                </CardTitle>
                {( (listing as any)?.priceWeekly || (listing as any)?.price_weekly ) && (
                  <CardDescription>
                    Save {(listing as any)?.weeklyDiscount ?? (listing as any)?.weekly_discount ?? 0}% with weekly rentals - {formatPrice((listing as any)?.priceWeekly ?? parseFloat((listing as any)?.price_weekly || '0'))}/week
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Rental Dates</label>
                  <DateRangePicker
                    value={selectedDates}
                    onChange={setSelectedDates}
                    listingId={listing.id}
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Quantity {listing.quantity_available && `(Available: ${listing.quantity_available})`}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={listing.quantity_available || 10}
                    value={quantity}
                    onChange={(e) => {
                      const maxQuantity = listing.quantity_available || 10;
                      const newQuantity = Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1));
                      setQuantity(newQuantity);
                    }}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                  {listing.quantity_available && quantity > listing.quantity_available && (
                    <p className="text-xs text-red-600 mt-1">
                      Only {listing.quantity_available} item{listing.quantity_available !== 1 ? 's' : ''} available
                    </p>
                  )}
                </div>

                {/* Delivery Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Option</label>
                  <div className="space-y-2">
                    {listing.delivery_options?.pickupAvailable && (
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryType === 'pickup'}
                          onChange={() => { setDeliveryType('pickup'); setDeliveryTouched(false) }}
                          className="text-coral-600"
                        />
                        <span>Pickup - Free</span>
                      </label>
                    )}
                    {listing.delivery_options?.deliveryAvailable && (
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryType === 'delivery'}
                          onChange={() => { setDeliveryType('delivery'); setDeliveryTouched(false) }}
                          className="text-coral-600"
                        />
                        <span>Delivery - {formatPrice(listing.delivery_options.deliveryFee)} {listing.delivery_options.deliveryFeeType === 'per_km' ? 'per km' : 'flat rate'}</span>
                      </label>
                    )}
                  </div>
                  {((listing as any)?.delivery_options?.pickupAvailable || (listing as any)?.delivery_options?.deliveryAvailable) && deliveryTouched && !deliveryType && (
                    <div className="text-xs text-red-600 mt-2">Please select pickup or delivery to continue.</div>
                  )}
                </div>

                {/* Price Breakdown */}
                {selectedDates.start && selectedDates.end && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Rental ({quantity} × {daysBetween(selectedDates.start, selectedDates.end)} days):</span>
                      <span>{formatPrice(calculateTotalPrice())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Service fee:</span>
                      <span>{formatPrice(calculateTotalPrice() * 0.05)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Deposit:</span>
                      <span>{formatPrice(listing.deposit_value * quantity)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Total:</span>
                      <span>{formatPrice(calculateTotalPrice() + (calculateTotalPrice() * 0.05) + (listing.deposit_value * quantity))}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleBooking}
                    disabled={
                      !selectedDates.start ||
                      !selectedDates.end ||
                      (listing.quantity_available && quantity > listing.quantity_available) ||
                      (((listing as any)?.delivery_options?.pickupAvailable || (listing as any)?.delivery_options?.deliveryAvailable) && !deliveryType)
                    }
                  >
                    {listing.instant_book ? 'Book Now' : 'Request to Book'}
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Heart className="mr-2 h-4 w-4" />
                    Save to Favorites
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-1 text-green-600" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                      <span>Deposit Protected</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {composeOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Message {ownerInfo.name}</h3>
              <p className="text-sm text-gray-600">About: {listing?.title}</p>
            </div>
            <div className="p-4">
              <textarea
                className="w-full border rounded-md px-3 py-2 min-h-[120px]"
                placeholder="Write your message..."
                value={composeText}
                onChange={(e) => setComposeText(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">Your message will appear in your Messages.</p>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button>
              <Button onClick={sendQuickMessage} disabled={!composeText.trim()}>Send</Button>
            </div>
          </div>
        </div>
      )}
      {kycModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">KYC Required</h3>
            </div>
            <div className="p-4 space-y-2">
              {kycState === 'PENDING' ? (
                <p className="text-sm text-gray-700">Thanks - your KYC documents were submitted and are currently under review. You'll be able to book once verification is completed.</p>
              ) : kycState === 'REJECTED' ? (
                <p className="text-sm text-gray-700">We could not verify your identity. Please update and resubmit your KYC documents to continue.</p>
              ) : kycState === 'MORE_INFO_REQUIRED' ? (
                <p className="text-sm text-gray-700">Additional information is required for your KYC verification. Please provide the requested documents to continue.</p>
              ) : (
                <p className="text-sm text-gray-700">This lister requires KYC to book. Please complete verification to continue.</p>
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setKycModalOpen(false)}>Close</Button>
              <Button onClick={() => router.push('/dashboard/kyc')}>
                {kycState === 'PENDING' ? 'View KYC' : 
                 kycState === 'REJECTED' ? 'Update KYC' : 
                 kycState === 'MORE_INFO_REQUIRED' ? 'Provide More Info' : 
                 'Go to KYC'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            aria-label="Close"
            className="absolute top-4 right-4 text-white/90 hover:text-white"
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false) }}
          >
            <X className="h-8 w-8" />
          </button>
          {images.length > 1 && (
            <button
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/90 hover:text-white"
              onClick={(e) => { e.stopPropagation(); goPrev() }}
            >
              <ChevronLeft className="h-12 w-12" />
            </button>
          )}
          <div className="relative w-full h-full max-w-6xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[currentImage]}
              alt={listing?.title || 'Listing image full'}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized
              priority
            />
          </div>
          {images.length > 1 && (
            <button
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/90 hover:text-white"
              onClick={(e) => { e.stopPropagation(); goNext() }}
            >
              <ChevronRight className="h-12 w-12" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}






