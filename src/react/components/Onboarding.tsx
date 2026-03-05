/**
 * Onboarding Component
 * Thin wrapper around CreateAccountFlow
 */

import React from 'react'
import type { OnboardingProps } from '../../types'
import { CreateAccountFlow } from './CreateAccountFlow'

export function Onboarding({
  skipSocialStep = false,
  skipAvatarStep = false,
  customStyles = {},
  onComplete,
  children
}: OnboardingProps) {
  return (
    <CreateAccountFlow
      skipSocialStep={skipSocialStep}
      skipAvatarStep={skipAvatarStep}
      onComplete={onComplete}
      customStyles={customStyles}
    />
  )
}
