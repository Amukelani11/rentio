"use client";

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DollarSign, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { Role } from '@/lib/types'

type Tx = { id: string; type: 'CREDIT'|'DEBIT'|'PAYOUT'|'TOPUP'; amount: number; note: string; date: string }

export default function WalletPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [topup, setTopup] = useState('')
  const [withdraw, setWithdraw] = useState('')
  const [txs, setTxs] = useState<Tx[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [u, p] = await Promise.all([
          fetch('/api/auth/user'),
          fetch('/api/profile')
        ])
        if (u.ok) setUser((await u.json()).user)
        if (p.ok) setProfile((await p.json()).data)
      } finally {
        setLoading(false)
      }
    }
    load()
    // seed mock transactions
    setTxs([
      { id: 't1', type: 'TOPUP', amount: 300, note: 'Card top-up', date: new Date().toISOString() },
      { id: 't2', type: 'PAYOUT', amount: -1200, note: 'Withdrawal to bank', date: new Date().toISOString() },
      { id: 't3', type: 'CREDIT', amount: 450, note: 'Booking earnings', date: new Date().toISOString() },
    ])
  }, [])

  const credit = Number(profile?.wallet_balance ?? 0)
  const isLister = Boolean(user?.roles?.includes(Role.INDIVIDUAL_LISTER) || user?.roles?.includes(Role.BUSINESS_LISTER))
  const availableEarnings = 3200 // placeholder; wire to payouts when backend is ready

  if (loading) {
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">Wallet</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5"/>In‑App Credit</CardTitle>
              <CardDescription>Use credit to pay deposits or rentals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-extrabold">R{credit.toLocaleString()}</div>
              <div className="flex gap-2 max-w-sm">
                <Input type="number" min={0} placeholder="Amount (ZAR)" value={topup} onChange={(e)=> setTopup(e.target.value)} />
                <Button onClick={() => { setTxs(prev => [{ id: Math.random().toString(), type: 'TOPUP', amount: Number(topup||0), note: 'Top-up', date: new Date().toISOString() }, ...prev ]); setTopup('') }}>Add Funds</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ArrowUpFromLine className="h-5 w-5"/>Withdraw Earnings</CardTitle>
              <CardDescription>Transfer available earnings to your bank</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLister ? (
                <>
                  <div className="text-3xl font-extrabold">R{availableEarnings.toLocaleString()}</div>
                  <div className="flex gap-2 max-w-sm">
                    <Input type="number" min={0} placeholder="Amount (ZAR)" value={withdraw} onChange={(e)=> setWithdraw(e.target.value)} />
                    <Button onClick={() => { if (!withdraw) return; alert('Withdrawal requested'); setWithdraw('') }}>Request</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Payouts are processed within 1–2 business days.</p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Start listing items to earn. <a className="text-coral-600 underline" href="/onboarding/lister">Become a lister</a>.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Your recent wallet activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {txs.map(t => (
                <div key={t.id} className="flex items-center justify-between rounded-xl border p-3">
                  <div className="flex items-center gap-3">
                    {t.type === 'TOPUP' ? <ArrowDownToLine className="h-4 w-4 text-coral-600"/> : <ArrowUpFromLine className="h-4 w-4 text-gray-500"/>}
                    <div>
                      <div className="font-medium">{t.note}</div>
                      <div className="text-xs text-muted-foreground">{new Date(t.date).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className={"font-semibold " + (t.amount >= 0 ? 'text-emerald-700' : 'text-red-600')}> {t.amount >= 0 ? '+' : ''}R{Math.abs(t.amount).toLocaleString()}</div>
                </div>
              ))}
              {txs.length === 0 && (
                <div className="p-6 text-sm text-muted-foreground">No transactions yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

