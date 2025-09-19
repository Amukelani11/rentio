"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import MaybeLater from '@/components/MaybeLater'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Role } from '@/lib/types'

export default function ListerOnboarding() {
  const STORAGE_KEY = 'onboarding:lister:step'
  const [step, setStep] = useState(0)
  const steps = [
    {
      img: '/assets/listhero.png',
      title: 'Earn with your stuff 💸',
      desc: 'Turn your unused items into recurring income.',
    },
    {
      img: '/assets/listlisting.png',
      title: 'List in minutes',
      desc: 'Add photos, set price & deposit — it’s quick and free.',
    },
    {
      img: '/assets/listmoneyin.png',
      title: 'You’re in control',
      desc: 'Approve or decline booking requests with one tap.',
    },
    {
      img: '/assets/listwalletwithmoney.png',
      title: 'Get paid fast',
      desc: 'Secure payouts directly to your bank.',
    },
  ]

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  // Load/save progress
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const n = parseInt(saved, 10)
      if (!Number.isNaN(n)) setStep(Math.max(0, Math.min(n, steps.length - 1)))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(step))
  }, [step])

  const router = useRouter()

  const activateRole = async () => {
    const rolesRes = await fetch('/api/auth/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: Role.INDIVIDUAL_LISTER }),
    })

    if (!rolesRes.ok) return

    try {
      await fetch('/api/onboarding/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow: 'INDIVIDUAL_LISTER', step }),
      })
      // set short-lived client cookie to avoid middleware race
      document.cookie = `onboarding_skipped=INDIVIDUAL_LISTER; path=/; max-age=60`
    } catch (e) {
      // ignore
    }

    localStorage.removeItem(STORAGE_KEY)
    router.push('/list-item')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-charcoal-600 dark:to-charcoal-700">
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="relative mx-auto mb-6 h-64 w-full max-w-lg overflow-hidden rounded-3xl bg-white/60">
            <Image src={steps[step].img} alt={steps[step].title} fill className="object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-slate-50">{steps[step].title}</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-slate-200">{steps[step].desc}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={back}>Back</Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={next}>Continue</Button>
            ) : (
              <>
                <Button onClick={activateRole}>
                  List My First Item
                </Button>
                {/* Removed Maybe Later - always proceed to dashboard */}
                <Button variant="ghost" onClick={() => { localStorage.removeItem(STORAGE_KEY); window.location.href = '/dashboard' }}>Skip</Button>
              </>
            )}
          </div>
          <div className="mt-4 text-center">
            <button className="text-sm text-gray-500 hover:underline" onClick={() => { setStep(0); localStorage.removeItem(STORAGE_KEY) }}>Start over</button>
          </div>
        </div>
      </section>
    </main>
  )
}

// Removed leftover MaybeLaterButton
