'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { CheckCircle, Clock, Mail, User, ArrowRight, Calendar, MapPin, CreditCard } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface BookingDetails {
  id: string
  status: string
  payment_status: string
  start_date: string
  end_date: string
  total_amount: number
  created_at: string
  listing: {
    id: string
    title: string
    description: string
    price_per_day: number
    images?: string[]
    location?: string
    user_id?: string
    business_id?: string
  }
  renter: {
    id: string
    name: string
    email: string
  }
}

interface PaymentDetails {
  id: string
  status: string
  amount: number
  currency: string
  provider: string
  created_at: string
}

export default function BookingPendingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [payment, setPayment] = useState<PaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const bookingId = searchParams.get('bookingId')
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId && !sessionId) {
        setError('No booking information provided')
        setLoading(false)
        return
      }

      try {
        let targetBookingId = bookingId

        // If we have a session ID instead, try to find the booking
        if (sessionId && !bookingId) {
          // Try matching common payment identifier columns (checkout_id or provider_id)
          const { data: payments, error: paymentError } = await supabase
            .from('payments')
            .select('booking_id')
            .or(`checkout_id.eq.${sessionId},provider_id.eq.${sessionId}`)
            .single()

          if (paymentError || !payments) {
            setError('Booking not found')
            setLoading(false)
            return
          }

          targetBookingId = payments.booking_id
        }

        // Fetch booking details
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            *,
            listing:listings(*),
            renter:profiles!bookings_renter_id_fkey(*)
          `)
          .eq('id', targetBookingId)
          .single()

        if (bookingError || !bookingData) {
          setError('Booking not found')
          setLoading(false)
          return
        }

        // Fetch payment details
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .eq('booking_id', targetBookingId)
          .single()

        if (paymentData) {
          setPayment(paymentData)
        }

        setBooking(bookingData)
      } catch (err) {
        console.error('Error fetching booking:', err)
        setError('Failed to load booking details')
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [bookingId, sessionId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <CheckCircle className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Booking</h1>
          <p className="text-gray-600 mb-6">{error || 'Booking details could not be found.'}</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  const isPaymentCompleted = booking.payment_status === 'COMPLETED'
  const isPendingConfirmation = booking.status === 'PENDING' && isPaymentCompleted

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 px-8 py-12 text-white text-center">
            <div className="mb-4">
              {isPaymentCompleted ? (
                <Clock className="h-20 w-20 mx-auto text-white" />
              ) : (
                <div className="h-20 w-20 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                  <CreditCard className="h-12 w-12 text-white" />
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {isPaymentCompleted ? 'Booking Awaiting Confirmation' : 'Payment Processing...'}
            </h1>
            <p className="text-lg opacity-90">
              {isPaymentCompleted
                ? 'Your payment is complete and the listing owner will review your booking shortly'
                : 'We\'re processing your payment'
              }
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Status Alert */}
            <div className={`mb-8 p-4 rounded-lg ${
              isPaymentCompleted
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}>
              <div className="flex items-center">
                {isPaymentCompleted ? (
                  <Clock className="h-5 w-5 mr-2" />
                ) : (
                  <CreditCard className="h-5 w-5 mr-2" />
                )}
                <span className="font-medium">
                  {isPaymentCompleted
                    ? 'Payment successful! Your booking is now awaiting confirmation from the listing owner.'
                    : 'Your payment is being processed. You will receive a confirmation email shortly.'
                  }
                </span>
              </div>
            </div>

            {/* Booking Details */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Rental Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Rental Information</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{booking.listing.title}</h3>
                    <p className="text-gray-600 text-sm">{booking.listing.description}</p>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <div>
                      <p className="text-sm font-medium">Pickup: {formatDate(booking.start_date)}</p>
                      <p className="text-sm font-medium">Return: {formatDate(booking.end_date)}</p>
                    </div>
                  </div>

                  {booking.listing.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <p className="text-sm">{booking.listing.location}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(booking.total_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Processing fee</span>
                      <span>Included</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span>Total Paid</span>
                        <span className="text-primary">{formatCurrency(booking.total_amount)}</span>
                      </div>
                    </div>
                  </div>

                  {payment && (
                    <div className="text-sm text-gray-600">
                      <p><strong>Payment ID:</strong> {payment.id}</p>
                      <p><strong>Method:</strong> {payment.provider}</p>
                      <p><strong>Status:</strong> {payment.status}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="border-t pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Next?</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Owner Review</h3>
                  <p className="text-sm text-gray-600">The listing owner will review your booking request and confirm or reject it</p>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <User className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Quick Response</h3>
                  <p className="text-sm text-gray-600">Most owners respond within 24 hours</p>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Ready When Confirmed</h3>
                  <p className="text-sm text-gray-600">Once confirmed, your rental will be ready for pickup at the scheduled time</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard/rentals"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Manage Your Booking
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Browse More Items
              </Link>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-8 text-center text-gray-600">
          <p className="mb-2">Need help with your booking?</p>
          <Link href="/support" className="text-primary hover:underline">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}