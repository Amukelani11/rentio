"use client";

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageCircle, Search } from 'lucide-react'
import { Role } from '@/lib/types'

type Ticket = {
  id: string
  subject: string
  status: 'OPEN'|'PENDING'|'RESOLVED'
  requester: { name: string; email: string }
  createdAt: string
}

export default function AdminSupportPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<'ALL'|'OPEN'|'PENDING'|'RESOLVED'>('ALL')

  useEffect(() => {
    const load = async () => {
      const u = await fetch('/api/auth/user')
      if (u.ok) setUser((await u.json()).user)
      // Mock tickets for now
      setTickets([
        { id: 't1', subject: 'Payment issue', status: 'OPEN', requester: { name: 'Alice', email: 'alice@example.com'}, createdAt: new Date().toISOString() },
        { id: 't2', subject: 'Booking question', status: 'PENDING', requester: { name: 'Bob', email: 'bob@example.com'}, createdAt: new Date().toISOString() },
      ])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = tickets.filter(t => (tab === 'ALL' || t.status === tab) && (q.trim() === '' || t.subject.toLowerCase().includes(q.toLowerCase())))

  if (loading) {
    return (
      <DashboardLayout user={user} showHeader={false}>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user || !user.roles?.includes(Role.ADMIN)) {
    return (
      <DashboardLayout user={user} showHeader={false}>
        <div className="p-6">Unauthorized</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user} showHeader={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">Support</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
            <CardDescription>Search and triage customer support tickets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input className="pl-9" placeholder="Search tickets" value={q} onChange={(e)=> setQ(e.target.value)} />
              </div>
              <Tabs value={tab} onValueChange={(v)=> setTab(v as any)}>
                <TabsList>
                  <TabsTrigger value="ALL">All</TabsTrigger>
                  <TabsTrigger value="OPEN">Open</TabsTrigger>
                  <TabsTrigger value="PENDING">Pending</TabsTrigger>
                  <TabsTrigger value="RESOLVED">Resolved</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="space-y-3">
              {filtered.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-xl border p-4 bg-white/70 dark:bg-charcoal-600/60">
                  <div>
                    <div className="font-medium">{t.subject}</div>
                    <div className="text-sm text-muted-foreground">{t.requester.name} · {new Date(t.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline"><MessageCircle className="h-4 w-4 mr-1" />Open</Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="p-6 text-sm text-muted-foreground">No tickets</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

