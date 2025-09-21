import { Coins, Percent, CreditCard, Users, Building2, TrendingUp, Calculator, Info, CheckCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function FeesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-coral-600 to-coral-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Coins className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Fees & Pricing</h1>
            <p className="text-xl text-coral-100">
              Transparent pricing with no hidden costs. We believe in fair and simple fee structures.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Service Fee Overview */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Service Fees</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-coral-200">
              <CardHeader>
                <CardTitle className="flex items-center text-coral-600">
                  <Percent className="h-6 w-6 mr-2" />
                  For Renters
                </CardTitle>
                <CardDescription>5% service fee on rental amount</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Applied to rental cost only</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Secure payment processing</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>24/7 customer support</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Dispute protection</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Platform maintenance</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-coral-200">
              <CardHeader>
                <CardTitle className="flex items-center text-coral-600">
                  <Building2 className="h-6 w-6 mr-2" />
                  For Listers
                </CardTitle>
                <CardDescription>5% service fee on rental amount</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Free listings</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Unlimited item listings</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Payment protection</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Marketing exposure</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Analytics dashboard</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fee Calculator */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Fee Calculator</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-6 w-6 mr-2 text-coral-600" />
                Estimate Your Costs
              </CardTitle>
              <CardDescription>
                See how fees apply to different rental scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Daily Rate (R)</label>
                  <input
                    type="number"
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="100"
                    defaultValue="100"
                    id="dailyRate"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rental Days</label>
                  <input
                    type="number"
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="7"
                    defaultValue="7"
                    id="rentalDays"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <input
                    type="number"
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="1"
                    defaultValue="1"
                    id="quantity"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium" id="subtotal">R700</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee (5%):</span>
                  <span className="font-medium text-coral-600" id="serviceFee">R35</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span id="total">R735</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-4">
                <Info className="h-4 w-4 inline mr-1" />
                Additional costs may include delivery fees and security deposits.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Fees */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Additional Fees</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Payment Processing</h3>
                <p className="text-gray-600 text-sm mb-3">
                  2.5% + R2.50 per transaction
                </p>
                <p className="text-xs text-gray-500">
                  Charged by payment providers for secure transaction processing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Featured Listings</h3>
                <p className="text-gray-600 text-sm mb-3">
                  R50 per week
                </p>
                <p className="text-xs text-gray-500">
                  Optional boost for increased visibility in search results
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Business Features</h3>
                <p className="text-gray-600 text-sm mb-3">
                  R199/month
                </p>
                <p className="text-xs text-gray-500">
                  Advanced business tools and team management
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Deposit Information */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Security Deposits</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-6 w-6 mr-2 text-coral-600" />
                How Deposits Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4 text-green-600">For Renters</h3>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Deposits are refundable</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Held securely in escrow</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Returned after successful return</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Protection against damage claims</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4 text-blue-600">For Listers</h3>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Protection for your items</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Coverage for damage or loss</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Quick dispute resolution</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Peace of mind guaranteed</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-coral-50 border border-coral-200 rounded-lg p-4 mt-6">
                <p className="text-coral-800 text-sm">
                  <strong>Note:</strong> Deposit amounts are set by listers based on item value and typically range from 10-50% of the item's worth.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Pricing */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Business Accounts</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <Building2 className="h-6 w-6 mr-2" />
                  Individual Listers
                </CardTitle>
                <CardDescription>Perfect for personal rentals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">Free</div>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Unlimited listings</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Basic analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Standard support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>5% service fee</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                POPULAR
              </div>
              <CardHeader>
                <CardTitle className="flex items-center text-purple-600">
                  <Users className="h-6 w-6 mr-2" />
                  Business Accounts
                </CardTitle>
                <CardDescription>For professional rental businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">R199<span className="text-lg font-normal">/month</span></div>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Everything in Individual</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Team management (5 users)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Custom branding</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Reduced service fee (4%)</span>
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/business">Start Free Trial</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Accepted Payment Methods</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-6 w-6 mr-2 text-coral-600" />
                Secure Payment Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">💳</div>
                  <h4 className="font-semibold">Credit/Debit Cards</h4>
                  <p className="text-xs text-gray-600">Visa, Mastercard</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">📱</div>
                  <h4 className="font-semibold">EFT</h4>
                  <p className="text-xs text-gray-600">Instant EFT</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">🏦</div>
                  <h4 className="font-semibold">Bank Transfer</h4>
                  <p className="text-xs text-gray-600">Standard transfer</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">💰</div>
                  <h4 className="font-semibold">Wallet</h4>
                  <p className="text-xs text-gray-600">Rentio balance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">When are fees charged?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Service fees are charged only when a booking is confirmed and payment is processed.
                  There are no upfront costs to list items or browse the platform.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Are there any hidden fees?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No, we believe in transparent pricing. The fees shown are exactly what you pay.
                  Any additional costs (like delivery fees) are clearly communicated before booking.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I get a refund?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Service fees are refundable if a booking is cancelled according to our cancellation policy.
                  Payment processing fees are non-refundable as they're charged by third-party providers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of South Africans already earning from their unused items.
            No listing fees, pay only when you earn.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard/listings">List Your First Item</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/browse">Browse Items</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}