import { useMemo } from 'react'
import Head from 'next/head'
import { JsonLd } from './JsonLd'
import { siteConfig } from '@/lib/site-config'

interface ListingSEOProps {
  listing: {
    id: string
    title: string
    description: string
    daily_rate: number
    weekly_rate?: number
    monthly_rate?: number
    category: string
    location: string
    city: string
    province: string
    images: string[]
    lister_name: string
    business_name?: string
    average_rating?: number
    rating_count?: number
    reviews?: Array<{
      id: string
      reviewer_name: string
      rating: number
      comment: string
      created_at: string
    }>
    tags?: string[]
    availability_status?: 'available' | 'rented' | 'maintenance'
    minimum_rental_period?: number
    delivery_options?: string[]
    security_deposit?: number
    created_at?: string
    updated_at?: string
  }
  baseUrl?: string
}

export default function ListingSEO({ listing, baseUrl = 'https://rentio.co.za' }: ListingSEOProps) {
  const listingUrl = `${baseUrl}/browse/${listing.id}`
  const mainImage = listing.images?.[0] || `${baseUrl}/og-default.jpg`

  // Generate keywords based on listing content
  const keywords = useMemo(() => {
    const baseKeywords = [
      `rent ${listing.title.toLowerCase()}`,
      `${listing.category} rental`,
      `${listing.city} rentals`,
      `${listing.province} rentals`,
      `${listing.category} for rent`,
      'rental marketplace south africa',
      'peer to peer rentals',
      'rent instead of buy',
      'temporary rental',
      'short term rental',
      'affordable rental',
      `rentals near ${listing.location}`,
      'south african rentals',
      'rentio',
    ]

    // Add tags as keywords
    const tagKeywords = listing.tags?.map(tag => `${tag} rental`) || []

    // Add location-specific keywords
    const locationKeywords = [
      `rent in ${listing.city}`,
      `${listing.city} ${listing.category}`,
      `${listing.province} ${listing.category}`,
      `${listing.location} rentals`,
    ]

    return [...baseKeywords, ...tagKeywords, ...locationKeywords].slice(0, 20)
  }, [listing])

  // Generate structured data
  const productSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    image: listing.images?.length ? listing.images : [mainImage],
    brand: {
      '@type': 'Brand',
      name: listing.business_name || listing.lister_name,
    },
    offers: {
      '@type': 'Offer',
      price: listing.daily_rate,
      priceCurrency: 'ZAR',
      availability: listing.availability_status === 'available'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': listing.business_name ? 'Organization' : 'Person',
        name: listing.business_name || listing.lister_name,
      },
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      availabilityStarts: listing.availability_status === 'available' ? new Date().toISOString() : undefined,
      itemCondition: 'https://schema.org/NewCondition',
    },
    review: listing.reviews?.map(review => ({
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
    aggregateRating: listing.rating_count && listing.rating_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: listing.average_rating,
      reviewCount: listing.rating_count,
      bestRating: 5,
    } : undefined,
  }), [listing, mainImage])

  const rentalSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'RentalCarReservation',
    pickupLocation: {
      '@type': 'Place',
      name: listing.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: listing.city,
        addressRegion: listing.province,
        addressCountry: 'ZA',
      },
    },
  }), [listing])

  const breadcrumbSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Browse',
        item: `${baseUrl}/browse`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: listing.category,
        item: `${baseUrl}/browse?category=${encodeURIComponent(listing.category.toLowerCase())}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: listing.location,
        item: `${baseUrl}/browse?location=${encodeURIComponent(listing.location)}`,
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: listing.title,
        item: listingUrl,
      },
    ],
  }), [listing, baseUrl, listingUrl])

  // Generate meta description
  const metaDescription = useMemo(() => {
    const priceText = `R${listing.daily_rate}/day`
    const locationText = `in ${listing.location}, ${listing.city}`
    const ratingText = listing.rating_count && listing.rating_count > 0
      ? `⭐ ${listing.average_rating} (${listing.rating_count} reviews)`
      : ''

    return `Rent ${listing.title} ${locationText} - ${priceText}. ${listing.description.substring(0, 100)}... ${ratingText} Available for short term rentals on Rentio, South Africa's trusted rental marketplace.`
  }, [listing])

  // Generate Open Graph data
  const openGraphData = useMemo(() => ({
    type: 'product' as const,
    title: `${listing.title} - Rent in ${listing.location} | Rentio`,
    description: metaDescription,
    url: listingUrl,
    images: [
      {
        url: mainImage,
        width: 1200,
        height: 630,
        alt: listing.title,
      },
      ...(listing.images?.slice(1, 4).map((img, index) => ({
        url: img,
        width: 1200,
        height: 630,
        alt: `${listing.title} - Image ${index + 2}`,
      })) || []),
    ],
  }), [listing, mainImage, metaDescription, listingUrl])

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{`${listing.title} - Rent in ${listing.location} | Rentio`}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={keywords.join(', ')} />
      <link rel="canonical" href={listingUrl} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={openGraphData.type} />
      <meta property="og:title" content={openGraphData.title} />
      <meta property="og:description" content={openGraphData.description} />
      <meta property="og:url" content={openGraphData.url} />
      <meta property="og:site_name" content="Rentio" />
      <meta property="og:locale" content="en_ZA" />
      <meta property="og:price:amount" content={listing.daily_rate.toString()} />
      <meta property="og:price:currency" content="ZAR" />

      {openGraphData.images.map((image, index) => (
        <React.Fragment key={index}>
          <meta property="og:image" content={image.url} />
          <meta property="og:image:width" content={image.width.toString()} />
          <meta property="og:image:height" content={image.height.toString()} />
          <meta property="og:image:alt" content={image.alt} />
        </React.Fragment>
      ))}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={openGraphData.title} />
      <meta name="twitter:description" content={openGraphData.description} />
      <meta name="twitter:image" content={mainImage} />
      <meta name="twitter:site" content="@rentio_sa" />
      <meta name="twitter:creator" content="@rentio_sa" />

      {/* Additional SEO Tags */}
      <meta name="author" content={listing.business_name || listing.lister_name} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />

      {/* Structured Data */}
      <JsonLd data={productSchema} />
      <JsonLd data={rentalSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Location-specific meta tags */}
      <meta name="geo.region" content="ZA-WC" />
      <meta name="geo.placename" content={listing.location} />
      <meta name="geo.position" content="-26.2041;28.0473" />
      <meta name="ICBM" content="-26.2041, 28.0473" />

      {/* Additional product tags */}
      <meta name="product:price:amount" content={listing.daily_rate.toString()} />
      <meta name="product:price:currency" content="ZAR" />
      <meta name="product:availability" content={listing.availability_status === 'available' ? 'in stock' : 'out of stock'} />

      {/* Date tags */}
      <meta name="article:published_time" content={listing.created_at} />
      <meta name="article:modified_time" content={listing.updated_at || listing.created_at} />
      <meta name="og:updated_time" content={listing.updated_at || listing.created_at} />

      {/* Rating tags */}
      {listing.rating_count && listing.rating_count > 0 && (
        <>
          <meta name="rating" content={listing.average_rating?.toString() || '0'} />
          <meta name="rating_count" content={listing.rating_count.toString()} />
          <meta name="rating_scale" content="5" />
        </>
      )}

      {/* Category and tags */}
      <meta name="category" content={listing.category} />
      {listing.tags?.map((tag, index) => (
        <meta key={index} name="article:tag" content={tag} />
      ))}

      {/* Performance hints */}
      <link rel="preconnect" href="https://images.unsplash.com" />
      {listing.images?.map((img, index) => (
        <link key={index} rel="preload" href={img} as="image" />
      ))}
    </Head>
  )
}