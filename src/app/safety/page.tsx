import { Shield, Users, MapPin, Camera, MessageSquare, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-coral-600 to-coral-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Safety Tips for Renters & Listers</h1>
            <p className="text-xl text-coral-100">
              Your safety is our top priority. Follow these guidelines to ensure secure and successful rentals.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Quick Tips */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Essential Safety Guidelines</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 mr-2 text-coral-600" />
                  For Renters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p>Always verify the lister's KYC status before booking</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p>Read reviews and check the lister's response rate</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p>Meet in safe, public locations for item exchange</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p>Inspect items thoroughly before accepting</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-6 w-6 mr-2 text-coral-600" />
                  For Listers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p>Complete KYC verification to build trust</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p>Provide accurate, detailed item descriptions</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p>Take clear, honest photos of your items</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p>Communicate clearly through our messaging system</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Safety */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Payment Security</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-6 w-6 mr-2 text-coral-600" />
                Protected Transactions
              </CardTitle>
              <CardDescription>
                Our payment system ensures security for both parties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-coral-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Escrow Protection</h3>
                  <p className="text-gray-600 text-sm">
                    Funds are held securely until both parties confirm successful transaction
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-coral-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Secure Payments</h3>
                  <p className="text-gray-600 text-sm">
                    Multiple payment options with bank-level encryption and security
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-coral-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Dispute Resolution</h3>
                  <p className="text-gray-600 text-sm">
                    Fair mediation process for any transaction issues
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meeting Safety */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Safe Meeting Practices</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-coral-600" />
                  Recommended Meeting Locations
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Police station parking lots</li>
                  <li>• Shopping center security areas</li>
                  <li>• Well-lit public spaces</li>
                  <li>• Bank lobbies during business hours</li>
                  <li>• Coffee shops with security cameras</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-coral-600" />
                  Best Times to Meet
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Daylight hours (9 AM - 5 PM)</li>
                  <li>• Weekdays when businesses are open</li>
                  <li>• Avoid late evening or night meetings</li>
                  <li>• Choose times when the location is busy</li>
                  <li>• Allow plenty of time for inspection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Communication Guidelines */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Communication Best Practices</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-6 w-6 mr-2 text-coral-600" />
                Stay Within the Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-2">Warning: Off-Platform Communication</h4>
                      <p className="text-yellow-700 text-sm">
                        Always communicate through Rentio's messaging system. Moving to WhatsApp, email, or phone calls
                        removes your protection and makes you vulnerable to scams.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">✅ Do:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Ask detailed questions about the item</li>
                      <li>• Request additional photos if needed</li>
                      <li>• Discuss pickup/delivery arrangements</li>
                      <li>• Keep all communication documented</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">❌ Don't:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Share personal contact information</li>
                      <li>• Accept payment outside Rentio</li>
                      <li>• Click external links</li>
                      <li>• Send money without booking</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Item Inspection */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Item Inspection Checklist</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-6 w-6 mr-2 text-coral-600" />
                  Before Accepting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Check for damage not shown in photos</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Test all functions and features</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Verify accessories and included items</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Take photos of any existing damage</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Confirm rental period and return date</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-6 w-6 mr-2 text-coral-600" />
                  Before Returning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Clean the item thoroughly</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Check for new damage during use</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Return all accessories and packaging</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Get confirmation from the owner</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Complete return in the app</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reporting Issues */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Report Suspicious Activity</h2>
          <Card>
            <CardHeader>
              <CardTitle>When to Contact Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-red-600">Report Immediately:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Requests for payment outside Rentio</li>
                      <li>• Fake or misleading item photos</li>
                      <li>• Threats or harassment</li>
                      <li>• Attempts to steal personal information</li>
                      <li>• Items that don't match descriptions</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">How to Report:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Use the "Report" button on listings</li>
                      <li>• Contact support through dashboard</li>
                      <li>• Include screenshots and evidence</li>
                      <li>• Provide detailed descriptions</li>
                      <li>• Block suspicious users</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-blue-800 text-sm">
                    <strong>Emergency:</strong> If you feel unsafe during a meeting, leave immediately and contact
                    local authorities. Then report the incident to Rentio support.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Trust & Verification</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">KYC Verified</h3>
                <p className="text-gray-600 text-sm">
                  Users with verified identities have completed our Know Your Customer process
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Secure Payments</h3>
                <p className="text-gray-600 text-sm">
                  All transactions are protected by our secure payment system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Reviewed Profiles</h3>
                <p className="text-gray-600 text-sm">
                  Check user reviews and ratings to build confidence
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our support team is here to help with any safety concerns or questions about using Rentio securely.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}