"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import RentioLogo from '../../../public/assets/rentiologo.png'

export default function SiteHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const [user, setUser] = useState<any | null>(null)
  useEffect(() => {
    let mounted = true
    fetch('/api/auth/user')
      .then(res => res.json())
      .then((data) => {
        if (mounted && data && data.user) setUser(data.user)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  // Hide header on dashboard routes
  if (pathname?.startsWith('/dashboard')) return null

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />
      <header className="sticky top-0 z-30 bg-transparent">
        <div className={`container transition-all ${scrolled ? 'py-2' : 'py-3'}`}>
          <div className="flex items-center justify-between rounded-full border border-white/60 bg-white/30 px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-8">
              <Link href="/" className="block">
                <span className="sr-only">Rentio</span>
                <Image
                  src={RentioLogo}
                  alt="Rentio"
                  height={scrolled ? 24 : 32}
                  className="w-auto object-contain"
                  priority
                />
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm">
                <Link href="/browse" className="text-gray-800 hover:text-coral-600 dark:text-slate-100">Browse</Link>
                <Link href="/listers" className="text-gray-800 hover:text-coral-600 dark:text-slate-100">Listers</Link>
                <Link href="/how-it-works" className="text-gray-800 hover:text-coral-600 dark:text-slate-100">How it works</Link>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <nav className="hidden sm:flex items-center gap-4">
                  <Link href="/dashboard" className="text-gray-800 hover:text-coral-600 dark:text-slate-100">Dashboard</Link>
                  <Link href="/dashboard/listings" className="text-white bg-coral-600 hover:bg-coral-700 px-3 py-1 rounded-md">List Item</Link>
                </nav>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/auth/signin">Sign in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/signup">Get started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
