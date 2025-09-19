"use client";

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Search, Eye, CheckCircle, XCircle, Ban } from 'lucide-react'
import { Role } from '@/lib/types'

export default function AdminListingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])
  const [selectedListing, setSelectedListing] = useState<any | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<'ALL'|'ACTIVE'|'INACTIVE'|'SUSPENDED'>('ALL')

  useEffect(() => {
    const load = async () => {
      const u = await fetch('/api/auth/user')
      if (u.ok) setUser((await u.json()).user)
      await fetchItems()
      setLoading(false)
    }
    load()
  }, [])

  const fetchItems = async () => {
    // Admin moderation: reuse listings API (will return creator-owned for non-admin).
    // For demo, call without params and filter client-side.
    try {
      const r = await fetch('/api/listings?limit=50')
      if (r.ok) {
        const d = await r.json()
        setItems(d.data.items || [])
      }
    } catch {}
  }

  const filtered = items.filter((l) =>
    (tab === 'ALL' || l.status === tab) &&
    (q.trim() === '' || (l.title || '').toLowerCase().includes(q.toLowerCase()))
  )

  if (loading) {
    return (
      <DashboardLayout user={user} showHeader={false}>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  const isAdmin = Array.isArray(user?.roles) && (user.roles.includes('ADMIN') || user.roles.includes(Role.ADMIN as any))

  return (
    <DashboardLayout user={user} showHeader={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">{isAdmin ? 'Listings Moderation' : 'My Listings'}</h1>
          <Button variant="outline" onClick={fetchItems}>Refresh</Button>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input className="pl-9" placeholder="Search listings" value={q} onChange={(e)=> setQ(e.target.value)} />
              </div>
              <Tabs value={tab} onValueChange={(v)=> setTab(v as any)}>
                <TabsList>
                  <TabsTrigger value="ALL">All</TabsTrigger>
                  <TabsTrigger value="ACTIVE">Active</TabsTrigger>
                  <TabsTrigger value="INACTIVE">Inactive</TabsTrigger>
                  <TabsTrigger value="SUSPENDED">Suspended</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((l) => (
                <Card key={l.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{l.title}</CardTitle>
                      <CardDescription>{l.location}</CardDescription>
                    </div>
                    <Badge>{l.status}</Badge>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {l.price_daily ? `R${l.price_daily}/day` : ''}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild><a href={`/browse/${l.slug}`}><Eye className="h-4 w-4 mr-1" />View</a></Button>
                      <Button size="sm" variant="outline" onClick={() => openDetails(l.id)}><Eye className="h-4 w-4 mr-1" />Details</Button>
                      {isAdmin && (
                        <>
                          <Button size="sm" variant="outline" onClick={async () => { await moderate(l.id, 'ACTIVE') }}><CheckCircle className="h-4 w-4 mr-1" />Approve</Button>
                          <Button size="sm" variant="outline" onClick={async () => { await moderate(l.id, 'SUSPENDED') }}><Ban className="h-4 w-4 mr-1" />Suspend</Button>
                          <Button size="sm" variant="destructive" onClick={async () => { await removeListing(l.id) }}><XCircle className="h-4 w-4 mr-1" />Delete</Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* Details modal */}
              {selectedListing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Listing Details</CardTitle>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => moderate(selectedListing.id, 'ACTIVE')}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => rejectListing(selectedListing.id)}>Reject</Button>
                          <Button size="sm" variant="outline" onClick={() => setSelectedListing(null)}>Close</Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {detailsLoading ? (
                        <div className="p-6 text-center">Loading...</div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold">Title</h3>
                            <div className="text-sm">{selectedListing.title}</div>
                          </div>
                          <div>
                            <h3 className="font-semibold">Location</h3>
                            <div className="text-sm">{selectedListing.location}</div>
                          </div>
                          <div>
                            <h3 className="font-semibold">Posted by</h3>
                            <div className="text-sm">{selectedListing.user?.email || selectedListing.user_id}</div>
                          </div>
                          <div>
                            <h3 className="font-semibold">Price</h3>
                            <div className="text-sm">{selectedListing.price_daily ? `R${selectedListing.price_daily}/day` : 'N/A'}</div>
                          </div>
                          <div>
                            <h3 className="font-semibold">Description</h3>
                            <div className="text-sm whitespace-pre-wrap">{selectedListing.description}</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
              {filtered.length === 0 && (
                <div className="p-6 text-sm text-muted-foreground">No listings found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )

  async function moderate(id: string, status: string) {
    await fetch(`/api/listings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    fetchItems()
  }

  async function openDetails(id: string) {
    setDetailsLoading(true)
    try {
      const r = await fetch(`/api/listings/${id}`)
      if (r.ok) {
        const d = await r.json()
        setSelectedListing(d.data || d)
        // update local items state so UI reflects changes after moderation
        fetchItems()
      } else {
        setSelectedListing(null)
      }
    } catch (e) {
      console.error('Failed to fetch listing details', e)
      setSelectedListing(null)
    } finally {
      setDetailsLoading(false)
    }
  }

  async function rejectListing(id: string) {
    await moderate(id, 'REJECTED')
    setSelectedListing(null)
  }

  async function removeListing(id: string) {
    if (!confirm('Delete listing?')) return
    await fetch(`/api/listings/${id}`, { method: 'DELETE' })
    fetchItems()
  }
}
