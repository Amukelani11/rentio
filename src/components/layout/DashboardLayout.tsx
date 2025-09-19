"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Package, Calendar, MessageCircle, DollarSign, Settings, Shield, Users, Star } from 'lucide-react'
import { Role as UserRole } from '@/lib/types'

type Props = {
  children: React.ReactNode
  user?: any
  showHeader?: boolean
}

export default function DashboardLayout({ children, user, showHeader = true }: Props) {
  const pathname = usePathname()

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

    // Lister links
    if (user.roles && (user.roles.includes(UserRole.INDIVIDUAL_LISTER) || user.roles.includes(UserRole.BUSINESS_LISTER))) {
      baseItems.push(
        { href: '/dashboard/listings', label: 'Listings', icon: Package },
        { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
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
              <div className="mt-auto pt-4">
                <NavItem href="/dashboard/settings" icon={Settings} active={pathname?.startsWith('/dashboard/settings')}>Settings</NavItem>
                <NavItem href="/dashboard/kyc" icon={Shield} active={pathname?.startsWith('/dashboard/kyc')}>Verification</NavItem>
              </div>
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
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
