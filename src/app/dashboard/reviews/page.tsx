"use client";

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < value ? 'text-coral-600 fill-coral-600' : 'text-gray-300'}`} />
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/user').then(async (r) => {
      if (r.ok) { const d = await r.json(); setUser(d.user) }
      setLoading(false)
    })
  }, [])

  const given = [
    { id: '1', item: 'Cordless Drill', rating: 5, text: 'Great condition, smooth handover.' },
  ]
  const received: any[] = []

  if (loading) {
    return (
      <DashboardLayout user={user} showHeader={false}>
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user} showHeader={false}>
      <div className="space-y-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Reviews</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
            <CardHeader>
              <CardTitle>Given</CardTitle>
              <CardDescription>Reviews you’ve written</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {given.map(r => (
                <div key={r.id} className="flex gap-4">
                  <div className="h-16 w-16 rounded-xl bg-gray-100" />
                  <div>
                    <p className="font-medium">{r.item}</p>
                    <Stars value={r.rating} />
                    <p className="text-sm text-muted-foreground mt-1">{r.text}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
            <CardHeader>
              <CardTitle>Received</CardTitle>
              <CardDescription>Feedback from listers</CardDescription>
            </CardHeader>
            <CardContent>
              {received.length === 0 && (
                <p className="text-sm text-muted-foreground">No reviews received yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
