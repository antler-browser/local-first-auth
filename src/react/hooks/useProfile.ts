/**
 * React hook for accessing current profile
 */

import { useState, useEffect } from 'react'
import { getCurrentProfile } from '../../core/profile'
import type { Profile } from '../../types'

/**
 * Hook to get the current profile
 * Updates when profile changes in storage
 */
export function useProfile(): Profile | null {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    // Get initial profile
    const currentProfile = getCurrentProfile()
    setProfile(currentProfile)

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'local-first-auth:profile' || e.key === null) {
        const updatedProfile = getCurrentProfile()
        setProfile(updatedProfile)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return profile
}
