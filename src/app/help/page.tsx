import { Search, BookOpen, Video, MessageCircle, Shield, CreditCard, Home, Car, Phone, User, Building2, Package, Calendar, MapPin, Camera, FileText, Settings, AlertTriangle, CheckCircle, Clock, HelpCircle, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import PageSEO from '@/components/SEO/PageSEO'

export default function HelpCenterPage() {
  const helpCategories = [
    {
      icon: User,
      title: "Getting Started",
      description: "Learn the basics of using Rentio",
      color: "bg-blue-100 text-blue-600",
      topics: [
        "Creating Your Account",
        "Completing KYC Verification",
        "Setting Up Your Profile",
        "Understanding User Roles",
        "Dashboard Navigation"
      ]
    },
    {
      icon: Home,
      title: "Renting Items",
      description: "Everything about renting from others",
      color: "bg-coral-100 text-coral-600",
      topics: [
        "Searching for Items",
        "Understanding Listings",
        "Making Booking Requests",
        "Payment Process",
        "Pickup & Return Procedures",
        "Item Inspection Guidelines"
      ]
    },
    {
      icon: Building2,
      title: "Listing Items",
      description: "Share your items with the community",
      color: "bg-green-100 text-green-600",
      topics: [
        "Creating Your First Listing",
        "Writing Effective Descriptions",
        "Taking Great Photos",
        "Setting Rental Prices",
        "Managing Availability",
        "Shipping & Delivery Options"
      ]
    },
    {
      icon: CreditCard,
      title: "Payments & Billing",
      description: "Understand our payment system",
      color: "bg-purple-100 text-purple-600",
      topics: [
        "Service Fees Explained",
        "Security Deposits",
        "Payment Methods",
        "Refund Process",
        "Payouts for Listers",
        "Tax Information"
      ]
    },
    {
      icon: Shield,
      title: "Safety & Security",
      description: "Stay safe while using Rentio",
      color: "bg-red-100 text-red-600",
      topics: [
        "Safety Guidelines",
        "Identity Verification",
        "Scam Prevention",
        "Meeting Safely",
        "Item Protection",
        "Emergency Procedures"
      ]
    },
    {
      icon: MessageCircle,
      title: "Communication",
      description: "Connect with other users",
      color: "bg-yellow-100 text-yellow-600",
      topics: [
        "In-App Messaging",
        "Professional Communication",
        "Negotiation Tips",
        "Reporting Issues",
        "Review System",
        "Dispute Resolution"
      ]
    },
    {
      icon: Calendar,
      title: "Bookings & Reservations",
      description: "Manage your rental activities",
      color: "bg-indigo-100 text-indigo-600",
      topics: [
        "Booking Status Guide",
        "Cancellation Policy",
        "Extending Rentals",
        "Late Returns",
        "No-Show Procedures",
        "Booking Modifications"
      ]
    },
    {
      icon: Package,
      title: "Business Features",
      description: "Advanced tools for businesses",
      color: "bg-orange-100 text-orange-600",
      topics: [
        "Business Account Setup",
        "Team Management",
        "Inventory Management",
        "Business Analytics",
        "Custom Branding",
        "Package Deals"
      ]
    }
  ]

  const quickActions = [
    {
      title: "Track Your Booking",
      description: "Check the status of your current or upcoming rentals",
      icon: Search,
      action: "Go to Dashboard"
    },
    {
      title: "Report an Issue",
      description: "Having trouble with a rental or another user?",
      icon: AlertTriangle,
      action: "Report Problem"
    },
    {
      title: "Contact Support",
      description: "Can't find what you're looking for?",
      icon: MessageCircle,
      action: "Get Help"
    },
    {
      title: "Verify Your Account",
      description: "Complete KYC to unlock all features",
      icon: CheckCircle,
      action: "Start Verification"
    }
  ]

  const commonIssues = [
    {
      title: "Payment Failed",
      solution: "Check your payment method details and try again. Contact your bank if issues persist.",
      icon: CreditCard,
      category: "Payments"
    },
    {
      title: "KYC Verification Pending",
      solution: "Upload clear documents and wait 24-48 hours for review. Ensure all information matches your ID.",
      icon: Camera,
      category: "Account"
    },
    {
      title: "Booking Request Not Responded",
      solution: "Wait 24-48 hours for response. You can cancel and book elsewhere if no response.",
      icon: Clock,
      category: "Bookings"
    },
    {
      title: "Item Not as Described",
      solution: "Document issues with photos and contact the lister immediately. Open dispute if unresolved.",
      icon: AlertTriangle,
      category: "Disputes"
    },
    {
      title: "Can't Login",
      solution: "Use 'Forgot Password' or check your email for verification. Clear browser cache if needed.",
      icon: Settings,
      category: "Technical"
    },
    {
      title: "Listing Not Approved",
      solution: "Ensure item meets guidelines, has clear photos, and complete description.",
      icon: FileText,
      category: "Listings"
    }
  ]

  const gettingStarted = [
    {
      step: 1,
      title: "Create Your Account",
      description: "Sign up with your email and complete your profile with accurate information.",
      icon: User,
      requirements: [
        "Valid email address",
        "Phone number verification",
        "Basic personal information"
      ]
    },
    {
      step: 2,
      title: "Complete KYC Verification",
      description: "Verify your identity to build trust and unlock all platform features.",
      icon: Camera,
      requirements: [
        "Government-issued ID",
        "Proof of address",
        "Clear selfie photo",
        "24-48 hour processing time"
      ]
    },
    {
      step: 3,
      title: "Choose Your Path",
      description: "Select whether you want to rent items, list items, or both.",
      icon: Home,
      requirements: [
        "Renter: Browse and book items",
        "Lister: Share your items for rent",
        "Business: Professional rental operations"
      ]
    },
    {
      step: 4,
      title: "Start Using Rentio",
      description: "Begin exploring listings or creating your own rental offerings.",
      icon: Star,
      requirements: [
        "Search for items in your area",
        "Create your first listing",
        "Connect with the community",
        "Enjoy secure rentals"
      ]
    }
  ]

  const safetyGuidelines = [
    {
      category: "For Renters",
      guidelines: [
        "Always meet in public places for item exchanges",
        "Inspect items thoroughly before payment",
        "Use Rentio's messaging for all communication",
        "Trust your instincts - if something feels wrong, walk away",
        "Never share personal financial information directly",
        "Report suspicious behavior immediately"
      ]
    },
    {
      category: "For Listers",
      guidelines: [
        "Verify renter's identity before handover",
        "Document item condition with photos",
        "Use Rentio's secure payment system only",
        "Meet in safe, public locations when possible",
        "Be clear about rental terms and conditions",
        "Maintain professional communication"
      ]
    },
    {
      category: "General Safety",
      guidelines: [
        "Keep communication within the platform",
        "Research users before accepting bookings",
        "Don't share personal addresses prematurely",
        "Use two-factor authentication on your account",
        "Regularly update your password",
        "Report scams or fraudulent activity"
      ]
    }
  ]

  const faqData = [
    {
      question: "How do I get started with Rentio?",
      answer: "Getting started is easy! Sign up for an account, complete your profile verification, and you can start browsing listings or create your first rental listing. Our onboarding process will guide you through each step."
    },
    {
      question: "What payment methods does Rentio accept?",
      answer: "Rentio accepts various payment methods including credit/debit cards, EFT, Yoco, PayFast, and PayStack. All payments are processed securely through our encrypted payment system."
    },
    {
      question: "How does the rental process work?",
      answer: "Browse listings, select your rental period, book the item, complete payment through our secure system, arrange pickup or delivery with the lister, enjoy your rental, and return the item in good condition."
    },
    {
      question: "What should I do if I have a problem with a rental?",
      answer: "Contact the lister first to resolve the issue. If that doesn't work, use our dispute resolution system or contact support. We have processes in place to handle various rental issues fairly."
    },
    {
      question: "How does Rentio ensure user safety?",
      answer: "We implement KYC verification, secure payment processing, user reviews, identity verification, and comprehensive safety guidelines. All users are verified before they can complete transactions."
    }
  ]

  return (
    <>
      <PageSEO
        title="Help Center | Rentio"
        description="Comprehensive help center for Rentio's peer-to-peer rental marketplace. Find answers to common questions, troubleshooting guides, and support resources."
        keywords={[
          "rental help center",
          "peer to peer rental help",
          "south african rental support",
          "rental marketplace assistance",
          "rental troubleshooting",
          "rental platform help",
          "rental faq",
          "rental user guide",
          "rental support south africa",
          "rental marketplace help"
        ]}
        canonical="https://rentio.co.za/help"
        openGraph={{
          type: 'article',
          title: 'Help Center | Rentio',
          description: 'Comprehensive help center for Rentio\'s peer-to-peer rental marketplace with FAQs and guides.',
        }}
        faq={faqData}
        breadcrumbs={[
          { name: 'Home', url: 'https://rentio.co.za' },
          { name: 'Help Center', url: 'https://rentio.co.za/help' }
        ]}
      />
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-coral-600 to-coral-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-coral-100">
              Everything you need to know about using Rentio safely and effectively
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Search Bar */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for help articles, guides, and FAQs..."
                className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:border-coral-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    index === 0 ? 'bg-blue-100 text-blue-600' :
                    index === 1 ? 'bg-red-100 text-red-600' :
                    index === 2 ? 'bg-coral-100 text-coral-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                  <Button size="sm" variant="outline">{action.action}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.topics.slice(0, 3).map((topic, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                        {topic}
                      </div>
                    ))}
                    {category.topics.length > 3 && (
                      <div className="text-sm text-coral-600 font-medium">
                        +{category.topics.length - 3} more topics
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Getting Started Guide</h2>
          <Card>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {gettingStarted.map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                      <step.icon className="h-8 w-8 text-coral-600" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-coral-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{step.description}</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      {step.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Common Issues */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Common Issues & Solutions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commonIssues.map((issue, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <issue.icon className="h-5 w-5 text-gray-600 mr-2" />
                      <CardTitle className="text-lg">{issue.title}</CardTitle>
                    </div>
                    <Badge variant="outline">{issue.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{issue.solution}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Safety Guidelines */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Safety Guidelines</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {safetyGuidelines.map((section, index) => (
              <Card key={index} className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <Shield className="h-5 w-5 mr-2" />
                    {section.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.guidelines.map((guideline, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        {guideline}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Resource Types */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Learning Resources</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="font-semibold mb-2">Help Articles</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Comprehensive guides covering every aspect of using Rentio
                </p>
                <div className="text-2xl font-bold text-coral-600">150+</div>
                <p className="text-xs text-gray-500">Articles available</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🎬</div>
                <h3 className="font-semibold mb-2">Video Tutorials</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Step-by-step video guides for visual learners
                </p>
                <div className="text-2xl font-bold text-coral-600">50+</div>
                <p className="text-xs text-gray-500">Video tutorials</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="font-semibold mb-2">Community Forum</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Get help from experienced users and Rentio experts
                </p>
                <div className="text-2xl font-bold text-coral-600">24/7</div>
                <p className="text-xs text-gray-500">Community support</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-coral-50 to-blue-50 rounded-lg p-8">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-coral-600" />
              <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our support team is here to help you with any questions or issues you might have.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" className="bg-coral-600 hover:bg-coral-700">
                  Contact Support
                </Button>
                <Button size="lg" variant="outline">
                  Browse FAQ
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Topics */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Popular Topics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "How to verify my account",
              "Understanding service fees",
              "Creating effective listings",
              "Safe meeting practices",
              "Payment processing times",
              "Cancellation policies",
              "Dispute resolution process",
              "Business account benefits"
            ].map((topic, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <HelpCircle className="h-4 w-4 text-coral-600 mr-2" />
                    <span className="text-sm font-medium">{topic}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}