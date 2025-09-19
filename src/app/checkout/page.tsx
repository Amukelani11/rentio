'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Truck, Shield, CheckCircle, ArrowLeft } from 'lucide-react'

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = searchParams.get('slug') || undefined
  const listingId = searchParams.get('listing') || undefined
  const start = searchParams.get('start') ? new Date(searchParams.get('start')!) : undefined
  const end = searchParams.get('end') ? new Date(searchParams.get('end')!) : undefined
  const qty = parseInt(searchParams.get('qty') || '1', 10)
  const delivery = (searchParams.get('delivery') as 'pickup' | 'delivery' | null) || null

  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function run() {
      try {
        if (slug) {
          const r = await fetch(`/api/listings/by-slug/${slug}`)
          if (r.ok) {
            const d = await r.json()
            setListing(d.data)
          }
        }
        // fetch user for KYC state
        const u = await fetch('/api/auth/user')
        if (u.ok) {
          const uj = await u.json()
          setUser(uj.user)
        }
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [slug])

  const formatPrice = (price: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(price || 0)

  const days = useMemo(() => {
    if (!start || !end) return 0
    const ms = end.getTime() - start.getTime()
    return ms > 0 ? Math.ceil(ms / (1000*60*60*24)) : 0
  }, [start, end])

  const subtotal = useMemo(() => {
    const daily = listing?.priceDaily || 0
    const rawSubtotal = Math.max(0, days) * daily * (isNaN(qty) ? 1 : Math.max(1, qty))
    return Math.round(rawSubtotal * 100) / 100
  }, [listing, days, qty])

  const serviceFee = Math.round((subtotal * 0.05) * 100) / 100
  const deposit = useMemo(() => {
    const depositValue = listing?.depositValue || listing?.deposit_value || 0
    const depositType = listing?.depositType || listing?.deposit_type || 'FIXED'
    const quantity = isNaN(qty) ? 1 : Math.max(1, qty)
    
    if (depositType === 'FIXED') {
      return Math.round((parseFloat(depositValue) * quantity) * 100) / 100
    } else {
      return Math.round(((subtotal * parseFloat(depositValue)) / 100) * 100) / 100
    }
  }, [listing, subtotal, qty])
  
  const deliveryFee = delivery === 'delivery' ? (listing?.delivery_options?.deliveryFee || 0) : 0
  const total = Math.round((subtotal + serviceFee + deposit + deliveryFee) * 100) / 100

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    deliveryAddress: '',
    notes: '',
  })
  const [addrQuery, setAddrQuery] = useState('')
  const [addrSuggestions, setAddrSuggestions] = useState<Array<{ description: string; place_id: string }>>([])
  const [addrOpen, setAddrOpen] = useState(false)
  const [deliveryAddrQuery, setDeliveryAddrQuery] = useState('')
  const [deliveryAddrSuggestions, setDeliveryAddrSuggestions] = useState<Array<{ description: string; place_id: string }>>([])
  const [deliveryAddrOpen, setDeliveryAddrOpen] = useState(false)

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  // Simple autocomplete using our Places API proxy for user address
  useEffect(() => {
    let active = true
    const q = addrQuery.trim()
    if (!q) { setAddrSuggestions([]); return }
    const id = setTimeout(async () => {
      try {
        const r = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(q)}&type=address`)
        if (!r.ok) return
        const d = await r.json()
        if (active) setAddrSuggestions(d.data || [])
      } catch {}
    }, 200)
    return () => { active = false; clearTimeout(id) }
  }, [addrQuery])

  // Simple autocomplete using our Places API proxy for delivery address
  useEffect(() => {
    let active = true
    const q = deliveryAddrQuery.trim()
    if (!q) { setDeliveryAddrSuggestions([]); return }
    const id = setTimeout(async () => {
      try {
        const r = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(q)}&type=address`)
        if (!r.ok) return
        const d = await r.json()
        if (active) setDeliveryAddrSuggestions(d.data || [])
      } catch {}
    }, 200)
    return () => { active = false; clearTimeout(id) }
  }, [deliveryAddrQuery])

  const canPay = listing && start && end && form.name && form.email && form.phone && form.address

  const requiresKyc = Boolean(listing?.requiresKyc)
  const kycVerified = (user?.kycStatus || '').toUpperCase() === 'VERIFIED' || (user?.kycStatus || '').toUpperCase() === 'APPROVED'
  const canPayWithKyc = canPay && (!requiresKyc || kycVerified)

  const handleBooking = async () => {
    try {
      // First create a pending booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          startDate: start?.toISOString(),
          endDate: end?.toISOString(),
          quantity: qty,
          deliveryType: delivery,
          deliveryAddress: delivery === 'delivery' ? deliveryAddrQuery : null,
          deliveryNotes: form.notes,
          contactDetails: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
          },
        }),
      })
      
      if (!bookingResponse.ok) {
        const error = await bookingResponse.json()
        alert(error.error || 'Failed to create booking')
        return
      }

      const bookingResult = await bookingResponse.json()
      const booking = bookingResult.data.booking

      // Now create Yoco checkout session
      const checkoutResponse = await fetch('/api/payments/yoco/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amountInCents: Math.round(total * 100), // Convert to cents
          currency: 'ZAR',
          metadata: {
            listingTitle: listing.title,
            startDate: start?.toISOString(),
            endDate: end?.toISOString(),
          },
        }),
      })

      if (!checkoutResponse.ok) {
        const error = await checkoutResponse.json()
        alert(error.error || 'Failed to create payment session')
        return
      }

      const checkoutResult = await checkoutResponse.json()
      
      // Redirect to Yoco payment page
      window.location.href = checkoutResult.data.redirectUrl
      
    } catch (error) {
      console.error('Booking error:', error)
      alert('An error occurred while processing your booking')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>
  if (!listing) return <div className="min-h-screen flex items-center justify-center">Listing not found</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Button variant="outline" onClick={() => router.back()} className="inline-flex items-center"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {requiresKyc && !kycVerified && (
                <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-800 p-3 text-sm">
                  This lister requires KYC. Please complete verification before paying.
                  <Button variant="outline" size="sm" className="ml-2" onClick={() => router.push('/dashboard/kyc')}>Go to KYC</Button>
                </div>
              )}
              <div className="rounded-md border border-blue-200 bg-blue-50 text-blue-800 p-3 text-sm mb-4">
                <strong>Required Information:</strong> All contact details are required so the lister can contact you and arrange delivery/pickup.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input 
                    className={`w-full border rounded-md px-3 py-2 ${!form.name ? 'border-red-300' : ''}`} 
                    value={form.name} 
                    onChange={e => update('name', e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    className={`w-full border rounded-md px-3 py-2 ${!form.email ? 'border-red-300' : ''}`} 
                    value={form.email} 
                    onChange={e => update('email', e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone <span className="text-red-500">*</span></label>
                  <input 
                    className={`w-full border rounded-md px-3 py-2 ${!form.phone ? 'border-red-300' : ''}`} 
                    value={form.phone} 
                    onChange={e => update('phone', e.target.value)} 
                    required 
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">Your Address <span className="text-red-500">*</span></label>
                  <input
                    className={`w-full border rounded-md px-3 py-2 ${!form.address ? 'border-red-300' : ''}`}
                    value={addrQuery || form.address}
                    onChange={e => { setAddrQuery(e.target.value); setAddrOpen(true) }}
                    onFocus={() => setAddrOpen(true)}
                    placeholder="Start typing your address"
                    autoComplete="off"
                    required
                  />
                  {addrOpen && addrSuggestions.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-md max-h-64 overflow-auto">
                      {addrSuggestions.map((s) => (
                        <button
                          key={s.place_id}
                          type="button"
                          onClick={() => { update('address', s.description); setAddrQuery(s.description); setAddrOpen(false) }}
                          className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                        >
                          {s.description}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {delivery === 'delivery' && (
                  <div className="relative md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Delivery Address</label>
                    <input
                      className="w-full border rounded-md px-3 py-2"
                      value={deliveryAddrQuery || form.deliveryAddress}
                      onChange={e => { setDeliveryAddrQuery(e.target.value); setDeliveryAddrOpen(true) }}
                      onFocus={() => setDeliveryAddrOpen(true)}
                      placeholder="Start typing delivery address"
                      autoComplete="off"
                    />
                    {deliveryAddrOpen && deliveryAddrSuggestions.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-md max-h-64 overflow-auto">
                        {deliveryAddrSuggestions.map((s) => (
                          <button
                            key={s.place_id}
                            type="button"
                            onClick={() => { update('deliveryAddress', s.description); setDeliveryAddrQuery(s.description); setDeliveryAddrOpen(false) }}
                            className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                          >
                            {s.description}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea className="w-full border rounded-md px-3 py-2" rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} />
              </div>
              <div className="text-xs text-gray-600 flex items-center"><Shield className="h-4 w-4 mr-1 text-green-600" />Your details are protected and only shared with the owner once confirmed.</div>
            </CardContent>
          </Card>

          </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="font-semibold">{listing.title}</div>
              <div className="text-sm text-gray-600 flex items-center"><MapPin className="h-4 w-4 mr-1" />{listing.location}</div>
              {delivery === 'delivery' && (
                <div className="text-sm text-gray-600 flex items-center"><Truck className="h-4 w-4 mr-1" />Delivery selected</div>
              )}
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span>Dates</span><span>{start?.toLocaleDateString()} – {end?.toLocaleDateString()} ({days} day{days === 1 ? '' : 's'})</span></div>
                <div className="flex justify-between"><span>Quantity</span><span>{isNaN(qty) ? 1 : Math.max(1, qty)}</span></div>
                <div className="flex justify-between"><span>Rental</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span>Service fee</span><span>{formatPrice(serviceFee)}</span></div>
                {deliveryFee > 0 && (<div className="flex justify-between"><span>Delivery</span><span>{formatPrice(deliveryFee)}</span></div>)}
                {deposit > 0 && (<div className="flex justify-between"><span>Refundable deposit</span><span>{formatPrice(deposit)}</span></div>)}
                <div className="border-t pt-2 flex justify-between font-semibold"><span>Total</span><span className="text-coral-600">{formatPrice(total)}</span></div>
              </div>

              <Button className="w-full" size="lg" disabled={!canPayWithKyc} onClick={handleBooking}>
                Complete Booking
              </Button>
              <div className="text-xs text-gray-600 flex items-center"><CheckCircle className="h-4 w-4 mr-1 text-green-600" />Secure checkout. Deposit protected.</div>
              <div className="text-xs text-gray-500">By continuing you agree to our terms and rental policies.</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
