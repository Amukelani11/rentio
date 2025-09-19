"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import MaybeLater from '@/components/MaybeLater'
import { Role } from '@/lib/types'

export default function BusinessOnboarding() {
  const STORAGE_KEY = 'onboarding:business:step'
  const [step, setStep] = useState(0)
  const steps = [
    {
      img: '/assets/businessshelve.png',
      title: 'Welcome to Rentio for Business 👋',
      desc: 'List your inventory, manage bookings, and grow your rental business.',
      cta: 'Get Started',
    },
    {
      img: '/assets/businessshelve.png',
      title: 'Organize your rentals',
      desc: 'Track stock, availability, and bookings all in one place.',
    },
    {
      img: '/assets/businessbulkupload.png',
      title: 'Save time with bulk uploads',
      desc: 'Add multiple items or packages at once — perfect for event rental companies.',
    },
    {
      img: '/assets/businessrentalpackage.png',
      title: 'Bundle items for events',
      desc: 'Group chairs, tents, sound, and more into ready-made rental packages.',
    },
    {
      img: '/assets/businessteamaccounts.png',
      title: 'Work with your team',
      desc: 'Give staff access to manage bookings, deliveries, and returns.',
    },
    {
      img: '/assets/listshield.png',
      title: 'Build trust instantly',
      desc: 'Verified businesses stand out with badges and secure payments.',
    },
    {
      img: '/assets/rentiologo.png',
      title: 'Your business, powered by Rentio 🚀',
      desc: 'Reach new customers, earn more, and grow your rentals.',
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
      body: JSON.stringify({ role: Role.BUSINESS_LISTER }),
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

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={back}>Back</Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={next}>{steps[step].cta || 'Continue'}</Button>
            ) : (
              <>
                <Button onClick={async () => {
                  // Ensure the user has the BUSINESS_LISTER role, then mark onboarding complete and go to dashboard
                  try {
                    await fetch('/api/auth/roles', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ role: Role.BUSINESS_LISTER }),
                    })
                  } catch (e) {
                    // ignore role add errors and continue
                  }
                  try {
                    await fetch('/api/onboarding/skip', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ flow: 'BUSINESS_LISTER', step }),
                    })
                    document.cookie = `onboarding_skipped=BUSINESS_LISTER; path=/; max-age=60`
                  } catch (e) {}
                  localStorage.removeItem(STORAGE_KEY)
                  window.location.href = '/dashboard'
                }}>Set Up My Business Account</Button>
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
