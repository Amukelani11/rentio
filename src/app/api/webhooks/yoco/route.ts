import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function timingSafeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return crypto.timingSafeEqual(ba, bb)
}

export async function POST(request: NextRequest) {
  try {
    const headers = request.headers
    const id = headers.get('webhook-id') || ''
    const timestamp = headers.get('webhook-timestamp') || ''
    const signatureHeader = headers.get('webhook-signature') || ''

    if (!id || !timestamp || !signatureHeader) {
      return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 })
    }

    const ts = Number(timestamp)
    if (!Number.isFinite(ts)) {
      return NextResponse.json({ error: 'Invalid timestamp' }, { status: 400 })
    }
    const ageSec = Math.abs(Math.floor(Date.now() / 1000) - ts)
    if (ageSec > 180) {
      return NextResponse.json({ error: 'Timestamp outside tolerance' }, { status: 400 })
    }

    const rawBody = await request.text()
    const signedContent = `${id}.${timestamp}.${rawBody}`

    const secret = process.env.YOCO_WEBHOOK_SECRET || ''
    if (!secret || !secret.startsWith('whsec_')) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }
    const secretPart = secret.split('_')[1] || ''
    const secretBytes = Buffer.from(secretPart, 'base64')

    const computeSig = (content: string) =>
      crypto.createHmac('sha256', secretBytes).update(content).digest('base64')
    const expectedSignature = computeSig(signedContent)

    const providedSigs = signatureHeader
      .split(' ')
      .map((token) => token.trim())
      .filter(Boolean)
      .map((token) => (token.includes(',') ? token.split(',')[1] : token))

    let match = providedSigs.some((sig) => timingSafeEqual(sig, expectedSignature))
    if (!match) {
      const variants = new Set<string>()
      const rb = rawBody
      const lf = rb.replace(/\r\n/g, '\n')
      const crlf = rb.replace(/\n/g, '\r\n')
      ;[rb, lf, crlf].forEach((b) => {
        variants.add(computeSig(`${id}.${timestamp}.${b}`))
      })
      match = providedSigs.some((sig) => Array.from(variants).some((v) => timingSafeEqual(sig, v)))
    }
    if (!match) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    let event: any = null
    try {
      event = JSON.parse(rawBody)
    } catch {
      event = rawBody
    }

    return NextResponse.json({ received: true })
  } catch (e: any) {
    console.error('[yoco webhook] error', e)
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}


