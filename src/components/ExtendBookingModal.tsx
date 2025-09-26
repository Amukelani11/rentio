"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Booking {
  id: string;
  booking_number: string;
  status: string;
  payment_status: string;
  start_date: string;
  end_date: string;
  duration: number;
  quantity: number;
  subtotal: number;
  service_fee: number;
  delivery_fee: number;
  deposit_amount: number;
  total_amount: number;
  delivery_type: string;
  listing: {
    id: string;
    title: string;
    slug: string;
    description?: string;
    price_daily: string;
    price_weekly?: string;
    price_monthly?: string;
    images: string[];
    location: string;
    category: {
      id: string;
      name: string;
      icon: string;
    };
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      avatar?: string;
    };
    business?: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      logo?: string;
    };
  };
}

interface ExtendSuccessPayload {
  message: string
  details?: string
  booking?: any
  extension?: {
    days: number
    cost: number
    newEndDate: string
  }
}

interface ExtendBookingModalProps {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (payload: ExtendSuccessPayload) => void
}

export function ExtendBookingModal({ booking, open, onOpenChange, onSuccess }: ExtendBookingModalProps) {
  const [newEndDate, setNewEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  const calculateExtensionCost = () => {
    if (!booking || !newEndDate) return 0

    const currentEnd = new Date(booking.end_date)
    const newEnd = new Date(newEndDate)

    if (newEnd <= currentEnd) return 0

    const extensionDays = Math.ceil((newEnd.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24))
    const dailyRate = parseFloat(booking.listing.price_daily)

    return extensionDays * dailyRate
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!booking || !newEndDate) {
      setError('Please select a new end date')
      return
    }

    const currentEnd = new Date(booking.end_date)
    const newEnd = new Date(newEndDate)

    if (newEnd <= currentEnd) {
      setError(`New end date must be after your current rental end date (${formatDate(booking.end_date)}). Please select a date after this.`)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/bookings/${booking.id}/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_end_date: newEndDate,
          notes: notes.trim() || undefined
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 409) {
          // Conflict error - show detailed message
          throw new Error(`${errorData.error}${errorData.details ? `\n\n${errorData.details}` : ''}`)
        }
        throw new Error(errorData.error || 'Failed to extend booking')
      }

      const responseData = await response.json()

      const payload: ExtendSuccessPayload = {
        message: 'Extension request submitted successfully! 🎉',
        details: 'The listing owner will review your request and you will receive an email notification once they approve or decline it.',
        booking: responseData?.data?.booking,
        extension: responseData?.data?.extension,
      }

      onSuccess?.(payload)

      onOpenChange(false)
      setNewEndDate('')
      setNotes('')
      setError('')
    } catch (error) {
      console.error('Extension error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to extend booking'

      // Show the error in the modal instead of just alert
      setError(errorMessage)

      // Also show in alert for immediate feedback
      if (errorMessage.includes('not available')) {
        alert(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!booking) return null

  const extensionCost = calculateExtensionCost()

  // Calculate the minimum selectable date (day after current booking ends)
  const currentEndDate = new Date(booking.end_date)
  const minSelectableDate = new Date(currentEndDate)
  minSelectableDate.setDate(minSelectableDate.getDate() + 1)
  const minDateString = minSelectableDate.toISOString().split('T')[0]

  // Calculate the rental period dates for visual indication
  const rentalStartDate = new Date(booking.start_date)
  const rentalEndDate = new Date(booking.end_date)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Extend Rental</DialogTitle>
          <DialogDescription>
            Extend your rental period for "{booking.listing.title}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-period">Current Rental Period</Label>
            <div className="text-sm p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2 text-blue-800">
                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                <span className="font-medium">Currently Renting</span>
              </div>
              <div className="mt-1 text-blue-700">
                {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                <span className="text-xs text-blue-600 ml-2">({booking.duration} days)</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              ⚠️ You can only extend your rental to dates after {formatDate(booking.end_date)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-end-date">Extension End Date *</Label>
            <Input
              id="new-end-date"
              type="date"
              value={newEndDate}
              onChange={(e) => {
                setNewEndDate(e.target.value)
                setError('') // Clear error when user changes date
              }}
              min={minDateString}
              required
              className="border-blue-200 focus:border-blue-500"
            />
            <p className="text-xs text-muted-foreground">
              Select the new end date for your rental extension
            </p>
          </div>

          {extensionCost > 0 && (
            <div className="space-y-2">
              <Label>Extension Cost</Label>
              <div className="text-sm p-3 bg-muted rounded-md">
                <div className="flex justify-between">
                  <span>Additional days:</span>
                  <span>{Math.ceil((new Date(newEndDate).getTime() - new Date(booking.end_date).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                </div>
                <div className="flex justify-between font-medium mt-1">
                  <span>Total:</span>
                  <span>R{extensionCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Optional: Add any special requests or reason for extension (e.g., 'Need extra time for project completion')..."
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value)
                setError('') // Clear error when user changes notes
              }}
              rows={3}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Extending...' : 'Extend Rental'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
