"use client";

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus,
  Package,
  BarChart,
  Image as ImageIcon,
  Calendar,
  Star,
  Shield,
} from 'lucide-react'
import { Role } from '@/lib/types'

export default function ListItemHub() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<any[]>([])
  const [images, setImages] = useState<File[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [u, l] = await Promise.all([
          fetch('/api/auth/user'),
          fetch('/api/listings')
        ])
        if (u.ok) {
          const d = await u.json()
          setUser(d.user)
        }
        if (l.ok) {
          const d = await l.json()
          setListings(d.data.items || [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const isLister = !!user?.roles?.includes(Role.INDIVIDUAL_LISTER) || !!user?.roles?.includes(Role.BUSINESS_LISTER)

  const handleBecomeLister = async () => {
    try {
      await fetch('/api/auth/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: Role.INDIVIDUAL_LISTER })
      })
      router.push('/dashboard/listings/new')
    } catch {}
  }

  const onFiles = useCallback((files: FileList | null) => {
    if (!files) return
    const arr = Array.from(files).slice(0, 12)
    setImages(prev => [...prev, ...arr])
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto mb-3 h-10 w-10 text-coral-600" />
          <h1 className="text-xl font-semibold mb-2">Sign in to list items</h1>
          <Button asChild>
            <Link href="/auth/signin">Sign in</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-charcoal-600 dark:to-charcoal-700">
      <section className="container py-10 md:py-14">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Listings</h1>
              <p className="text-gray-600 dark:text-slate-200">Create listings, manage photos, and track performance.</p>
            </div>
            {isLister ? (
              <div className="flex gap-2">
                <Button onClick={() => router.push('/dashboard/listings/new')}>
                  <Plus className="mr-2 h-4 w-4" /> New Listing
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard/listings')}>Manage Listings</Button>
              </div>
            ) : (
              <Button onClick={handleBecomeLister}>
                Become a Lister
              </Button>
            )}
          </div>

          {/* For non-listers show steps */}
          {!isLister && (
            <Card>
              <CardHeader>
                <CardTitle>Get started listing</CardTitle>
                <CardDescription>It only takes a minute.</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm text-gray-700 list-decimal pl-6">
                  <li>Add the “Individual Lister” role to your account</li>
                  <li>Create your first listing with photos and pricing</li>
                  <li>Publish and start receiving booking requests</li>
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Simple media dropzone (local preview only) */}
          {isLister && (
            <Card className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
              <CardHeader>
                <CardTitle>Quick Photo Upload</CardTitle>
                <CardDescription>Drop photos to attach later in the create form.</CardDescription>
              </CardHeader>
              <CardContent>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-8 text-center hover:bg-slate-50 dark:border-charcoal-500 dark:bg-charcoal-600/40">
                  <ImageIcon className="h-10 w-10 text-gray-500" />
                  <div>
                    <p className="font-medium">Drag and drop images</p>
                    <p className="text-xs text-gray-500">Up to 12 images • JPG/PNG</p>
                  </div>
                  <Input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
                </label>
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((f, i) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded-lg border">
                        <img src={URL.createObjectURL(f)} alt={f.name} className="h-full w-full object-cover" />
                        <Badge className="absolute bottom-1 right-1 bg-black/60">{Math.round(f.size/1024)} KB</Badge>
                      </div>
                    ))}
                  </div>
                )}
                {images.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => router.push('/dashboard/listings/new')}>Continue to create</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metrics */}
          {isLister && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{listings.length}</div>
                  <p className="text-xs text-muted-foreground">Published and draft</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{listings.reduce((s,l)=>s+(l.bookingsCount||0),0)}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{listings.reduce((s,l)=>s+(l.views||0),0)}</div>
                  <p className="text-xs text-muted-foreground">Last 30 days (mock)</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                  <Star className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {listings.length ? (listings.reduce((s,l)=>s+(l.averageRating||0),0)/listings.length).toFixed(1) : '0.0'}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all listings</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Manage area */}
          {isLister && (
            <Card>
              <CardHeader>
                <CardTitle>Manage Your Listings</CardTitle>
                <CardDescription>Quick access to common tasks.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/dashboard/listings/new" className="rounded-xl border p-4 hover:bg-slate-50 dark:hover:bg-charcoal-600/40">
                    <div className="mb-2 font-semibold">Create listing</div>
                    <p className="text-sm text-muted-foreground">Add photos, pricing and availability</p>
                  </Link>
                  <Link href="/dashboard/listings" className="rounded-xl border p-4 hover:bg-slate-50 dark:hover:bg-charcoal-600/40">
                    <div className="mb-2 font-semibold">Manage listings</div>
                    <p className="text-sm text-muted-foreground">Edit, publish or delete</p>
                  </Link>
                  <Link href="/dashboard/bookings" className="rounded-xl border p-4 hover:bg-slate-50 dark:hover:bg-charcoal-600/40">
                    <div className="mb-2 font-semibold">View bookings</div>
                    <p className="text-sm text-muted-foreground">Requests and upcoming rentals</p>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  )
}
