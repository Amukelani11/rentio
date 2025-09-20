import { NextRequest, NextResponse } from 'next/server'
import { runStockAlertCheck } from '@/lib/alerts'

// This endpoint should be secured and only called by authorized cron services
export async function GET(request: NextRequest) {
  try {
    // Simple security check - you might want to add proper authentication
    const authHeader = request.headers.get('Authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Running stock alert check...')

    // Run the alert check
    await runStockAlertCheck()

    return NextResponse.json({
      success: true,
      message: 'Stock alert check completed',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in stock alert cron job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also allow POST for cron services that use POST
export async function POST(request: NextRequest) {
  return GET(request)
}