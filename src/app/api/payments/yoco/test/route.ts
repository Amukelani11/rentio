import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { payload, signature, webhookId, timestamp } = await request.json()
    const webhookSecret = process.env.YOCO_WEBHOOK_SECRET

    if (!payload || !signature || !webhookId || !timestamp || !webhookSecret) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('=== YOCO SIGNATURE DEBUG TEST ===')
    console.log('Input:', { payloadLength: payload.length, signature, webhookId, timestamp, secretLength: webhookSecret.length })

    // Test different secret processing methods
    const tests = [
      {
        name: 'Method 1: replace whsec_ and base64 decode',
        secretBytes: Buffer.from(webhookSecret.replace('whsec_', ''), 'base64'),
        description: 'Current method'
      },
      {
        name: 'Method 2: split on _ and take [1]',
        secretBytes: Buffer.from(webhookSecret.split('_')[1] || '', 'base64'),
        description: 'Original method'
      },
      {
        name: 'Method 3: direct base64 decode',
        secretBytes: Buffer.from(webhookSecret, 'base64'),
        description: 'No prefix removal'
      },
      {
        name: 'Method 4: use as utf8',
        secretBytes: Buffer.from(webhookSecret, 'utf8'),
        description: 'UTF-8 instead of base64'
      }
    ]

    const signedContent = `${webhookId}.${timestamp}.${payload}`

    for (const test of tests) {
      try {
        console.log(`\n--- ${test.name} ---`)
        console.log(`Description: ${test.description}`)
        console.log(`Secret bytes length: ${test.secretBytes.length}`)

        const expectedSignature = crypto
          .createHmac('sha256', test.secretBytes)
          .update(signedContent)
          .digest('base64')

        console.log(`Expected signature: ${expectedSignature}`)

        // Test different signature parsing methods
        const signatureTests = [
          {
            name: 'Split on space, take v1,',
            method: () => {
              const signatures = signature.split(' ')
              for (const sig of signatures) {
                if (sig.startsWith('v1,')) {
                  return sig.substring(3)
                }
              }
              return null
            }
          },
          {
            name: 'Split on comma, take [1]',
            method: () => {
              const parts = signature.split(',')
              return parts.length > 1 ? parts[1] : signature
            }
          },
          {
            name: 'Direct use',
            method: () => signature
          },
          {
            name: 'Remove v1, prefix',
            method: () => signature.replace('v1,', '')
          }
        ]

        for (const sigTest of signatureTests) {
          try {
            const actualSignature = sigTest.method()
            if (actualSignature) {
              const match = actualSignature === expectedSignature
              console.log(`  ${sigTest.name}: ${match ? '✅' : '❌'} ${actualSignature.substring(0, 20)}...`)
              if (match) {
                console.log(`  🎉 MATCH FOUND! Using ${test.name} with ${sigTest.name}`)
                return NextResponse.json({
                  success: true,
                  method: test.name,
                  signatureMethod: sigTest.name,
                  expectedSignature,
                  actualSignature
                })
              }
            }
          } catch (e) {
            console.log(`  ${sigTest.name}: ERROR - ${e}`)
          }
        }
      } catch (e) {
        console.log(`ERROR in ${test.name}: ${e}`)
      }
    }

    // If we get here, no combination worked
    return NextResponse.json({
      error: 'No working combination found',
      signedContent: signedContent.substring(0, 100) + '...',
      signature
    })

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to simulate Yoco signature generation
export async function GET() {
  try {
    const webhookSecret = process.env.YOCO_WEBHOOK_SECRET
    const webhookId = 'test_webhook_id'
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const payload = JSON.stringify({
      test: true,
      message: 'This is a test payload',
      created: new Date().toISOString()
    })

    console.log('=== GENERATING TEST SIGNATURE ===')
    console.log('Secret:', webhookSecret?.substring(0, 20) + '...')
    console.log('Webhook ID:', webhookId)
    console.log('Timestamp:', timestamp)
    console.log('Payload:', payload)

    const signedContent = `${webhookId}.${timestamp}.${payload}`
    console.log('Signed content:', signedContent)

    // Try different secret processing methods
    const secretBytes = Buffer.from(webhookSecret?.replace('whsec_', '') || '', 'base64')
    console.log('Secret bytes length:', secretBytes.length)

    const signature = crypto
      .createHmac('sha256', secretBytes)
      .update(signedContent)
      .digest('base64')

    const fullSignature = `v1,${signature}`

    console.log('Generated signature:', signature)
    console.log('Full signature header:', fullSignature)

    return NextResponse.json({
      webhookId,
      timestamp,
      payload,
      signedContent,
      signature,
      fullSignature,
      secretLength: webhookSecret?.length
    })

  } catch (error) {
    console.error('Generate test error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}