"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import MaybeLater from '@/components/MaybeLater'
import { Button } from '@/components/ui/button'
import { Role } from '@/lib/types'

export default function RenterOnboarding() {
  const STORAGE_KEY = 'onboarding:renter:step'
  const [step, setStep] = useState(0)
  const steps = [
    {
      img: '/assets/rhero.png',
      title: 'Welcome to Rentio 👋',
      desc: 'Find and book anything nearby — from tools to tents.',
    },
    {
      img: '/assets/rfind.png',
      title: 'Find what you need',
      desc: 'Browse categories and search items near you.',
    },
    {
      img: '/assets/rpay.png',
      title: 'Book with confidence',
      desc: 'Secure payments, deposits, and verified listers.',
    },
    {
      img: '/assets/rget%20and%20return.png',
      title: 'Easy handovers',
      desc: 'Pick up, use, and return hassle-free.',
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

  const activateRole = async () => {
    await fetch('/api/auth/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: Role.CUSTOMER }),
    })
    localStorage.removeItem(STORAGE_KEY)
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

          <div className="mt-8 flex items-center justify-center gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={back}>Back</Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={next}>Get Started</Button>
            ) : (
              <>
                <Button onClick={async () => {
                  // Ensure the user has the CUSTOMER role, then mark onboarding complete and go to dashboard
                  try {
                    await fetch('/api/auth/roles', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ role: Role.CUSTOMER }),
                    })
                  } catch (e) {
                    // ignore role add errors and continue
                  }
                  try {
                    await fetch('/api/onboarding/skip', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ flow: 'RENTER', step }),
                    })
                    // short-lived cookie so middleware permits immediate dashboard access
                    document.cookie = `onboarding_skipped=RENTER; path=/; max-age=60`
                  } catch (e) {
                    // ignore
                  }
                  localStorage.removeItem(STORAGE_KEY)
                  // Force page reload to refresh session
                  window.location.href = '/dashboard'
                }}>Get Started</Button>
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
