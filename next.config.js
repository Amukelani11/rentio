/** @type {import('next').NextConfig} */
const nextConfig = {
  // Try to work around the generate function issue
  experimental: {
    // Disable features that might cause the generate function issue
    serverComponentsExternalPackages: [],
  },
  webpack: (config, { isServer }) => {
    // Add polyfills for potential missing functions
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }
    return config
  },
}

module.exports = nextConfig