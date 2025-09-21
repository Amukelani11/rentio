import React from 'react'
import Head from 'next/head'
import { StructuredData } from '@/lib/seo'

interface SEOMetadataProps {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  openGraph?: {
    title?: string
    description?: string
    url?: string
    type?: 'website' | 'article' | 'product'
    images?: Array<{
      url: string
      width?: number
      height?: number
      alt?: string
    }>
  }
  twitter?: {
    card?: 'summary' | 'summary_large_image'
    title?: string
    description?: string
    image?: string
  }
  schemaData?: Record<string, any>[]
  noIndex?: boolean
}

export default function SEOMetadata({
  title,
  description,
  keywords,
  canonical,
  openGraph,
  twitter,
  schemaData,
  noIndex = false
}: SEOMetadataProps) {
  // Default values
  const siteName = 'Rentio'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rentio.co.za'
  const defaultTitle = title ? `${title} | ${siteName}` : 'Rentio - South Africa\'s Premier Rental Marketplace'
  const defaultDescription = description || 'Why buy when you can rent? Find everything you need nearby. Turn your unused items into income. South Africa\'s trusted peer-to-peer rental platform.'

  const defaultKeywords = [
    'rentio',
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
    'rental platform',
    'share economy',
    'south african rentals'
  ]

  const allKeywords = keywords ? [...defaultKeywords, ...keywords] : defaultKeywords

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{defaultTitle}</title>
      <meta name="description" content={defaultDescription} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      <meta name="author" content={siteName} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="googlebot" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph Tags */}
      <meta property="og:type" content={openGraph?.type || 'website'} />
      <meta property="og:title" content={openGraph?.title || defaultTitle} />
      <meta property="og:description" content={openGraph?.description || defaultDescription} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_ZA" />

      {openGraph?.url && <meta property="og:url" content={openGraph.url} />}

      {openGraph?.images && openGraph.images.map((image, index) => (
        <React.Fragment key={index}>
          <meta property="og:image" content={image.url} />
          <meta property="og:image:width" content={image.width?.toString() || '1200'} />
          <meta property="og:image:height" content={image.height?.toString() || '630'} />
          <meta property="og:image:alt" content={image.alt || siteName} />
        </React.Fragment>
      ))}

      {/* Default OG Image if none provided */}
      {!openGraph?.images && (
        <>
          <meta property="og:image" content={`${siteUrl}/og-default.jpg`} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={siteName} />
        </>
      )}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitter?.card || 'summary_large_image'} />
      <meta name="twitter:title" content={twitter?.title || defaultTitle} />
      <meta name="twitter:description" content={twitter?.description || defaultDescription} />
      <meta name="twitter:site" content="@rentio_sa" />
      <meta name="twitter:creator" content="@rentio_sa" />

      {twitter?.image ? (
        <meta name="twitter:image" content={twitter.image} />
      ) : (
        <meta name="twitter:image" content={`${siteUrl}/og-default.jpg`} />
      )}

      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#FF6B6B" />
      <meta name="msapplication-TileColor" content="#FF6B6B" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Structured Data */}
      {schemaData?.map((schema, index) => (
        <StructuredData key={index} data={schema} />
      ))}

      {/* Verification Tags */}
      <meta name="google-site-verification" content={process.env.GOOGLE_SITE_VERIFICATION || ''} />
      <meta name="p:domain_verify" content={process.env.PINTEREST_SITE_VERIFICATION || ''} />
    </Head>
  )
}