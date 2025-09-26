import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')
    const userId = searchParams.get('userId')
    const bookingId = searchParams.get('bookingId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let query = serviceClient
      .from('reviews')
      .select(`
        *,
        from_user:users!from_user_id(id, name, avatar),
        to_user:users!to_user_id(id, name, avatar),
        booking:bookings!booking_id(
          id,
          booking_number,
          start_date,
          end_date,
          listing:listings(id, title, slug)
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (listingId) {
      // Get reviews for a specific listing (reviews of the listing owner)
      const { data: listing } = await serviceClient
        .from('listings')
        .select('user_id, business_id')
        .eq('id', listingId)
        .single()
      
      if (listing) {
        const ownerId = listing.user_id || listing.business_id
        if (ownerId) {
          query = query.eq('to_user_id', ownerId)
        }
      }
    }

    if (userId) {
      query = query.eq('to_user_id', userId)
    }

    if (bookingId) {
      query = query.eq('booking_id', bookingId)
    }

    const { data: reviews, error: reviewsError } = await query
      .range(offset, offset + limit - 1)

    if (reviewsError) {
      console.error('Reviews fetch error:', reviewsError)
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }

    // Get total count
    let countQuery = serviceClient
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('is_public', true)

    if (listingId) {
      const { data: listing } = await serviceClient
        .from('listings')
        .select('user_id, business_id')
        .eq('id', listingId)
        .single()
      
      if (listing) {
        const ownerId = listing.user_id || listing.business_id
        if (ownerId) {
          countQuery = countQuery.eq('to_user_id', ownerId)
        }
      }
    }

    if (userId) {
      countQuery = countQuery.eq('to_user_id', userId)
    }

    if (bookingId) {
      countQuery = countQuery.eq('booking_id', bookingId)
    }

    const { count } = await countQuery

    // Calculate average rating and distribution for this specific target
    let avgQuery = serviceClient
      .from('reviews')
      .select('rating')
      .eq('is_public', true)

    if (listingId) {
      const { data: listing } = await serviceClient
        .from('listings')
        .select('user_id, business_id')
        .eq('id', listingId)
        .single()
      
      if (listing) {
        const ownerId = listing.user_id || listing.business_id
        if (ownerId) {
          avgQuery = avgQuery.eq('to_user_id', ownerId)
        }
      }
    }

    if (userId) {
      avgQuery = avgQuery.eq('to_user_id', userId)
    }

    const { data: ratingData } = await avgQuery

    const totalReviews = ratingData?.length || 0
    const averageRating = totalReviews > 0 && ratingData
      ? ratingData.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    // Calculate rating distribution
    const distribution = [5, 4, 3, 2, 1].map((rating) => {
      const ratingCount = ratingData?.filter(r => r.rating === rating).length || 0
      return {
        rating,
        count: ratingCount,
        percentage: totalReviews > 0 ? (ratingCount / totalReviews) * 100 : 0,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        items: reviews || [],
        total: count || 0,
        page,
        pageSize: limit,
        totalPages: Math.ceil((count || 0) / limit),
        averageRating: Math.round(averageRating * 10) / 10,
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
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, rating, title, comment } = body

    if (!bookingId || !rating || !title || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Check if booking exists and belongs to user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(id, title, user_id, business_id)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.renter_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to review this booking' }, { status: 403 })
    }

    // Check if booking is completed
    if (booking.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Booking must be completed to leave a review' }, { status: 400 })
    }

    // Check if review already exists for this booking
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', bookingId)
      .single()

    if (existingReview) {
      return NextResponse.json({ error: 'Review already exists for this booking' }, { status: 400 })
    }

    // Determine who to review (listing owner)
    const toUserId = booking.listing.user_id || booking.listing.business_id
    if (!toUserId) {
      return NextResponse.json({ error: 'Cannot determine listing owner' }, { status: 400 })
    }

    // Create review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        booking_id: bookingId,
        from_user_id: user.id,
        to_user_id: toUserId,
        rating,
        title,
        comment,
        is_public: true,
        is_flagged: false,
      })
      .select(`
        *,
        from_user:users!from_user_id(id, name, avatar),
        to_user:users!to_user_id(id, name, avatar)
      `)
      .single()

    if (reviewError) {
      console.error('Create review error:', reviewError)
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
    }

    // Update listing owner's average rating
    const { data: ownerReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('to_user_id', toUserId)
      .eq('is_public', true)

    if (ownerReviews && ownerReviews.length > 0) {
      const averageRating = ownerReviews.reduce((sum, r) => sum + r.rating, 0) / ownerReviews.length
      const totalReviews = ownerReviews.length

      // Update user profile with new rating
      await supabase
        .from('users')
        .update({
          average_rating: Math.round(averageRating * 10) / 10,
          total_reviews: totalReviews,
        })
        .eq('id', toUserId)
    }

    // Create notification for owner
    await supabase
      .from('notifications')
      .insert({
        user_id: toUserId,
        type: 'REVIEW_RECEIVED',
        title: 'New Review Received',
        message: `You received a ${rating}-star review for your rental "${booking.listing.title}"`,
        data: {
          reviewId: review.id,
          bookingId,
          listingId: booking.listing.id,
          rating,
        },
        channels: ['EMAIL', 'PUSH'],
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
