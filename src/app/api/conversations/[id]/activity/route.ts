import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuthUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = await params

    // Check if user is participant in this conversation
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (participantError || !participant) {
      console.error('[ACTIVITY] Participant check failed:', { participantError, participant })
      return NextResponse.json({ error: 'Unauthorized to view this conversation' }, { status: 403 })
    }

    // Get all participants in this conversation
    const { data: participants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)

    if (participantsError) {
      console.error('[ACTIVITY] Failed to fetch participants:', participantsError)
      return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 })
    }

    if (!participants || participants.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Get activity for all participants
    const participantIds = participants.map(p => p.user_id)
    
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activity_log')
      .select('user_id, last_seen_at, last_active_at')
      .in('user_id', participantIds)

    if (activitiesError) {
      console.error('[ACTIVITY] Failed to fetch activities:', activitiesError)
      return NextResponse.json({ error: 'Failed to fetch activity data' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: activities || []
    })
  } catch (error) {
    console.error('[ACTIVITY] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
