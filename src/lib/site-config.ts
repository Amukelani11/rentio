export const siteConfig = {
  name: 'Rentio',
  title: 'Rentio - South Africa\'s Premier Rental Marketplace',
  description: 'Why buy when you can rent? Find everything you need nearby. Turn your unused items into income. List in minutes, rent instantly. South Africa\'s trusted peer-to-peer rental platform.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://rentio.co.za',
  ogImage: '/og-default.jpg',
  logo: '/logo.png',
  favicon: '/favicon.ico',
  email: 'support@rentio.co.za',
  phone: '+27 10 123 4567',

  // Social media
  twitter: '@rentio_sa',
  facebook: 'rentio_sa',
  instagram: 'rentio_sa',
  linkedin: 'company/rentio',

  // SEO verification
  googleVerification: process.env.GOOGLE_SITE_VERIFICATION || '',
  pinterestVerification: process.env.PINTEREST_SITE_VERIFICATION || '',

  // Legal
  privacyPolicyUrl: '/privacy',
  termsOfServiceUrl: '/terms',
  helpCenterUrl: '/help',
  contactUrl: '/contact',

  // App information
  appStoreUrl: 'https://apps.apple.com/za/app/rentio/id1234567890',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.rentio.app',

  // Default meta tags
  defaultKeywords: [
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
    'car rental',
    'rental platform',
    'share economy',
    'rental business',
    'temporary rentals',
    'short term rentals',
    'affordable rentals',
    'rent instead of buy',
    'rentals near me',
    'south african rentals',
    'za rentals'
  ],

  // Locations served
  locations: [
    'johannesburg',
    'cape town',
    'durban',
    'pretoria',
    'port elizabeth',
    'bloemfontein',
    'east london',
    'pietermaritzburg',
    'polokwane',
    'nelspruit',
    'kimberley',
    'mahikeng',
    'bisho'
  ],

  // Categories
  categories: [
    'electronics',
    'furniture',
    'tools',
    'party supplies',
    'camera equipment',
    'sports equipment',
    'musical instruments',
    'books',
    'games',
    'clothing',
    'accessories',
    'baby equipment',
    'outdoor gear',
    'kitchen appliances',
    'office equipment',
    'medical equipment',
    'costumes',
    'decorations'
  ]
}