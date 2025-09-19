import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { sendEmail } from '@/lib/resend'
import { paymentReceiptEmail, bookingStatusEmail } from '@/emails/templates'

function verifyWebhookSignature(payload: string, signature: string, secret: string, webhookId: string, timestamp: string): boolean {
  try {
    // Construct the signed content: id.timestamp.payload (exactly as Yoco docs)
    const signedContent = `${webhookId}.${timestamp}.${payload}`

    // Get the secret bytes (remove whsec_ prefix)
    const secretBytes = Buffer.from(secret.split('_')[1], 'base64')

    // Create expected signature using HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', secretBytes)
      .update(signedContent)
      .digest('base64')

    // Parse the signature header - format: "v1,signature" or "v1,sig1 v1,sig2"
    const signatures = signature.split(' ')
    let actualSignature = null

    for (const sig of signatures) {
      const parts = sig.split(',')
      if (parts.length === 2 && parts[0] === 'v1') {
        actualSignature = parts[1]
        break
      }
    }

    if (!actualSignature) {
      console.error('No valid v1 signature found in:', signature)
      return false
    }

    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(actualSignature)
    )
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw body first for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('webhook-signature')
    const webhookId = request.headers.get('webhook-id')
    const timestamp = request.headers.get('webhook-timestamp')
    const webhookSecret = process.env.YOCO_WEBHOOK_SECRET
    
    // Verify webhook signature if secret is available
    if (webhookSecret && signature && webhookId && timestamp) {
      if (!verifyWebhookSignature(rawBody, signature, webhookSecret, webhookId, timestamp)) {
        console.error('❌ Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    let body
    try {
      body = JSON.parse(rawBody)
    } catch (e) {
      console.error('Webhook JSON parse error:', e, 'rawBody:', rawBody)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    
    // Yoco webhook payload structure - note that the actual payment data is in 'payload', not 'data'
    const {
      id: eventId,
      type: eventType,
      payload: eventData
    } = body

    if (!eventId || !eventType || !eventData) {
      console.error('Missing required fields in webhook:', { eventId, eventType, eventData, body })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Extract checkout details from event data
    const { 
      id: yocoCheckoutId, 
      status, 
      amount, 
      currency, 
      metadata 
    } = eventData

    if (!yocoCheckoutId || !status) {
      console.error('Missing checkout fields in event data:', { yocoCheckoutId, status, eventData })
      return NextResponse.json({ error: 'Missing checkout fields' }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Find the payment record by Yoco checkout ID from metadata

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        booking:bookings(
          *,
          listing:listings(*)
        )
      `)
      .eq('checkout_id', yocoCheckoutId)
      .single()

    if (paymentError || !payment) {
      console.error('Payment not found by checkout_id, trying provider_id:', paymentError, 'checkoutId:', yocoCheckoutId)

      // Try with provider_id as fallback
      const { data: payment2, error: paymentError2 } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings(
            *,
            listing:listings(*)
          )
        `)
        .eq('provider_id', yocoCheckoutId)
        .single()

      if (paymentError2 || !payment2) {
        console.error('Payment not found by provider_id either:', paymentError2, 'providerId:', yocoCheckoutId)
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }

      // Use the second result if first failed
      payment = payment2
    }

    console.log('✅ Payment found:', payment.id, 'for booking:', payment.booking_id, 'eventType:', eventType, 'status:', status)

    // Update payment status - Yoco uses 'succeeded' for successful payments
    const paymentStatus = status === 'succeeded' ? 'COMPLETED' : 'FAILED'
    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)

    if (updatePaymentError) {
      console.error('Update payment error:', updatePaymentError)
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
    }

    if (status === 'succeeded') {
      console.log('🎉 Payment succeeded! Updating booking status...')

      // Check if booking requires lister confirmation
      const requiresConfirmation = payment.metadata?.requires_confirmation || !eventData.metadata?.instant_book

      if (requiresConfirmation) {
        // For bookings requiring confirmation, set status to PENDING (awaiting lister approval)
        const { error: updateBookingError } = await supabase
          .from('bookings')
          .update({
            status: 'PENDING',
            payment_status: 'COMPLETED',
          })
          .eq('id', payment.booking_id)

        if (updateBookingError) {
          console.error('❌ Update booking error:', updateBookingError)
          return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 })
        }

        console.log('✅ Booking status updated to PENDING (awaiting lister confirmation)!')

        // Notify the lister about pending booking confirmation
        const ownerId = payment.booking?.listing?.user_id || payment.booking?.listing?.business_id
        const listingTitle = payment.booking?.listing?.title || 'Unknown Item'
        if (ownerId) {
          await supabase
            .from('notifications')
            .insert({
              user_id: ownerId,
              type: 'BOOKING_REQUEST',
              title: 'New Booking Request',
              message: `You have a new booking request for "${listingTitle}" that requires your confirmation`,
              data: {
                bookingId: payment.booking_id,
              },
              channels: ['EMAIL', 'PUSH'],
            })
        }

        // Notify the renter that payment is complete and booking is pending lister approval
        await supabase
          .from('notifications')
          .insert({
            user_id: payment.booking.renter_id,
            type: 'BOOKING_CONFIRMED',
            title: 'Payment Complete - Awaiting Confirmation',
            message: `Your payment for "${listingTitle}" is complete. The listing owner will review your booking request shortly.`,
            data: {
              bookingId: payment.booking_id,
            },
            channels: ['PUSH'],
          })

        // Email renter payment receipt and status
        try {
          const renterEmail = payment.booking?.renter?.email || null
          const renterName = payment.booking?.renter?.name || 'there'
          const amountStr = `R ${(payment.amount || payment.booking?.total_amount || 0).toFixed?.(2) || String(payment.amount)}`
          if (renterEmail) {
            await sendEmail({ to: renterEmail, subject: 'Payment received', html: paymentReceiptEmail({ name: renterName, amount: amountStr, bookingNumber: payment.booking?.booking_number, provider: 'YOCO' }) })
            await sendEmail({ to: renterEmail, subject: 'Booking confirmed', html: bookingStatusEmail({ name: renterName, listingTitle: listingTitle, status: requiresConfirmation ? 'PENDING' : 'CONFIRMED' }) })
          }
        } catch (e) { console.debug('[email] webhook renter receipt skipped', e) }
      } else {
        // For instant bookings, confirm immediately
        const { error: updateBookingError } = await supabase
          .from('bookings')
          .update({
            status: 'CONFIRMED',
            payment_status: 'COMPLETED',
            confirmed_at: new Date().toISOString(),
          })
          .eq('id', payment.booking_id)

        if (updateBookingError) {
          console.error('❌ Update booking error:', updateBookingError)
          return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 })
        }

        console.log('✅ Booking status updated to CONFIRMED!')

        // Create conversation for this booking if it doesn't exist
        const { data: existingConversation } = await supabase
          .from('conversations')
          .select('id')
          .eq('booking_id', payment.booking_id)
          .single()

        if (!existingConversation) {
          const listingTitle = payment.booking?.listing?.title || 'Unknown Item'
          const { data: conversation, error: conversationError } = await supabase
            .from('conversations')
            .insert({
              booking_id: payment.booking_id,
              title: `Chat about ${listingTitle}`,
            })
            .select()
            .single()

          if (!conversationError && conversation) {
            // Add participants to conversation
            const ownerId = payment.booking?.listing?.user_id || payment.booking?.listing?.business_id
            if (ownerId) {
              await supabase
                .from('conversation_participants')
                .insert([
                  { conversation_id: conversation.id, user_id: payment.booking.renter_id },
                  { conversation_id: conversation.id, user_id: ownerId },
                ])
            }
          }
        }

        // Create notifications for instant booking
        const ownerId = payment.booking?.listing?.user_id || payment.booking?.listing?.business_id
        const listingTitle = payment.booking?.listing?.title || 'Unknown Item'
        if (ownerId) {
          await supabase
            .from('notifications')
            .insert({
              user_id: ownerId,
              type: 'BOOKING_CONFIRMED',
              title: 'New Booking Confirmed',
              message: `You have a new confirmed booking for "${listingTitle}"`,
              data: {
                bookingId: payment.booking_id,
              },
              channels: ['EMAIL', 'PUSH'],
            })
        }

        // Notify the renter about instant booking confirmation
        await supabase
          .from('notifications')
          .insert({
            user_id: payment.booking.renter_id,
            type: 'BOOKING_CONFIRMED',
            title: 'Booking Confirmed',
            message: `Your booking for "${listingTitle}" has been confirmed`,
            data: {
              bookingId: payment.booking_id,
            },
            channels: ['PUSH'],
          })
      }
    } else {
      // Payment failed - update booking status
      const { error: updateBookingError } = await supabase
        .from('bookings')
        .update({
          status: 'CANCELLED',
          payment_status: 'FAILED',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', payment.booking_id)

      if (updateBookingError) {
        console.error('Update booking error:', updateBookingError)
      }

      // Notify the renter about payment failure
      const listingTitle = payment.booking?.listing?.title || 'Unknown Item'
      await supabase
        .from('notifications')
        .insert({
          user_id: payment.booking.renter_id,
          type: 'BOOKING_CANCELLED',
          title: 'Payment Failed',
          message: `Payment failed for your booking of "${listingTitle}"`,
          data: {
            bookingId: payment.booking_id,
          },
          channels: ['PUSH'],
        })

      // Email renter payment failed
      try {
        const renterEmail = payment.booking?.renter?.email || null
        const renterName = payment.booking?.renter?.name || 'there'
        if (renterEmail) {
          await sendEmail({ to: renterEmail, subject: 'Payment failed', html: bookingStatusEmail({ name: renterName, listingTitle, status: 'CANCELLED', note: 'Payment failed. Please try again.' }) })
        }
      } catch (e) { console.debug('[email] webhook renter failed skipped', e) }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Yoco webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}