"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkListings = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Check if we can get any listings
      const response = await fetch('/api/listings/create-sample', {
        method: 'POST'
      })
      const result = await response.json()
      
      console.log('Sample listing result:', result)
      
      // Now try to get the listing by slug
      const listingResponse = await fetch('/api/listings/by-slug/sample-power-drill')
      const listingResult = await listingResponse.json()
      
      console.log('Listing by slug result:', listingResult)
      
      setListings([result, listingResult])
    } catch (e) {
      console.error('Test error:', e)
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkListings()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Debug: Listing Not Found Issue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkListings} disabled={loading}>
              {loading ? 'Testing...' : 'Test Again'}
            </Button>
            
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="font-semibold">Results:</h3>
              {listings.map((result, index) => (
                <details key={index} className="border rounded p-2">
                  <summary className="cursor-pointer font-medium">
                    Result {index + 1}
                  </summary>
                  <pre className="mt-2 text-sm bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}