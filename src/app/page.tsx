"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
// use public/ string paths instead of static imports to avoid module resolution issues in Netlify
import {
  Search,
  MapPin,
  Wrench,
  PartyPopper,
  Shirt,
  Monitor,
  Truck,
  Dumbbell,
  ShieldCheck,
  BadgeCheck,
  Coins,
  Star,
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [scrolled, setScrolled] = useState(false)

  // Handle booking confirmation redirect
  useEffect(() => {
    const bookingId = searchParams.get('bookingId')
    if (bookingId) {
      router.replace(`/booking-confirmation?bookingId=${bookingId}`)
    }
  }, [searchParams, router])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const categories = [
    { name: 'Tools', icon: Wrench },
    { name: 'Party & Events', icon: PartyPopper },
    { name: 'Dresses', icon: Shirt },
    { name: 'Electronics', icon: Monitor },
    { name: 'Trailers', icon: Truck },
    { name: 'Sports', icon: Dumbbell },
  ]

  const benefits = [
    { title: 'Secure Payments', desc: 'Escrow protection for every transaction', icon: ShieldCheck },
    { title: 'KYC Verified', desc: 'Identity checks for safer rentals', icon: BadgeCheck },
    { title: 'Deposit Protection', desc: 'Refundable deposits for peace of mind', icon: Coins },
    { title: 'Trusted Reviews', desc: 'Community ratings build confidence', icon: Star },
  ]

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-charcoal-600 dark:to-charcoal-700">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-[-2rem] h-[28rem] bg-gradient-to-b from-coral-100/50 to-transparent blur-2xl dark:from-coral-400/10" />
        <div className="absolute inset-0 bg-[radial-gradient(40rem_20rem_at_50%_-2rem,rgba(255,90,95,0.06),transparent)]" />
      </div>

      {/* Header is now shared via SiteHeader in root layout */}

      {/* Floating glass search on scroll */}
      <div className={`fixed inset-x-0 z-30 hidden transition-all duration-300 md:block ${scrolled ? 'top-3 opacity-100 translate-y-0' : 'top-0 opacity-0 -translate-y-2 pointer-events-none'}`}>
        <div className="container">
          <div className="rounded-2xl border border-white/60 bg-white/40 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="relative flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-lg bg-white/70 px-3 py-2 dark:bg-white/10">
                <Search className="h-4 w-4 text-gray-500 sm:h-5 sm:w-5" />
                <input type="text" placeholder="What do you need?" className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-500 outline-none dark:text-slate-100" />
              </div>
              <div className="hidden h-8 w-px bg-white/60 md:block dark:bg-white/10" />
              <div className="flex flex-1 items-center gap-2 rounded-lg bg-white/70 px-3 py-2 dark:bg-white/10">
                <MapPin className="h-4 w-4 text-gray-500 sm:h-5 sm:w-5" />
                <input type="text" placeholder="Where?" className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-500 outline-none dark:text-slate-100" />
              </div>
              <Button size="lg" className="whitespace-nowrap">Search</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="container pt-8 md:pt-16 lg:pt-24">
        <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-10">
          <div className="text-center lg:text-left">
            <h1 className="text-balance text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl dark:text-slate-50">
              Why buy? <span className="text-coral-600">Rent it nearby</span>
            </h1>
            <p className="mt-3 max-w-xl text-base text-gray-600 sm:text-lg md:mt-4 md:text-xl dark:text-slate-200 lg:max-w-2xl">
              Find anything you need from neighbors and local businesses. Save money, reduce waste, and build community.
            </p>

            {/* Search Bar */}
            <div className="mt-4 md:mt-6">
              <div className="relative flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm backdrop-blur-sm dark:border-charcoal-600 dark:bg-charcoal-600/70 sm:flex-row sm:gap-0">
                <div className="flex flex-1 items-center gap-2 rounded-lg bg-slate-50 px-3 py-3 dark:bg-charcoal-600">
                  <Search className="h-4 w-4 text-gray-500 sm:h-5 sm:w-5" />
                  <input
                    type="text"
                    placeholder="What do you need?"
                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-500 outline-none sm:text-base dark:text-slate-100"
                  />
                </div>
                <div className="hidden h-8 w-px bg-slate-200 sm:block dark:bg-charcoal-500" />
                <div className="flex flex-1 items-center gap-2 rounded-lg bg-slate-50 px-3 py-3 dark:bg-charcoal-600">
                  <MapPin className="h-4 w-4 text-gray-500 sm:h-5 sm:w-5" />
                  <input
                    type="text"
                    placeholder="Where?"
                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-500 outline-none sm:text-base dark:text-slate-100"
                  />
                </div>
                <Button size="lg" className="mt-2 whitespace-nowrap sm:mt-0">Search</Button>
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-6 lg:justify-start">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/auth/signup">Start renting</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                <Link href="/dashboard/listings/new">List an item</Link>
              </Button>
            </div>
          </div>

          {/* Hero Visual */}
            <div className="relative mx-auto aspect-[4/3] w-full min-h-[380px] sm:min-h-[440px] md:min-h-[520px] overflow-hidden rounded-3xl">
            {/* Soft coral background shape */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(229,50,55,0.22),rgba(229,50,55,0.0))] blur-2xl" />
              <img src="/assets/rhero.png" alt="People renting items" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-8 md:py-14">
        <h2 className="text-center text-xl font-semibold text-gray-900 sm:text-2xl md:text-3xl dark:text-slate-50">Popular categories</h2>
        <p className="mt-1 text-center text-sm text-gray-600 sm:mt-2 dark:text-slate-200">Explore what people are renting right now</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 md:gap-4">
          {[
            { name: 'Tools', img: '/assets/rdrill.png' },
            { name: 'Tents', img: '/assets/rtent.png' },
            { name: 'Dresses', img: '/assets/rdress.png' },
            { name: 'Trailers', img: '/assets/rtrailer.png' },
            { name: 'Cameras', img: '/assets/rcamera.png' },
            { name: 'Electronics', img: '/assets/rcamera.png' },
          ].map(({ name, img }) => (
            <Link
              key={name}
              href={`/browse?category=${encodeURIComponent(name.toLowerCase())}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-charcoal-600 dark:bg-charcoal-600 sm:rounded-2xl"
            >
              <img src={img} alt={name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/0" />
              <div className="absolute bottom-2 left-2 rounded-md bg-white/90 px-1.5 py-0.5 text-xs font-medium text-gray-900 shadow-sm backdrop-blur sm:bottom-3 sm:left-3 sm:px-2 sm:py-1 sm:text-sm">
                {name}
              </div>
            </Link>
          ))}
        </div>

        {/* Mid‑page CTA */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-white p-1 shadow-sm dark:border-charcoal-600 dark:from-charcoal-600 dark:via-charcoal-600 dark:to-charcoal-600 sm:mt-16 sm:rounded-3xl">
          <div className="relative grid items-center gap-4 rounded-2xl bg-[radial-gradient(60rem_20rem_at_10%_-4rem,rgba(229,50,55,0.08),transparent)] px-4 py-6 sm:gap-6 sm:px-6 sm:py-10 md:grid-cols-2 sm:rounded-3xl">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl md:text-3xl dark:text-slate-50">Earn with your stuff</h3>
              <p className="mt-1 text-sm text-gray-600 sm:mt-2 dark:text-slate-200">List your first item today and start making extra income.</p>
              <div className="mt-3 sm:mt-4"><Button size="lg" asChild><Link href="/dashboard/listings/new">List an item</Link></Button></div>
            </div>
            <div className="relative mx-auto aspect-[4/3] w-full max-w-xs overflow-hidden rounded-xl sm:max-w-md sm:rounded-2xl">
              <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,rgba(229,50,55,0.18),rgba(229,50,55,0))] blur-xl sm:h-64 sm:w-64" />
              <img src="/assets/rcamera.png" alt="List your items" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-slate-50/60 py-8 sm:py-12 md:py-16 dark:border-charcoal-600 dark:bg-charcoal-700/30">
        <div className="container">
          <h2 className="text-center text-xl font-semibold text-gray-900 sm:text-2xl md:text-3xl dark:text-slate-50">How it works</h2>
          <div className="relative mx-auto mt-6 max-w-5xl sm:mt-10">
            {/* Connector line */}
            <div className="pointer-events-none absolute left-[10%] right-[10%] top-16 hidden h-0.5 bg-slate-200 sm:top-20 md:block dark:bg-charcoal-600" />
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
                {[
                { img: '/assets/rfind.png', title: 'Search & find', desc: 'Browse thousands of items near you.' },
                { img: '/assets/rpay.png', title: 'Book & pay', desc: 'Secure checkout with deposits and protection.' },
                { img: '/assets/rget%20and%20return.png', title: 'Enjoy & return', desc: "Use it, then return when you’re done." },
              ].map(({ img, title, desc }) => (
                <div key={title} className="relative rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm sm:rounded-2xl sm:p-6 dark:border-charcoal-600 dark:bg-charcoal-600">
                  <div className="mx-auto -mt-1 mb-3 h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-white sm:-mt-2 sm:mb-4 sm:h-24 sm:w-24 sm:rounded-2xl dark:border-charcoal-600">
                  <img src={img} alt={title} width={96} height={96} className="h-20 w-20 object-cover sm:h-24 sm:w-24" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 sm:text-lg dark:text-slate-50">{title}</h3>
                  <p className="mt-1 text-xs text-gray-600 sm:mt-2 sm:text-sm dark:text-slate-200">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container py-8 sm:py-12 md:py-16">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6 md:p-8 dark:border-charcoal-600 dark:bg-charcoal-600">
          <h2 className="text-center text-xl font-semibold text-gray-900 sm:text-2xl md:text-3xl dark:text-slate-50">Safe. Simple. Reliable.</h2>
          <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ title, desc, icon: Icon }) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm sm:rounded-2xl sm:p-6 dark:border-charcoal-600 dark:bg-charcoal-600">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-coral-100 text-coral-600 sm:mb-3 sm:h-12 sm:w-12 dark:bg-coral-400/10">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 sm:text-base dark:text-slate-50">{title}</h3>
                <p className="mt-1 text-xs text-gray-600 sm:text-sm dark:text-slate-200">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-slate-50/60 py-8 sm:py-12 md:py-14 dark:bg-charcoal-700/30">
        <div className="container">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
            <div className="relative -mb-1 h-10 w-10 overflow-hidden rounded-lg sm:h-12 sm:w-12 sm:rounded-xl">
              <img src="/assets/envelope.svg" alt="Newsletter" width={48} height={48} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-slate-50">Join our newsletter</h3>
            <p className="text-xs text-gray-600 sm:text-sm dark:text-slate-200">Get product updates, launch news, and rental tips.</p>
            <form className="mt-2 flex w-full max-w-xl flex-col gap-2 sm:flex-row sm:gap-0">
              <input type="email" placeholder="you@example.com" className="input flex-1 rounded-lg sm:rounded-none sm:rounded-l-lg" />
              <Button type="submit" className="sm:rounded-none sm:rounded-r-lg">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container py-8 sm:py-12">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="md:col-span-2 lg:col-span-1">
              <h3 className="text-lg font-bold sm:text-xl">Rentio</h3>
              <p className="mt-1 text-sm text-gray-400 sm:mt-2">Peer‑to‑peer and business rentals marketplace for South Africa.</p>
              <div className="mt-3 flex items-center gap-3 text-gray-400 sm:mt-4">
                <a href="#" aria-label="Instagram" className="hover:text-white transition-colors">IG</a>
                <a href="#" aria-label="TikTok" className="hover:text-white transition-colors">TT</a>
                <a href="#" aria-label="LinkedIn" className="hover:text-white transition-colors">IN</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold sm:text-base">For renters</h4>
              <ul className="mt-2 space-y-1.5 text-sm text-gray-400 sm:mt-3 sm:space-y-2">
                <li><Link href="/browse" className="hover:text-white transition-colors">Browse items</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
                <li><Link href="/safety" className="hover:text-white transition-colors">Safety tips</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold sm:text-base">For listers</h4>
              <ul className="mt-2 space-y-1.5 text-sm text-gray-400 sm:mt-3 sm:space-y-2">
                <li><Link href="/dashboard/listings/new" className="hover:text-white transition-colors">List an item</Link></li>
                <li><Link href="/business" className="hover:text-white transition-colors">Business accounts</Link></li>
                <li><Link href="/fees" className="hover:text-white transition-colors">Fees & pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold sm:text-base">Legal</h4>
              <ul className="mt-2 space-y-1.5 text-sm text-gray-400 sm:mt-3 sm:space-y-2">
                <li><Link href="/rental-policy" className="hover:text-white transition-colors">Rental Policy</Link></li>
                <li><Link href="/renter-guarantee" className="hover:text-white transition-colors">Renter Guarantee</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold sm:text-base">Company</h4>
              <ul className="mt-2 space-y-1.5 text-sm text-gray-400 sm:mt-3 sm:space-y-2">
                <li><Link href="/about" className="hover:text-white transition-colors">About us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 border-t border-white/10 pt-6 text-center text-sm text-gray-400 sm:mt-8 sm:pt-8">
            <p>&copy; {new Date().getFullYear()} Rentio. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Sticky bottom CTA */}
      <div className={`fixed inset-x-0 bottom-0 z-30 transition-all ${scrolled ? 'translate-y-0' : 'translate-y-24'}`}>
        <div className="container pb-3 sm:pb-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 rounded-xl border border-white/40 bg-white/60 px-3 py-2.5 text-gray-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:rounded-2xl sm:px-4 sm:py-3 dark:border-white/10 dark:bg-white/5 dark:text-slate-50">
            <span className="text-xs sm:text-sm md:text-base">Got something to rent? List it in minutes.</span>
            <Button asChild size="sm" className="sm:size-default">
              <Link href="/dashboard/listings/new">List an item</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
