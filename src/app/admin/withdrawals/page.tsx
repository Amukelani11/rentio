"use client";

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Search, CheckCircle, XCircle, DollarSign } from 'lucide-react'
import { Role } from '@/lib/types'

type Withdrawal = {
  id: string
  user: { id: string; name: string; email: string }
  amount: number
  status: 'PENDING'|'PAID'|'REJECTED'
  createdAt: string
}

export default function AdminWithdrawalsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Withdrawal[]>([])
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<'ALL'|'PENDING'|'PAID'|'REJECTED'>('ALL')

  useEffect(() => {
    const load = async () => {
      const u = await fetch('/api/auth/user')
      if (u.ok) setUser((await u.json()).user)
      // Mock data for now; replace with API /api/admin/withdrawals when available
      setItems([
        { id: 'w1', user: { id: 'u1', name: 'Alice', email: 'alice@example.com'}, amount: 1250, status: 'PENDING', createdAt: new Date().toISOString() },
        { id: 'w2', user: { id: 'u2', name: 'Bob', email: 'bob@example.com'}, amount: 980, status: 'PAID', createdAt: new Date().toISOString() },
      ])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = items.filter((w) =>
    (tab === 'ALL' || w.status === tab) &&
    (q.trim() === '' || w.user.name.toLowerCase().includes(q.toLowerCase()) || w.user.email.toLowerCase().includes(q.toLowerCase()))
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
          <h1 className="text-2xl font-extrabold tracking-tight">Withdrawals</h1>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input className="pl-9" placeholder="Search user" value={q} onChange={(e)=> setQ(e.target.value)} />
              </div>
              <Tabs value={tab} onValueChange={(v)=> setTab(v as any)}>
                <TabsList>
                  <TabsTrigger value="ALL">All</TabsTrigger>
                  <TabsTrigger value="PENDING">Pending</TabsTrigger>
                  <TabsTrigger value="PAID">Paid</TabsTrigger>
                  <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-3">
              {filtered.map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-xl border p-4 bg-white/70 dark:bg-charcoal-600/60">
                  <div>
                    <div className="font-medium">{w.user.name} <span className="text-sm text-muted-foreground">({w.user.email})</span></div>
                    <div className="text-sm text-muted-foreground">Requested {new Date(w.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-bold">R{w.amount}</div>
                    <Badge>{w.status}</Badge>
                    {w.status === 'PENDING' && (
                      <>
                        <Button size="sm" onClick={()=> mark(w.id, 'PAID')}><DollarSign className="h-4 w-4 mr-1" />Mark Paid</Button>
                        <Button size="sm" variant="outline" onClick={()=> mark(w.id, 'REJECTED')}><XCircle className="h-4 w-4 mr-1" />Reject</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="p-6 text-sm text-muted-foreground">No withdrawals</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )

  function mark(id: string, status: Withdrawal['status']) {
    setItems(prev => prev.map(w => w.id === id ? { ...w, status } : w))
  }
}

