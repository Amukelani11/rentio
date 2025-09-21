import { Phone, Mail, MapPin, Clock, MessageSquare, Users, Building2, Star, CheckCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
    alert('Thank you for your message! We\'ll get back to you soon.')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Support",
      value: "+27 10 123 4567",
      description: "Monday - Friday, 9 AM - 6 PM",
      hours: "Mon-Fri: 9AM-6PM"
    },
    {
      icon: Mail,
      title: "Email Support",
      value: "support@rentio.co.za",
      description: "We respond within 24 hours",
      hours: "24/7 Support"
    },
    {
      icon: MapPin,
      title: "Head Office",
      value: "Johannesburg, South Africa",
      description: "By appointment only",
      hours: "Mon-Fri: 9AM-5PM"
    }
  ]

  const faqs = [
    {
      question: "How quickly do you respond to support requests?",
      answer: "We typically respond to all inquiries within 24 hours. For urgent issues, please call our support line during business hours."
    },
    {
      question: "What should I do if I have a problem with a rental?",
      answer: "If you're experiencing issues with a rental, please contact our support team immediately. We have dedicated dispute resolution specialists who can help mediate any issues."
    },
    {
      question: "How do I report suspicious activity?",
      answer: "You can report suspicious activity through your dashboard or by contacting our support team. All reports are investigated promptly and confidentially."
    },
    {
      question: "Do you offer phone support?",
      answer: "Yes, we offer phone support during business hours (Monday-Friday, 9 AM - 6 PM). For after-hours support, please email us or use our online contact form."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-blue-100">
              We're here to help! Get in touch with our friendly support team for any questions or concerns.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Contact Methods */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Get in Touch</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <info.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                  <p className="text-blue-600 font-medium mb-1">{info.value}</p>
                  <p className="text-gray-600 text-sm mb-2">{info.description}</p>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {info.hours}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">Name *</label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">Email *</label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">Subject *</label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contact */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Need Urgent Help?</h2>
            <div className="space-y-6">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <Star className="h-5 w-5 mr-2" />
                    Emergency Support
                  </CardTitle>
                  <CardDescription>
                    For urgent issues requiring immediate attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-red-600 mr-3" />
                      <div>
                        <p className="font-medium">Emergency Hotline</p>
                        <p className="text-red-600 font-semibold">+27 10 123 4567</p>
                        <p className="text-sm text-gray-600">Available 24/7 for safety issues</p>
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">
                        <strong>Emergency cases include:</strong> Safety threats, harassment, fraudulent activity, or immediate security concerns.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Support Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Account Issues</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Login problems</li>
                        <li>• Profile updates</li>
                        <li>• KYC verification</li>
                        <li>• Payment methods</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Rental Issues</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Booking problems</li>
                        <li>• Payment disputes</li>
                        <li>• Item damage</li>
                        <li>• Return issues</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Technical Support</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• App bugs</li>
                        <li>• Website issues</li>
                        <li>• Feature requests</li>
                        <li>• Integration help</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Business Support</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Account setup</li>
                        <li>• Team management</li>
                        <li>• Billing questions</li>
                        <li>• Training requests</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Response Times */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Response Times</h2>
          <Card>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Emergency</h3>
                  <p className="text-green-600 font-bold">Immediate</p>
                  <p className="text-sm text-gray-600">24/7 hotline</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Urgent</h3>
                  <p className="text-blue-600 font-bold">2-4 hours</p>
                  <p className="text-sm text-gray-600">Business hours</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Standard</h3>
                  <p className="text-yellow-600 font-bold">24 hours</p>
                  <p className="text-sm text-gray-600">All inquiries</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Business</h3>
                  <p className="text-purple-600 font-bold">4-8 hours</p>
                  <p className="text-sm text-gray-600">Priority support</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Office Locations */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Visit Our Offices</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-6 w-6 mr-2 text-coral-600" />
                  Johannesburg Office
                </CardTitle>
                <CardDescription>Headquarters & Main Support Center</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">Address</h4>
                    <p className="text-gray-600">
                      123 Rivonia Road<br />
                      Sandton, Johannesburg<br />
                      2196, South Africa
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Hours</h4>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 1:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Services</h4>
                    <p className="text-gray-600">
                      In-person support, business meetings, training sessions, account setup assistance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-6 w-6 mr-2 text-blue-600" />
                  Cape Town Office
                </CardTitle>
                <CardDescription>Regional Support Center</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">Address</h4>
                    <p className="text-gray-600">
                      45 Long Street<br />
                      Cape Town City Centre<br />
                      8001, South Africa
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Hours</h4>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 5:00 PM<br />
                      Saturday: 10:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Services</h4>
                    <p className="text-gray-600">
                      Regional support, partner meetings, community events, local business outreach
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Community */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Join Our Community</h2>
          <Card>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="font-semibold mb-2">Community Forum</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Connect with other users, share tips, and get advice from experienced renters.
                  </p>
                  <Button variant="outline" size="sm">Join Forum</Button>
                </div>
                <div>
                  <div className="text-4xl mb-4">📱</div>
                  <h3 className="font-semibold mb-2">Social Media</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Follow us for updates, tips, and community stories.
                  </p>
                  <Button variant="outline" size="sm">Follow Us</Button>
                </div>
                <div>
                  <div className="text-4xl mb-4">📧</div>
                  <h3 className="font-semibold mb-2">Newsletter</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Get the latest news, features, and exclusive offers delivered to your inbox.
                  </p>
                  <Button variant="outline" size="sm">Subscribe</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-coral-50 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our friendly support team is ready to help you with any questions or concerns you might have.
            Don't hesitate to reach out!
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Contact Support
            </Button>
            <Button size="lg" variant="outline">
              Browse Help Center
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}