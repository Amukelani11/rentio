"use client";

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { CancellationPolicy, DepositType, Category } from '@/types'

type Form = {
  title: string
  description: string
  categoryId: string
  priceDaily: number
  priceWeekly?: number
  weeklyDiscount: number
  weekendMultiplier: number
  depositType: DepositType
  depositValue: number
  minDays: number
  maxDays?: number
  instantBook: boolean
  requiresKyc: boolean
  maxDistance?: number
  location: string
  availabilityRules: any
  specifications: any
  tags: string[]
  cancellationPolicy: CancellationPolicy
  status?: string
}

export default function EditListingPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<Form | null>(null)
  const [activeTab, setActiveTab] = useState<'basic'|'pricing'|'availability'|'logistics'|'settings'>('basic')

  useEffect(() => {
    const load = async () => {
      try {
        const [u, cats, listing] = await Promise.all([
          fetch('/api/auth/user'),
          fetch('/api/categories'),
          id ? fetch(`/api/listings/${id}`) : Promise.resolve({ ok: false }) as any,
        ])
        if (u.ok) { const d = await u.json(); setUser(d.user) }
        if (cats.ok) {
          const cd = await cats.json()
          const flat = (cd.data || []).flatMap((c: any) => [
            { id: c.id, name: c.name }, ...((c.children || []).map((ch: any) => ({ id: ch.id, name: ch.name })))
          ])
          setCategories(flat)
        }
        if (listing.ok) {
          const ld = await listing.json()
          const l = ld.data
          const f: Form = {
            title: l.title || '',
            description: l.description || '',
            categoryId: l.category_id || '',
            priceDaily: l.price_daily ?? 0,
            priceWeekly: l.price_weekly ?? undefined,
            weeklyDiscount: l.weekly_discount ?? 0,
            weekendMultiplier: l.weekend_multiplier ?? 1,
            depositType: l.deposit_type || DepositType.FIXED,
            depositValue: l.deposit_value ?? 0,
            minDays: l.min_days ?? 1,
            maxDays: l.max_days ?? undefined,
            instantBook: Boolean(l.instant_book),
            requiresKyc: Boolean(l.requires_kyc),
            maxDistance: l.max_distance ?? undefined,
            location: l.location || '',
            availabilityRules: tryParseJSON(l.availability_rules) || {},
            specifications: tryParseJSON(l.specifications) || {},
            tags: tryParseJSON(l.tags) || [],
            cancellationPolicy: l.cancellation_policy || CancellationPolicy.MODERATE,
            status: l.status,
          }
          setForm(f)
        }
      } catch (e) {
        setError('Failed to load listing')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const setField = (k: keyof Form, v: any) => setForm(prev => prev ? { ...prev, [k]: v } : prev)
  const setAvail = (k: string, v: any) => setForm(prev => prev ? { ...prev, availabilityRules: { ...(prev.availabilityRules||{}), [k]: v } } : prev)
  const setSpecs = (k: string, v: any) => setForm(prev => prev ? { ...prev, specifications: { ...(prev.specifications||{}), [k]: v } } : prev)

  const save = async (action: 'save'|'publish'|'unpublish') => {
    if (!form || !id) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/listings/${id}` , {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: action === 'publish' ? 'ACTIVE' : action === 'unpublish' ? 'INACTIVE' : form.status })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to update')
      router.push('/dashboard/listings')
    } catch (e: any) {
      setError(e?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) {
    return (
      <DashboardLayout user={user} showHeader={false}>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user} showHeader={false}>
      <div className="max-w-5xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
              <p className="text-gray-600">Update your listing details and manage its visibility</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/listings')}
                className="flex items-center gap-2"
              >
                ← Back to Listings
              </Button>
              {form.status === 'ACTIVE' ? (
                <Button 
                  variant="outline" 
                  onClick={() => save('unpublish')} 
                  disabled={saving}
                  className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Unpublish
                </Button>
              ) : (
                <Button 
                  onClick={() => save('publish')} 
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Publish Listing
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => save('save')} 
                disabled={saving}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Draft
              </Button>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              form.status === 'ACTIVE' 
                ? 'bg-green-100 text-green-800' 
                : form.status === 'PENDING'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {form.status === 'ACTIVE' ? 'Published' : form.status === 'PENDING' ? 'Pending Review' : 'Draft'}
            </span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger 
              value="basic" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
            >
              Basic Info
            </TabsTrigger>
            <TabsTrigger 
              value="pricing"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
            >
              Pricing
            </TabsTrigger>
            <TabsTrigger 
              value="availability"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
            >
              Availability
            </TabsTrigger>
            <TabsTrigger 
              value="logistics"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
            >
              Logistics
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title} onChange={(e) => setField('title', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="desc">Description</Label>
                  <Textarea id="desc" value={form.description} onChange={(e) => setField('description', e.target.value)} rows={4} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.categoryId} onValueChange={(v) => setField('categoryId', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid max-w-sm">
                  <Label>Quantity</Label>
                  <Input type="number" min={1} value={form.specifications?.quantity || 1} onChange={(e) => setSpecs('quantity', Math.max(1, parseInt(e.target.value)||1))} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4 max-w-2xl">
                  <div>
                    <Label>Daily (ZAR)</Label>
                    <Input type="number" min={0} step="0.01" value={form.priceDaily ?? 0} onChange={(e) => setField('priceDaily', parseFloat(e.target.value)||0)} />
                  </div>
                  <div>
                    <Label>Weekly (ZAR)</Label>
                    <Input type="number" min={0} step="0.01" value={form.priceWeekly ?? ''} onChange={(e) => setField('priceWeekly', parseFloat(e.target.value)||0)} />
                  </div>
                  <div>
                    <Label>Weekly Discount (%)</Label>
                    <Input type="number" min={0} step="1" value={form.weeklyDiscount ?? 0} onChange={(e) => setField('weeklyDiscount', parseInt(e.target.value)||0)} />
                  </div>
                  <div>
                    <Label>Weekend Multiplier</Label>
                    <Input type="number" min={1} step="0.1" value={form.weekendMultiplier ?? 1} onChange={(e) => setField('weekendMultiplier', parseFloat(e.target.value)||1)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Booking Window</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-3 gap-4 max-w-2xl">
                <div>
                  <Label>Minimum Days</Label>
                  <Input type="number" min={1} value={form.minDays || 1} onChange={(e)=> setField('minDays', Math.max(1, parseInt(e.target.value)||1))} />
                </div>
                <div>
                  <Label>Maximum Days</Label>
                  <Input type="number" min={form.minDays||1} value={form.maxDays || ''} onChange={(e)=> setField('maxDays', Math.max(form.minDays||1, parseInt(e.target.value)|| (form.minDays||1)))} />
                </div>
                <div>
                  <Label>Advance Notice (days)</Label>
                  <Input type="number" min={0} value={form.availabilityRules?.advanceNoticeDays || 0} onChange={(e)=> setAvail('advanceNoticeDays', Math.max(0, parseInt(e.target.value)||0))} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Days Available</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4 max-w-xl">
                <div className="flex items-center justify-between rounded border p-3">
                  <div>
                    <Label>Weekdays</Label>
                    <p className="text-xs text-muted-foreground">Allow bookings Mon–Fri</p>
                  </div>
                  <Switch checked={Boolean(form.availabilityRules?.weekdays ?? true)} onCheckedChange={(v)=>setAvail('weekdays', v)} />
                </div>
                <div className="flex items-center justify-between rounded border p-3">
                  <div>
                    <Label>Weekends</Label>
                    <p className="text-xs text-muted-foreground">Allow bookings Sat–Sun</p>
                  </div>
                  <Switch checked={Boolean(form.availabilityRules?.weekends ?? true)} onCheckedChange={(v)=>setAvail('weekends', v)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logistics" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Logistics</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e)=> setField('location', e.target.value)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Instant Book</Label>
                    <p className="text-xs text-muted-foreground">Allow bookings without approval</p>
                  </div>
                  <Switch checked={form.instantBook} onCheckedChange={(v)=> setField('instantBook', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Requires KYC</Label>
                    <p className="text-xs text-muted-foreground">Only verified renters can book</p>
                  </div>
                  <Switch checked={form.requiresKyc} onCheckedChange={(v)=> setField('requiresKyc', v)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Security & Policy</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4 max-w-2xl">
                <div>
                  <Label>Deposit Type</Label>
                  <Select value={form.depositType} onValueChange={(v)=> setField('depositType', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DepositType.FIXED}>Fixed</SelectItem>
                      <SelectItem value={DepositType.PERCENTAGE}>Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Deposit Value</Label>
                  <Input type="number" min={0} step="0.01" value={form.depositValue ?? 0} onChange={(e)=> setField('depositValue', parseFloat(e.target.value)||0)} />
                </div>
                <div>
                  <Label>Cancellation Policy</Label>
                  <Select value={form.cancellationPolicy} onValueChange={(v)=> setField('cancellationPolicy', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CancellationPolicy.FLEXIBLE}>Flexible</SelectItem>
                      <SelectItem value={CancellationPolicy.MODERATE}>Moderate</SelectItem>
                      <SelectItem value={CancellationPolicy.STRICT}>Strict</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => save('save')} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save</Button>
              {form.status === 'ACTIVE' ? (
                <Button variant="outline" onClick={() => save('unpublish')} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Unpublish</Button>
              ) : (
                <Button onClick={() => save('publish')} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Publish</Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function tryParseJSON(v: any) {
  if (!v) return null
  if (typeof v === 'object') return v
  try { return JSON.parse(v) } catch { return null }
}

