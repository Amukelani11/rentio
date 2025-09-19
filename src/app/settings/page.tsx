"use client"

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [pickup, setPickup] = useState('')

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(j => { if (j.success) { setProfile(j.data); setPickup(j.data?.pickup_location || '') } })
  }, [])

  const save = async () => {
    await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pickupLocation: pickup }) })
    alert('Profile updated')
  }

  return (
    <DashboardLayout user={null} showHeader={false}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <div className="mb-4">
          <Label>Default Pickup Location</Label>
          <Input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Your default pickup location" />
          <div className="mt-2 text-sm text-muted-foreground">This will be used as the default pickup location when creating new listings.</div>
        </div>
        <Button onClick={save}>Save</Button>
      </div>
    </DashboardLayout>
  )
}




