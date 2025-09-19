"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function RentalDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const routeId = (typeof params?.id === 'string' ? params.id : Array.isArray((params as any)?.id) ? (params as any).id[0] : null) as string | null
  const bookingId = routeId || searchParams.get('id') || searchParams.get('bookingId')
  const [booking, setBooking] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [extendDate, setExtendDate] = useState<string>('')
  const [extendSuccess, setExtendSuccess] = useState<string>('')

  useEffect(() => {
    if (!bookingId) { setLoading(false); return }
    const fetchData = async () => {
      try {
        const [uRes, bRes] = await Promise.all([
          fetch('/api/auth/user'),
          fetch(`/api/bookings/${bookingId}`),
        ])
        if (uRes.ok) setUser((await uRes.json()).user)
        if (bRes.ok) setBooking((await bRes.json()).data)
      } catch (e) {
        console.error('Fetch rental detail error', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [bookingId])

  const mutateBooking = (next: any) => setBooking((prev: any) => ({ ...(prev || {}), ...(next || {}) }))

  const cancelBooking = async () => {
    if (!bookingId || submitting) return
    const reason = prompt('Why are you cancelling? (optional)') || ''
    setSubmitting(true)
    const prev = booking
    try {
      mutateBooking({ status: 'CANCELLED', cancelled_at: new Date().toISOString() })
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', reason })
      })
      if (!res.ok) throw new Error('Cancel failed')
      const data = await res.json()
      mutateBooking(data.data)
    } catch (e) {
      console.error(e)
      mutateBooking(prev)
      alert('Failed to cancel booking')
    } finally {
      setSubmitting(false)
    }
  }

  const extendBooking = async (newEndIso: string) => {
    if (!bookingId || submitting || !booking) return
    setSubmitting(true)
    setExtendSuccess('')
    const prev = booking
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'extend', newEndDate: newEndIso })
      })
      if (!res.ok) throw new Error('Extend failed')
      const data = await res.json()
      mutateBooking(data.data)
      setExtendSuccess('Extension requested. The owner will review and you will receive a confirmation email to pay up to the extended date once approved.')
      setShowExtendModal(false)
    } catch (e) {
      console.error(e)
      mutateBooking(prev)
      alert('Failed to request extension')
    } finally {
      setSubmitting(false)
    }
  }

  const messageOwner = async () => {
    if (!booking || submitting) return
    const to = booking.listing.user?.id || booking.listing.business?.id
    if (!to) return
    setSubmitting(true)
    try {
      // Ensure a conversation exists for this listing between renter and owner
      const res = await fetch('/api/conversations/find-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: to, listingId: booking.listing.id })
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/dashboard/messages?conversation=${data.data.conversationId}`)
      } else {
        // Fallback to compose
        router.push(`/dashboard/messages?compose=1&to=${to}`)
      }
    } catch (e) {
      console.error('Open conversation failed', e)
      router.push(`/dashboard/messages?compose=1&to=${to}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <DashboardLayout user={user} showHeader={false}><div className="p-12">Loading...</div></DashboardLayout>
  if (!booking) return <DashboardLayout user={user} showHeader={false}><div className="p-12">Not found</div></DashboardLayout>

  const canCancel = ['PENDING','CONFIRMED'].includes(booking.status)

  // Financials & deposit
  const subtotal = Number(booking.subtotal || 0)
  const serviceFee = Number(booking.service_fee || 0)
  const deliveryFee = Number(booking.delivery_fee || 0)
  const depositAmount = Number(booking.deposit_amount || 0)
  const totalAmount = Number(booking.total_amount || 0)
  const payment = Array.isArray(booking.payments) ? booking.payments[0] : null
  const depositReleased = Boolean(payment?.deposit_released)
  const depositRetained = Number(payment?.deposit_retained || 0)
  const depositRefundable = Math.max(depositAmount - depositRetained, 0)
  const showRefund = ['COMPLETED','CANCELLED'].includes(booking.status) && payment?.status === 'COMPLETED'

  return (
    <DashboardLayout user={user} showHeader={false}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Rental Details</h1>
            <p className="text-sm text-muted-foreground">{booking.listing.title}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{booking.status}</Badge>
            <Button variant="outline" size="sm" onClick={messageOwner} disabled={submitting}>Message</Button>
            <Button variant="outline" size="sm" onClick={() => { setExtendSuccess(''); setExtendDate(''); setShowExtendModal(true) }} disabled={submitting}>Extend</Button>
            {canCancel && (
              <Button variant="destructive" size="sm" onClick={cancelBooking} disabled={submitting}>Cancel</Button>
            )}
          </div>
        </div>

        {extendSuccess && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {extendSuccess}
          </div>
        )}

        {/* Financial summary */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Subtotal</div>
                <div className="text-lg font-semibold">R{subtotal.toFixed(2)}</div>
                <div className="mt-2 text-sm flex justify-between"><span>Service fee</span><span>R{serviceFee.toFixed(2)}</span></div>
                <div className="text-sm flex justify-between"><span>Delivery</span><span>R{deliveryFee.toFixed(2)}</span></div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Deposit held</div>
                <div className="text-lg font-semibold">R{depositAmount.toFixed(2)}</div>
                {showRefund ? (
                  <div className="mt-2 text-sm">
                    {depositReleased ? (
                      <div className="flex items-center justify-between text-green-700"><span>Refunded</span><span>R{depositRefundable.toFixed(2)}</span></div>
                    ) : (
                      <div className="flex items-center justify-between text-amber-700"><span>Pending refund</span><span>R{depositRefundable.toFixed(2)}</span></div>
                    )}
                    {depositRetained > 0 && (
                      <div className="flex items-center justify-between text-red-700"><span>Retained</span><span>R{depositRetained.toFixed(2)}</span></div>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-muted-foreground">Refund available after completion or cancellation</div>
                )}
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Total paid</div>
                <div className="text-2xl font-extrabold text-coral-600">R{totalAmount.toFixed(2)}</div>
                <div className="mt-2 text-xs text-muted-foreground">Booking #{booking.booking_number}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details & Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">{booking.listing.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p className="text-sm">Pickup: {new Date(booking.start_date).toLocaleString()}</p>
                <p className="text-sm">Return: {new Date(booking.end_date).toLocaleString()}</p>
              </div>
              <div className="pt-4 flex flex-wrap items-center gap-2">
                <Button onClick={() => router.push(`/dashboard/messages?compose=1&to=${booking.listing.user?.id || booking.listing.business?.id}`)}>Contact Owner</Button>
                <Link href={`/dashboard/bookings/${booking.id}`} className="text-sm underline">Manage booking</Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extend Modal */}
        {showExtendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowExtendModal(false)} />
            <div className="relative z-10 w-full max-w-md rounded-xl border bg-white p-5 shadow-xl dark:border-charcoal-600 dark:bg-charcoal-700">
              <h3 className="text-lg font-semibold">Request Extension</h3>
              <p className="mt-1 text-sm text-muted-foreground">Select the new return date and time.</p>
              <div className="mt-4 space-y-2">
                <label className="text-sm">New return date/time</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-md border px-3 py-2 text-sm dark:bg-charcoal-600"
                  value={extendDate}
                  min={new Date(new Date(booking.end_date).getTime() + 60 * 60 * 1000).toISOString().slice(0,16)}
                  onChange={(e) => setExtendDate(e.target.value)}
                />
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setShowExtendModal(false)} disabled={submitting}>Close</Button>
                <Button onClick={() => extendDate ? extendBooking(new Date(extendDate).toISOString()) : null} disabled={submitting || !extendDate}>Request extension</Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">We’ll notify the owner. Once approved, you’ll receive a confirmation email to pay for the extension.</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}



