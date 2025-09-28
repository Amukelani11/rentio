'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, CheckCircle, Clock, Users } from 'lucide-react'

interface RentalAgreementModalProps {
  bookingId: string
  isOpen: boolean
  onClose: () => void
  userType: 'renter' | 'lister'
}

export default function RentalAgreementModal({
  bookingId,
  isOpen,
  onClose,
  userType
}: RentalAgreementModalProps) {
  const [agreement, setAgreement] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signature, setSignature] = useState('')

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchAgreement()
    }
  }, [isOpen, bookingId])

  const fetchAgreement = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/agreements/${bookingId}`)
      const data = await response.json()

      if (data.success) {
        setAgreement(data.data)
      }
    } catch (error) {
      console.error('Error fetching agreement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignAgreement = async () => {
    if (!signature.trim()) {
      alert('Please provide your signature')
      return
    }

    try {
      setSigning(true)
      const response = await fetch(`/api/agreements/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature: signature.trim(),
          signatureType: userType
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('Agreement signed successfully!')
        onClose()
        window.location.reload() // Refresh to show updated status
      } else {
        alert(data.error || 'Failed to sign agreement')
      }
    } catch (error) {
      console.error('Error signing agreement:', error)
      alert('Failed to sign agreement')
    } finally {
      setSigning(false)
    }
  }

  const downloadAgreement = () => {
    if (!agreement?.agreement_content) return

    const blob = new Blob([agreement.agreement_content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rental-agreement-${agreement.agreement_number}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-coral-600" />
            <h2 className="text-xl font-semibold">Rental Agreement</h2>
          </div>
          <Button variant="ghost" onClick={onClose} className="p-2">
            ✕
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
              <span className="ml-2">Loading agreement...</span>
            </div>
          ) : agreement ? (
            <div className="space-y-6">
              {/* Agreement Header */}
              <div className="text-center border-b pb-4">
                <h1 className="text-2xl font-bold mb-2">RENTAL AGREEMENT</h1>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <span>Agreement #{agreement.agreement_number}</span>
                  <Badge variant={agreement.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {agreement.status}
                  </Badge>
                </div>
              </div>

              {/* Agreement Content */}
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {agreement.agreement_content}
                </pre>
              </div>

              {/* Signatures Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Users className="mr-2 h-5 w-5" />
                    Signatures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Renter Signature */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Renter Signature</h4>
                      {agreement.renter_signature ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Signed on {new Date(agreement.signed_at).toLocaleDateString()}</span>
                        </div>
                      ) : userType === 'renter' ? (
                        <div className="space-y-3">
                          <textarea
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                            placeholder="Type your full name as signature"
                            className="w-full p-3 border rounded-md"
                            rows={3}
                          />
                          <Button
                            onClick={handleSignAgreement}
                            disabled={signing || !signature.trim()}
                            className="w-full"
                          >
                            {signing ? 'Signing...' : 'Sign Agreement'}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>Waiting for renter signature</span>
                        </div>
                      )}
                    </div>

                    {/* Lister Signature */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Lister Signature</h4>
                      {agreement.lister_signature ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Signed on {new Date(agreement.signed_at).toLocaleDateString()}</span>
                        </div>
                      ) : userType === 'lister' ? (
                        <div className="space-y-3">
                          <textarea
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                            placeholder="Type your full name as signature"
                            className="w-full p-3 border rounded-md"
                            rows={3}
                          />
                          <Button
                            onClick={handleSignAgreement}
                            disabled={signing || !signature.trim()}
                            className="w-full"
                          >
                            {signing ? 'Signing...' : 'Sign Agreement'}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>Waiting for lister signature</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Unable to load agreement</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-between">
          <Button variant="outline" onClick={downloadAgreement} disabled={!agreement}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}
