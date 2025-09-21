"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShieldCheck, BadgeCheck, Coins, CheckCircle2, Sparkles } from 'lucide-react'

export default function ListersClient() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-charcoal-600 dark:to-charcoal-700">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-[-2rem] h-[22rem] bg-gradient-to-b from-coral-100/50 to-transparent blur-2xl dark:from-coral-400/10" />
      </div>

      {/* Header is shared via SiteHeader in root layout */}

      {/* Hero */}
      <section className="container pt-16 md:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-gray-900 md:text-6xl dark:text-slate-50">
              Turn your stuff into income with Rentio
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-gray-600 md:text-xl dark:text-slate-200">
              List your first item today and start earning from tools, dresses, tents, and more.
            </p>
            <div className="mt-6">
              <Button size="lg" asChild>
                <Link href="/dashboard/listings/new">List an Item for Free</Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto aspect-[4/3] w-full min-h-[360px] overflow-hidden rounded-3xl bg-white/10 p-2 dark:bg-white/5">
            <div className="pointer-events-none absolute -left-10 -top-10 h-[480px] w-[480px] rounded-full bg-[radial-gradient(closest-side,rgba(229,50,55,0.22),rgba(229,50,55,0))] blur-2xl" />
            <Image src="/assets/listhero.png" alt="List on Rentio" fill className="object-contain" />
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="container py-16">
        <h2 className="text-center text-2xl font-semibold text-gray-900 md:text-3xl dark:text-slate-50">Why list on Rentio</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Earn Recurring Income', img: '/assets/listwalletwithmoney.png' },
            { title: 'You Control Pricing', img: '/assets/listpricetag.png' },
            { title: 'Safe & Secure', img: '/assets/listshield.png' },
            { title: 'Flexible Rentals', img: '/assets/listbox.png' },
          ].map(({ title, img }) => (
            <div
              key={title}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-charcoal-600 dark:bg-charcoal-600"
            >
              <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-xl">
                <Image src={img} alt={title} width={80} height={80} className="h-20 w-20 object-contain" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-slate-50">{title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-slate-50/60 py-16 dark:border-charcoal-600 dark:bg-charcoal-700/30">
        <div className="container">
          <h2 className="text-center text-2xl font-semibold text-gray-900 md:text-3xl dark:text-slate-50">How it works</h2>
          <div className="relative mx-auto mt-10 max-w-5xl">
            <div className="pointer-events-none absolute left-[8%] right-[8%] top-24 hidden h-0.5 bg-slate-200 md:block dark:bg-charcoal-600" />
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { title: 'List your item', desc: 'Add photos, price, and availability.', img: '/assets/listlisting.png' },
                { title: 'Get bookings & payments', desc: 'Approve bookings and get paid securely.', img: '/assets/listmoneyin.png' },
                { title: 'Handover & earn', desc: 'Meet, hand over, and earn from your gear.', img: '/assets/listhandover.png' },
              ].map(({ title, desc, img }) => (
                <div
                  key={title}
                  className="relative rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-charcoal-600 dark:bg-charcoal-600"
                >
                  <div className="mx-auto -mt-2 mb-4 h-24 w-24 overflow-hidden rounded-2xl">
                    <Image src={img} alt={title} width={96} height={96} className="h-24 w-24 object-contain" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50">{title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-slate-200">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What can you list */}
      <section className="container py-16">
        <h2 className="text-center text-2xl font-semibold text-gray-900 md:text-3xl dark:text-slate-50">What can you list?</h2>
        <p className="mt-2 text-center text-gray-600 dark:text-slate-200">Popular categories that perform well on Rentio</p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {[
            { name: 'Tools', img: '/assets/rdrill.png' },
            { name: 'Dresses', img: '/assets/rdress.png' },
            { name: 'Tents', img: '/assets/rtent.png' },
            { name: 'Trailers', img: '/assets/rtrailer.png' },
            { name: 'Cameras', img: '/assets/rcamera.png' },
          ].map(({ name, img }) => (
            <div key={name} className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-charcoal-600 dark:bg-charcoal-600">
              <Image src={img} alt={name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/0" />
              <div className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-gray-900 shadow-sm backdrop-blur">
                {name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing & Tips */}
      <section className="container py-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-charcoal-600 dark:bg-charcoal-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50">Pricing and fees</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-slate-200">
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-coral-600" />You set your own price and availability</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-coral-600" />Secure payments with deposits held in escrow</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-coral-600" />Platform fee transparently shown at checkout</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-charcoal-600 dark:bg-charcoal-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50">Tips to get more bookings</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-slate-200">
              <li className="flex items-start gap-2"><Sparkles className="mt-0.5 h-4 w-4 text-coral-600" />Upload clear photos from multiple angles</li>
              <li className="flex items-start gap-2"><Sparkles className="mt-0.5 h-4 w-4 text-coral-600" />Write a concise, helpful description</li>
              <li className="flex items-start gap-2"><Sparkles className="mt-0.5 h-4 w-4 text-coral-600" />Offer a fair price and flexible pickup</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonial + Trust */}
      <section className="container py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-3xl bg-white/10 p-2 dark:bg-white/5">
            <Image src="/assets/listhappy.png" alt="Happy lister" fill className="object-contain" />
          </div>
          <div>
            <blockquote className="text-xl font-medium text-gray-900 dark:text-slate-50">
              “I listed my camera and got my first booking in 2 days — now it pays for itself.”
            </blockquote>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[{ icon: ShieldCheck, title: 'Secure Payments' }, { icon: BadgeCheck, title: 'KYC Verified' }, { icon: Coins, title: 'Deposit Protection' }].map(
                ({ icon: Icon, title }) => (
                  <div
                    key={title}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-charcoal-600 dark:bg-charcoal-600"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral-100 text-coral-600 dark:bg-coral-400/10">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-slate-50">{title}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="container pb-12">
        <h2 className="text-center text-2xl font-semibold text-gray-900 md:text-3xl dark:text-slate-50">FAQs</h2>
        <div className="mx-auto mt-6 grid max-w-4xl gap-4">
          {[
            { q: 'How do payouts work?', a: 'Funds are released after handover and any deposit holds, directly to your linked account.' },
            { q: 'Is it safe to list expensive items?', a: 'All users are KYC-verified. Deposits and reviews help protect listers and renters.' },
            { q: 'What can I list?', a: 'Tools, dresses, cameras, tents, trailers and more — if it’s legal and safe, you can likely list it.' },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-charcoal-600 dark:bg-charcoal-600">
              <div className="font-medium text-gray-900 dark:text-slate-50">{q}</div>
              <div className="mt-1 text-sm text-gray-600 dark:text-slate-200">{a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container pb-24 pt-4">
        <div className="grid items-center gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-charcoal-600 dark:bg-charcoal-600 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-50">
              Your items could be earning you money right now.
            </h3>
            <p className="mt-2 text-gray-600 dark:text-slate-200">It’s free to list and only takes a few minutes.</p>
            <div className="mt-4">
              <Button size="lg" asChild>
                <Link href="/dashboard/listings/new">Start Listing Today — It's Free</Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl bg-white/10 p-2 dark:bg-white/5">
            <Image src="/assets/listcash.png" alt="Start listing" fill className="object-contain" />
          </div>
        </div>
      </section>

      {/* Sticky bottom CTA */}
      <div className={`fixed inset-x-0 bottom-0 z-30 transition-all ${scrolled ? 'translate-y-0' : 'translate-y-24'}`}>
        <div className="container pb-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 rounded-2xl border border-white/40 bg-white/60 px-4 py-3 text-gray-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-50">
            <span className="text-sm md:text-base">Ready to earn? List your first item today.</span>
            <Button asChild>
              <Link href="/dashboard/listings/new">List an Item</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
