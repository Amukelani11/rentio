"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Package, Calendar, MessageCircle, DollarSign, Settings, Shield, Users, Star, Building, Users as TeamIcon, PackagePlus, AlertTriangle, LogOut, Menu, X } from 'lucide-react'
import { Role as UserRole } from '@/lib/types'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Props = {
  children: React.ReactNode
  user?: any
  showHeader?: boolean
}

export default function DashboardLayout({ children, user, showHeader = true }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [showBusinessPrompt, setShowBusinessPrompt] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    const checkBusinessProfile = async () => {
      try {
        if (!user) return
        const isBusiness = Array.isArray(user.roles) && user.roles.includes(UserRole.BUSINESS_LISTER)
        const onBusinessPage = pathname?.startsWith('/dashboard/business')
        if (!isBusiness || onBusinessPage) return

        const res = await fetch('/api/business/profile', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        const hasBusiness = Boolean(json?.business?.id)
        if (!hasBusiness) {
          setShowBusinessPrompt(true)
        }
      } catch {}
    }
    checkBusinessProfile()
  }, [user, pathname])

  useEffect(() => {
    if (!showBusinessPrompt) return
    setCountdown(3)
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id)
          router.push('/dashboard/business')
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [showBusinessPrompt, router])

  const handleSignOut = async () => {
    try {
      const supabase = createClientComponentClient()
      await supabase.auth.signOut()
      router.push('/auth/signin')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getNavItems = () => {
    const baseItems: { href: string; label: string; icon: any }[] = [
      { href: '/dashboard', label: 'Overview', icon: Home },
      { href: '/browse', label: 'Browse', icon: Calendar },
    ]

    if (!user) return baseItems

    // Customer-specific links
    if (user.roles && user.roles.includes(UserRole.CUSTOMER)) {
      baseItems.push(
        { href: '/dashboard/rentals', label: 'My Rentals', icon: Package },
        { href: '/dashboard/messages', label: 'Messages', icon: MessageCircle }
      )
      // If not a lister yet, show quick entry to create a listing
      const isLister = user.roles.includes(UserRole.INDIVIDUAL_LISTER) || user.roles.includes(UserRole.BUSINESS_LISTER)
      if (!isLister) {
        baseItems.push({ href: '/dashboard/listings', label: 'List Item', icon: Package })
        // Wallet visible only for non-listers
        baseItems.push({ href: '/dashboard/wallet', label: 'Wallet', icon: DollarSign })
      }
    }

    // Individual Lister links (hide Listings/Wallet in sidebar)
    if (user.roles && user.roles.includes(UserRole.INDIVIDUAL_LISTER)) {
      baseItems.push(
        { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar }
      )
    }

    // Business Lister links (hide Listings/Wallet in sidebar)
    if (user.roles && user.roles.includes(UserRole.BUSINESS_LISTER)) {
      baseItems.push(
        { href: '/dashboard/business', label: 'Business Profile', icon: Building },
        { href: '/dashboard/inventory', label: 'Inventory', icon: PackagePlus },
        { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
        { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
        { href: '/dashboard/pricing', label: 'Pricing', icon: DollarSign },
        { href: '/dashboard/alerts', label: 'Alerts', icon: AlertTriangle },
        { href: '/dashboard/team', label: 'Team', icon: TeamIcon },
        { href: '/dashboard/earnings', label: 'Earnings', icon: DollarSign }
      )
    }

    // Admin
    if (user.roles && user.roles.includes(UserRole.ADMIN)) {
      baseItems.push({ href: '/admin', label: 'Admin', icon: Users })
    }

    baseItems.push({ href: '/dashboard/reviews', label: 'Reviews', icon: Star })

    return baseItems
  }

  const navItems = getNavItems()

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  const navContent = (
    <nav className="flex h-full flex-col">
      <div className="space-y-1 overflow-y-auto pb-6">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            active={pathname === item.href || pathname?.startsWith(item.href)}
          >
            {item.label}
          </NavItem>
        ))}
      </div>
      <div className="mt-auto border-t border-gray-200 pt-4 dark:border-gray-700">
        <NavItem href="/dashboard/settings" icon={Settings} active={pathname?.startsWith('/dashboard/settings')}>
          Settings
        </NavItem>
        <NavItem href="/dashboard/kyc" icon={Shield} active={pathname?.startsWith('/dashboard/kyc')}>
          Verification
        </NavItem>
        <SignOutItem />
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-charcoal-800">
      {showHeader && (
        <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md dark:bg-charcoal-700/60">
          <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Toggle navigation"
                className="inline-flex items-center justify-center rounded-lg border border-transparent p-2 text-charcoal-500 transition hover:bg-slate-100 hover:text-charcoal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 md:hidden"
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link href="/dashboard" className="inline-flex items-center" aria-label="Rentio dashboard">
                <Image src="/assets/rentiologo.png" alt="Rentio" width={96} height={28} priority className="h-7 w-auto" />
              </Link>
            </div>
            <div className="flex items-center gap-3" />
          </div>
        </header>
      )}

      <div className="flex w-full gap-0 px-0 md:px-4">
        <aside className="hidden w-64 shrink-0 border-r bg-white/90 backdrop-blur-sm dark:bg-charcoal-700/60 md:sticky md:top-16 md:block">
          <div className="m-3 max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl p-2">
            {navContent}
          </div>
        </aside>

        <main className="w-full flex-1 p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between md:hidden">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Open navigation"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white/95 p-2 text-charcoal-500 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 dark:border-charcoal-600 dark:bg-charcoal-700/90 dark:text-slate-100"
                  onClick={() => setMobileNavOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <Link href="/dashboard" className="inline-flex items-center" aria-label="Rentio dashboard">
                  <Image src="/assets/rentiologo.png" alt="Rentio" width={88} height={26} className="h-6 w-auto" />
                </Link>
              </div>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-charcoal-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 dark:border-charcoal-600 dark:text-slate-100"
              >
                Back to top
              </button>
            </div>
          {children}
        </main>
      </div>

      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/40 transition-opacity md:hidden',
          mobileNavOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        aria-hidden={!mobileNavOpen}
        onClick={() => setMobileNavOpen(false)}
      >
        <div
          className={cn(
            'absolute left-0 top-0 h-full w-[85%] max-w-xs overflow-hidden border-r border-slate-200 bg-white/95 p-4 text-charcoal-700 shadow-xl transition-transform dark:border-charcoal-600 dark:bg-charcoal-700/95',
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <Link href="/dashboard" className="text-lg font-semibold text-charcoal-900 dark:text-slate-50">Dashboard</Link>
            <button
              type="button"
              aria-label="Close navigation"
              className="rounded-lg p-2 text-charcoal-500 transition hover:bg-slate-100 hover:text-charcoal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500"
              onClick={() => setMobileNavOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex h-[calc(100%-2.75rem)] flex-col overflow-y-auto">
            {navContent}
          </div>
        </div>
      </div>

      {showBusinessPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-charcoal-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-50">Complete your business profile</h2>
            <p className="mt-2 text-gray-600 dark:text-slate-200">
              You have the Business role but no business profile yet. We'll take you there to finish setup.
            </p>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-slate-300">
              <span>Redirecting in {countdown}s…</span>
              <button
                onClick={() => router.push('/dashboard/business')}
                className="inline-flex items-center rounded-lg bg-coral-600 px-3 py-2 font-medium text-white hover:bg-coral-700"
              >
                Go now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NavItem({ href, icon: Icon, children, active }: { href: string; icon: React.ComponentType<any>; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'mb-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-coral-50 text-coral-800 font-semibold dark:bg-coral-600/15 dark:text-coral-200'
          : 'text-gray-900 hover:bg-slate-100 hover:text-gray-900 dark:text-slate-100 dark:hover:bg-charcoal-600/60'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  )
}

function SignOutItem() {
  const handleSignOut = async () => {
    try {
      const supabase = createClientComponentClient()
      await supabase.auth.signOut()
      window.location.href = '/signin'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      className={cn(
        'mb-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors w-full text-left',
        'text-gray-900 hover:bg-slate-100 hover:text-gray-900 dark:text-slate-100 dark:hover:bg-charcoal-600/60'
      )}
    >
      <LogOut className="h-4 w-4" />
      <span>Sign Out</span>
    </button>
  )
}
