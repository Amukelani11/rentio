import { siteConfig } from './site-config'

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

interface SitemapOptions {
  baseUrl?: string
  listings?: Array<{
    id: string
    title: string
    category: string
    location: string
    updated_at: string
  }>
}

export function generateSitemap(options: SitemapOptions = {}) {
  const baseUrl = options.baseUrl || siteConfig.url
  const currentDate = new Date().toISOString().split('T')[0]

  // Static pages with their priorities and update frequencies
  const staticPages: SitemapUrl[] = [
    {
      loc: baseUrl,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      loc: `${baseUrl}/browse`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/how-it-works`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/safety`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/fees`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.7,
    },
    {
      loc: `${baseUrl}/business`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.7,
    },
    {
      loc: `${baseUrl}/contact`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.6,
    },
    {
      loc: `${baseUrl}/help`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/terms`,
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: 0.5,
    },
    {
      loc: `${baseUrl}/privacy`,
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: 0.5,
    },
    {
      loc: `${baseUrl}/auth/signup`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.6,
    },
    {
      loc: `${baseUrl}/auth/signin`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.6,
    },
  ]

  // Category pages
  const categories = siteConfig.categories.map(category => ({
    loc: `${baseUrl}/browse?category=${encodeURIComponent(category)}`,
    lastmod: currentDate,
    changefreq: 'daily' as const,
    priority: 0.8,
  }))

  // Location pages
  const locations = siteConfig.locations.map(location => ({
    loc: `${baseUrl}/browse?location=${encodeURIComponent(location)}`,
    lastmod: currentDate,
    changefreq: 'daily' as const,
    priority: 0.9,
  }))

  // Help center pages
  const helpPages = [
    { path: '/help/getting-started', priority: 0.7 },
    { path: '/help/renting', priority: 0.7 },
    { path: '/help/listing', priority: 0.7 },
    { path: '/help/payments', priority: 0.7 },
    { path: '/help/safety', priority: 0.8 },
    { path: '/help/communication', priority: 0.6 },
    { path: '/help/bookings', priority: 0.6 },
    { path: '/help/business', priority: 0.6 },
  ].map(page => ({
    loc: `${baseUrl}${page.path}`,
    lastmod: currentDate,
    changefreq: 'monthly' as const,
    priority: page.priority,
  }))

  // Generate listing URLs if provided
  const listingUrls: SitemapUrl[] = options.listings?.map(listing => ({
    loc: `${baseUrl}/browse/${listing.id}`,
    lastmod: listing.updated_at.split('T')[0],
    changefreq: 'weekly' as const,
    priority: 0.8,
  })) || []

  // Combine all URLs
  const allUrls = [
    ...staticPages,
    ...categories,
    ...locations,
    ...helpPages,
    ...listingUrls,
  ]

  // Generate XML sitemap
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`

  return sitemapXml
}

export function generateSitemapIndex(baseUrl: string, sitemaps: string[]) {
  const currentDate = new Date().toISOString().split('T')[0]

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${baseUrl}/${sitemap}</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`
}

// Helper function to generate individual sitemap files for large sites
export function generateCategorySitemaps(listings: any[], baseUrl: string) {
  const categories = [...new Set(listings.map(listing => listing.category))]

  return categories.map(category => {
    const categoryListings = listings.filter(listing => listing.category === category)
    const urls = categoryListings.map(listing => ({
      loc: `${baseUrl}/browse/${listing.id}`,
      lastmod: listing.updated_at.split('T')[0],
      changefreq: 'weekly' as const,
      priority: 0.8,
    }))

    return {
      filename: `sitemap-${category.toLowerCase().replace(/\s+/g, '-')}.xml`,
      content: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`
    }
  })
}

// Generate robots.txt content
export function generateRobotsTxt(baseUrl: string, sitemapUrl?: string) {
  return `# Rentio Robots.txt - South African Rental Marketplace
# Website: ${baseUrl}

# Allow all search engines to crawl the site
User-agent: *
Allow: /

# Allow all search engines to access important directories
User-agent: Googlebot
Allow: /
Allow: /browse/
Allow: /help/
Allow: /safety/
Allow: /fees/
Allow: /business/
Allow: /contact/
Allow: /terms/
Allow: /privacy/

# Block access to sensitive areas
Disallow: /dashboard/
Disallow: /api/
Disallow: /admin/
Disallow: /auth/
Disallow: /onboarding/
Disallow: /_next/
Disallow: /static/
Disallow: *.json$
Disallow: *.js$
Disallow: *.css$

# Specific bot settings
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

# Image and media indexing
User-agent: Googlebot-Image
Allow: /assets/
Allow: /images/
Allow: /uploads/

# Sitemap location
${sitemapUrl ? `Sitemap: ${sitemapUrl}` : `Sitemap: ${baseUrl}/sitemap.xml`}

# Crawl-delay for respectful crawling
Crawl-delay: 1`
}