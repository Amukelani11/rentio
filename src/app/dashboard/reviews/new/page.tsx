'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, 
  ArrowLeft, 
  Package, 
  Calendar, 
  User,
  CheckCircle,
  AlertTriangle,
  Info,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface Booking {
  id: string;
  bookingNumber: string;
  startDate: string;
  endDate: string;
  listing: {
    id: string;
    title: string;
    images: string[];
    category: {
      name: string;
    };
  };
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ReviewCategory {
  id: string;
  name: string;
  description: string;
}

const reviewCategories: ReviewCategory[] = [
  { id: 'item_quality', name: 'Item Quality', description: 'How was the condition and quality of the item?' },
  { id: 'owner_communication', name: 'Owner Communication', description: 'How responsive and helpful was the owner?' },
  { id: 'value_for_money', name: 'Value for Money', description: 'Was the rental price fair for what you received?' },
  { id: 'delivery_pickup', name: 'Delivery/Pickup', description: 'How was the delivery or pickup experience?' },
  { id: 'accuracy', name: 'Listing Accuracy', description: 'Did the item match the listing description?' },
];

export default function CreateReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking');
  
  const [user, setUser] = useState<any>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!bookingId) {
      router.push('/dashboard/bookings');
      return;
    }
    fetchData();
  }, [bookingId]);

  const fetchData = async () => {
    try {
      const [userResponse, bookingResponse] = await Promise.all([
        fetch('/api/auth/user'),
        fetch(`/api/bookings/${bookingId}`),
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      }

      if (bookingResponse.ok) {
        const bookingData = await bookingResponse.json();
        setBooking(bookingData.data);
        
        // Check if review already exists
        if (bookingData.data.reviews && bookingData.data.reviews.length > 0) {
          router.push(`/dashboard/bookings/${bookingId}`);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (value: number) => {
    setRating(value);
  };

  const handleCategoryRatingChange = (categoryId: string, value: number) => {
    setCategoryRatings(prev => ({
      ...prev,
      [categoryId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !rating || !title || !comment) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          listingId: booking.listing.id,
          rating,
          title,
          comment,
          categories: categoryRatings,
        }),
      });

      if (response.ok) {
        router.push(`/dashboard/bookings/${booking.id}`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('An error occurred while submitting your review');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (currentRating: number, onRatingChange?: (rating: number) => void, readonly = false) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            className={`p-1 rounded-full transition-colors ${
              star <= (hoverRating || currentRating)
                ? 'text-yellow-500'
                : 'text-gray-300 hover:text-yellow-400'
            } ${!readonly ? 'hover:bg-yellow-50' : ''}`}
            onClick={() => onRatingChange?.(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
          >
            <Star className={`h-5 w-5 ${star <= (hoverRating || currentRating) ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
    );
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

  if (!booking) {
    return (
      <DashboardLayout user={user} showHeader={false}>
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Booking not found</h3>
          <Link href="/dashboard/bookings">
            <Button>Back to Bookings</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} showHeader={false}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/bookings/${booking.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Booking
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Write a Review</h1>
            <p className="text-gray-600">Share your experience with other renters</p>
          </div>
        </div>

        {/* Booking Info */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{booking.listing.title}</h3>
                <p className="text-gray-600 mb-2">{booking.listing.category.name}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{booking.owner.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Form */}
        <Card>
          <CardHeader>
            <CardTitle>Rate Your Experience</CardTitle>
            <CardDescription>
              Your honest review helps other renters make informed decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Rating *
                </label>
                <div className="flex items-center space-x-3">
                  {renderStars(rating, handleRatingChange)}
                  <span className="text-sm text-gray-600">
                    {rating > 0 ? `${rating} out of 5` : 'Select a rating'}
                  </span>
                </div>
              </div>

              {/* Category Ratings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Rate Specific Aspects
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviewCategories.map((category) => (
                    <div key={category.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{category.name}</h4>
                          <p className="text-xs text-gray-600">{category.description}</p>
                        </div>
                        {renderStars(
                          categoryRatings[category.id] || 0,
                          (rating) => handleCategoryRatingChange(category.id, rating)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience in a few words"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {title.length}/100 characters
                </p>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review *
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your experience with this rental..."
                  rows={6}
                  minLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {comment.length}/1000 characters minimum (50 characters required)
                </p>
              </div>

              {/* Review Guidelines */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1 text-sm">
                    <p>• Be honest and constructive in your review</p>
                    <p>• Focus on your personal experience with the item and owner</p>
                    <p>• Avoid including personal information or inappropriate content</p>
                    <p>• Your review will be public and help other renters make decisions</p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <div className="flex items-center justify-between">
                <Link href={`/dashboard/bookings/${booking.id}`}>
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button
                  type="submit"
                  disabled={!rating || !title || !comment || comment.length < 50 || submitting}
                  size="lg"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
