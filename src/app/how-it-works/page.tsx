'use client'

import { Search, Calendar, CreditCard, MessageSquare, CheckCircle, Shield, ArrowRight, Star, Clock, MapPin, Camera, Users, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function HowItWorksPage() {
  const renterSteps = [
    {
      icon: Search,
      title: "Browse & Search",
      description: "Search thousands of items near you by category, location, or keywords. Filter by price, availability, and distance.",
      details: ["Use advanced filters", "View detailed photos", "Read reviews and ratings", "Check real-time availability"]
    },
    {
      icon: Calendar,
      title: "Book Your Dates",
      description: "Select your rental dates and instantly check availability. Most items offer flexible pickup and return times.",
      details: ["Instant booking available", "Choose pickup/delivery", "Select rental duration", "Add special requests"]
    },
    {
      icon: CreditCard,
      title: "Secure Payment",
      description: "Pay securely with a 5% service fee. Your payment is protected and deposits are held safely in escrow.",
      details: ["Multiple payment methods", "Secure payment processing", "Deposit protection", "Instant confirmation"]
    },
    {
      icon: MessageSquare,
      title: "Connect & Arrange",
      description: "Chat with the owner to arrange pickup details, get usage instructions, and clarify any questions.",
      details: ["In-app messaging", "Pickup coordination", "Usage guidelines", "Contact details sharing"]
    },
    {
      icon: CheckCircle,
      title: "Enjoy & Return",
      description: "Use your rental item and return it in the same condition. Rate your experience and help the community.",
      details: ["Use as needed", "Return on time", "Leave a review", "Get deposit back"]
    }
  ]

  const listerSteps = [
    {
      icon: Camera,
      title: "List Your Items",
      description: "Take great photos and create detailed listings. Set your own prices, availability, and rental terms.",
      details: ["Upload multiple photos", "Write detailed descriptions", "Set competitive pricing", "Define rental terms"]
    },
    {
      icon: Calendar,
      title: "Manage Bookings",
      description: "Receive booking requests and manage your calendar. You control what gets rented and when.",
      details: ["Approve/decline requests", "Instant book option", "Calendar management", "Automated notifications"]
    },
    {
      icon: MessageSquare,
      title: "Coordinate Handover",
      description: "Chat with renters to arrange pickup and drop-off. Provide instructions and ensure smooth transactions.",
      details: ["Pickup scheduling", "Usage instructions", "Condition checks", "Contact coordination"]
    },
    {
      icon: CreditCard,
      title: "Get Paid",
      description: "Receive 85% of rental fees (15% service fee). Payments are processed securely and deposited to your account.",
      details: ["85% of rental income", "Secure payment processing", "Quick payouts", "Deposit protection"]
    },
    {
      icon: Star,
      title: "Build Your Reputation",
      description: "Earn great reviews and build trust in the community. Top-rated listers get more bookings.",
      details: ["Earn 5-star reviews", "Build trust", "Increase visibility", "Grow your income"]
    }
  ]

  const safetyFeatures = [
    {
      icon: Shield,
      title: "Identity Verification",
      description: "All users go through identity verification to ensure a trusted community."
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "All payments are processed securely. Deposits are held in escrow for protection."
    },
    {
      icon: MessageSquare,
      title: "In-App Communication",
      description: "Keep all communication in-app for transparency and safety records."
    },
    {
      icon: Star,
      title: "Review System",
      description: "Both renters and listers can review each other to build community trust."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-coral-600 to-coral-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">How Rentio Works</h1>
            <p className="text-xl text-coral-100">
              Your complete guide to renting and listing items safely and easily
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* For Renters Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">For Renters</Badge>
            <h2 className="text-3xl font-bold mb-4">Rent Anything You Need</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From tools to tents, cameras to costumes - find what you need nearby and save money on things you'll only use occasionally.
            </p>
          </div>

          <div className="space-y-8">
            {renterSteps.map((step, index) => (
              <div key={index} className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded-full mr-3">
                      {index + 1}
                    </span>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
                {index < renterSteps.length - 1 && (
                  <div className="hidden md:block flex-shrink-0">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/browse">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Browsing Items
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* For Listers Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-100">For Listers</Badge>
            <h2 className="text-3xl font-bold mb-4">Earn Money from Your Stuff</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Turn your unused items into recurring income. List anything from power tools to party equipment and start earning today.
            </p>
          </div>

          <div className="space-y-8">
            {listerSteps.map((step, index) => (
              <div key={index} className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center mb-2">
                    <span className="bg-green-600 text-white text-sm font-bold px-2 py-1 rounded-full mr-3">
                      {index + 1}
                    </span>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
                {index < listerSteps.length - 1 && (
                  <div className="hidden md:block flex-shrink-0">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/list-item">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Start Listing Items
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Safety & Trust Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Safety & Trust</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We've built multiple layers of protection to ensure safe and trustworthy transactions for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {safetyFeatures.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-coral-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Business Solutions */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center mb-4">
                    <Building2 className="h-8 w-8 mr-3" />
                    <h3 className="text-2xl font-bold">Business Solutions</h3>
                  </div>
                  <p className="text-purple-100 mb-6">
                    Run a rental business? Get advanced tools for inventory management, team accounts, bulk uploads, and analytics.
                  </p>
                  <ul className="space-y-2 text-purple-100 mb-6">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Bulk inventory uploads
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Team member accounts
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Advanced analytics
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Priority support
                    </li>
                  </ul>
                  <Link href="/onboarding/business">
                    <Button variant="secondary" size="lg">
                      Learn About Business Features
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
                <div className="text-center">
                  <img src="/assets/businessshelve.png" alt="Business tools" className="mx-auto max-w-xs" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How much does it cost?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Renters pay a 5% service fee on rentals. Listers keep 85% of rental income (15% service fee). 
                  No payment processing fees - everything is included.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What if something gets damaged?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Security deposits protect both parties. If damage occurs, we help resolve disputes fairly. 
                  Renters are responsible for returning items in the same condition.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do payments work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Payments are processed securely when bookings are confirmed. Listers receive payouts after 
                  successful rentals. Deposits are held in escrow and returned when items are safely returned.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel a booking?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes, both renters and listers can cancel bookings according to our cancellation policy. 
                  Cancellation terms vary by listing and timing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-12 bg-white rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of South Africans already saving money by renting and earning by sharing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Browse Items to Rent
              </Button>
            </Link>
            <Link href="/list-item">
              <Button size="lg" variant="outline">
                List Your Items
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
