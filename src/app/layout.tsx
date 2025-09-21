import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import SiteHeader from '@/components/layout/SiteHeader'
import RatingModalWrapper from '@/components/RatingModalWrapper'
import { createMetadata, createWebSiteSchema, createOrganizationSchema, createLocalBusinessSchema } from '@/lib/seo'
import { JsonLd } from '@/components/SEO/JsonLd'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = createMetadata({
  title: 'South Africa\'s Premier Rental Marketplace',
  description: 'Why buy when you can rent? Find everything you need nearby. Turn your unused items into income. List in minutes, rent instantly. Peer-to-peer rentals made easy in South Africa.',
  keywords: [
    'rental marketplace south africa',
    'peer to peer rentals',
    'rent items',
    'equipment rental',
    'furniture rental',
    'electronics rental',
    'party supplies rental',
    'tool rental',
    'camera rental',
    'bike rental',
    'car rental',
    'rental platform',
    'share economy south africa',
    'temporary rentals',
    'short term rentals',
    'affordable rentals',
    'rent instead of buy',
    'rentals near me',
    'south african rentals',
    'za rentals',
    'johannesburg rentals',
    'cape town rentals',
    'durban rentals'
  ],
  openGraph: {
    type: 'website',
    title: 'Rentio - South Africa\'s Premier Rental Marketplace',
    description: 'Why buy when you can rent? Find everything you need nearby. Turn your unused items into income. South Africa\'s trusted rental platform.',
    url: 'https://rentio.co.za',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rentio - South Africa\'s Premier Rental Marketplace',
    description: 'Why buy when you can rent? Find everything you need nearby. Turn your unused items into income.',
  },
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-ZA" className={`${inter.className} antialiased`}>
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-GDGWS9RNBK"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-GDGWS9RNBK');
            `,
          }}
        />

        <JsonLd data={createWebSiteSchema()} />
        <JsonLd data={createOrganizationSchema()} />
        <JsonLd data={createLocalBusinessSchema()} />

        {/* Additional meta tags for performance and SEO */}
        <meta name="application-name" content="Rentio" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Rentio" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />

        {/* DNS prefetch for potential external resources */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#FF6B6B" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1a1a1a" media="(prefers-color-scheme: dark)" />
      </head>
      <body className="bg-gray-50">
        <SiteHeader />
        {children}
        <RatingModalWrapper />
      </body>
    </html>
  )
}
