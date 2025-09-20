"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Package, Calendar, MessageCircle, DollarSign, Settings, Shield, Users, Star, Building, Users as TeamIcon, PackagePlus, AlertTriangle, LogOut } from 'lucide-react'
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
      if (!(user.roles.includes(UserRole.INDIVIDUAL_LISTER) || user.roles.includes(UserRole.BUSINESS_LISTER))) {
        baseItems.push({ href: '/dashboard/listings', label: 'List Item', icon: Package })
      }
      baseItems.push({ href: '/dashboard/wallet', label: 'Wallet', icon: DollarSign })
    }

    // Individual Lister links
    if (user.roles && user.roles.includes(UserRole.INDIVIDUAL_LISTER)) {
      baseItems.push(
        { href: '/dashboard/listings', label: 'Listings', icon: Package },
        { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
        { href: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
        { href: '/dashboard/wallet', label: 'Wallet', icon: DollarSign }
      )
    }

    // Business Lister links
    if (user.roles && user.roles.includes(UserRole.BUSINESS_LISTER)) {
      baseItems.push(
        { href: '/dashboard/business', label: 'Business Profile', icon: Building },
        { href: '/dashboard/inventory', label: 'Inventory', icon: PackagePlus },
        { href: '/dashboard/listings', label: 'Listings', icon: Package },
        { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
        { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
        { href: '/dashboard/pricing', label: 'Pricing', icon: DollarSign },
        { href: '/dashboard/alerts', label: 'Alerts', icon: AlertTriangle },
        { href: '/dashboard/team', label: 'Team', icon: TeamIcon },
        { href: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
        { href: '/dashboard/wallet', label: 'Wallet', icon: DollarSign }
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-charcoal-800">
      {showHeader && (
        <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md dark:bg-charcoal-700/60">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
            <Link href="/dashboard" className="font-semibold">Rentio</Link>
            <div className="flex items-center gap-3">
            </div>
          </div>
        </header>
      )}

      <div className="flex w-full gap-0 px-0 md:px-4">
        <aside className="hidden md:block md:sticky md:top-16 w-64 shrink-0 border-r bg-white/90 backdrop-blur-sm dark:bg-charcoal-700/60">
          <div className="m-3 max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl p-2">
            <nav className="flex flex-col">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <NavItem key={item.href} href={item.href} icon={item.icon} active={pathname === item.href || pathname?.startsWith(item.href)}>
                    {item.label}
                  </NavItem>
                ))}
              </div>
              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <NavItem href="/dashboard/settings" icon={Settings} active={pathname?.startsWith('/dashboard/settings')}>Settings</NavItem>
                <NavItem href="/dashboard/kyc" icon={Shield} active={pathname?.startsWith('/dashboard/kyc')}>Verification</NavItem>
                <SignOutItem />
              </div>
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
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
