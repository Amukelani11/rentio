import { sendEmail } from '@/lib/resend'

type SupabaseClientLike = {
  from: (table: string) => any
}

export type ParticipantRecord = {
  user_id: string
  user: {
    id: string
    name: string | null
    email: string | null
    avatar?: string | null
  } | null
}

export type ConversationRecord = {
  id: string
  booking_id?: string | null
  title?: string | null
  conversation_participants?: ParticipantRecord[]
}

export async function listConversationParticipants(
  supabase: SupabaseClientLike,
  conversationId: string
): Promise<ParticipantRecord[]> {
  const { data, error } = await supabase
    .from('conversation_participants')
    .select(`
      user_id,
      user:users(id, name, email, avatar)
    `)
    .eq('conversation_id', conversationId)

  if (error) {
    return []
  }

  return (data || [])
    .filter((row: any) => row && row.user_id)
    .map((row: any) => ({
      user_id: String(row.user_id),
      user: row.user
        ? {
            id: String(row.user.id),
            name: row.user.name ?? null,
            email: row.user.email ?? null,
            avatar: row.user.avatar ?? null,
          }
        : null,
    }))
}

export async function listMessages(
  supabase: SupabaseClientLike,
  conversationId: string
): Promise<any[]> {
  const { data } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users!from_user_id(id, name, avatar)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  return data || []
}

export async function ensureRecipients(
  supabase: SupabaseClientLike,
  conversation: ConversationRecord,
  currentUserId: string
): Promise<{ participants: ParticipantRecord[]; recipientIds: string[] }> {
  const { id: conversationId, booking_id } = conversation

  // Current participants
  const participants = await listConversationParticipants(supabase, conversationId)
  const recipientIds = participants
    .map((p) => p.user_id)
    .filter((uid) => uid !== currentUserId)

  if (recipientIds.length > 0) {
    return { participants, recipientIds }
  }

  if (!booking_id) {
    return { participants, recipientIds: [] }
  }

  // Derive candidates from booking context
  const { data: booking } = await (supabase as any)
    .from('bookings')
    .select(`
      id,
      renter_id,
      listing:listings(id, user_id, business_id)
    `)
    .eq('id', booking_id)
    .maybeSingle()

  const candidates = new Set<string>()
  if (booking?.renter_id && booking.renter_id !== currentUserId) {
    candidates.add(String(booking.renter_id))
  }
  const listing = booking?.listing
  if (listing?.user_id && listing.user_id !== currentUserId) {
    candidates.add(String(listing.user_id))
  }
  if ((!listing?.user_id || candidates.size === 0) && listing?.business_id) {
    const { data: teamMembers } = await (supabase as any)
      .from('team_members')
      .select('user_id')
      .eq('business_id', listing.business_id)

    for (const tm of teamMembers || []) {
      const uid = tm?.user_id
      if (uid && uid !== currentUserId) candidates.add(String(uid))
    }
  }

  if (candidates.size === 0) {
    return { participants, recipientIds: [] }
  }

  const newRows = Array.from(candidates)
    .filter((uid) => !participants.some((p) => p.user_id === uid))
    .map((uid) => ({ conversation_id: conversationId, user_id: uid }))

  if (newRows.length > 0) {
    await (supabase as any)
      .from('conversation_participants')
      .upsert(newRows, { onConflict: 'conversation_id,user_id' })
  }

  const updated = await listConversationParticipants(supabase, conversationId)
  const updatedRecipientIds = updated
    .map((p) => p.user_id)
    .filter((uid) => uid !== currentUserId)

  return { participants: updated, recipientIds: updatedRecipientIds }
}

export async function sendConversationMessage(
  supabase: SupabaseClientLike,
  conversation: ConversationRecord,
  senderId: string,
  content: string,
  type: string = 'TEXT'
): Promise<any | null> {
  const { recipientIds } = await ensureRecipients(supabase, conversation, senderId)
  const toUserId = recipientIds[0] || null

  const payload: Record<string, unknown> = {
    conversation_id: conversation.id,
    from_user_id: senderId,
    to_user_id: toUserId,
    content,
    type,
  }
  if (conversation.booking_id) payload.booking_id = conversation.booking_id

  const { data, error } = await (supabase as any)
    .from('messages')
    .insert(payload)
    .select(`
      *,
      sender:users!from_user_id(id, name, avatar)
    `)
    .maybeSingle()

  if (error) return null
  return data
}

export async function notifyParticipantsByEmail(
  supabase: any,
  conversation: ConversationRecord,
  message: any,
  sender: { id: string; name?: string | null },
  options?: { forceSend?: boolean }
) {
  console.log('[EMAIL] Starting smart email notifications for conversation %s', conversation.id)

  // Fetch fresh participant data with user details to ensure we have email addresses
  const { data: freshParticipants, error: participantsError } = await supabase
    .from('conversation_participants')
    .select(`
      user_id,
      user:users(id, name, email, avatar)
    `)
    .eq('conversation_id', conversation.id)

  if (participantsError) {
    console.error('[EMAIL] Failed to fetch participants for email:', participantsError)
    return
  }

  console.log('[EMAIL] Fresh participant data:', JSON.stringify(freshParticipants, null, 2))

  // For participants with null user data, try to fetch their details individually
  const participantsWithUserData = []
  for (const participant of freshParticipants || []) {
    if (participant.user) {
      participantsWithUserData.push(participant)
    } else {
      // Try to fetch user data directly for participants with null user data
      console.log('[EMAIL] Fetching user data for participant:', participant.user_id)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, email, avatar')
        .eq('id', participant.user_id)
        .maybeSingle()

      if (userError) {
        console.error('[EMAIL] Failed to fetch user data for participant:', participant.user_id, userError)
      } else if (userData) {
        participantsWithUserData.push({
          user_id: participant.user_id,
          user: userData
        })
      }
    }
  }

  console.log('[EMAIL] Participants with user data:', JSON.stringify(participantsWithUserData, null, 2))

  const participants = participantsWithUserData.filter(
    (p) => p.user && p.user.id !== sender.id && p.user.email
  )
  
  if (participants.length === 0) {
    console.log('[EMAIL] No participants with email addresses for conversation %s', conversation.id)
    console.log('[EMAIL] All participants after user data fetch:', JSON.stringify(participantsWithUserData, null, 2))
    return
  }

  const senderName = sender?.name || 'Rentio user'
  const title = conversation.title || 'Conversation'
  const messageContent = message?.content || ''
  const messageId = message?.id || 'unknown'

  const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charSet="utf-8"/>
    <meta http-equiv="x-ua-compatible" content="ie=edge"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>New message from ${senderName}</title>
  </head>
  <body style="margin:0;background:#f8fafc;color:#0f172a;font-family:Inter,-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f8fafc;padding:24px 0">
      <tbody>
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,0.06)">
              <tbody>
                <tr>
                  <td style="padding:20px;background:linear-gradient(90deg, rgba(255,90,95,0.08), rgba(255,90,95,0))">
                    <img src="https://rentio-public.s3.amazonaws.com/rentiologo.png" alt="Rentio" height="24" style="display:block"/>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px">
                    <h1 style="margin:0 0 16px;font-size:24px;color:#0f172a">New message in ${title}</h1>

                    <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid #ff5a5f">
                      <div style="margin-bottom:12px">
                        <span style="font-weight:600;color:#0f172a">From:</span>
                        <span style="margin-left:8px;color:#475569">${senderName}</span>
                      </div>

                      <div style="background:#ffffff;border-radius:8px;padding:16px;border:1px solid #e2e8f0">
                        <p style="margin:0;color:#0f172a;line-height:1.6">${messageContent}</p>
                      </div>
                    </div>

                    <div style="text-align:center;margin:32px 0">
                      <a href="https://rentio.co.za/dashboard/messages?id=${conversation.id}"
                         style="display:inline-block;background:#ff5a5f;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;box-shadow:0 2px 8px rgba(255,90,95,0.3);transition:all 0.2s ease">
                        💬 Reply to Message
                      </a>
                    </div>

                    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e2e8f0">
                      <div style="background:#fef3c7;border-radius:8px;padding:16px;margin-bottom:16px;border-left:4px solid #f59e0b">
                        <h3 style="margin:0 0 8px;font-size:14px;color:#92400e;font-weight:600">💡 Quick Tip</h3>
                        <p style="margin:0;color:#92400e;font-size:13px">Keep all rental communication within Rentio for your protection and to maintain a complete rental history.</p>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;background:#f1f5f9;color:#475569;font-size:12px;text-align:center">
                    <div>You're receiving this email because you're participating in this conversation.</div>
                    <div style="margin-top:8px">© ${new Date().getFullYear()} Rentio. All rights reserved.</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
  `

  // Check if we should send emails (45-minute cooldown and offline check)
  const cooldownTime = new Date(Date.now() - 45 * 60 * 1000) // 45 minutes

  for (const participant of participants) {
    if (!participant.user || !participant.user.email) {
      continue
    }

    const userId = participant.user.id

    try {
      // Check if user is currently active in this specific conversation
      const { data: recentActivity, error: activityError } = await supabase
        .from('user_activity_log')
        .select('last_seen_at, current_conversation_id')
        .eq('user_id', userId)
        .order('last_seen_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (activityError) {
        // If we can't check activity, don't send email (better safe than spammy)
        continue
      }

      // Check if user is currently viewing this conversation (within last 5 minutes)
      if (!options?.forceSend && recentActivity && recentActivity.last_seen_at) {
        const lastSeen = new Date(recentActivity.last_seen_at)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        
        // If user is currently in this conversation and was active in last 5 minutes
        if (recentActivity.current_conversation_id === conversation.id && lastSeen > fiveMinutesAgo) {
          console.log('[EMAIL] User %s is currently active in this conversation (%s), skipping email', userId, lastSeen.toISOString())
          continue
        }
        
        // If user was active in any conversation in the last 45 minutes
        if (lastSeen > cooldownTime) {
          console.log('[EMAIL] User %s was active recently (%s), skipping email', userId, lastSeen.toISOString())
          continue
        }
      }

      // Check if we've sent a notification for this conversation in the last 45 minutes
      const { data: recentNotifications, error: notificationError } = await supabase
        .from('email_notification_log')
        .select('sent_at')
        .eq('user_id', userId)
        .eq('conversation_id', conversation.id)
        .gte('sent_at', cooldownTime.toISOString())
        .limit(1)
        .maybeSingle()

      if (notificationError) {
        console.log('[EMAIL] Error checking recent notifications for user %s:', notificationError)
        // Continue with sending if we can't check
      } else if (!options?.forceSend && recentNotifications) {
        console.log('[EMAIL] Recent notification sent to user %s for conversation %s, skipping', userId, conversation.id)
        continue
      }

      console.log('[EMAIL] Sending notification to:', participant.user.email)
      
      const emailSubject = `💬 ${senderName} sent you a message on Rentio`
      
      // Send the email
      await sendEmail({
        to: participant.user.email,
        subject: emailSubject,
        html,
      })

      // Log the notification
      await supabase
        .from('email_notification_log')
        .insert({
          user_id: userId,
          conversation_id: conversation.id,
          message_id: messageId,
          sent_at: new Date().toISOString(),
          notification_type: 'MESSAGE_NOTIFICATION',
          email_subject: emailSubject,
          email_to: participant.user.email
        })

      console.log('[EMAIL] Email notification sent successfully to %s', participant.user.email)
    } catch (error) {
      console.error('[EMAIL] Failed to send email notification', error)
    }
  }

  console.log('[EMAIL] Finished processing email notifications for conversation %s', conversation.id)
}


