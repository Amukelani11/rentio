"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function MaybeLater({ flow, step }: { flow: string; step?: number }) {
  const router = useRouter()

  async function handleMaybeLater() {
    try {
      const res = await fetch('/api/onboarding/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow, step }),
      })

      if (res.ok) {
        // set client-side cookie immediately to avoid middleware re-check race
        const maxAge = 60
        document.cookie = `onboarding_skipped=${encodeURIComponent(flow)}; path=/; max-age=${maxAge}`
      }
    } catch (_) {
      // ignore
    }

    // fallback navigation
    router.push('/dashboard')
  }

  return (
    <Button variant="ghost" onClick={handleMaybeLater}>
      Maybe Later
    </Button>
  )
}


