'use client'

import { useEffect, useState } from 'react'
import RatingRequestModal from './RatingRequestModal'

export default function RatingModalWrapper() {
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const response = await fetch('/api/auth/user')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to check user:', error)
    }
  }

  // Don't render on server or if not mounted
  if (!mounted) return null

  return <RatingRequestModal user={user} />
}
