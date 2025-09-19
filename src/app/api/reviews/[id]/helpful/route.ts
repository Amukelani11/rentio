import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { UserRole } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviewId = params.id
    const body = await request.json()
    const { action } = body

    if (action !== 'helpful') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Check if user already marked this review as helpful
    const existingHelpful = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId: user.id,
        },
      },
    })

    if (existingHelpful) {
      // Remove helpful vote
      await prisma.reviewHelpful.delete({
        where: {
          reviewId_userId: {
            reviewId,
            userId: user.id,
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: {
          helpful: false,
          helpfulCount: Math.max(0, review.helpfulCount - 1),
        },
        message: 'Helpful vote removed',
      })
    } else {
      // Add helpful vote
      await prisma.reviewHelpful.create({
        data: {
          reviewId,
          userId: user.id,
        },
      })

      return NextResponse.json({
        success: true,
        data: {
          helpful: true,
          helpfulCount: review.helpfulCount + 1,
        },
        message: 'Marked as helpful',
      })
    }
  } catch (error) {
    console.error('Update review helpful error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}