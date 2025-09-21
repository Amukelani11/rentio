import { Shield, CheckCircle, CreditCard, Clock, Users, Star, ArrowRight, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function RenterGuaranteePage() {
  const guarantees = [
    {
      icon: Shield,
      title: "100% Secure Payments",
      description: "Your money is protected with bank-level security. Full refunds for cancellations 24+ hours in advance.",
      highlight: "Bank-level security"
    },
    {
      icon: CheckCircle,
      title: "Verified Listers Only",
      description: "Every lister completes identity verification and item ownership checks before joining our platform.",
      highlight: "Identity verified"
    },
    {
      icon: CreditCard,
      title: "Deposit Protection",
      description: "Security deposits held safely in escrow. Only released to cover actual damage with photographic evidence.",
      highlight: "Escrow protection"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Real human support available around the clock for emergencies, disputes, and urgent questions.",
      highlight: "Always available"
    },
    {
      icon: Users,
      title: "Fair Dispute Resolution",
      description: "Independent review process for disagreements. Evidence-based decisions that protect both parties.",
      highlight: "Independently reviewed"
    },
    {
      icon: Star,
      title: "Quality Guarantee",
      description: "Items must match their descriptions. If not, you're protected with our satisfaction guarantee.",
      highlight: "As described or protected"
    }
  ]

  const protectionSteps = [
    {
      step: "1",
      title: "Browse with Confidence",
      description: "All listings are verified, and listers are identity-checked before joining.",
      icon: "🔍"
    },
    {
      step: "2", 
      title: "Book Securely",
      description: "Your payment is protected and deposits are held safely in escrow until return.",
      icon: "🔒"
    },
    {
      step: "3",
      title: "Rent with Peace of Mind", 
      description: "24/7 support available if anything goes wrong during your rental period.",
      icon: "🛡️"
    },
    {
      step: "4",
      title: "Fair Resolution",
      description: "If disputes arise, our independent team reviews evidence and makes fair decisions.",
      icon: "⚖️"
    }
  ]

  const stats = [
    { number: "50,000+", label: "Protected Bookings" },
    { number: "98%", label: "Dispute Resolution Rate" },
    { number: "4.8/5", label: "Average Trust Rating" },
    { number: "24/7", label: "Support Availability" }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-coral-600 to-coral-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="h-20 w-20 mx-auto mb-6 text-coral-100" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">You're Protected When You Book</h1>
            <p className="text-xl text-coral-100 mb-8 max-w-2xl mx-auto">
              Rent with complete confidence. Our comprehensive protection covers your money, your safety, and your peace of mind.
            </p>
            <Badge className="mb-4 bg-coral-100 text-coral-700 text-lg px-4 py-2">
              ✅ 100% Money-Back Guarantee
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Trust Stats */}
        <div className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-coral-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Guarantees */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What We Guarantee</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guarantees.map((guarantee, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <guarantee.icon className="h-8 w-8 text-coral-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{guarantee.title}</h3>
                  <Badge className="mb-3 bg-green-100 text-green-700">{guarantee.highlight}</Badge>
                  <p className="text-gray-600">{guarantee.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How You're Protected */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How You're Protected</h2>
          <div className="max-w-4xl mx-auto">
            {protectionSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-6 mb-8 last:mb-0">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center text-2xl">
                    {step.icon}
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center mb-2">
                    <span className="bg-coral-600 text-white text-sm font-bold px-3 py-1 rounded-full mr-3">
                      Step {step.step}
                    </span>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Money Protection Details */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <CreditCard className="h-6 w-6 mr-2" />
                Your Money is Always Protected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-green-700">100% Refund Scenarios:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Cancel 24+ hours before rental</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Lister cancels your confirmed booking</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Item doesn't match description</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Safety concerns or broken items</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-green-700">Deposit Protection:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Held securely in escrow</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Only deducted for proven damage</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Photographic evidence required</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Returned within 5-7 days</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Safety & Support */}
        <div className="mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 mr-2 text-coral-600" />
                  24/7 Human Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Real people, not bots. Get help when you need it most.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-coral-500 mr-2" />
                    <span>Emergency hotline available 24/7</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-coral-500 mr-2" />
                    <span>WhatsApp support for urgent matters</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-coral-500 mr-2" />
                    <span>Average response time: Under 4 hours</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-coral-500 mr-2" />
                    <span>Dispute mediation within 5-10 days</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-coral-600" />
                  Safety First
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Your safety and security are our top priorities.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-coral-500 mr-2" />
                    <span>All listers identity verified</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-coral-500 mr-2" />
                    <span>POPIA compliant data protection</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-coral-500 mr-2" />
                    <span>Secure in-app messaging only</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-coral-500 mr-2" />
                    <span>Review system for accountability</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Renters Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "When my camera rental had an issue, support resolved it within 2 hours and gave me a full refund. Amazing service!"
                </p>
                <div className="font-semibold">- Sarah M.</div>
                <div className="text-sm text-gray-600">Photography Equipment Renter</div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "I was worried about the deposit, but they explained everything clearly and returned it exactly when promised."
                </p>
                <div className="font-semibold">- David K.</div>
                <div className="text-sm text-gray-600">Power Tools Renter</div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "The lister cancelled last minute, but Rentio immediately refunded everything and helped me find an alternative."
                </p>
                <div className="font-semibold">- Lisa T.</div>
                <div className="text-sm text-gray-600">Event Equipment Renter</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Legal Compliance */}
        <div className="mb-16">
          <Card className="bg-gray-50">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold mb-4">Legal Protection & Compliance</h3>
              <p className="text-gray-600 mb-6">
                Our policies comply with South African consumer protection laws (CPA) and data protection regulations (POPIA). 
                You have legal rights and remedies beyond our platform guarantees.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/rental-policy">
                  <Button variant="outline">
                    Full Rental Policy
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/privacy">
                  <Button variant="outline">
                    Privacy Policy
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Final CTA */}
        <div className="text-center py-12 bg-white rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Rent with Confidence?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied renters who trust Rentio for safe, secure, and reliable rentals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse">
              <Button size="lg" className="bg-coral-600 hover:bg-coral-700">
                Start Browsing Items
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Ask Questions
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
