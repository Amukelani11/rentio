'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, X } from 'lucide-react'

interface RatingRequestModalProps {
  user?: any
}

interface PendingReview {
  bookingId: string
  listingTitle: string
  ownerName: string
  completedAt: string
}

export default function RatingRequestModal({ user }: RatingRequestModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([])
  const [currentReview, setCurrentReview] = useState<PendingReview | null>(null)
  const [dismissed, setDismissed] = useState<string[]>([])

  useEffect(() => {
    if (!user) return
    
    // Check for completed bookings without reviews
    checkPendingReviews()
    
    // Check localStorage for dismissed reviews
    const dismissedReviews = localStorage.getItem('dismissedReviews')
    if (dismissedReviews) {
      setDismissed(JSON.parse(dismissedReviews))
    }
  }, [user])

  useEffect(() => {
    if (pendingReviews.length > 0 && !currentReview) {
      // Find the first non-dismissed review
      const nextReview = pendingReviews.find(review => !dismissed.includes(review.bookingId))
      if (nextReview) {
        setCurrentReview(nextReview)
        setIsOpen(true)
      }
    }
  }, [pendingReviews, dismissed, currentReview])

  const checkPendingReviews = async () => {
    try {
      // Get completed bookings from the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const response = await fetch(`/api/bookings?status=COMPLETED&since=${thirtyDaysAgo.toISOString()}`)
      if (response.ok) {
        const data = await response.json()
        const bookings = data.data?.items || []

        // Check which ones don't have reviews yet
        const reviewPromises = bookings.map(async (booking: any) => {
          const reviewResponse = await fetch(`/api/reviews/supabase?bookingId=${booking.id}`)
          if (reviewResponse.ok) {
            const reviewData = await reviewResponse.json()
            return {
              booking,
              hasReview: reviewData.data.items.length > 0
            }
          }
          return { booking, hasReview: false }
        })

        const reviewResults = await Promise.all(reviewPromises)
        const pending = reviewResults
          .filter(result => !result.hasReview)
          .map(result => ({
            bookingId: result.booking.id,
            listingTitle: result.booking.listing?.title || 'Unknown Item',
            ownerName: result.booking.listing?.user?.name || result.booking.listing?.business?.name || 'the owner',
            completedAt: result.booking.completed_at || result.booking.updated_at,
          }))

        setPendingReviews(pending)
      }
    } catch (error) {
      console.error('Failed to check pending reviews:', error)
    }
  }

  const handleRateNow = () => {
    if (currentReview) {
      router.push(`/reviews/new?booking=${currentReview.bookingId}`)
      setIsOpen(false)
    }
  }

  const handleDismiss = () => {
    if (currentReview) {
      const newDismissed = [...dismissed, currentReview.bookingId]
      setDismissed(newDismissed)
      localStorage.setItem('dismissedReviews', JSON.stringify(newDismissed))
      
      // Find next review to show
      const nextReview = pendingReviews.find(review => 
        review.bookingId !== currentReview.bookingId && 
        !newDismissed.includes(review.bookingId)
      )
      
      if (nextReview) {
        setCurrentReview(nextReview)
      } else {
        setIsOpen(false)
        setCurrentReview(null)
      }
    }
  }

  const handleRemindLater = () => {
    // Dismiss for today only
    const todayKey = `dismissedToday_${new Date().toDateString()}`
    const dismissedToday = JSON.parse(localStorage.getItem(todayKey) || '[]')
    if (currentReview && !dismissedToday.includes(currentReview.bookingId)) {
      dismissedToday.push(currentReview.bookingId)
      localStorage.setItem(todayKey, JSON.stringify(dismissedToday))
    }
    setIsOpen(false)
  }

  if (!isOpen || !currentReview) return null

  const daysSinceCompleted = Math.floor(
    (new Date().getTime() - new Date(currentReview.completedAt).getTime()) / 
    (1000 * 60 * 60 * 24)
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            Rate Your Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            How was your rental of <strong>{currentReview.listingTitle}</strong> with {currentReview.ownerName}?
          </p>
          
          <div className="text-sm text-gray-500 mb-6">
            Completed {daysSinceCompleted === 0 ? 'today' : 
                     daysSinceCompleted === 1 ? 'yesterday' : 
                     `${daysSinceCompleted} days ago`}
          </div>

          <div className="flex items-center justify-center mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className="h-6 w-6 text-gray-300 mx-1" 
              />
            ))}
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleRateNow}
              className="w-full"
            >
              Write Review
            </Button>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleRemindLater}
                className="flex-1"
              >
                Remind Me Later
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleDismiss}
                className="flex-1"
              >
                No Thanks
              </Button>
            </div>
          </div>

          {pendingReviews.length > 1 && (
            <p className="text-xs text-gray-500 text-center mt-4">
              {pendingReviews.length - dismissed.length - 1} more rental{pendingReviews.length - dismissed.length - 1 !== 1 ? 's' : ''} to review
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
