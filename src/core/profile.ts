/**
 * Profile creation and management
 */

import type { Profile, SocialLink } from '../types'
import { generateProfileKeys } from './crypto'
import { saveProfile, savePrivateKey, getProfile, getPrivateKey } from './storage'
import { injectLocalFirstAuthAPI } from './api'

/**
 * Create a new profile with DID and keys
 */
export async function createProfile(
  name: string,
  socials?: SocialLink[],
  avatar?: string | null
): Promise<Profile> {
  // Generate DID and keys
  const { did, privateKey } = await generateProfileKeys()

  // Create profile object
  const profile: Profile = {
    did,
    name,
    socials,
    avatar: avatar || null
  }

  // Save to storage
  saveProfile({
    did: profile.did,
    name: profile.name,
    socials: profile.socials,
    avatar: profile.avatar
  })
  savePrivateKey(privateKey)

  // Inject Local First Auth API
  injectLocalFirstAuthAPI()

  console.log('Profile created successfully:', {
    did,
    name,
    socials: socials?.length || 0,
    hasAvatar: !!avatar
  })

  return profile
}

/**
 * Get the current profile
 */
export function getCurrentProfile(): Profile | null {
  const storedProfile = getProfile()
  const privateKey = getPrivateKey()

  if (!storedProfile || !privateKey) {
    return null
  }

  return {
    did: storedProfile.did,
    name: storedProfile.name,
    socials: storedProfile.socials,
    avatar: storedProfile.avatar
  }
}

/**
 * Update the current profile
 */
export async function updateProfile(
  updates: Partial<Omit<Profile, 'did'>>
): Promise<Profile> {
  const currentProfile = getCurrentProfile()

  if (!currentProfile) {
    throw new Error('No profile exists to update')
  }

  // Merge updates
  const updatedProfile: Profile = {
    ...currentProfile,
    ...updates
  }

  // Save to storage
  saveProfile({
    did: updatedProfile.did,
    name: updatedProfile.name,
    socials: updatedProfile.socials,
    avatar: updatedProfile.avatar
  })

  console.log('Profile updated successfully')

  return updatedProfile
}
