import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { sendEmail } from '@/lib/resend'
import { paymentReceiptEmail, bookingStatusEmail, bookingConfirmationEmail, newBookingNotificationEmail } from '@/emails/templates'

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

    let paymentRec: any = null
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        booking:bookings(
          *,
          listing:listings(*),
          renter:users!renter_id(*)
        )
      `)
      .eq('checkout_id', yocoCheckoutId)
      .single()

    if (!paymentError && payment) {
      paymentRec = payment
    } else {
      console.error('Payment not found by checkout_id, trying provider_id:', paymentError, 'checkoutId:', yocoCheckoutId)

      // Try with provider_id as fallback
      const { data: payment2, error: paymentError2 } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings(
            *,
            listing:listings(*),
            renter:users!renter_id(*)
          )
        `)
        .eq('provider_id', yocoCheckoutId)
        .single()

      if (paymentError2 || !payment2) {
        console.error('Payment not found by provider_id either:', paymentError2, 'providerId:', yocoCheckoutId)
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }

      // Use the second result if first failed
      paymentRec = payment2
    }

    const paymentObj = paymentRec
    console.log('✅ Payment found:', paymentObj.id, 'for booking:', paymentObj.booking_id, 'eventType:', eventType, 'status:', status)

    // Update payment status - Yoco uses 'succeeded' for successful payments
    const paymentStatus = status === 'succeeded' ? 'COMPLETED' : 'FAILED'
    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentObj.id)

    if (updatePaymentError) {
      console.error('Update payment error:', updatePaymentError)
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
    }

    if (status === 'succeeded') {
      console.log('🎉 Payment succeeded! Updating booking status...')

      // Check if booking requires lister confirmation
      const requiresConfirmation = paymentObj.metadata?.requires_confirmation || !eventData.metadata?.instant_book

      if (requiresConfirmation) {
        // For bookings requiring confirmation, set status to PENDING (awaiting lister approval)
        const { error: updateBookingError } = await supabase
          .from('bookings')
          .update({
            status: 'PENDING',
            payment_status: 'COMPLETED',
          })
          .eq('id', paymentObj.booking_id)

        if (updateBookingError) {
          console.error('❌ Update booking error:', updateBookingError)
          return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 })
        }

        console.log('✅ Booking status updated to PENDING (awaiting lister confirmation)!')

        // Notify the lister about pending booking confirmation
        const ownerId = paymentObj.booking?.listing?.user_id || paymentObj.booking?.listing?.business_id
        const listingTitle = paymentObj.booking?.listing?.title || 'Unknown Item'
        if (ownerId) {
          await supabase
            .from('notifications')
            .insert({
              user_id: ownerId,
              type: 'BOOKING_REQUEST',
              title: 'New Booking Request',
              message: `You have a new booking request for "${listingTitle}" that requires your confirmation`,
              data: {
                bookingId: paymentObj.booking_id,
              },
              channels: ['EMAIL', 'PUSH'],
            })
        }

        // Notify the renter that payment is complete and booking is pending lister approval
        await supabase
          .from('notifications')
          .insert({
            user_id: paymentObj.booking.renter_id,
            type: 'BOOKING_CONFIRMED',
            title: 'Payment Complete - Awaiting Confirmation',
            message: `Your payment for "${listingTitle}" is complete. The listing owner will review your booking request shortly.`,
            data: {
              bookingId: paymentObj.booking_id,
            },
            channels: ['PUSH'],
          })

        // Email renter payment receipt and booking status
        try {
          const renterEmail = paymentObj.booking?.renter?.email || null
          const renterName = paymentObj.booking?.renter?.name || 'there'
          const amountStr = `R ${(paymentObj.amount || paymentObj.booking?.total_amount || 0).toFixed?.(2) || String(paymentObj.amount)}`

          console.log('📧 Attempting to send renter emails to:', renterEmail, 'name:', renterName)

          if (renterEmail) {
            // Send payment receipt
            console.log('📧 Sending payment receipt to:', renterEmail)
            await sendEmail({
              to: renterEmail,
              subject: 'Payment Received',
              html: paymentReceiptEmail({
                name: renterName,
                amount: amountStr,
                bookingNumber: paymentObj.booking?.booking_number,
                provider: 'YOCO'
              })
            })
            console.log('✅ Payment receipt sent successfully')

            // Send booking confirmation with proper status
            if (requiresConfirmation) {
              console.log('📧 Sending booking pending email to:', renterEmail)
              await sendEmail({
                to: renterEmail,
                subject: 'Booking Awaiting Confirmation',
                html: bookingStatusEmail({
                  name: renterName,
                  listingTitle: listingTitle,
                  status: 'PENDING',
                  note: 'Your payment has been received. The listing owner will review your booking request shortly.'
                })
              })
              console.log('✅ Booking pending email sent successfully')
            } else {
              // Send proper booking confirmation for instant bookings
              console.log('📧 Sending booking confirmation email to:', renterEmail)
              await sendEmail({
                to: renterEmail,
                subject: 'Booking Confirmed!',
                html: bookingConfirmationEmail({
                  renterName,
                  listingTitle,
                  startDate: new Date(paymentObj.booking?.start_date).toLocaleDateString('en-ZA'),
                  endDate: new Date(paymentObj.booking?.end_date).toLocaleDateString('en-ZA'),
                  total: amountStr,
                  pickupLocation: paymentObj.booking?.listing?.pickup_location || paymentObj.booking?.listing?.location,
                  pickupInstructions: paymentObj.booking?.listing?.pickup_instructions,
                  deliveryInstructions: paymentObj.booking?.listing?.delivery_instructions,
                  deliveryAddress: paymentObj.booking?.delivery_address,
                  isDelivery: paymentObj.booking?.listing?.delivery_available || false,
                  ownerName: paymentObj.booking?.listing?.user?.name || paymentObj.booking?.listing?.business?.name,
                  ownerEmail: paymentObj.booking?.listing?.user?.email || paymentObj.booking?.listing?.business?.email,
                  bookingId: paymentObj.booking_id
                })
              })
              console.log('✅ Booking confirmation email sent successfully')
            }
          } else {
            console.log('❌ No renter email found, skipping emails')
          }
        } catch (e) {
          console.error('❌ Error sending renter emails:', e)
          console.debug('[email] webhook renter emails skipped', e)
        }

        // Email business/lister about new booking
        try {
          const ownerId = paymentObj.booking?.listing?.user_id || paymentObj.booking?.listing?.business_id
          if (ownerId) {
            // Get owner email and name
            const { data: owner } = await supabase
              .from('users')
              .select('email, name')
              .eq('id', ownerId)
              .single()
              
            if (owner?.email) {
              const renterName = paymentObj.booking?.renter?.name || 'Customer'
              const renterEmail = paymentObj.booking?.renter?.email || 'Not provided'
              const renterPhone = paymentObj.booking?.contact_phone || 'Not provided'
              const amountStr = `R ${(paymentObj.amount || paymentObj.booking?.total_amount || 0).toFixed?.(2) || String(paymentObj.amount)}`
              
              await sendEmail({ 
                to: owner.email, 
                subject: `New Booking Received - ${listingTitle}`, 
                html: newBookingNotificationEmail({ 
                  ownerName: owner.name || 'there',
                  renterName,
                  renterEmail,
                  renterPhone,
                  listingTitle, 
                  startDate: new Date(paymentObj.booking?.start_date).toLocaleDateString('en-ZA'),
                  endDate: new Date(paymentObj.booking?.end_date).toLocaleDateString('en-ZA'),
                  total: amountStr,
                  bookingNumber: paymentObj.booking?.booking_number,
                  requiresConfirmation
                }) 
              })
            }
          }
        } catch (e) { console.debug('[email] webhook owner notification skipped', e) }
      } else {
        // For instant bookings, confirm immediately
        const { error: updateBookingError } = await supabase
          .from('bookings')
          .update({
            status: 'CONFIRMED',
            payment_status: 'COMPLETED',
            confirmed_at: new Date().toISOString(),
          })
          .eq('id', paymentObj.booking_id)

        if (updateBookingError) {
          console.error('❌ Update booking error:', updateBookingError)
          return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 })
        }

        console.log('✅ Booking status updated to CONFIRMED!')

        // Create conversation for this booking if it doesn't exist
        const { data: existingConversation } = await supabase
          .from('conversations')
          .select('id')
          .eq('booking_id', paymentObj.booking_id)
          .single()

        if (!existingConversation) {
          const listingTitle = paymentObj.booking?.listing?.title || 'Unknown Item'
          const { data: conversation, error: conversationError } = await supabase
            .from('conversations')
            .insert({
              booking_id: paymentObj.booking_id,
              title: `Chat about ${listingTitle}`,
            })
            .select()
            .single()

          if (!conversationError && conversation) {
            // Add participants to conversation
            const ownerId = paymentObj.booking?.listing?.user_id || paymentObj.booking?.listing?.business_id
            if (ownerId) {
              await supabase
                .from('conversation_participants')
                .insert([
                  { conversation_id: conversation.id, user_id: paymentObj.booking.renter_id },
                  { conversation_id: conversation.id, user_id: ownerId },
                ])
            }
          }
        }

        // Create notifications for instant booking
        const ownerId = paymentObj.booking?.listing?.user_id || paymentObj.booking?.listing?.business_id
        const listingTitle = paymentObj.booking?.listing?.title || 'Unknown Item'
        if (ownerId) {
          await supabase
            .from('notifications')
            .insert({
              user_id: ownerId,
              type: 'BOOKING_CONFIRMED',
              title: 'New Booking Confirmed',
              message: `You have a new confirmed booking for "${listingTitle}"`,
              data: {
                bookingId: paymentObj.booking_id,
              },
              channels: ['EMAIL', 'PUSH'],
            })
        }

        // Notify the renter about instant booking confirmation
        await supabase
          .from('notifications')
          .insert({
            user_id: paymentObj.booking.renter_id,
            type: 'BOOKING_CONFIRMED',
            title: 'Booking Confirmed',
            message: `Your booking for "${listingTitle}" has been confirmed`,
            data: {
              bookingId: paymentObj.booking_id,
            },
            channels: ['PUSH'],
          })

        // Send emails for instant bookings
        try {
          const renterEmail = paymentObj.booking?.renter?.email || null
          const renterName = paymentObj.booking?.renter?.name || 'there'
          const amountStr = `R ${(paymentObj.amount || paymentObj.booking?.total_amount || 0).toFixed?.(2) || String(paymentObj.amount)}`

          console.log('📧 [INSTANT] Attempting to send instant booking emails to:', renterEmail)

          if (renterEmail) {
            // Send payment receipt
            console.log('📧 [INSTANT] Sending payment receipt to:', renterEmail)
            await sendEmail({
              to: renterEmail,
              subject: 'Payment Received',
              html: paymentReceiptEmail({
                name: renterName,
                amount: amountStr,
                bookingNumber: paymentObj.booking?.booking_number,
                provider: 'YOCO'
              })
            })
            console.log('✅ [INSTANT] Payment receipt sent successfully')

            // Send booking confirmation for instant booking
            console.log('📧 [INSTANT] Sending booking confirmation to:', renterEmail)
            await sendEmail({
              to: renterEmail,
              subject: 'Booking Confirmed!',
              html: bookingConfirmationEmail({
                renterName,
                listingTitle,
                startDate: new Date(paymentObj.booking?.start_date).toLocaleDateString('en-ZA'),
                endDate: new Date(paymentObj.booking?.end_date).toLocaleDateString('en-ZA'),
                total: amountStr,
                pickupLocation: paymentObj.booking?.listing?.pickup_location || paymentObj.booking?.listing?.location,
                pickupInstructions: paymentObj.booking?.listing?.pickup_instructions,
                deliveryInstructions: paymentObj.booking?.listing?.delivery_instructions,
                deliveryAddress: paymentObj.booking?.delivery_address,
                isDelivery: paymentObj.booking?.listing?.delivery_available || false,
                ownerName: paymentObj.booking?.listing?.user?.name || paymentObj.booking?.listing?.business?.name,
                ownerEmail: paymentObj.booking?.listing?.user?.email || paymentObj.booking?.listing?.business?.email,
                bookingId: paymentObj.booking_id
              })
            })
            console.log('✅ [INSTANT] Booking confirmation sent successfully')
          } else {
            console.log('❌ [INSTANT] No renter email found, skipping emails')
          }

          // Email business/lister about new instant booking
          if (ownerId) {
            console.log('📧 [INSTANT] Getting owner info for ID:', ownerId)
            // Get owner email and name
            const { data: owner } = await supabase
              .from('users')
              .select('email, name')
              .eq('id', ownerId)
              .single()

            console.log('📧 [INSTANT] Owner found:', owner?.email)

            if (owner?.email) {
              const renterEmail_safe = paymentObj.booking?.renter?.email || 'Not provided'
              const renterPhone = paymentObj.booking?.contact_phone || 'Not provided'

              console.log('📧 [INSTANT] Sending owner notification to:', owner.email)
              await sendEmail({
                to: owner.email,
                subject: `New Booking Confirmed - ${listingTitle}`,
                html: newBookingNotificationEmail({
                  ownerName: owner.name || 'there',
                  renterName,
                  renterEmail: renterEmail_safe,
                  renterPhone,
                  listingTitle,
                  startDate: new Date(paymentObj.booking?.start_date).toLocaleDateString('en-ZA'),
                  endDate: new Date(paymentObj.booking?.end_date).toLocaleDateString('en-ZA'),
                  total: amountStr,
                  bookingNumber: paymentObj.booking?.booking_number,
                  requiresConfirmation: false
                })
              })
              console.log('✅ [INSTANT] Owner notification sent successfully')
            } else {
              console.log('❌ [INSTANT] No owner email found')
            }
          } else {
            console.log('❌ [INSTANT] No owner ID found')
          }
        } catch (e) {
          console.error('❌ [INSTANT] Error sending instant booking emails:', e)
          console.debug('[email] instant booking emails skipped', e)
        }
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
        .eq('id', paymentObj.booking_id)

      if (updateBookingError) {
        console.error('Update booking error:', updateBookingError)
      }

      // Notify the renter about payment failure
      const listingTitle = paymentObj.booking?.listing?.title || 'Unknown Item'
      await supabase
        .from('notifications')
        .insert({
          user_id: paymentObj.booking.renter_id,
          type: 'BOOKING_CANCELLED',
          title: 'Payment Failed',
          message: `Payment failed for your booking of "${listingTitle}"`,
          data: {
            bookingId: paymentObj.booking_id,
          },
          channels: ['PUSH'],
        })

      // Email renter payment failed
      try {
        const renterEmail = paymentObj.booking?.renter?.email || null
        const renterName = paymentObj.booking?.renter?.name || 'there'
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