"use client";

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PaymentsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/user').then(async (r) => {
      if (r.ok) { const d = await r.json(); setUser(d.user) }
      setLoading(false)
    })
  }, [])

  const transactions = [
    { id: 't1', item: 'Cordless Drill', amount: 'R350', deposit: 'R500', date: 'Sep 15', status: 'PAID' },
    { id: 't2', item: 'Camping Tent 4P', amount: 'R420', deposit: 'R600', date: 'Sep 20', status: 'PAID' },
  ]
  const deposits = [
    { id: 'd1', item: 'Cordless Drill', amount: 'R500', date: 'Sep 15', status: 'PENDING' },
    { id: 'd2', item: 'Camping Tent 4P', amount: 'R600', date: 'Sep 20', status: 'HELD' },
  ]
  const payouts: any[] = []

  const Row = ({ a, b, c, d, status }: any) => (
    <div className="grid grid-cols-4 gap-4 items-center py-3 border-b">
      <div className="font-medium">{a}</div>
      <div>{b}</div>
      <div className="text-sm text-muted-foreground">{c}</div>
      <div className="flex items-center justify-end gap-2">
        {d}
        {status && <Badge variant={status === 'PAID' || status === 'RELEASED' ? 'default' : 'secondary'}>{status}</Badge>}
      </div>
    </div>
  )

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
        <h1 className="text-2xl font-extrabold tracking-tight">Payments & Deposits</h1>
        <Tabs defaultValue="transactions">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions">
            <Card className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Item, amount, deposit, and date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-gray-500 py-2">
                  <div>Item</div><div>Amount</div><div>Date</div><div className="text-right">Status</div>
                </div>
                {transactions.map(t => (
                  <Row key={t.id} a={t.item} b={t.amount} c={t.date} d={t.deposit} status={t.status} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="deposits">
            <Card className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
              <CardHeader>
                <CardTitle>Deposits</CardTitle>
                <CardDescription>Held and refunded deposits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-gray-500 py-2">
                  <div>Item</div><div>Deposit</div><div>Date</div><div className="text-right">Status</div>
                </div>
                {deposits.map(d => (
                  <Row key={d.id} a={d.item} b={d.amount} c={d.date} d={''} status={d.status} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payouts">
            <Card className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
              <CardHeader>
                <CardTitle>Payouts</CardTitle>
                <CardDescription>Refunds and releases</CardDescription>
              </CardHeader>
              <CardContent>
                {payouts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No payouts yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
