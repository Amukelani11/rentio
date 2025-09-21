import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createBusinessSlug } from '@/lib/utils/slugify'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug

    // First, find business by creating a slug from the business name
    // Since we don't have a slug field, we'll search by a slugified version of the name
    const { data: businesses, error: businessError } = await serviceClient
      .from('businesses')
      .select(`
        *,
        user:users(id, name, email, avatar, created_at),
        listings(
          *,
          category:categories(id, name, icon)
        )
      `)

    if (businessError) {
      console.error('Business fetch error:', businessError)
      return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
    }

    // Find business by matching slugified name
    const business = businesses?.find(b => {
      const businessSlug = createBusinessSlug(b.name || '')
      return businessSlug === slug
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get business reviews and rating
    const { data: reviews } = await serviceClient
      .from('reviews')
      .select(`
        *,
        from_user:users!from_user_id(id, name, avatar)
      `)
      .eq('to_user_id', business.user_id)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(10)

    // Calculate rating stats
    const totalReviews = reviews?.length || 0
    const averageRating = totalReviews > 0 && reviews
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    // Filter only active listings
    const activeListings = business.listings?.filter((listing: any) => 
      listing.status === 'ACTIVE'
    ) || []

    const businessData = {
      ...business,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      reviews: reviews || [],
      listings: activeListings,
      slug, // Include the slug that was used to find this business
    }

    return NextResponse.json({
      success: true,
      data: businessData,
    })
  } catch (error) {
    console.error('Get business error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
