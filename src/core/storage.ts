/**
 * LocalStorage wrapper for profile storage
 */

import type { StoredProfile } from '../types'

const STORAGE_KEYS = {
  PROFILE: 'local-first-auth:profile',
  PRIVATE_KEY: 'local-first-auth:privateKey',
} as const

/**
 * Save profile to LocalStorage
 */
export function saveProfile(profile: StoredProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile))
  } catch (error) {
    console.error('Failed to save profile:', error)
    throw new Error('Failed to save profile to LocalStorage')
  }
}

/**
 * Get profile from LocalStorage
 */
export function getProfile(): StoredProfile | null {
  try {
    const profileString = localStorage.getItem(STORAGE_KEYS.PROFILE)
    if (!profileString) {
      return null
    }

    return JSON.parse(profileString) as StoredProfile
  } catch (error) {
    console.error('Failed to get profile:', error)
    return null
  }
}

/**
 * Save private key to LocalStorage
 */
export function savePrivateKey(privateKey: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRIVATE_KEY, privateKey)
  } catch (error) {
    console.error('Failed to save private key:', error)
    throw new Error('Failed to save private key to LocalStorage')
  }
}

/**
 * Get private key from LocalStorage
 */
export function getPrivateKey(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.PRIVATE_KEY)
  } catch (error) {
    console.error('Failed to get private key:', error)
    return null
  }
}

/**
 * Clear all stored profile data
 */
export function clearProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILE)
    localStorage.removeItem(STORAGE_KEYS.PRIVATE_KEY)
  } catch (error) {
    console.error('Failed to clear profile:', error)
  }
}

/**
 * Check if a profile exists in storage
 */
export function hasProfile(): boolean {
  return getProfile() !== null && getPrivateKey() !== null
}
