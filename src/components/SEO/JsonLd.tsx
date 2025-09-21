'use client'

import React from 'react'

interface JsonLdProps {
  data: Record<string, any>
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Pre-built schema components
export function WebSiteSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Rentio',
    description: 'South Africa\'s Premier Rental Marketplace',
    url: 'https://rentio.co.za',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://rentio.co.za/browse?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Rentio',
      logo: {
        '@type': 'ImageObject',
        url: 'https://rentio.co.za/logo.png',
      },
    },
  }

  return <JsonLd data={data} />
}

export function OrganizationSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Rentio',
    description: 'South Africa\'s Premier Rental Marketplace',
    url: 'https://rentio.co.za',
    logo: 'https://rentio.co.za/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['English'],
      email: 'support@rentio.co.za',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ZA',
    },
    sameAs: [
      'https://facebook.com/rentio_sa',
      'https://twitter.com/rentio_sa',
      'https://instagram.com/rentio_sa',
      'https://linkedin.com/company/rentio',
    ],
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: 'Rentio Team',
    },
  }

  return <JsonLd data={data} />
}

export function LocalBusinessSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Rentio',
    description: 'Peer-to-peer rental marketplace for South Africa',
    url: 'https://rentio.co.za',
    telephone: '+27 10 123 4567',
    email: 'support@rentio.co.za',
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
    areaServed: [
      'Johannesburg',
      'Cape Town',
      'Durban',
      'Pretoria',
      'Port Elizabeth',
      'Bloemfontein',
    ],
    paymentAccepted: [
      'Credit Card',
      'Debit Card',
      'Bank Transfer',
      'EFT',
      'Mobile Payment',
    ],
  }

  return <JsonLd data={data} />
}