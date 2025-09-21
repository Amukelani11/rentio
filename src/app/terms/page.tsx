import { FileText, Shield, Users, CreditCard, MapPin, AlertTriangle, CheckCircle, Calendar, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PageSEO from '@/components/SEO/PageSEO'

export default function TermsPage() {
  const faqData = [
    {
      question: "What are the main terms of using Rentio?",
      answer: "The main terms include eligibility requirements (18+ years old), proper account registration, following listing guidelines, secure payment processing, and maintaining professional conduct with other users."
    },
    {
      question: "What items are prohibited from being rented on Rentio?",
      answer: "Prohibited items include illegal goods, weapons, stolen property, hazardous materials, prescription medications, and any items that violate South African law or platform policies."
    },
    {
      question: "How does Rentio handle payment disputes?",
      answer: "Rentio provides a structured dispute resolution process. Users can report issues, which are reviewed by our team. We may hold payments in escrow until disputes are resolved fairly."
    },
    {
      question: "What are my responsibilities as a user?",
      answer: "Users must provide accurate information, maintain professional communication, follow safety guidelines, comply with South African laws, and respect the rights and property of others."
    },
    {
      question: "How can I terminate my Rentio account?",
      answer: "You can terminate your account by contacting support. Active rentals must be completed, and any pending payments or disputes must be resolved before account closure."
    }
  ]

  return (
    <>
      <PageSEO
        title="Terms of Service | Rentio"
        description="Comprehensive terms of service for Rentio's peer-to-peer rental marketplace in South Africa. Understand your rights and responsibilities."
        keywords={[
          "rental terms of service",
          "peer to peer rental terms",
          "south african rental agreement",
          "rental platform terms",
          "rental marketplace policies",
          "rental user agreement",
          "rental terms and conditions",
          "south african rental terms",
          "rental platform policies",
          "rental marketplace rules"
        ]}
        canonical="https://rentio.co.za/terms"
        openGraph={{
          type: 'article',
          title: 'Terms of Service | Rentio',
          description: 'Comprehensive terms of service for Rentio\'s peer-to-peer rental marketplace.',
        }}
        faq={faqData}
        breadcrumbs={[
          { name: 'Home', url: 'https://rentio.co.za' },
          { name: 'Terms of Service', url: 'https://rentio.co.za/terms' }
        ]}
      />
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <FileText className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-gray-200">
              Please read these terms carefully before using Rentio's services.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Last Updated */}
        <div className="mb-8 text-center">
          <Badge variant="outline" className="text-sm">
            <Calendar className="h-3 w-3 mr-1" />
            Last Updated: January 2024
          </Badge>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-6 w-6 mr-2 text-gray-600" />
              1. Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Welcome to Rentio ("Platform"), South Africa's peer-to-peer and business rental marketplace.
              These Terms of Service ("Terms") govern your use of Rentio's services, website, mobile applications,
              and all related services (collectively, the "Service").
            </p>
            <p className="text-gray-600">
              By accessing or using our Service, you agree to be bound by these Terms. If you do not agree
              to these Terms, please do not use our Service.
            </p>
          </CardContent>
        </Card>

        {/* Acceptance of Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
              2. Acceptance of Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              By creating an account, using our Service, or clicking "I Agree" during registration, you
              acknowledge that you have read, understood, and agree to be bound by these Terms.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Important:</strong> These Terms constitute a legally binding agreement between you and Rentio.
                If you are using the Service on behalf of a business or entity, you represent that you have the
                authority to bind such entity to these Terms.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Eligibility */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-6 w-6 mr-2 text-blue-600" />
              3. Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              To use Rentio's Service, you must:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Be at least 18 years of age</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Have the legal capacity to enter into binding contracts</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Provide accurate and complete registration information</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Have a valid South African ID or proof of residence</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Not be prohibited from using the Service under applicable laws</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Account Registration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-6 w-6 mr-2 text-purple-600" />
              4. Account Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              To use certain features of our Service, you must register for an account. You agree to:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Provide accurate, current, and complete information</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Maintain and update your information to keep it accurate</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Keep your password secure and confidential</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Not share your account with others</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Promptly notify us of any unauthorized use</span>
              </li>
            </ul>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>KYC Verification:</strong> All users must complete Know Your Customer (KYC) verification before
                listing items or making bookings. This helps ensure the safety and security of our platform.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-6 w-6 mr-2 text-green-600" />
              5. User Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">For All Users:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Comply with all applicable laws</li>
                  <li>• Use the Service for lawful purposes only</li>
                  <li>• Respect other users' rights</li>
                  <li>• Not engage in fraudulent activity</li>
                  <li>• Not attempt to harm the platform</li>
                  <li>• Not use automated systems or bots</li>
                  <li>• Not impersonate others</li>
                  <li>• Provide accurate item information</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Prohibited Activities:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Listing illegal or prohibited items</li>
                  <li>• Discriminatory practices</li>
                  <li>• Harassment or bullying</li>
                  <li>• Spam or unsolicited communications</li>
                  <li>• Violating intellectual property rights</li>
                  <li>• Circumventing platform fees</li>
                  <li>• Sharing personal contact information</li>
                  <li>• Engaging in off-platform transactions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings and Items */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-6 w-6 mr-2 text-coral-600" />
              6. Listings and Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Listing Requirements:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Accurate and truthful descriptions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Clear, honest photos of actual items</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Complete pricing information</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Availability and rental terms</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Location and pickup/delivery options</span>
                </li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                <strong>Prohibited Items:</strong> Weapons, illegal substances, stolen property, hazardous materials,
                counterfeit goods, items requiring special licenses, and any items prohibited by South African law.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bookings and Payments */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
              7. Bookings and Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Payment Terms:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Service fee: 5% of rental amount (4% for business accounts)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Payment processing: 2.5% + R2.50 per transaction</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Security deposits held in escrow</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Payouts processed within 3-5 business days</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Booking Policies:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>All bookings must be made through the platform</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Cancellation policies vary by listing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Disputes must be reported within 24 hours</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Damage claims require photographic evidence</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Fees and Payments */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-6 w-6 mr-2 text-green-600" />
              8. Fees and Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-coral-600">For Renters:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 5% service fee on rental amount</li>
                  <li>• Payment processing fees apply</li>
                  <li>• Security deposits (refundable)</li>
                  <li>• Delivery fees (if applicable)</li>
                  <li>• No hidden or surprise charges</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-blue-600">For Listers:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 5% service fee on earnings</li>
                  <li>• 4% for business accounts</li>
                  <li>• Payout processing fees</li>
                  <li>• Optional listing promotion fees</li>
                  <li>• No upfront listing costs</li>
                </ul>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                <strong>Tax Responsibility:</strong> Users are responsible for their own tax obligations,
                including income tax on rental earnings and VAT where applicable.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Prohibited Activities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
              9. Prohibited Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              You may not engage in any of the following activities while using Rentio:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-red-600">Strictly Prohibited:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Fraud or misrepresentation</li>
                  <li>• Identity theft or impersonation</li>
                  <li>• Money laundering</li>
                  <li>• Harassment or discrimination</li>
                  <li>• Hacking or security breaches</li>
                  <li>• Spam or bulk messaging</li>
                  <li>• Circumventing platform fees</li>
                  <li>• Off-platform transactions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-orange-600">Content Restrictions:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Illegal or harmful content</li>
                  <li>• Hate speech or discrimination</li>
                  <li>• Adult content</li>
                  <li>• False or misleading information</li>
                  <li>• Personal contact information</li>
                  <li>• External links to harmful sites</li>
                  <li>• Copyrighted material without permission</li>
                  <li>• Inappropriate or offensive content</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-6 w-6 mr-2 text-purple-600" />
              10. Intellectual Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Rentio and its licensors own all rights, title, and interest in the Service, including all
              intellectual property rights. You are granted a limited, non-exclusive, non-transferable
              license to use the Service for your personal or business use.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800 text-sm">
                <strong>User Content:</strong> You retain ownership of content you submit to Rentio. By submitting content,
                you grant Rentio a worldwide, royalty-free license to use, display, and distribute your content
                solely for the purpose of operating and improving the Service.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy and Data */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-6 w-6 mr-2 text-green-600" />
              11. Privacy and Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Your privacy is important to us. Our collection, use, and protection of your personal
              information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>We collect information necessary to provide our services</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>We use industry-standard security measures</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>We do not sell your personal information</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>You can access and update your information</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Disclaimers and Limitations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-yellow-600" />
              12. Disclaimers and Limitations of Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Rentio provides a platform to connect users but does not guarantee the quality, safety,
              or legality of items listed or users on the platform.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Disclaimer:</strong> The Service is provided "as is" and "as available" without warranties
                of any kind, either express or implied. Rentio disclaims all liability for damages arising
                from your use of the Service.
              </p>
            </div>
            <p className="text-gray-600">
              In no event shall Rentio be liable for any indirect, incidental, special, consequential,
              or punitive damages arising from your use of the Service.
            </p>
          </CardContent>
        </Card>

        {/* Indemnification */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="h-6 w-6 mr-2 text-indigo-600" />
              13. Indemnification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You agree to indemnify and hold harmless Rentio, its affiliates, officers, directors,
              employees, and agents from any claims, damages, liabilities, costs, and fees (including
              reasonable attorneys' fees) arising from:
            </p>
            <ul className="mt-3 space-y-1 text-sm text-gray-600">
              <li>• Your use of the Service</li>
              <li>• Your violation of these Terms</li>
              <li>• Your infringement of third-party rights</li>
              <li>• Your interactions with other users</li>
              <li>• Your listings or bookings</li>
            </ul>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
              14. Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Rentio reserves the right to suspend or terminate your account and access to the Service
              at any time, with or without notice, for any reason, including:
            </p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Violation of these Terms</li>
              <li>• Fraudulent or suspicious activity</li>
              <li>• Harm to other users or the platform</li>
              <li>• Legal or regulatory requirements</li>
              <li>• Inactivity for extended periods</li>
            </ul>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                <strong>Effect of Termination:</strong> Upon termination, your right to use the Service ceases immediately.
                Sections regarding fees, liability, and indemnification survive termination.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="h-6 w-6 mr-2 text-blue-600" />
              15. Governing Law and Dispute Resolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              These Terms are governed by the laws of South Africa. Any disputes arising from these Terms
              or your use of the Service shall be resolved through binding arbitration in Johannesburg,
              South Africa, in accordance with the Arbitration Act of 1965.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-6 w-6 mr-2 text-gray-600" />
              16. Changes to Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Rentio reserves the right to modify these Terms at any time. We will notify users of
              material changes by posting the updated Terms on the platform and/or sending email notifications.
              Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-6 w-6 mr-2 text-coral-600" />
              17. Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> legal@rentio.co.za</p>
              <p><strong>Phone:</strong> +27 10 123 4567</p>
              <p><strong>Address:</strong> 123 Rivonia Road, Sandton, Johannesburg, 2196</p>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance */}
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            By continuing to use Rentio's services, you acknowledge that you have read, understood,
            and agree to be bound by these Terms of Service.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-coral-600 hover:bg-coral-700">
              I Accept These Terms
            </Button>
            <Button size="lg" variant="outline">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}