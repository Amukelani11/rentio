import { Coins, Percent, CreditCard, Users, Building2, TrendingUp, Calculator, Info, CheckCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import PageSEO from '@/components/SEO/PageSEO'

export default function FeesPage() {
  const faqData = [
    {
      question: "What percentage does Rentio charge for rentals?",
      answer: "Rentio charges a 5% service fee on successful rentals. This fee covers platform maintenance, payment processing, customer support, and security features."
    },
    {
      question: "Are there any hidden fees?",
      answer: "No, Rentio is transparent about all fees. We only charge a 5% service fee on successful rentals. There are no listing fees, monthly subscriptions, or hidden charges."
    },
    {
      question: "When are fees charged?",
      answer: "Fees are only charged when a rental is successfully completed and the renter confirms they received the item in good condition."
    },
    {
      question: "Do listers pay any fees?",
      answer: "Yes, listers pay the 5% service fee on successful rentals. This is automatically deducted from the rental payment when the transaction is completed."
    },
    {
      question: "Is there a fee for business accounts?",
      answer: "Business accounts have different pricing tiers. Individual/Free accounts pay 5% per transaction, Business accounts pay R199/month + 3% per transaction, and Enterprise accounts have custom pricing."
    }
  ]

  return (
    <>
      <PageSEO
        title="Fees & Pricing | Rentio"
        description="Transparent pricing structure for Rentio's peer-to-peer rental marketplace in South Africa. No hidden fees, just 5% service fee on successful rentals."
        keywords={[
          "rental fees south africa",
          "peer to peer rental pricing",
          "rental marketplace fees",
          "rental service charges",
          "rental commission rates",
          "rental platform pricing",
          "south african rental costs",
          "rental transaction fees",
          "rental pricing structure",
          "rental marketplace costs"
        ]}
        canonical="https://rentio.co.za/fees"
        openGraph={{
          type: 'article',
          title: 'Fees & Pricing | Rentio',
          description: 'Transparent pricing structure for Rentio\'s peer-to-peer rental marketplace in South Africa.',
        }}
        faq={faqData}
        breadcrumbs={[
          { name: 'Home', url: 'https://rentio.co.za' },
          { name: 'Fees & Pricing', url: 'https://rentio.co.za/fees' }
        ]}
      />
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
                <CardDescription>15% service fee on rental amount</CardDescription>
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
                <div className="text-center mb-3">
                  <h4 className="font-semibold text-gray-700">Example Calculation</h4>
                  <p className="text-sm text-gray-600">R100/day × 7 days × 1 item</p>
                </div>
                <div className="flex justify-between">
                  <span>Rental Subtotal:</span>
                  <span className="font-medium" id="subtotal">R700</span>
                </div>
                <div className="flex justify-between">
                  <span>Renter Service Fee (5%):</span>
                  <span className="font-medium text-coral-600" id="renterFee">R35</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total for Renter:</span>
                  <span id="renterTotal">R735</span>
                </div>
                <div className="border-t pt-3 bg-blue-50 -mx-4 px-4 py-3 mt-4">
                  <div className="flex justify-between">
                    <span>Lister Service Fee (15%):</span>
                    <span className="font-medium text-blue-600" id="listerFee">R105</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Lister Receives:</span>
                    <span id="listerTotal">R595</span>
                  </div>
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
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Payment Processing</h3>
                <p className="text-gray-600 text-sm mb-3">
                  No additional fees
                </p>
                <p className="text-xs text-gray-500">
                  Payment processing is included in our service fee
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
                  Since payment processing is included in our service fee, there are no additional charges.
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
  </>
  )
}