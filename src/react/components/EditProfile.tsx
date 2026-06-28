/**
 * EditProfile Component
 * Thin wrapper around CreateAccountFlow that edits the current profile in place.
 * Mirrors the Onboarding component, but seeds from the existing profile and runs
 * in 'edit' mode so the DID / identity is preserved.
 */

import React from 'react'
import type { EditProfileProps } from '../../types'
import { getCurrentProfile } from '../../core/profile'
import { CreateAccountFlow } from './CreateAccountFlow'

export function EditProfile({
  skipSocialStep = false,
  skipAvatarStep = false,
  customStyles = {},
  onComplete,
  onBack
}: EditProfileProps) {
  const profile = getCurrentProfile()

  // No profile to edit — render nothing and let the app decide what to do.
  if (!profile) {
    return null
  }

  return (
    <CreateAccountFlow
      mode="edit"
      initialName={profile.name}
      initialSocials={profile.socials ?? []}
      initialAvatar={profile.avatar ?? null}
      skipSocialStep={skipSocialStep}
      skipAvatarStep={skipAvatarStep}
      customStyles={customStyles}
      onComplete={onComplete}
      onBack={onBack}
    />
  )
}
