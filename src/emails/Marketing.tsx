import * as React from 'react'
import {
  EmailLayout,
  EmailButton,
  EmailCard,
  EmailSection,
  EmailHeading,
  EmailText,
  EmailDivider,
  EmailBadge,
  BRAND_COLORS,
  SITE_URL,
} from './EmailLayout'

interface WelcomeEmailData {
  name: string
  role?: string
  onboardingUrl?: string
  features?: string[]
}

export function WelcomeEmail({ data }: { data: WelcomeEmailData }) {
  const getRoleSpecificContent = () => {
    switch (data.role) {
      case 'CUSTOMER':
        return {
          title: 'Welcome to Rentio! 🎉',
          message: 'Get ready to discover amazing items to rent in your area.',
          features: [
            'Browse thousands of rental items',
            'Book with confidence with secure payments',
            'Connect directly with owners',
            'Read reviews from other renters'
          ]
        }
      case 'INDIVIDUAL_LISTER':
        return {
          title: 'Welcome to Rentio as a Lister! 🏠',
          message: 'Start earning money by renting out your unused items.',
          features: [
            'List items in minutes',
            'Set your own prices and availability',
            'Receive secure payments',
            'Build your reputation with reviews'
          ]
        }
      case 'BUSINESS_LISTER':
        return {
          title: 'Welcome to Rentio for Business! 🏢',
          message: 'Grow your business by reaching more customers.',
          features: [
            'Manage business inventory',
            'Team member collaboration',
            'Business analytics and insights',
            'Professional listing management'
          ]
        }
      default:
        return {
          title: 'Welcome to Rentio! 🎉',
          message: 'The best place to rent and list items in South Africa.',
          features: [
            'Safe and secure platform',
            'Verified users and reviews',
            '24/7 customer support',
            'Easy payment processing'
          ]
        }
    }
  }

  const roleContent = getRoleSpecificContent()

  return (
    <EmailLayout
      title={roleContent.title}
      preview="Welcome to Rentio - South Africa's trusted rental marketplace"
    >
      <EmailSection>
        <EmailHeading level={1} align="center">
          {roleContent.title}
        </EmailHeading>
        <EmailText align="center" color="secondary">
          Hi {data.name}, {roleContent.message}
        </EmailText>
      </EmailSection>

      <EmailCard background="primary" padding="md">
        <EmailHeading level={3} align="center">
          What Makes Rentio Special?
        </EmailHeading>

        {data.features || roleContent.features.map((feature, index) => (
          <EmailText key={index} color="secondary" size="sm">
            ✨ {feature}
          </EmailText>
        ))}
      </EmailCard>

      <EmailSection>
        <EmailButton
          href={data.onboardingUrl || `${SITE_URL}/dashboard`}
          variant="primary"
          fullWidth
        >
          Get Started
        </EmailButton>
      </EmailSection>

      <EmailCard background="white" padding="md">
        <EmailHeading level={3}>Quick Start Guide</EmailHeading>
        <EmailText color="secondary" size="sm">
          1. <strong>Complete your profile</strong> - Add a photo and verify your email
        </EmailText>
        <EmailText color="secondary" size="sm">
          2. <strong>Browse listings</strong> - Discover items available in your area
        </EmailText>
        <EmailText color="secondary" size="sm">
          3. <strong>Make your first booking</strong> - Secure payment and instant confirmation
        </EmailText>
        <EmailText color="secondary" size="sm">
          4. <strong>Leave reviews</strong> - Help build trust in our community
        </EmailText>
      </EmailCard>

      <EmailDivider />

      <EmailText align="center" color="muted" size="sm">
        Have questions? Our support team is here to help! Reply to this email anytime.
      </EmailText>
    </EmailLayout>
  )
}

interface PromotionEmailData {
  name: string
  promotionTitle: string
  promotionDescription: string
  discountCode?: string
  validUntil?: string
  featuredListings?: Array<{
    title: string
    price: string
    imageUrl?: string
    url: string
  }>
}

export function PromotionEmail({ data }: { data: PromotionEmailData }) {
  return (
    <EmailLayout
      title={data.promotionTitle}
      preview="Special offers and promotions from Rentio"
    >
      <EmailSection>
        <EmailHeading level={1} align="center">
          {data.promotionTitle}
        </EmailHeading>
        <EmailText align="center" color="secondary">
          Hi {data.name}, {data.promotionDescription}
        </EmailText>
      </EmailSection>

      {data.discountCode && (
        <EmailCard background="success" padding="md">
          <EmailHeading level={3} align="center">
            Your Exclusive Discount
          </EmailHeading>
          <div style={{
            backgroundColor: '#ffffff',
            border: `2px dashed ${BRAND_COLORS.status.success}`,
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            margin: '16px 0',
          }}>
            <EmailText align="center" size="lg">
              <span style={{ color: BRAND_COLORS.status.success, fontWeight: 700 }}>{data.discountCode}</span>
            </EmailText>
          </div>
          <EmailText align="center" color="secondary" size="sm">
            {data.validUntil && `Valid until ${data.validUntil}`}
          </EmailText>
        </EmailCard>
      )}

      {data.featuredListings && data.featuredListings.length > 0 && (
        <EmailCard background="white" padding="md">
          <EmailHeading level={3}>Featured Listings</EmailHeading>
          {data.featuredListings.map((listing, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <EmailText>
                <strong>{listing.title}</strong>
              </EmailText>
              <EmailText color="secondary">
                {listing.price}
              </EmailText>
              <EmailButton href={listing.url} variant="secondary" size="sm">
                View Listing
              </EmailButton>
              {index < data.featuredListings!.length - 1 && <EmailDivider />}
            </div>
          ))}
        </EmailCard>
      )}

      <EmailSection>
        <EmailButton href={`${SITE_URL}/listings`} variant="primary" fullWidth>
          Browse All Listings
        </EmailButton>
      </EmailSection>

      <EmailDivider />

      <EmailText align="center" color="muted" size="sm">
        Terms and conditions apply. Limited time offer.
      </EmailText>
    </EmailLayout>
  )
}

interface AnnouncementEmailData {
  title: string
  message: string
  features?: Array<{
    title: string
    description: string
    icon?: string
  }>
  actionUrl?: string
  actionText?: string
}

export function AnnouncementEmail({ data }: { data: AnnouncementEmailData }) {
  return (
    <EmailLayout
      title={data.title}
      preview="Important announcement from Rentio"
    >
      <EmailSection>
        <EmailHeading level={1} align="center">
          {data.title}
        </EmailHeading>
        <EmailText align="center" color="secondary">
          {data.message}
        </EmailText>
      </EmailSection>

      {data.features && data.features.length > 0 && (
        <EmailCard background="primary" padding="md">
          <EmailHeading level={3} align="center">
            What's New?
          </EmailHeading>
          {data.features.map((feature, index) => (
            <div key={index} style={{ marginBottom: '16px' }}>
              <EmailText>
                <strong>{feature.icon} {feature.title}</strong>
              </EmailText>
              <EmailText color="secondary" size="sm">
                {feature.description}
              </EmailText>
            </div>
          ))}
        </EmailCard>
      )}

      {data.actionUrl && (
        <EmailSection>
          <EmailButton href={data.actionUrl} variant="primary" fullWidth>
            {data.actionText || 'Learn More'}
          </EmailButton>
        </EmailSection>
      )}

      <EmailCard background="white" padding="md">
        <EmailHeading level={4}>We'd Love Your Feedback</EmailHeading>
        <EmailText color="secondary" size="sm">
          Your input helps us make Rentio better for everyone. What do you think of these changes?
        </EmailText>
        <EmailButton href={`${SITE_URL}/feedback`} variant="secondary" size="sm">
          Share Feedback
        </EmailButton>
      </EmailCard>

      <EmailDivider />

      <EmailText align="center" color="muted" size="sm">
        Have questions? Reply to this email or visit our Help Center.
      </EmailText>
    </EmailLayout>
  )
}

interface NewsletterEmailData {
  name: string
  month: string
  topListings?: Array<{
    title: string
    price: string
    url: string
  }>
  communityStats?: {
    newUsers: string
    totalListings: string
    completedRentals: string
  }
  tips?: string[]
  upcomingEvents?: Array<{
    title: string
    date: string
    description: string
  }>
}

export function NewsletterEmail({ data }: { data: NewsletterEmailData }) {
  return (
    <EmailLayout
      title={`Rentio ${data.month} Newsletter`}
      preview="Your monthly update from Rentio"
    >
      <EmailSection>
        <EmailHeading level={1} align="center">
          {data.month} Newsletter
        </EmailHeading>
        <EmailText align="center" color="secondary">
          Hi {data.name}, here's what's happening at Rentio this month!
        </EmailText>
      </EmailSection>

      {data.communityStats && (
        <EmailCard background="primary" padding="md">
          <EmailHeading level={3} align="center">
            Community Highlights
          </EmailHeading>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            textAlign: 'center',
          }}>
            <div>
              <EmailText align="center" size="lg">
                <span style={{ color: BRAND_COLORS.primary[500], fontWeight: 700 }}>{data.communityStats.newUsers}</span>
              </EmailText>
              <EmailText align="center" color="secondary" size="sm">
                New Users
              </EmailText>
            </div>
            <div>
              <EmailText align="center" size="lg">
                <span style={{ color: BRAND_COLORS.primary[500], fontWeight: 700 }}>{data.communityStats.totalListings}</span>
              </EmailText>
              <EmailText align="center" color="secondary" size="sm">
                Total Listings
              </EmailText>
            </div>
            <div>
              <EmailText align="center" size="lg">
                <span style={{ color: BRAND_COLORS.primary[500], fontWeight: 700 }}>{data.communityStats.completedRentals}</span>
              </EmailText>
              <EmailText align="center" color="secondary" size="sm">
                Completed Rentals
              </EmailText>
            </div>
          </div>
        </EmailCard>
      )}

      {data.topListings && data.topListings.length > 0 && (
        <EmailCard background="white" padding="md">
          <EmailHeading level={3}>Most Popular This Month</EmailHeading>
          {data.topListings.map((listing, index) => (
            <div key={index} style={{ marginBottom: '12px' }}>
              <EmailText>
                <strong>{index + 1}. {listing.title}</strong>
              </EmailText>
              <EmailText color="secondary" size="sm">
                {listing.price}
              </EmailText>
            </div>
          ))}
          <EmailButton href={`${SITE_URL}/listings`} variant="secondary" size="sm">
            View All Popular Items
          </EmailButton>
        </EmailCard>
      )}

      {data.tips && data.tips.length > 0 && (
        <EmailCard background="primary" padding="md">
          <EmailHeading level={3}>Insider Tips</EmailHeading>
          {data.tips.map((tip, index) => (
            <EmailText key={index}>{tip}</EmailText>
          ))}
        </EmailCard>
      )}

      {data.upcomingEvents && data.upcomingEvents.length > 0 && (
        <EmailCard background="white" padding="md">
          <EmailHeading level={3}>Upcoming Events</EmailHeading>
          {data.upcomingEvents.map((event, index) => (
            <div key={index} style={{ marginBottom: '16px' }}>
              <EmailText>
                <strong>{event.title}</strong>
              </EmailText>
              <EmailText color="secondary" size="sm">
                {event.date}
              </EmailText>
              <EmailText color="secondary" size="sm">
                {event.description}
              </EmailText>
            </div>
          ))}
        </EmailCard>
      )}

      <EmailSection>
        <EmailButton href={`${SITE_URL}/listings`} variant="primary" fullWidth>
          Start Browsing
        </EmailButton>
      </EmailSection>

      <EmailDivider />

      <EmailText align="center" color="muted" size="sm">
        Thanks for being part of the Rentio community! 🎉
      </EmailText>
    </EmailLayout>
  )
}

interface ReengagementEmailData {
  name: string
  lastActive?: string
  recommendations?: Array<{
    title: string
    price: string
    url: string
    reason: string
  }>
}

export function ReengagementEmail({ data }: { data: ReengagementEmailData }) {
  return (
    <EmailLayout
      title="We've Missed You! 👋"
      preview="Come back and discover what's new on Rentio"
    >
      <EmailSection>
        <EmailHeading level={1} align="center">
          We've Missed You! 👋
        </EmailHeading>
        <EmailText align="center" color="secondary">
          Hi {data.name}, it's been a while since you last visited Rentio.
        </EmailText>
      </EmailSection>

      <EmailCard background="primary" padding="md">
        <EmailHeading level={3} align="center">
          What's New Since You've Been Gone?
        </EmailHeading>
        <EmailText color="secondary" size="sm">
          • New safety features and verification processes
        </EmailText>
        <EmailText color="secondary" size="sm">
          • Enhanced search and filtering options
        </EmailText>
        <EmailText color="secondary" size="sm">
          • More listings than ever before
        </EmailText>
        <EmailText color="secondary" size="sm">
          • Improved messaging and communication
        </EmailText>
      </EmailCard>

      {data.recommendations && data.recommendations.length > 0 && (
        <EmailCard background="white" padding="md">
          <EmailHeading level={3}>Recommended for You</EmailHeading>
          {data.recommendations.map((item, index) => (
            <div key={index} style={{ marginBottom: '16px' }}>
              <EmailText>
                <strong>{item.title}</strong>
              </EmailText>
              <EmailText color="secondary" size="sm">
                {item.reason}
              </EmailText>
              <EmailText color="secondary">
                {item.price}
              </EmailText>
              <EmailButton href={item.url} variant="secondary" size="sm">
                View Item
              </EmailButton>
              {index < data.recommendations!.length - 1 && <EmailDivider />}
            </div>
          ))}
        </EmailCard>
      )}

      <EmailCard background="success" padding="md">
        <EmailHeading level={3} align="center">
          Special Welcome Back Offer!
        </EmailHeading>
        <EmailText align="center" color="secondary">
          Use code <strong>WELCOMEBACK20</strong> for 20% off your next booking.
        </EmailText>
        <EmailText align="center" color="secondary" size="sm">
          Valid for 7 days
        </EmailText>
      </EmailCard>

      <EmailSection>
        <EmailButton href={`${SITE_URL}/listings`} variant="primary" fullWidth>
          Start Exploring Again
        </EmailButton>
      </EmailSection>

      <EmailDivider />

      <EmailText align="center" color="muted" size="sm">
        We're constantly improving to make your rental experience better. Come see what's new!
      </EmailText>
    </EmailLayout>
  )
}