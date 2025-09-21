'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Star, ArrowLeft } from 'lucide-react'

export default function NewReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams?.get('booking')

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!bookingId) {
      router.push('/dashboard/bookings')
      return
    }
    fetchBooking()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`)
      if (response.ok) {
        const data = await response.json()
        setBooking(data.data)
        
        // Check if review already exists
        const reviewResponse = await fetch(`/api/reviews/supabase?bookingId=${bookingId}`)
        if (reviewResponse.ok) {
          const reviewData = await reviewResponse.json()
          if (reviewData.data.items.length > 0) {
            setError('You have already reviewed this booking')
          }
        }
      } else {
        setError('Booking not found')
      }
    } catch (err) {
      setError('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating || !title || !comment) {
      setError('Please fill in all fields and select a rating')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/reviews/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          rating,
          title,
          comment,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard/bookings?success=review-submitted')
      } else {
        setError(data.error || 'Failed to submit review')
      }
    } catch (err) {
      setError('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Unable to Load Review</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/dashboard/bookings')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const ownerName = booking?.listing?.user?.name || booking?.listing?.business?.name || 'the owner'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Rate Your Rental Experience</CardTitle>
              <CardDescription>
                Share your experience to help other renters and improve our community
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Booking Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-lg mb-2">{booking?.listing?.title}</h3>
                <p className="text-gray-600 mb-2">Rented from {ownerName}</p>
                <div className="text-sm text-gray-500">
                  {booking?.start_date && booking?.end_date && (
                    <>
                      {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                    </>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating Stars */}
                <div>
                  <Label className="text-base font-medium">Overall Rating</Label>
                  <div className="flex items-center space-x-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`p-1 ${
                          star <= (hoverRating || rating) 
                            ? 'text-yellow-500' 
                            : 'text-gray-300'
                        } hover:text-yellow-500 transition-colors`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        <Star className="h-8 w-8 fill-current" />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {rating === 0 ? 'Select a rating' : `${rating} star${rating !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <Label htmlFor="title">Review Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarize your experience..."
                    maxLength={100}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
                </div>

                {/* Review Comment */}
                <div>
                  <Label htmlFor="comment">Your Review</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell others about your rental experience. Was the item as described? How was the communication with the owner? Any tips for future renters?"
                    rows={6}
                    maxLength={1000}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{comment.length}/1000 characters</p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !rating || !title || !comment}
                    className="min-w-[120px]"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
