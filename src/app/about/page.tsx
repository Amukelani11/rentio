import { Heart, Users, MapPin, Award, Target, Star, Shield, TrendingUp, Building2, Camera, MessageSquare, Calendar, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function AboutPage() {
  const team = [
    {
      name: "Thabo Nkosi",
      role: "CEO & Founder",
      bio: "Former rental business owner with 10+ years experience in the South African market",
      image: "/assets/team/thabo.jpg"
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      bio: "Full-stack developer passionate about building scalable marketplace platforms",
      image: "/assets/team/sarah.jpg"
    },
    {
      name: "Lerato Mokoena",
      role: "Head of Operations",
      bio: "Operations expert with background in logistics and customer service",
      image: "/assets/team/lerato.jpg"
    },
    {
      name: "David van der Merwe",
      role: "Head of Marketing",
      bio: "Marketing specialist focused on community building and growth strategies",
      image: "/assets/team/david.jpg"
    }
  ]

  const stats = [
    { number: "50,000+", label: "Active Users" },
    { number: "25,000+", label: "Items Listed" },
    { number: "R2M+", label: "Monthly Transactions" },
    { number: "98%", label: "Customer Satisfaction" }
  ]

  const values = [
    {
      icon: Heart,
      title: "Community First",
      description: "Building trust and connections within local communities across South Africa"
    },
    {
      icon: Shield,
      title: "Security & Trust",
      description: "KYC verification, secure payments, and comprehensive protection for all users"
    },
    {
      icon: Target,
      title: "Accessibility",
      description: "Making rental affordable and accessible to everyone, everywhere in South Africa"
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description: "Continuously improving our platform with cutting-edge technology and features"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-coral-600 to-coral-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <Heart className="h-12 w-12 text-coral-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6">About Rentio</h1>
            <p className="text-xl text-coral-100 mb-8 max-w-3xl mx-auto">
              We're building South Africa's trusted peer-to-peer and business rental marketplace.
              Our mission is to make renting accessible, affordable, and secure for everyone.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-white text-coral-600 hover:bg-gray-100">
                Join Our Community
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-coral-600">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Stats */}
        <div className="mb-16">
          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-coral-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Story</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-coral-600">The Problem We Solved</h3>
                  <p className="text-gray-600 leading-relaxed">
                    In South Africa, millions of valuable items sit unused in garages, storage units, and closets.
                    Meanwhile, people constantly need temporary access to these same items for short-term use.
                    The traditional rental market was fragmented, expensive, and lacked trust.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-coral-600">Our Solution</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Founded in 2023, Rentio was created to connect South Africans who have items to rent with those
                    who need them. We built a secure, user-friendly platform that handles everything from discovery
                    and booking to payments and dispute resolution.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-coral-600">Growing Together</h3>
                  <p className="text-gray-600 leading-relaxed">
                    From our first listing in Johannesburg to serving communities across all nine provinces,
                    we've remained committed to our mission of making rental accessible to every South African.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-coral-50 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">🏠</div>
                <h4 className="font-semibold mb-2">Homes Served</h4>
                <p className="text-2xl font-bold text-coral-600">15,000+</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">🏪</div>
                <h4 className="font-semibold mb-2">Business Partners</h4>
                <p className="text-2xl font-bold text-blue-600">2,500+</p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">🌍</div>
                <h4 className="font-semibold mb-2">Cities Covered</h4>
                <p className="text-2xl font-bold text-green-600">50+</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">⭐</div>
                <h4 className="font-semibold mb-2">Happy Rentals</h4>
                <p className="text-2xl font-bold text-purple-600">100,000+</p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-coral-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">For Renters</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Access to thousands of items</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Verified and trusted listers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Secure payment protection</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Flexible rental periods</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>24/7 customer support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">For Listers</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Free unlimited listings</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Reach millions of users</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Business tools & analytics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Team management</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Marketing exposure</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">For Everyone</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>KYC verification system</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Secure payment processing</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Dispute resolution</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Community reviews</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Mobile app access</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <Users className="h-8 w-8 text-gray-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                  <Badge className="mb-3 bg-coral-600 text-white">{member.role}</Badge>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Impact */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Impact</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-green-600">Environmental Impact</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Reduced Waste</h4>
                      <p className="text-gray-600 text-sm">500+ tons of items reused instead of discarded</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Local Economy</h4>
                      <p className="text-gray-600 text-sm">R50M+ generated for local communities</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Income Generation</h4>
                      <p className="text-gray-600 text-sm">10,000+ earners supplementing their income</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-blue-600">Community Focus</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                      <Heart className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Trust Building</h4>
                      <p className="text-gray-600 text-sm">25,000+ KYC verified users</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                      <MessageSquare className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Support System</h4>
                      <p className="text-gray-600 text-sm">24/7 multilingual customer support</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                      <Award className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Recognition</h4>
                      <p className="text-gray-600 text-sm">Awarded "Startup of the Year 2023"</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Press & Recognition */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center">In The News</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-4xl mb-4">📰</div>
                <h3 className="font-semibold mb-2">TechCabal</h3>
                <p className="text-gray-600 text-sm mb-4">
                  "Rentio is revolutionizing the sharing economy in South Africa with its focus on security and trust."
                </p>
                <a href="#" className="text-coral-600 text-sm hover:underline">Read more →</a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="font-semibold mb-2">Startup Awards SA</h3>
                <p className="text-gray-600 text-sm mb-4">
                  "Winner of Most Innovative Platform 2023 for their groundbreaking rental marketplace solution."
                </p>
                <a href="#" className="text-coral-600 text-sm hover:underline">Read more →</a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="font-semibold mb-2">BusinessTech</h3>
                <p className="text-gray-600 text-sm mb-4">
                  "How Rentio is helping South Africans turn unused items into income streams."
                </p>
                <a href="#" className="text-coral-600 text-sm hover:underline">Read more →</a>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Join Us */}
        <div className="text-center py-12 bg-gradient-to-r from-coral-50 to-blue-50 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Join the Rentio Community</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Whether you're looking to rent items, list your belongings, or grow your rental business,
            we have the tools and community to help you succeed.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-coral-600 hover:bg-coral-700">
              Get Started
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}