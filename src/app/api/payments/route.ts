import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { Role as UserRole } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      bookingId,
      paymentMethodId,
      savePaymentMethod,
      provider = 'STRIPE', // Default to Stripe
    } = body

    // Validate required fields
    if (!bookingId || !paymentMethodId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: true,
        renter: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if user is the renter
    if (booking.renterId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to pay for this booking' }, { status: 403 })
    }

    // Check if booking is still pending payment
    if (booking.status !== 'PENDING' || booking.paymentStatus !== 'PENDING') {
      return NextResponse.json({ error: 'Booking is not ready for payment' }, { status: 400 })
    }

    // Calculate payment amounts
    const rentalAmount = booking.subtotal
    const serviceFee = booking.serviceFee
    const deliveryFee = booking.deliveryFee
    const depositAmount = booking.depositAmount
    const totalAmount = booking.totalAmount

    // In a real implementation, you would integrate with Stripe/Payfast/etc.
    // For now, we'll simulate the payment process

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        provider,
        providerId: `pay_${Date.now()}`, // Mock provider ID
        amount: totalAmount,
        currency: 'ZAR',
        status: 'PROCESSING',
        platformFee: serviceFee,
        paymentFee: totalAmount * 0.029, // Mock payment processing fee (2.9%)
        depositHold: true,
        depositReleased: false,
      },
    })

    // Simulate payment processing
    setTimeout(async () => {
      try {
        // Update payment status to completed
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            amountCaptured: totalAmount,
          },
        })

        // Update booking status
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'COMPLETED',
            status: listing.instantBook ? 'CONFIRMED' : 'PENDING', // Auto-confirm if instant book
          },
        })

        // If instant book, create notification for owner
        if (booking.listing.instantBook) {
          await prisma.notification.create({
            data: {
              userId: booking.listing.userId || booking.listing.businessId!,
              type: 'BOOKING_CONFIRMED',
              title: 'New Booking Confirmed',
              message: `Your item "${booking.listing.title}" has been booked for ${new Date(booking.startDate).toLocaleDateString()}`,
              data: {
                bookingId,
                listingId: booking.listing.id,
              },
              channels: ['EMAIL', 'PUSH'],
            },
          })
        }

        console.log(`Payment completed for booking ${bookingId}`)
      } catch (error) {
        console.error('Error processing payment completion:', error)
      }
    }, 2000) // Simulate 2 second processing time

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        status: 'PROCESSING',
        message: 'Payment is being processed',
      },
    })
  } catch (error) {
    console.error('Process payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('id')
    const { action } = await request.json()

    if (!paymentId || !action) {
      return NextResponse.json({ error: 'Missing payment ID or action' }, { status: 400 })
    }

    // Get payment details
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            listing: true,
            renter: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Check permissions
    const isOwner = payment.booking.listing.userId === user.id || payment.booking.listing.businessId === user.id
    const isRenter = payment.booking.renterId === user.id
    const isAdmin = user.roles.includes(UserRole.ADMIN)

    if (!isOwner && !isRenter && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    switch (action) {
      case 'release_deposit':
        if (!isOwner && !isAdmin) {
          return NextResponse.json({ error: 'Only owner can release deposit' }, { status: 403 })
        }

        if (payment.status !== 'COMPLETED' || payment.depositReleased) {
          return NextResponse.json({ error: 'Deposit cannot be released' }, { status: 400 })
        }

        // Release deposit
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            depositReleased: true,
            depositReleasedAt: new Date(),
          },
        })

        // Process payout to owner
        const payoutAmount = payment.amountCaptured - payment.platformFee - payment.paymentFee
        await prisma.payout.create({
          data: {
            userId: payment.booking.listing.userId || payment.booking.listing.businessId!,
            bookingId: payment.bookingId,
            amount: payoutAmount,
            currency: 'ZAR',
            status: 'PENDING',
            platformFee: payment.platformFee,
          },
        })

        return NextResponse.json({
          success: true,
          message: 'Deposit released successfully',
        })

      case 'retain_deposit':
        if (!isOwner && !isAdmin) {
          return NextResponse.json({ error: 'Only owner can retain deposit' }, { status: 403 })
        }

        const { retainAmount, retainReason } = await request.json()

        if (!retainAmount || !retainReason) {
          return NextResponse.json({ error: 'Missing retain amount or reason' }, { status: 400 })
        }

        // Retain partial deposit
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            depositRetained: retainAmount,
            depositReason: retainReason,
            depositReleased: true,
            depositReleasedAt: new Date(),
          },
        })

        // Process partial payout
        const partialPayoutAmount = payment.amountCaptured - payment.platformFee - payment.paymentFee - retainAmount
        await prisma.payout.create({
          data: {
            userId: payment.booking.listing.userId || payment.booking.listing.businessId!,
            bookingId: payment.bookingId,
            amount: partialPayoutAmount,
            currency: 'ZAR',
            status: 'PENDING',
            platformFee: payment.platformFee,
          },
        })

        return NextResponse.json({
          success: true,
          message: `Deposit retained: ${retainReason}`,
        })

      case 'refund':
        if (!isRenter && !isAdmin) {
          return NextResponse.json({ error: 'Only renter can request refund' }, { status: 403 })
        }

        const { refundAmount, refundReason } = await request.json()

        if (!refundAmount || !refundReason) {
          return NextResponse.json({ error: 'Missing refund amount or reason' }, { status: 400 })
        }

        // Process refund
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            refundAmount,
            refundReason,
            refundedAt: new Date(),
            status: 'REFUNDED',
          },
        })

        // Update booking status
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'REFUNDED',
            cancelledAt: new Date(),
          },
        })

        return NextResponse.json({
          success: true,
          message: 'Refund processed successfully',
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Update payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
