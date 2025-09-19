"use client";

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function MockCheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'cancelled'>('loading')
  const [processing, setProcessing] = useState(false)

  const paymentId = searchParams.get('paymentId')
  const transactionId = searchParams.get('transactionId')

  useEffect(() => {
    // Simulate payment processing
    const timer = setTimeout(() => {
      setStatus('loading')
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handlePaymentSuccess = async () => {
    setProcessing(true)
    try {
      // Simulate successful payment
      const response = await fetch('/api/payments/yoco/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: transactionId,
          status: 'successful',
          amount: 10000, // 100.00 ZAR in cents
          currency: 'ZAR',
          metadata: {
            paymentId,
          },
        }),
      })

      if (response.ok) {
        setStatus('success')
        // Redirect to booking confirmation
        setTimeout(() => {
          router.push('/dashboard/bookings')
        }, 2000)
      } else {
        setStatus('failed')
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      setStatus('failed')
    } finally {
      setProcessing(false)
    }
  }

  const handlePaymentFailure = async () => {
    setProcessing(true)
    try {
      // Simulate failed payment
      const response = await fetch('/api/payments/yoco/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: transactionId,
          status: 'failed',
          amount: 10000,
          currency: 'ZAR',
          metadata: {
            paymentId,
          },
        }),
      })

      setStatus('failed')
    } catch (error) {
      console.error('Payment processing error:', error)
      setStatus('failed')
    } finally {
      setProcessing(false)
    }
  }

  const handleCancel = () => {
    setStatus('cancelled')
    setTimeout(() => {
      router.push('/dashboard/bookings')
    }, 2000)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Processing Payment</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-600">Please wait while we process your payment...</p>
            <div className="space-y-2">
              <Button 
                onClick={handlePaymentSuccess} 
                disabled={processing}
                className="w-full"
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Simulate Success
              </Button>
              <Button 
                onClick={handlePaymentFailure} 
                disabled={processing}
                variant="destructive"
                className="w-full"
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Simulate Failure
              </Button>
              <Button 
                onClick={handleCancel} 
                disabled={processing}
                variant="outline"
                className="w-full"
              >
                Cancel Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-green-600">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
            <p className="text-gray-600">Your booking has been confirmed and payment processed successfully.</p>
            <p className="text-sm text-gray-500">Redirecting to your bookings...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Payment Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <XCircle className="h-12 w-12 mx-auto text-red-600" />
            <p className="text-gray-600">Your payment could not be processed. Please try again.</p>
            <Button 
              onClick={() => router.push('/dashboard/bookings')}
              className="w-full"
            >
              Back to Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'cancelled') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-yellow-600">Payment Cancelled</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <XCircle className="h-12 w-12 mx-auto text-yellow-600" />
            <p className="text-gray-600">You cancelled the payment. No charges were made.</p>
            <p className="text-sm text-gray-500">Redirecting to your bookings...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}


