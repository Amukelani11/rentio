import { Building2, Users, TrendingUp, Shield, Star, Clock, CheckCircle, ArrowRight, BarChart3, Calendar, MessageSquare, Package, CreditCard, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import PageSEO from '@/components/SEO/PageSEO'

export default function BusinessPage() {
  const faqData = [
    {
      question: "What is a Business account on Rentio?",
      answer: "A Business account is designed for companies and professional listers who want to manage multiple listings, team members, and access advanced business tools for their rental operations."
    },
    {
      question: "How much does a Business account cost?",
      answer: "Business accounts cost R199 per month plus a 3% transaction fee on successful rentals. This is lower than the standard 5% fee for individual accounts."
    },
    {
      question: "What features are included in the Business account?",
      answer: "Business accounts include team management, advanced analytics, priority support, custom branding options, inventory management, and API access for integrations."
    },
    {
      question: "Can I add team members to my Business account?",
      answer: "Yes, Business accounts allow you to add multiple team members with different permission levels, from administrators to customer service representatives."
    },
    {
      question: "What if I need more advanced features?",
      answer: "We offer Enterprise accounts with custom pricing for larger businesses that need additional features, dedicated support, and custom integrations."
    }
  ]

  return (
    <>
      <PageSEO
        title="Business Accounts | Rentio"
        description="Professional rental business solutions for South African companies. Manage teams, inventory, and grow your rental business with Rentio's business tools."
        keywords={[
          "business rental accounts south africa",
          "rental business tools",
          "professional rental management",
          "rental business platform",
          "corporate rental solutions",
          "rental business pricing",
          "rental team management",
          "rental business software",
          "south african rental business",
          "rental business growth"
        ]}
        canonical="https://rentio.co.za/business"
        openGraph={{
          type: 'article',
          title: 'Business Accounts | Rentio',
          description: 'Professional rental business solutions for South African companies.',
        }}
        faq={faqData}
        breadcrumbs={[
          { name: 'Home', url: 'https://rentio.co.za' },
          { name: 'Business', url: 'https://rentio.co.za/business' }
        ]}
      />
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Business Accounts</h1>
            <p className="text-xl text-purple-100 mb-6">
              Transform your rental business with powerful tools designed for professional listers
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Features Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Business Account?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Team Management</h3>
                <p className="text-gray-600">
                  Add up to 5 team members with role-based access control. Collaborate efficiently with your team.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Advanced Analytics</h3>
                <p className="text-gray-600">
                  Track performance metrics, revenue trends, and customer insights to grow your business.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Priority Support</h3>
                <p className="text-gray-600">
                  Get dedicated support with faster response times and priority access to new features.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Inventory Management</h3>
                <p className="text-gray-600">
                  Manage multiple locations, track stock levels, and automate rental workflows.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Booking Calendar</h3>
                <p className="text-gray-600">
                  Integrated calendar system to manage all your rentals in one place with automated reminders.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Custom Branding</h3>
                <p className="text-gray-600">
                  Showcase your business logo, customize your store page, and build brand recognition.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center">Choose Your Plan</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Individual Plan */}
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Individual</CardTitle>
                <CardDescription>For personal rentals</CardDescription>
                <div className="text-4xl font-bold mt-4">Free</div>
                <p className="text-gray-600">Forever</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Unlimited listings</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Basic analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Standard support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">5% service fee</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Mobile app access</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Business Plan */}
            <Card className="relative border-2 border-purple-600">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                MOST POPULAR
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Business</CardTitle>
                <CardDescription>For growing businesses</CardDescription>
                <div className="text-4xl font-bold mt-4">R199<span className="text-lg font-normal">/month</span></div>
                <p className="text-gray-600">Billed monthly</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Everything in Individual</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Team management (5 users)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Custom branding</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">4% service fee</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">API access</span>
                  </li>
                </ul>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription>For large businesses</CardDescription>
                <div className="text-4xl font-bold mt-4">Custom</div>
                <p className="text-gray-600">Tailored pricing</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Everything in Business</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Unlimited team members</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Custom integrations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Dedicated account manager</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">3% service fee</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">White-label options</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Custom features</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Business Tools */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center">Powerful Business Tools</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2 text-purple-600" />
                  Business Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Revenue Tracking</h4>
                    <p className="text-gray-600 text-sm">
                      Monitor your income, track trends, and identify your best-performing items and categories.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Customer Insights</h4>
                    <p className="text-gray-600 text-sm">
                      Understand your customers better with detailed rental patterns and preferences.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Performance Metrics</h4>
                    <p className="text-gray-600 text-sm">
                      Track booking rates, average rental duration, and customer satisfaction scores.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 mr-2 text-blue-600" />
                  Team Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Role-Based Access</h4>
                    <p className="text-gray-600 text-sm">
                      Assign different roles to team members with appropriate permissions and access levels.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Task Management</h4>
                    <p className="text-gray-600 text-sm">
                      Assign and track tasks related to pickups, deliveries, and customer communications.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Activity Logs</h4>
                    <p className="text-gray-600 text-sm">
                      Keep track of all team activities with detailed audit logs and activity tracking.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-6 w-6 mr-2 text-green-600" />
                  Inventory Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Multi-Location Support</h4>
                    <p className="text-gray-600 text-sm">
                      Manage inventory across multiple pickup locations or storage facilities.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Stock Level Tracking</h4>
                    <p className="text-gray-600 text-sm">
                      Monitor availability in real-time and set up automatic low-stock notifications.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Maintenance Scheduling</h4>
                    <p className="text-gray-600 text-sm">
                      Schedule maintenance and track repair history for all your rental items.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-6 w-6 mr-2 text-red-600" />
                  Customer Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Customer Database</h4>
                    <p className="text-gray-600 text-sm">
                      Build and maintain a comprehensive database of your customers and their rental history.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Automated Communication</h4>
                    <p className="text-gray-600 text-sm">
                      Send automated reminders, confirmations, and follow-up messages to customers.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Review Management</h4>
                    <p className="text-gray-600 text-sm">
                      Monitor and respond to customer reviews to maintain high service quality.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center">Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-coral-100 rounded-full flex items-center justify-center mr-3">
                    <Building2 className="h-6 w-6 text-coral-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Party Rentals SA</h4>
                    <p className="text-sm text-gray-600">Johannesburg</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  "The business account transformed our operations. We now manage 500+ items across 3 locations with ease."
                </p>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>300% revenue growth</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Tool Hire Express</h4>
                    <p className="text-sm text-gray-600">Cape Town</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  "Team management features allow us to coordinate 8 staff members seamlessly across multiple job sites."
                </p>
                <div className="flex items-center text-sm text-green-600">
                  <Users className="h-4 w-4 mr-1" />
                  <span>8 team members</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Event Equipment Co</h4>
                    <p className="text-sm text-gray-600">Durban</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  "The analytics dashboard helps us identify trends and optimize our inventory for maximum profit."
                </p>
                <div className="flex items-center text-sm text-green-600">
                  <Star className="h-4 w-4 mr-1" />
                  <span>4.9/5 rating</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Business vs Individual</h2>
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Feature</th>
                      <th className="text-center py-3 px-4">Individual</th>
                      <th className="text-center py-3 px-4">Business</th>
                      <th className="text-center py-3 px-4">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Team Members</td>
                      <td className="text-center py-3 px-4">1</td>
                      <td className="text-center py-3 px-4">5</td>
                      <td className="text-center py-3 px-4">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Service Fee</td>
                      <td className="text-center py-3 px-4">5%</td>
                      <td className="text-center py-3 px-4">4%</td>
                      <td className="text-center py-3 px-4">3%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Analytics</td>
                      <td className="text-center py-3 px-4">Basic</td>
                      <td className="text-center py-3 px-4">Advanced</td>
                      <td className="text-center py-3 px-4">Premium</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Support</td>
                      <td className="text-center py-3 px-4">Standard</td>
                      <td className="text-center py-3 px-4">Priority</td>
                      <td className="text-center py-3 px-4">24/7 Dedicated</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Custom Branding</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">API Access</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Monthly Cost</td>
                      <td className="text-center py-3 px-4">Free</td>
                      <td className="text-center py-3 px-4">R199</td>
                      <td className="text-center py-3 px-4">Custom</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I upgrade or downgrade my plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades apply at the next billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a contract or commitment?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  No, all business plans are month-to-month. You can cancel anytime without penalties.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  We accept credit/debit cards, EFT, and bank transfers for business account payments.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer training and onboarding?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Yes, business accounts include personalized onboarding and training sessions to help you get started.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-12 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of successful rental businesses using Rentio to streamline operations and increase revenue.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Start Free Trial
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline">
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  )
}