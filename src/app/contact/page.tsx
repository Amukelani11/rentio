'use client'

import { Mail, MessageSquare, Users, Building2, Send, Clock, Globe, Shield } from 'lucide-react'
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
      icon: Mail,
      title: "Email Support",
      value: "support@rentio.co.za",
      description: "We respond within 24 hours",
      hours: "24/7 Support"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      value: "In-App Chat",
      description: "Chat with our support team",
      hours: "Available 24/7"
    },
    {
      icon: Globe,
      title: "Help Center",
      value: "Online Resources",
      description: "Self-service support articles",
      hours: "Always Available"
    }
  ]

  const faqs = [
    {
      question: "How quickly do you respond to support requests?",
      answer: "We typically respond to all inquiries within 24 hours. Most responses are sent within 4-6 hours during business days."
    },
    {
      question: "What should I do if I have a problem with a rental?",
      answer: "If you're experiencing issues with a rental, please contact our support team through the contact form or in-app messaging. We have dedicated dispute resolution specialists who can help mediate any issues."
    },
    {
      question: "How do I report suspicious activity?",
      answer: "You can report suspicious activity through your dashboard, in-app reporting tools, or by contacting our support team. All reports are investigated promptly and confidentially."
    },
    {
      question: "Do you offer phone support?",
      answer: "Currently, we provide support through email and in-app messaging to ensure we can track all communications and provide thorough assistance. This allows us to resolve issues more efficiently."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-coral-600 to-coral-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-coral-100">
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
                  <div className="w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <info.icon className="h-8 w-8 text-coral-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                  <p className="text-coral-600 font-medium mb-1">{info.value}</p>
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

          {/* Support Categories */}
          <div>
            <h2 className="text-3xl font-bold mb-6">How We Can Help</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-coral-600" />
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

              <Card className="border-coral-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-coral-600">
                    <Shield className="h-5 w-5 mr-2" />
                    Safety & Security
                  </CardTitle>
                  <CardDescription>
                    Report urgent safety or security concerns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-coral-50 border border-coral-200 rounded-lg p-3">
                      <p className="text-sm text-coral-800">
                        <strong>For urgent safety issues:</strong> Please use the in-app reporting feature or mark your message as urgent when contacting support.
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Our team prioritizes safety-related reports and responds to urgent matters within 2-4 hours.
                    </p>
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
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Safety Issues</h3>
                  <p className="text-red-600 font-bold">2-4 hours</p>
                  <p className="text-sm text-gray-600">Priority response</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-coral-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Urgent</h3>
                  <p className="text-coral-600 font-bold">4-8 hours</p>
                  <p className="text-sm text-gray-600">Same business day</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Standard</h3>
                  <p className="text-blue-600 font-bold">24 hours</p>
                  <p className="text-sm text-gray-600">All inquiries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Online Resources */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Self-Service Resources</h2>
          <Card>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl mb-4">📚</div>
                  <h3 className="font-semibold mb-2">Help Center</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Browse our comprehensive knowledge base with tutorials and guides.
                  </p>
                  <Button variant="outline" size="sm">Visit Help Center</Button>
                </div>
                <div>
                  <div className="text-4xl mb-4">🎬</div>
                  <h3 className="font-semibold mb-2">Video Tutorials</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Watch step-by-step video guides for using all Rentio features.
                  </p>
                  <Button variant="outline" size="sm">Watch Tutorials</Button>
                </div>
                <div>
                  <div className="text-4xl mb-4">📱</div>
                  <h3 className="font-semibold mb-2">In-App Support</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Get instant help through our built-in chat and support tools.
                  </p>
                  <Button variant="outline" size="sm">Open App</Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
        <div className="text-center py-12 bg-gradient-to-r from-coral-50 to-blue-50 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our friendly support team is ready to help you with any questions or concerns you might have.
            Don't hesitate to reach out through our contact form or in-app messaging.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-coral-600 hover:bg-coral-700">
              Send Message
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