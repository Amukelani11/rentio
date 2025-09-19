"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function OnboardingSelector() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-charcoal-600 dark:to-charcoal-700">
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-slate-50">Welcome to Rentio 👋</h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-slate-200">Tell us what you’d like to do today.</p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
          <Link href="/onboarding/renter" className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-charcoal-600 dark:bg-charcoal-600">
            <div className="relative h-40 w-full overflow-hidden rounded-xl bg-white/60">
              <Image src="/assets/rfind.png" alt="Find and book" fill className="object-contain" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-slate-50">I want to Rent Items</h3>
            <p className="text-sm text-gray-600 dark:text-slate-200">Find & book things nearby</p>
            <div className="mt-4"><Button>Get Started</Button></div>
          </Link>

          <Link href="/onboarding/lister" className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-charcoal-600 dark:bg-charcoal-600">
            <div className="relative h-40 w-full overflow-hidden rounded-xl bg-white/60">
              <Image src="/assets/rcamera.png" alt="Earn with your stuff" fill className="object-contain" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-slate-50">I want to List Items</h3>
            <p className="text-sm text-gray-600 dark:text-slate-200">Earn with my stuff</p>
            <div className="mt-4"><Button>Start</Button></div>
          </Link>

          <Link href="/onboarding/business" className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-charcoal-600 dark:bg-charcoal-600">
            <div className="relative h-40 w-full overflow-hidden rounded-xl bg-white/60">
              <Image src="/assets/businessshelve.png" alt="Business onboarding" fill className="object-contain" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-slate-50">I run a Rental Business</h3>
            <p className="text-sm text-gray-600 dark:text-slate-200">Manage inventory, team, and packages</p>
            <div className="mt-4"><Button>Set Up Business</Button></div>
          </Link>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-gray-500">Not sure? You can switch anytime in your profile settings.</p>
      </section>
    </main>
  )
}
