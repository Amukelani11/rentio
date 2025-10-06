/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  },
  trailingSlash: false,
  output: 'standalone',
  experimental: {
    // Disable static generation for pages with dynamic content
    dynamicIO: false,
  },
}

module.exports = nextConfig