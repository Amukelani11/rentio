import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import SiteHeader from '@/components/layout/SiteHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rentio - Peer-to-Peer & Business Rentals Marketplace',
  description: 'Why buy? Rent it nearby. Turn your garage into an ATM. List in minutes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-ZA">
      <body className={`${inter.className} antialiased`}> 
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}
