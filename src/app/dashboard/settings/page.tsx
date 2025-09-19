"use client";

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/user').then(async (r) => {
      if (r.ok) { const d = await r.json(); setUser(d.user) }
      setLoading(false)
    })
  }, [])

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
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input defaultValue={user?.name || ''} placeholder="Name" />
              <Input defaultValue={user?.email || ''} disabled />
              <Input placeholder="Phone number" />
              <Button>Save</Button>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Add or edit cards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Card number" />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="MM/YY" />
                <Input placeholder="CVC" />
              </div>
              <Button>Add Card</Button>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
            <CardHeader>
              <CardTitle>Verification</CardTitle>
              <CardDescription>KYC status</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Status: {user?.kycStatus || 'UNVERIFIED'}</p>
              <Button className="mt-2" variant="outline">Start Verification</Button>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/60">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Password & 2FA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="New password" type="password" />
              <Button>Change Password</Button>
              <Button variant="outline">Enable 2FA</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
