import type { Metadata, ResolvingMetadata } from 'next'
import { siteConfig } from './site-config'

// Core SEO types
export interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  openGraph?: OpenGraphProps
  twitter?: TwitterCardProps
  schema?: Record<string, any>[]
  noIndex?: boolean
}

export interface OpenGraphProps {
  title?: string
  description?: string
  url?: string
  type?: 'website' | 'article' | 'product' | 'profile'
  images?: OpenGraphImage[]
  locale?: string
  siteName?: string
}

export interface OpenGraphImage {
  url: string
  width?: number
  height?: number
  alt?: string
  type?: string
}

export interface TwitterCardProps {
  card?: 'summary' | 'summary_large_image'
  title?: string
  description?: string
  images?: string[]
  site?: string
  creator?: string
}

// Generate comprehensive metadata
export function createMetadata({
  title,
  description,
  keywords,
  canonical,
  openGraph,
  twitter,
  schema,
  noIndex = false
}: SEOProps): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title
  const metaDescription = description || siteConfig.description

  const metadata: Metadata = {
    title: fullTitle,
    description: metaDescription,
    keywords: keywords?.join(', '),
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: siteConfig.googleVerification,
      other: {
        'pinterest': siteConfig.pinterestVerification,
      },
    },
  }

  // Add canonical URL
  if (canonical) {
    metadata.alternates = {
      canonical: canonical,
    }
  }

  // Open Graph
  if (openGraph) {
    metadata.openGraph = {
      title: openGraph.title || fullTitle,
      description: openGraph.description || metaDescription,
      url: openGraph.url || canonical,
      type: openGraph.type || 'website',
      locale: openGraph.locale || 'en_ZA',
      siteName: openGraph.siteName || siteConfig.name,
      images: openGraph.images || [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    }
  }

  // Twitter Card
  if (twitter) {
    metadata.twitter = {
      card: twitter.card || 'summary_large_image',
      title: twitter.title || fullTitle,
      description: twitter.description || metaDescription,
      images: twitter.images || [siteConfig.ogImage],
      site: twitter.site || '@rentio_sa',
      creator: twitter.creator || '@rentio_sa',
    }
  }

  return metadata
}

// Schema markup generators
export function createWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/browse?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: siteConfig.logo,
      },
    },
  }
}

export function createOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: siteConfig.logo,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteConfig.phone,
      contactType: 'Customer Service',
      availableLanguage: ['English'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ZA',
    },
    sameAs: [
      'https://facebook.com/rentio_sa',
      'https://twitter.com/rentio_sa',
      'https://instagram.com/rentio_sa',
    ],
  }
}

export function createLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ZA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '-26.2041',
      longitude: '28.0473',
    },
    openingHours: 'Mo-Fr 09:00-17:00',
    priceRange: 'R',
  }
}

export function createRentalSchema(listing: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    image: listing.images?.[0] || siteConfig.ogImage,
    brand: {
      '@type': 'Brand',
      name: 'Rentio',
    },
    offers: {
      '@type': 'Offer',
      price: listing.daily_rate,
      priceCurrency: 'ZAR',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: listing.business_name || listing.lister_name,
      },
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    review: listing.reviews?.map((review: any) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.reviewer_name,
      },
      datePublished: review.created_at,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
      },
      reviewBody: review.comment,
    })) || [],
    aggregateRating: listing.rating_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: listing.average_rating,
      reviewCount: listing.rating_count,
      bestRating: 5,
    } : undefined,
  }
}

export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function createFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// Structured data component for Next.js
export function StructuredData({ data }: { data: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Generate dynamic keywords based on content
export function generateKeywords(content: string, location?: string): string[] {
  const baseKeywords = [
    'rentio',
    'rental marketplace',
    'peer to peer rentals',
    'rent items',
    'south africa',
    'rental platform',
    'share economy',
    'rental business',
  ]

  const contentKeywords = content
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'been'].includes(word))

  const locationKeywords = location ? [
    `rentals in ${location}`,
    `${location} rentals`,
    `rent near ${location}`,
  ] : []

  return [...baseKeywords, ...contentKeywords.slice(0, 10), ...locationKeywords].slice(0, 20)
}