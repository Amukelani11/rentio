import { Shield, FileText, CreditCard, Clock, AlertTriangle, Users, CheckCircle, Scale, Camera, Phone } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function RentalPolicyPage() {
  const lastUpdated = "December 2024"

  const policyHighlights = [
    {
      icon: Shield,
      title: "Secure Payments",
      description: "All payments processed securely through Rentio with full deposit protection"
    },
    {
      icon: Clock,
      title: "Flexible Cancellations",
      description: "24+ hours: 100% refund. <24 hours: 50% refund of rental fees"
    },
    {
      icon: Scale,
      title: "Fair Dispute Resolution",
      description: "Structured process for handling disagreements with evidence-based decisions"
    },
    {
      icon: CheckCircle,
      title: "Consumer Protection",
      description: "Compliant with South African CPA and POPIA regulations"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-coral-600 to-coral-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <FileText className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Rental Policy</h1>
            <p className="text-xl text-coral-100">
              Fair, transparent rules that protect everyone in our marketplace
            </p>
            <Badge className="mt-4 bg-coral-100 text-coral-700">
              Last updated: {lastUpdated}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Policy Highlights */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Key Protections</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {policyHighlights.map((highlight, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <highlight.icon className="h-6 w-6 text-coral-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{highlight.title}</h3>
                  <p className="text-sm text-gray-600">{highlight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 1. General Policy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-6 w-6 mr-2 text-coral-600" />
              1. General Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Rentio operates as a <strong>marketplace platform</strong> connecting renters and listers (individuals or businesses).</li>
              <li>Rentio does not own or supply the listed items. All rentals are agreements between the renter and the lister, facilitated by the platform.</li>
              <li>By booking or listing on Rentio, users agree to comply with this Rental Policy, the Terms & Conditions, and applicable South African law.</li>
              <li>All users must complete identity verification (KYC) before participating in transactions.</li>
              <li>Rentio reserves the right to suspend or terminate accounts for policy violations.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 2. Eligibility */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-coral-600" />
              2. Eligibility Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">For Renters:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Must be at least <strong>18 years old</strong> with a valid South African ID, passport, or permanent residence permit</li>
                <li>Provide a valid email address and phone number for verification</li>
                <li>For vehicle rentals or regulated items, must hold the required licenses (driver's license, professional certifications, etc.)</li>
                <li>Must have a valid payment method (credit card, debit card, or bank account)</li>
                <li>Not be banned or suspended from the platform</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">For Listers:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Must be at least <strong>18 years old</strong> with valid South African documentation</li>
                <li>Provide proof of ownership or legal right to rent listed items</li>
                <li>Maintain items in safe, clean, and working condition</li>
                <li>Complete business verification for business accounts</li>
                <li>Comply with local regulations and licensing requirements for their rental category</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 3. Booking & Payments */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-6 w-6 mr-2 text-coral-600" />
              3. Booking & Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>All rentals must be booked and paid through Rentio's secure payment system - no offline payments allowed.</li>
              <li><strong>Payment is processed upfront</strong> and includes:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Rental fee (daily, weekly, or monthly rate as listed)</li>
                  <li>Security deposit (refundable, set by lister)</li>
                  <li>Service fees: 5% for renters, 15% for listers</li>
                  <li>Delivery fees (if applicable)</li>
                </ul>
              </li>
              <li>Rentio releases payment to the lister <strong>24 hours after the rental period begins</strong>, minus service fees.</li>
              <li>Deposits are held in escrow until the item is returned and cleared by the lister.</li>
              <li>All payments are processed in South African Rand (ZAR).</li>
              <li>Payment confirmations and receipts are sent via email and available in your dashboard.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 4. Deposits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-6 w-6 mr-2 text-coral-600" />
              4. Security Deposits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Listers may require a refundable security deposit ranging from 10% to 100% of the item's value.</li>
              <li>Deposits are held securely by Rentio in a separate escrow account.</li>
              <li>Deposits are returned within <strong>5-7 working days</strong> after successful return, less any approved deductions.</li>
              <li><strong>Valid deductions include:</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Repair costs for damage beyond normal wear and tear</li>
                  <li>Replacement costs for lost or stolen items</li>
                  <li>Professional cleaning fees (if item returned excessively dirty)</li>
                  <li>Late return fees as specified in the listing</li>
                </ul>
              </li>
              <li>Disputes over deductions are handled under Section 10 (Disputes) with evidence requirements.</li>
              <li>Maximum deposit amount is capped at R50,000 per item for consumer protection.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 5. Cancellations & Refunds */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-6 w-6 mr-2 text-coral-600" />
              5. Cancellations & Refunds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3 text-coral-600">5.1 Renter Cancellations</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-100 rounded">
                  <span><strong>24+ hours before start:</strong></span>
                  <span className="text-green-700 font-semibold">100% refund of all fees + deposit</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-100 rounded">
                  <span><strong>Less than 24 hours:</strong></span>
                  <span className="text-yellow-700 font-semibold">50% rental fee + full deposit refund</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-100 rounded">
                  <span><strong>After rental started:</strong></span>
                  <span className="text-red-700 font-semibold">No rental fee refund; deposit still refundable</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-coral-600">5.2 Lister Cancellations</h4>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>If a lister cancels a confirmed booking: <strong>Full refund</strong> (rental fee + deposit + service fees)</li>
                <li>Automatic R200 penalty fee charged to lister for confirmed booking cancellations</li>
                <li>Repeated cancellations result in profile ranking reduction and potential account suspension</li>
                <li>Emergency cancellations (medical, family emergency) may be exempt from penalties with documentation</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-coral-600">5.3 Force Majeure (Unforeseen Circumstances)</h4>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Natural disasters, government restrictions, national emergencies, or severe weather conditions</li>
                <li>Official travel bans or lockdown orders affecting the rental location</li>
                <li>Rentio may issue full or partial refunds at its discretion, overriding standard cancellation policies</li>
                <li>Both parties are notified immediately with alternative solutions where possible</li>
              </ul>
            </div>

            <div className="bg-coral-50 border border-coral-200 rounded-lg p-4">
              <p className="text-coral-800 text-sm">
                <strong>Refund Processing:</strong> All refunds are processed within 5-10 working days to the original payment method. 
                Bank processing times may add 3-5 additional business days.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 6. Late Returns & Extensions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-coral-600" />
              6. Late Returns & Extensions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-coral-600">Late Return Fees:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Charged per hour/day at a rate set by the lister (minimum: daily rate × 1.5)</li>
                <li>First 2 hours late: Warning period with no fees (lister discretion)</li>
                <li>Grace period applies only once per renter per lister</li>
                <li>Late fees are automatically calculated and deducted from deposits</li>
                <li>Maximum late fee: 200% of daily rental rate per day</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 text-coral-600">Extensions:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Renters can request extensions via the platform <strong>before</strong> the original end time</li>
                <li>Extensions require lister approval and may be subject to availability</li>
                <li>Additional payment is processed once the extension is confirmed</li>
                <li>Extension rates may differ from original booking rates</li>
                <li>Last-minute extension requests (within 4 hours of return) may incur premium rates</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 7. Damage, Loss & Theft */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="h-6 w-6 mr-2 text-coral-600" />
              7. Damage, Loss & Theft
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 text-sm">
                <strong>Important:</strong> Both parties must document item condition with photos at handover and return. 
                This is your primary protection against disputes.
              </p>
            </div>

            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Renters are responsible for returning items in the same condition as received (normal wear and tear excepted)</li>
              <li><strong>Damage Reporting Process:</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Lister must report damage within <strong>24 hours</strong> of return via the platform</li>
                  <li>Must provide photographic evidence of damage</li>
                  <li>Must provide repair quotes from reputable service providers</li>
                  <li>Rentio mediates disputes and makes final decisions on deductions</li>
                </ul>
              </li>
              <li><strong>Loss & Theft:</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Must be reported immediately to Rentio and local police</li>
                  <li>Police case number required for theft claims</li>
                  <li>Replacement value based on current market prices, depreciated for used items</li>
                  <li>If deposit is insufficient, renter remains liable for the balance</li>
                </ul>
              </li>
              <li><strong>High-Value Items:</strong> Electronics over R10,000, vehicles, and specialized equipment may require:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Proof of insurance or liability coverage</li>
                  <li>Additional identity verification</li>
                  <li>Signed liability waivers</li>
                  <li>Higher security deposits</li>
                </ul>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 8. Lister Responsibilities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-6 w-6 mr-2 text-coral-600" />
              8. Lister Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Item Condition:</strong> Maintain items in good, safe, and usable condition with regular maintenance</li>
              <li><strong>Accurate Listings:</strong> Provide truthful descriptions, recent photos, and correct pricing</li>
              <li><strong>Clear Requirements:</strong> State all requirements (licenses, deposits, delivery/collection rules, usage restrictions)</li>
              <li><strong>Availability:</strong> Keep calendar updated and honor confirmed bookings unless force majeure applies</li>
              <li><strong>Communication:</strong> Respond to renter messages within 4 hours during business hours</li>
              <li><strong>Safety Compliance:</strong> Ensure items meet South African safety standards and regulations</li>
              <li><strong>Insurance:</strong> Maintain appropriate insurance for high-value or specialized items</li>
              <li><strong>Handover Process:</strong> Provide clear instructions, demonstrate usage if needed, document condition</li>
            </ul>
          </CardContent>
        </Card>

        {/* 9. Renter Responsibilities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-coral-600" />
              9. Renter Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Intended Use Only:</strong> Use rented items only for their intended purpose as described in the listing</li>
              <li><strong>Timely Return:</strong> Return items on time, in the same condition, and to the agreed location</li>
              <li><strong>Immediate Reporting:</strong> Report issues, damages, or malfunctions immediately to the lister and Rentio</li>
              <li><strong>No Sub-renting:</strong> Not permitted to sub-rent, lend, or transfer items to third parties</li>
              <li><strong>Care & Maintenance:</strong> Handle items with reasonable care and follow usage instructions</li>
              <li><strong>Security:</strong> Keep items secure and not leave them unattended in public places</li>
              <li><strong>Legal Compliance:</strong> Comply with all local laws and regulations when using rented items</li>
              <li><strong>Documentation:</strong> Take photos at pickup and return to document condition</li>
            </ul>
          </CardContent>
        </Card>

        {/* 10. Disputes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="h-6 w-6 mr-2 text-coral-600" />
              10. Dispute Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Dispute Process:</h4>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li><strong>Direct Resolution (48 hours):</strong> Parties attempt to resolve directly through platform messaging</li>
                <li><strong>Formal Complaint:</strong> Submit dispute claim with evidence within 7 days of rental end</li>
                <li><strong>Rentio Review:</strong> Our team reviews all evidence and makes a decision within 5-10 business days</li>
                <li><strong>Final Decision:</strong> Rentio's decision is binding, except where South African law provides otherwise</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Required Evidence:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Photos of item condition (before and after)</li>
                <li>Screenshots of all communications</li>
                <li>Receipts for repair/replacement costs</li>
                <li>Police reports (for theft claims)</li>
                <li>Professional assessments (for high-value disputes)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Escalation Options:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Consumer Protection Authority (CPA) for consumer rights violations</li>
                <li>South African Small Claims Court for amounts under R20,000</li>
                <li>Alternative Dispute Resolution (ADR) for larger amounts</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 11. Insurance & Liability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-6 w-6 mr-2 text-coral-600" />
              11. Insurance & Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>General Liability:</strong> Renters assume responsibility for rented items during the rental period</li>
              <li><strong>Category-Specific Insurance:</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Vehicles: Valid insurance required, liability coverage confirmed</li>
                  <li>Electronics: Optional damage protection available for premium</li>
                  <li>Tools/Equipment: Public liability coverage recommended</li>
                </ul>
              </li>
              <li><strong>Rentio Platform Liability:</strong> Limited to service fees collected per transaction</li>
              <li><strong>Personal Injury:</strong> Users responsible for their own safety and medical coverage</li>
              <li><strong>Third-Party Claims:</strong> Users indemnify Rentio against claims arising from rental usage</li>
              <li><strong>Force Majeure:</strong> Rentio not liable for losses due to circumstances beyond our control</li>
            </ul>

            <div className="bg-coral-50 border border-coral-200 rounded-lg p-4">
              <p className="text-coral-800 text-sm">
                <strong>Insurance Recommendations:</strong> Consider comprehensive personal liability insurance or specific 
                rental insurance for high-value items. Check with your insurance provider about coverage during rentals.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 12. Prohibited Items */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
              12. Prohibited Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm font-semibold">
                The following items may NOT be listed on Rentio:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-red-600">Illegal & Dangerous:</h4>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Illegal goods or substances</li>
                  <li>Firearms, ammunition, explosives</li>
                  <li>Hazardous chemicals or materials</li>
                  <li>Medical devices requiring prescriptions</li>
                  <li>Surveillance equipment without permits</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-red-600">Restricted Categories:</h4>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Perishable food items</li>
                  <li>Live animals or pets</li>
                  <li>Personal hygiene items</li>
                  <li>Items with expired safety certifications</li>
                  <li>Stolen or counterfeit goods</li>
                </ul>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Special Licensing Required:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Vehicles (driver's license verification)</li>
                <li>Power tools (safety certification may be required)</li>
                <li>Professional equipment (qualification verification)</li>
                <li>Event items requiring permits (sound systems, marquees)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 13. Privacy & Data */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-6 w-6 mr-2 text-coral-600" />
              13. Privacy & Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Data Collection:</strong> We collect personal information for verification, fraud prevention, and transaction processing</li>
              <li><strong>POPIA Compliance:</strong> All data handling complies with South Africa's Protection of Personal Information Act</li>
              <li><strong>KYC Documents:</strong> Identity documents stored securely and deleted after verification period</li>
              <li><strong>Communication Records:</strong> Platform messages retained for dispute resolution purposes</li>
              <li><strong>Third-Party Sharing:</strong> Limited to payment processors, identity verification services, and legal requirements</li>
              <li><strong>Data Retention:</strong> Personal data deleted within 7 years of account closure unless legally required</li>
              <li><strong>User Rights:</strong> Access, correction, deletion, and portability of personal data available on request</li>
            </ul>

            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="text-sm text-gray-700">
                <strong>Contact for Privacy Matters:</strong> <a href="mailto:privacy@rentio.co.za" className="text-coral-600">privacy@rentio.co.za</a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 14. Policy Amendments */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-6 w-6 mr-2 text-coral-600" />
              14. Policy Amendments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Rentio may amend this Rental Policy with 30 days advance notice for major changes</li>
              <li>Minor clarifications and updates may be made with immediate effect</li>
              <li>Users notified via email, in-app notifications, and website announcements</li>
              <li>Continued use of the platform constitutes acceptance of updated terms</li>
              <li>Previous policy versions available upon request for reference</li>
              <li>Significant changes require re-acceptance before next transaction</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact & Support */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-6 w-6 mr-2 text-coral-600" />
              15. Contact & Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">General Support:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>Email: <a href="mailto:support@rentio.co.za" className="text-coral-600">support@rentio.co.za</a></li>
                  <li>Phone: <a href="tel:+27123456789" className="text-coral-600">+27 12 345 6789</a></li>
                  <li>Hours: Mon-Fri 8AM-6PM SAST</li>
                  <li>Response time: Within 4 hours</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Emergency & Disputes:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>Emergency: <a href="tel:+27123456999" className="text-coral-600">+27 12 345 6999</a></li>
                  <li>24/7 WhatsApp: <a href="https://wa.me/27123456789" className="text-coral-600">+27 12 345 6789</a></li>
                  <li>Disputes: <a href="mailto:disputes@rentio.co.za" className="text-coral-600">disputes@rentio.co.za</a></li>
                  <li>Available: 24/7 for urgent matters</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center py-8 bg-white rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Questions About Our Policy?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our support team is here to help clarify any aspect of our rental policy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-coral-600 hover:bg-coral-700">
                Contact Support
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline">
                How Rentio Works
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
