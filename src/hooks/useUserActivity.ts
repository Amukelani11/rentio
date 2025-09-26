import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseUserActivityProps {
  userId: string | null
  conversationId?: string | null
  activityType?: string
}

export function useUserActivity({
  userId,
  conversationId,
  activityType = 'MESSAGES_PAGE'
}: UseUserActivityProps) {
  const supabase = createClient()

  const updateActivity = useCallback(async () => {
    if (!userId) return

    try {
      // Update user activity with current conversation tracking
      await supabase.rpc('update_user_activity', {
        user_uuid: userId,
        activity_type: activityType,
        conversation_uuid: conversationId || null
      })
    } catch (error) {
      // Silently fail - activity tracking shouldn't break the app
      console.debug('[ACTIVITY] Failed to update user activity:', error)
    }
  }, [userId, conversationId, activityType, supabase])

  // Update activity on page load
  useEffect(() => {
    updateActivity()
  }, [updateActivity])

  // Update activity periodically (every 5 minutes)
  useEffect(() => {
    if (!userId) return

    const interval = setInterval(updateActivity, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [userId, updateActivity])

  // Update activity on user interactions (clicks, typing, etc.)
  useEffect(() => {
    if (!userId) return

    const handleUserActivity = () => updateActivity()

    // Listen for various user interactions
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity)
      })
    }
  }, [userId, updateActivity])

  return { updateActivity }
}
