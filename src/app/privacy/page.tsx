import PageSEO from '@/components/SEO/PageSEO'

export default function PrivacyPolicyPage() {
  const faqData = [
    {
      question: "What personal information does Rentio collect?",
      answer: "Rentio collects contact information, profile details, identification documents for KYC verification, payment information, location data, and communications necessary for rental transactions and platform security."
    },
    {
      question: "How does Rentio protect my personal data?",
      answer: "We use industry-standard encryption, secure servers, regular security audits, access controls, and comply with POPIA. Your data is stored securely and only accessible to authorized personnel."
    },
    {
      question: "Does Rentio share my information with third parties?",
      answer: "We only share necessary information with payment processors, identity verification services, and as required by law. We never sell your personal information to third parties for marketing purposes."
    },
    {
      question: "How can I access or delete my personal data?",
      answer: "You can access, update, or delete your personal information through your account settings or by contacting our data protection officer at privacy@rentio.co.za."
    },
    {
      question: "Is Rentio compliant with South African privacy laws?",
      answer: "Yes, Rentio is fully compliant with the Protection of Personal Information Act (POPIA) and other relevant South African privacy regulations."
    }
  ]

  return (
    <>
      <PageSEO
        title="Privacy Policy | Rentio"
        description="Rentio's comprehensive privacy policy compliant with POPIA. Learn how we collect, use, and protect your personal information in South Africa."
        keywords={[
          "rentio privacy policy",
          "south african privacy policy",
          "popia compliance rental",
          "rental marketplace privacy",
          "peer to peer rental privacy",
          "data protection south africa",
          "rental platform privacy",
          "personal information protection",
          "rental data security",
          "south african rental privacy"
        ]}
        canonical="https://rentio.co.za/privacy"
        openGraph={{
          type: 'article',
          title: 'Privacy Policy | Rentio',
          description: 'Rentio\'s comprehensive privacy policy compliant with POPIA and South African data protection laws.',
        }}
        faq={faqData}
        breadcrumbs={[
          { name: 'Home', url: 'https://rentio.co.za' },
          { name: 'Privacy Policy', url: 'https://rentio.co.za/privacy' }
        ]}
      />
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-600 text-lg">
            Last updated: December 1, 2024
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Introduction</h2>
          <p className="text-gray-700 mb-4">
            Rentio ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our peer-to-peer rental marketplace platform in South Africa.
          </p>
          <p className="text-gray-700">
            By using Rentio, you agree to the collection and use of information in accordance with this policy and the Protection of Personal Information Act (POPIA).
          </p>
        </div>

        {/* Information We Collect */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>

          <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>Contact information (email address, postal address)</li>
            <li>Personal details (name, date of birth)</li>
            <li>Identification documents for KYC verification</li>
            <li>Profile information and profile photos</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">Rental Information</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>Listing details and descriptions</li>
            <li>Booking history and transaction records</li>
            <li>Reviews and ratings</li>
            <li>Communication between users</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">Payment Information</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>Bank account details</li>
            <li>Credit/debit card information (processed securely by third parties)</li>
            <li>Transaction history and payment records</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">Technical Information</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>IP address and device information</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent on our platform</li>
            <li>Location data for service delivery</li>
          </ul>
        </div>

        {/* How We Use Your Information */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>

          <h3 className="text-xl font-semibold mb-3">Required Uses</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>To facilitate rental transactions between users</li>
            <li>To process payments and manage bookings</li>
            <li>To verify user identity and prevent fraud</li>
            <li>To facilitate communication between renters and listers</li>
            <li>To monitor platform activity and ensure safety</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">Optional Uses</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>To analyze usage patterns and improve our services</li>
            <li>To send promotional offers and platform updates</li>
            <li>To provide customer support</li>
          </ul>
        </div>

        {/* Information Sharing */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Information Sharing</h2>
          <p className="text-gray-700 mb-4">
            We do not sell your personal information. We only share your information in the following circumstances:
          </p>

          <h3 className="text-xl font-semibold mb-3">Service Providers</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>Payment processors for transaction handling</li>
            <li>Identity verification services for KYC processes</li>
            <li>Cloud storage providers for data hosting</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">Legal Requirements</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>When required by law or regulation</li>
            <li>To respond to legal processes and requests</li>
            <li>To protect our rights, property, or safety</li>
            <li>To investigate and prevent fraudulent activities</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">With Your Consent</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>When you explicitly consent to the sharing</li>
            <li>For business transfers (mergers, acquisitions)</li>
          </ul>
        </div>

        {/* Data Security */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement appropriate technical and organizational measures to protect your personal information, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>Encryption of sensitive data in transit and at rest</li>
            <li>Secure servers with access controls</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Employee training on data protection</li>
            <li>Compliance with POPIA requirements</li>
          </ul>
        </div>

        {/* Your Rights */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
          <p className="text-gray-700 mb-4">
            Under POPIA, you have the following rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li><strong>Right to Access:</strong> Request copies of your personal information</li>
            <li><strong>Right to Correction:</strong> Update inaccurate information</li>
            <li><strong>Right to Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Right to Object:</strong> Object to processing of your information</li>
            <li><strong>Right to Complain:</strong> Lodge complaints with regulatory authorities</li>
          </ul>
        </div>

        {/* Data Retention */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
          <p className="text-gray-700 mb-4">
            We retain your personal information only as long as necessary for the purposes outlined in this policy:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>Account information: While your account is active</li>
            <li>Transaction records: 7 years for legal and tax purposes</li>
            <li>Communication data: 2 years</li>
            <li>Marketing data: Until you opt out</li>
          </ul>
        </div>

        {/* International Data Transfers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">International Data Transfers</h2>
          <p className="text-gray-700 mb-4">
            Your information may be stored and processed in countries outside of South Africa. We ensure that any international transfers comply with POPIA requirements and that adequate protection measures are in place.
          </p>
        </div>

        {/* Cookies */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Cookies</h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar technologies to enhance your experience, analyze site usage, and for marketing purposes. You can manage your cookie preferences through your browser settings.
          </p>
        </div>

        {/* Changes to This Policy */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
          <p className="text-gray-700">
            We may update this privacy policy from time to time. The updated policy will be effective when posted on our platform. We encourage you to review this policy periodically for any changes.
          </p>
        </div>

        {/* Contact Information */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about this privacy policy or how we handle your personal information, please contact us:
          </p>
          <div className="text-gray-700">
            <p><strong>Email:</strong> privacy@rentio.co.za</p>
            <p><strong>Data Protection Officer:</strong> privacy@rentio.co.za</p>
          </div>
        </div>

        {/* POPIA Compliance */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">POPIA Compliance</h2>
          <p className="text-gray-700">
            Rentio is committed to complying with the Protection of Personal Information Act (POPIA) and other applicable data protection laws in South Africa. We have implemented appropriate measures to ensure the lawful and fair processing of personal information.
          </p>
        </div>
      </div>
    </div>
    </>
  )
}