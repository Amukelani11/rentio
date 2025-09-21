import { Shield, Lock, Eye, Database, Share2, Trash2, Settings, Globe, Mail, Phone, MapPin } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PrivacyPolicyPage() {
  const dataCategories = [
    {
      icon: Mail,
      title: "Contact Information",
      description: "Email addresses, phone numbers, and postal addresses",
      examples: ["Email address", "Phone number", "Delivery address"]
    },
    {
      icon: User,
      title: "Personal Details",
      description: "Name, date of birth, and identification documents",
      examples: ["Full name", "Date of birth", "ID/Passport copies"]
    },
    {
      icon: MapPin,
      title: "Location Data",
      description: "Address information and geographic location for service delivery",
      examples: ["Home address", "GPS coordinates", "Service area"]
    },
    {
      icon: CreditCard,
      title: "Payment Information",
      description: "Payment methods and transaction history",
      examples: ["Bank details", "Card information", "Transaction records"]
    },
    {
      icon: Camera,
      title: "KYC Documents",
      description: "Identity verification documents and photos",
      examples: ["ID photos", "Proof of address", "Selfie verification"]
    },
    {
      icon: MessageSquare,
      title: "Communication Data",
      description: "Messages, reviews, and support interactions",
      examples: ["Chat messages", "Reviews", "Support tickets"]
    }
  ]

  const dataPurposes = [
    {
      title: "Service Provision",
      description: "To facilitate rentals, process payments, and manage bookings",
      necessity: "Required"
    },
    {
      title: "Identity Verification",
      description: "To verify user identity and prevent fraud through KYC processes",
      necessity: "Required"
    },
    {
      title: "Communication",
      description: "To facilitate communication between renters and listers",
      necessity: "Required"
    },
    {
      title: "Safety & Security",
      description: "To monitor platform activity and prevent fraudulent behavior",
      necessity: "Required"
    },
    {
      title: "Platform Improvement",
      description: "To analyze usage patterns and improve our services",
      necessity: "Optional"
    },
    {
      title: "Marketing",
      description: "To send promotional offers and platform updates",
      necessity: "Optional"
    }
  ]

  const userRights = [
    {
      icon: Eye,
      title: "Right to Access",
      description: "Request a copy of all personal data we hold about you"
    },
    {
      icon: Edit,
      title: "Right to Rectification",
      description: "Correct inaccurate or incomplete personal data"
    },
    {
      icon: Trash2,
      title: "Right to Erasure",
      description: "Request deletion of your personal data (right to be forgotten)"
    },
    {
      icon: Pause,
      title: "Right to Restrict Processing",
      description: "Limit how we use your personal data"
    },
    {
      icon: Download,
      title: "Right to Data Portability",
      description: "Receive your data in a machine-readable format"
    },
    {
      icon: X,
      title: "Right to Object",
      description: "Object to processing of your personal data"
    },
    {
      icon: Settings,
      title: "Right to Withdraw Consent",
      description: "Withdraw consent at any time (where processing is based on consent)"
    },
    {
      icon: Brain,
      title: "Right to Automated Decision Making",
      description: "Not be subject to solely automated decisions"
    }
  ]

  const thirdParties = [
    {
      name: "Payment Processors",
      purpose: "Payment processing and financial transactions",
      data: "Payment information, transaction details",
      security: "PCI DSS compliant"
    },
    {
      name: "Identity Verification Services",
      purpose: "KYC verification and fraud prevention",
      data: "ID documents, facial recognition data",
      security: "ISO 27001 certified"
    },
    {
      name: "Communication Services",
      purpose: "Email delivery, SMS notifications, in-app messaging",
      data: "Contact information, message content",
      security: "End-to-end encryption"
    },
    {
      name: "Cloud Storage Providers",
      purpose: "Data storage and backup services",
      data: "All user data and platform data",
      security: "AES-256 encryption"
    },
    {
      name: "Analytics Providers",
      purpose: "Platform usage analysis and improvement",
      data: "Anonymized usage data",
      security: "Data anonymization"
    },
    {
      name: "Legal Authorities",
      purpose: "Compliance with legal obligations",
      data: "Required data when legally compelled",
      security: "Legal compliance procedures"
    }
  ]

  const securityMeasures = [
    {
      icon: Lock,
      title: "Encryption",
      description: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption"
    },
    {
      icon: Shield,
      title: "Access Controls",
      description: "Strict role-based access controls with principle of least privilege"
    },
    {
      icon: Database,
      title: "Regular Audits",
      description: "Regular security audits and vulnerability assessments"
    },
    {
      icon: Eye,
      title: "Monitoring",
      description: "24/7 security monitoring and intrusion detection"
    },
    {
      icon: Users,
      title: "Staff Training",
      description: "Regular security training for all employees handling user data"
    },
    {
      icon: FileText,
      title: "Incident Response",
      description: "Comprehensive incident response plan for data breaches"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-blue-100">
              Your privacy is our priority. Learn how we collect, use, and protect your personal information.
            </p>
            <p className="text-blue-100 mt-4">
              Last updated: September 2024
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Introduction */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Our Privacy Commitment</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-4">
              At Rentio, we understand that your personal information is valuable. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your personal data when you use our platform. We are committed to transparency
              and giving you control over your information.
            </p>
            <p className="text-gray-600">
              This policy applies to all users of Rentio's services in South Africa and complies with the Protection of
              Personal Information Act (POPIA) and other applicable data protection laws.
            </p>
          </div>
        </div>

        {/* Information We Collect */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Information We Collect</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataCategories.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <category.icon className="h-5 w-5 mr-2 text-blue-600" />
                    {category.title}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {category.examples.map((example, idx) => (
                      <li key={idx}>• {example}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How We Use Your Information */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">How We Use Your Information</h2>
          <div className="space-y-4">
            {dataPurposes.map((purpose, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{purpose.title}</h3>
                      <p className="text-gray-600">{purpose.description}</p>
                    </div>
                    <Badge variant={purpose.necessity === "Required" ? "default" : "secondary"}>
                      {purpose.necessity}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Data Sharing and Disclosure */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Who We Share Your Data With</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {thirdParties.map((party, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{party.name}</CardTitle>
                  <CardDescription>{party.purpose}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Data Shared:</h4>
                      <p className="text-sm text-gray-600">{party.data}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Security Measures:</h4>
                      <p className="text-sm text-gray-600">{party.security}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Your Privacy Rights */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Your Privacy Rights</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {userRights.map((right, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <right.icon className="h-5 w-5 mr-2 text-blue-600" />
                    {right.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{right.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Data Security */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">How We Protect Your Data</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityMeasures.map((measure, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <measure.icon className="h-5 w-5 mr-2 text-green-600" />
                    {measure.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{measure.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Data Retention */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Data Retention</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Account Data</h3>
                  <p className="text-gray-600">
                    We retain your account information while your account is active. After account closure, we retain
                    essential data for legal compliance and fraud prevention for up to 7 years.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Transaction Data</h3>
                  <p className="text-gray-600">
                    Transaction records are retained for 7 years to comply with financial regulations and tax requirements.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Communication Data</h3>
                  <p className="text-gray-600">
                    Messages and communications are retained for 2 years, unless required for legal purposes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* International Data Transfers */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">International Data Transfers</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Your information may be stored and processed in South Africa and other countries where our service
                  providers operate. We ensure that all international transfers comply with POPIA and include appropriate
                  safeguards such as:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Standard contractual clauses with data processors</li>
                  <li>Adequacy decisions for countries with equivalent data protection</li>
                  <li>Binding corporate rules for intra-group transfers</li>
                  <li>Technical and organizational security measures</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cookies and Tracking */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Cookies and Tracking Technologies</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Essential Cookies</h3>
                  <p className="text-gray-600">
                    Required for basic website functionality including security, login, and session management.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Analytics Cookies</h3>
                  <p className="text-gray-600">
                    Help us understand how users interact with our platform to improve user experience.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Marketing Cookies</h3>
                  <p className="text-gray-600">
                    Used to deliver relevant advertisements and measure marketing campaign effectiveness.
                  </p>
                </div>
                <p className="text-gray-600">
                  You can manage cookie preferences through your browser settings or our cookie consent banner.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Children's Privacy */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Children's Privacy</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Rentio is not intended for use by individuals under the age of 18. We do not knowingly collect
                  personal information from children. If we discover that we have collected information from a child
                  under 18, we will take steps to delete such information promptly.
                </p>
                <p className="text-gray-600">
                  If you are a parent or guardian and believe your child has provided us with personal information,
                  please contact us immediately so we can take appropriate action.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Changes to This Policy */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Changes to This Policy</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or for
                  operational, legal, or regulatory reasons. When we make changes, we will:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Post the updated policy on this page</li>
                  <li>Update the "Last updated" date at the top</li>
                  <li>Notify users of material changes via email or platform notification</li>
                  <li>Obtain consent where required by law</li>
                </ul>
                <p className="text-gray-600">
                  We encourage you to review this policy periodically to stay informed about how we protect your data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Us */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Contact Our Data Protection Officer</h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Privacy-Related Inquiries</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-gray-600">privacy@rentio.co.za</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-gray-600">+27 10 123 4567</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-gray-600">123 Rivonia Road, Sandton, Johannesburg, 2196</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">How to Exercise Your Rights</h3>
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      To exercise any of your privacy rights, please contact us with:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                      <li>Your full name and account details</li>
                      <li>Clear description of your request</li>
                      <li>Supporting documentation (if applicable)</li>
                      <li>Contact information for response</li>
                    </ul>
                    <p className="text-gray-600">
                      We will respond to your request within 30 days as required by POPIA.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complaints */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Complaints and Disputes</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  If you believe we have not complied with this Privacy Policy or applicable data protection laws,
                  you have the right to lodge a complaint with us or with the Information Regulator of South Africa.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Information Regulator Contact Details:</h4>
                  <p className="text-gray-600">
                    Email: complaints@inforegulator.org.za<br />
                    Phone: 010 023 6700<br />
                    Address: 177 Sefako Makgatho Drive, Centurion, 0157
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-coral-50 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Your Privacy Matters</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We are committed to protecting your personal information and being transparent about our data practices.
            If you have any questions about this Privacy Policy or how we handle your data, please don't hesitate to contact us.
          </p>
          <div className="flex justify-center gap-4">
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-blue-600">POPIA Compliant</p>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-green-600">Secure Data Processing</p>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-purple-600">Your Rights Protected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}