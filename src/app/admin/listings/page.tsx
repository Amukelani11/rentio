"use client";

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionNote, setRejectionNote] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)

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
                          <Button size="sm" variant="outline" onClick={() => openRejectDialog(selectedListing.id)}>Reject</Button>
                          <Button size="sm" variant="outline" onClick={() => setSelectedListing(null)}>Close</Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {detailsLoading ? (
                        <div className="p-6 text-center">Loading...</div>
                      ) : (
                        <div className="space-y-6">
                          {/* Images */}
                          {selectedListing.images && selectedListing.images.length > 0 && (
                            <div>
                              <h3 className="font-semibold mb-2">Images</h3>
                              <div className="grid grid-cols-2 gap-2">
                                {selectedListing.images.slice(0, 4).map((image: string, index: number) => (
                                  <img
                                    key={index}
                                    src={image}
                                    alt={`Listing image ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg border"
                                  />
                                ))}
                              </div>
                              {selectedListing.images.length > 4 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  +{selectedListing.images.length - 4} more images
                                </p>
                              )}
                            </div>
                          )}

                          {/* Owner Information */}
                          <div>
                            <h3 className="font-semibold mb-2">Posted by</h3>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              {selectedListing.owner_user ? (
                                <div>
                                  <div className="font-medium">{selectedListing.owner_user.name}</div>
                                  <div className="text-sm text-gray-600">{selectedListing.owner_user.email}</div>
                                  <Badge variant="outline" className="mt-1">Individual Lister</Badge>
                                </div>
                              ) : selectedListing.owner_business ? (
                                <div>
                                  <div className="font-medium">{selectedListing.owner_business.name}</div>
                                  <div className="text-sm text-gray-600">{selectedListing.owner_business.contact_email}</div>
                                  <div className="text-sm text-gray-500">{selectedListing.owner_business.contact_name}</div>
                                  <Badge variant="outline" className="mt-1">Business Lister</Badge>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">Owner information not available</div>
                              )}
                            </div>
                          </div>

                          {/* Basic Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-semibold">Title</h3>
                              <div className="text-sm">{selectedListing.title}</div>
                            </div>
                            <div>
                              <h3 className="font-semibold">Category</h3>
                              <div className="text-sm">{selectedListing.category?.name || 'N/A'}</div>
                            </div>
                            <div>
                              <h3 className="font-semibold">Status</h3>
                              <Badge variant={selectedListing.status === 'ACTIVE' ? 'default' : selectedListing.status === 'PENDING' ? 'secondary' : 'destructive'}>
                                {selectedListing.status}
                              </Badge>
                            </div>
                            <div>
                              <h3 className="font-semibold">Location</h3>
                              <div className="text-sm">{selectedListing.location}</div>
                            </div>
                          </div>

                          {/* Pricing */}
                          <div>
                            <h3 className="font-semibold mb-2">Pricing</h3>
                            <div className="bg-blue-50 p-3 rounded-lg space-y-2">
                              <div className="flex justify-between">
                                <span>Daily Rate:</span>
                                <span className="font-medium">R{parseFloat(selectedListing.price_daily || 0).toLocaleString()}</span>
                              </div>
                              {selectedListing.price_weekly && (
                                <div className="flex justify-between">
                                  <span>Weekly Rate:</span>
                                  <span className="font-medium">R{parseFloat(selectedListing.price_weekly).toLocaleString()}</span>
                                </div>
                              )}
                              {selectedListing.supports_monthly && (
                                <div className="flex justify-between">
                                  <span>Monthly Rentals:</span>
                                  <span className="font-medium">
                                    Supported {selectedListing.min_months && `(Min: ${selectedListing.min_months} months)`}
                                  </span>
                                </div>
                              )}
                              {selectedListing.weekend_multiplier > 1 && (
                                <div className="flex justify-between">
                                  <span>Weekend Multiplier:</span>
                                  <span className="font-medium">{selectedListing.weekend_multiplier}x</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Deposit */}
                          <div>
                            <h3 className="font-semibold mb-2">Security Deposit</h3>
                            <div className="bg-yellow-50 p-3 rounded-lg">
                              <div className="flex justify-between">
                                <span>Type:</span>
                                <span className="font-medium">{selectedListing.deposit_type}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Amount:</span>
                                <span className="font-medium">
                                  {selectedListing.deposit_type === 'PERCENTAGE' 
                                    ? `${selectedListing.deposit_value}%` 
                                    : `R${parseFloat(selectedListing.deposit_value || 0).toLocaleString()}`
                                  }
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Rental Terms */}
                          <div>
                            <h3 className="font-semibold mb-2">Rental Terms</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Minimum Days:</span>
                                <div className="font-medium">{selectedListing.min_days || 1}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Maximum Days:</span>
                                <div className="font-medium">{selectedListing.max_days || 'No limit'}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Instant Book:</span>
                                <div className="font-medium">{selectedListing.instant_book ? 'Yes' : 'No'}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">KYC Required:</span>
                                <div className="font-medium">{selectedListing.requires_kyc ? 'Yes' : 'No'}</div>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <h3 className="font-semibold mb-2">Description</h3>
                            <div className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                              {selectedListing.description}
                            </div>
                          </div>

                          {/* Tags */}
                          {selectedListing.tags && selectedListing.tags.length > 0 && (
                            <div>
                              <h3 className="font-semibold mb-2">Tags</h3>
                              <div className="flex flex-wrap gap-1">
                                {selectedListing.tags.map((tag: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Timestamps */}
                          <div className="text-xs text-gray-500 pt-2 border-t">
                            <div>Created: {new Date(selectedListing.created_at).toLocaleString()}</div>
                            <div>Updated: {new Date(selectedListing.updated_at).toLocaleString()}</div>
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

      {/* Rejection Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Listing</h3>
            <p className="text-gray-600 mb-4">
              Please provide feedback to help the user improve their listing:
            </p>
            <Textarea
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder="Explain what needs to be updated (e.g., clearer photos, better description, pricing issues...)"
              rows={4}
              className="mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false)
                  setRejectingId(null)
                  setRejectionNote('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmReject}
                disabled={!rejectionNote.trim()}
              >
                Reject Listing
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )

  async function moderate(id: string, status: string, note?: string) {
    await fetch(`/api/listings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, note }) })
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

  function openRejectDialog(id: string) {
    setRejectingId(id)
    setRejectionNote('')
    setShowRejectDialog(true)
  }

  async function confirmReject() {
    if (rejectingId) {
      await moderate(rejectingId, 'REJECTED', rejectionNote)
      setShowRejectDialog(false)
      setRejectingId(null)
      setRejectionNote('')
      setSelectedListing(null)
    }
  }

  async function removeListing(id: string) {
    if (!confirm('Delete listing?')) return
    await fetch(`/api/listings/${id}`, { method: 'DELETE' })
    fetchItems()
  }
}
