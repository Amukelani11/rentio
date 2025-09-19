import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.YOCO_SECRET_KEY
    if (!secret) {
      return NextResponse.json({ error: 'YOCO_SECRET_KEY not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { token, amountInCents, currency = 'ZAR', metadata } = body || {}
    if (!token || !amountInCents) {
      return NextResponse.json({ error: 'Missing token or amountInCents' }, { status: 400 })
    }

    const res = await fetch('https://online.yoco.com/v1/charges/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, amountInCents, currency, metadata }),
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: 'Yoco charge failed', details: json }, { status: 502 })
    }

    return NextResponse.json({ success: true, data: json })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 })
  }
}

