import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { Role as UserRole } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')
    const userId = searchParams.get('userId')
    const bookingId = searchParams.get('bookingId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}

    if (listingId) where.listingId = listingId
    if (userId) where.userId = userId
    if (bookingId) where.bookingId = bookingId

    const [reviews, total, averageRating, ratingDistribution] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          booking: {
            select: {
              id: true,
              bookingNumber: true,
              startDate: true,
              endDate: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          helpful: {
            select: {
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({
        where,
        _avg: {
          rating: true,
        },
      }),
      prisma.review.groupBy({
        by: ['rating'],
        where,
        _count: {
          rating: true,
        },
      }),
    ])

    // Calculate rating distribution
    const distribution = [5, 4, 3, 2, 1].map((rating) => {
      const match = (ratingDistribution as any[]).find((r: any) => r.rating === rating)
      const count = match?._count?.rating || 0
      return {
        rating,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        items: reviews,
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
        averageRating: averageRating._avg.rating || 0,
        ratingDistribution: distribution,
      },
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, listingId, rating, title, comment, categories } = body

    if (!bookingId || !listingId || !rating || !title || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.renterId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to review this booking' }, { status: 403 })
    }

    if (booking.listingId !== listingId) {
      return NextResponse.json({ error: 'Booking does not match listing' }, { status: 400 })
    }

    // Check if booking is completed
    if (booking.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Booking must be completed to leave a review' }, { status: 400 })
    }

    // Check if review already exists for this booking
    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    })

    if (existingReview) {
      return NextResponse.json({ error: 'Review already exists for this booking' }, { status: 400 })
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        bookingId,
        listingId,
        userId: user.id,
        rating,
        title,
        comment,
        categories: categories || {},
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    })

    // Update listing rating
    const listingStats = await prisma.review.aggregate({
      where: { listingId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    })

    await prisma.listing.update({
      where: { id: listingId },
      data: {
        averageRating: listingStats._avg.rating || 0,
        totalReviews: listingStats._count.rating,
      },
    })

    // Update owner's rating
    const ownerStats = await prisma.review.aggregate({
      where: {
        listing: {
          userId: booking.listing.userId,
        },
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    })

    if (booking.listing.userId) {
      await prisma.user.update({
        where: { id: booking.listing.userId },
        data: {
          averageRating: ownerStats._avg.rating || 0,
          totalReviews: ownerStats._count.rating,
        },
      })
    }

    // Create notification for owner
    await prisma.notification.create({
      data: {
        userId: booking.listing.userId || booking.listing.businessId!,
        type: 'NEW_REVIEW',
        title: 'New Review Received',
        message: `You have received a ${rating}-star review for "${booking.listing.title}"`,
        data: {
          reviewId: review.id,
          bookingId,
          listingId,
        },
        channels: ['EMAIL', 'PUSH'],
      },
    })

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review submitted successfully',
    })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
