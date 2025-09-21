import React from 'react'
import Head from 'next/head'
import { JsonLd } from './JsonLd'
import { siteConfig } from '@/lib/site-config'

interface PageSEOProps {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  openGraph?: {
    type?: 'website' | 'article'
    title?: string
    description?: string
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
  schema?: Record<string, any>[]
  noIndex?: boolean
  breadcrumbs?: Array<{
    name: string
    url: string
  }>
  faq?: Array<{
    question: string
    answer: string
  }>
  publishDate?: string
  modifiedDate?: string
  author?: string
}

export default function PageSEO({
  title,
  description,
  keywords = [],
  canonical,
  openGraph,
  twitter,
  schema = [],
  noIndex = false,
  breadcrumbs,
  faq,
  publishDate,
  modifiedDate,
  author
}: PageSEOProps) {
  const siteUrl = siteConfig.url
  const fullTitle = title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`
  const defaultDescription = description || siteConfig.description

  // Generate default keywords
  const defaultKeywords = [
    'rentio',
    'rental marketplace south africa',
    'peer to peer rentals',
    'rent items',
    'south african rentals',
    ...siteConfig.defaultKeywords.slice(0, 10)
  ]

  const allKeywords = [...defaultKeywords, ...keywords].slice(0, 20)

  // Generate structured data
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: defaultDescription,
    url: canonical || siteUrl,
    inLanguage: 'en-ZA',
    isPartOf: {
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteUrl,
    },
    about: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteUrl,
    },
    datePublished: publishDate,
    dateModified: modifiedDate || publishDate,
    author: author ? {
      '@type': 'Organization',
      name: author,
    } : {
      '@type': 'Organization',
      name: siteConfig.name,
    },
  }

  // Generate breadcrumb schema if provided
  const breadcrumbSchema = breadcrumbs ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  } : null

  // Generate FAQ schema if provided
  const faqSchema = faq && faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  } : null

  // Combine all schema data
  const allSchemaData = [
    webPageSchema,
    ...(breadcrumbSchema ? [breadcrumbSchema] : []),
    ...(faqSchema ? [faqSchema] : []),
    ...schema,
  ]

  // Default Open Graph data
  const defaultOpenGraph = {
    type: 'website' as const,
    title: fullTitle,
    description: defaultDescription,
    url: canonical || siteUrl,
    images: openGraph?.images || [
      {
        url: `${siteUrl}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
    ...openGraph,
  }

  // Default Twitter data
  const defaultTwitter = {
    card: 'summary_large_image' as const,
    title: fullTitle,
    description: defaultDescription,
    image: twitter?.image || `${siteUrl}${siteConfig.ogImage}`,
    site: '@rentio_sa',
    creator: '@rentio_sa',
    ...twitter,
  }

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={defaultDescription} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      <meta name="author" content={author || siteConfig.name} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="googlebot" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph Tags */}
      <meta property="og:type" content={defaultOpenGraph.type} />
      <meta property="og:title" content={defaultOpenGraph.title} />
      <meta property="og:description" content={defaultOpenGraph.description} />
      <meta property="og:url" content={defaultOpenGraph.url} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:locale" content="en_ZA" />

      {defaultOpenGraph.images.map((image, index) => (
        <React.Fragment key={index}>
          <meta property="og:image" content={image.url} />
          <meta property="og:image:width" content={image.width?.toString() || '1200'} />
          <meta property="og:image:height" content={image.height?.toString() || '630'} />
          <meta property="og:image:alt" content={image.alt || title} />
        </React.Fragment>
      ))}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={defaultTwitter.card} />
      <meta name="twitter:title" content={defaultTwitter.title} />
      <meta name="twitter:description" content={defaultTwitter.description} />
      <meta name="twitter:image" content={defaultTwitter.image} />
      <meta name="twitter:site" content={defaultTwitter.site} />
      <meta name="twitter:creator" content={defaultTwitter.creator} />

      {/* Date Tags */}
      {publishDate && (
        <>
          <meta name="article:published_time" content={publishDate} />
          <meta property="article:published_time" content={publishDate} />
        </>
      )}

      {modifiedDate && (
        <>
          <meta name="article:modified_time" content={modifiedDate} />
          <meta property="og:updated_time" content={modifiedDate} />
        </>
      )}

      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#FF6B6B" />
      <meta name="msapplication-TileColor" content="#FF6B6B" />
      <meta name="application-name" content={siteConfig.name} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteConfig.name} />

      {/* Structured Data */}
      {allSchemaData.map((schemaData, index) => (
        <JsonLd key={index} data={schemaData} />
      ))}

      {/* Verification Tags */}
      <meta name="google-site-verification" content={process.env.GOOGLE_SITE_VERIFICATION || ''} />
      <meta name="p:domain_verify" content={process.env.PINTEREST_SITE_VERIFICATION || ''} />

      {/* Performance optimization */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />

      {/* Language and region */}
      <meta httpEquiv="content-language" content="en-ZA" />
      <meta name="geo.region" content="ZA" />
      <meta name="geo.country" content="South Africa" />
    </Head>
  )
}