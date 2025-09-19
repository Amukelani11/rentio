"use client";

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/user').then(async (r) => {
      if (r.ok) {
        const d = await r.json();
        setUser(d.user)
      }
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <DashboardLayout user={user} showHeader={false}>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user || !user.isAdmin) {
    return (
      <DashboardLayout user={user} showHeader={false}>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Unauthorized</CardTitle>
              <CardDescription>You don't have permission to access the admin panel.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Please sign in with an admin account.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user} showHeader={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">Admin Panel</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage user roles and status</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <a href="/admin/users">Open</a>
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
            <CardHeader>
              <CardTitle>KYC Reviews</CardTitle>
              <CardDescription>Verify user submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <a href="/admin/kyc">Open</a>
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
            <CardHeader>
              <CardTitle>Listings</CardTitle>
              <CardDescription>Moderate reported listings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <a href="/admin/listings">Open</a>
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
            <CardHeader>
              <CardTitle>Withdrawals</CardTitle>
              <CardDescription>Process payout requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <a href="/admin/withdrawals">Open</a>
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
            <CardHeader>
              <CardTitle>Support</CardTitle>
              <CardDescription>Handle support tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <a href="/admin/support">Open</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
