/**
 * Create Account Flow Component
 * Orchestrates the 3-step onboarding process
 */

import React, { useState } from 'react'
import type { CreateAccountFlowProps, SocialLink } from '../../types'
import { NameStep } from './NameStep'
import { SocialsStep } from './SocialsStep'
import { AvatarStep } from './AvatarStep'
import { createProfile } from '../../core/profile'

export function CreateAccountFlow({
  initialName,
  skipSocialStep = false,
  skipAvatarStep = false,
  onComplete,
  onBack,
  customStyles = {}
}: CreateAccountFlowProps) {
  // Check if we have a valid initial name (2-50 chars)
  const hasValidInitialName = !!(initialName && initialName.trim().length >= 2 && initialName.trim().length <= 50)

  // Determine starting step based on whether name is pre-provided
  const getInitialStep = (): 'name' | 'socials' | 'avatar' => {
    if (!hasValidInitialName) return 'name'
    if (!skipSocialStep) return 'socials'
    if (!skipAvatarStep) return 'avatar'
    return 'name' // fallback
  }

  const [step, setStep] = useState<'name' | 'socials' | 'avatar'>(getInitialStep())
  const [name, setName] = useState(hasValidInitialName ? initialName!.trim() : '')
  const [socials, setSocials] = useState<SocialLink[]>([])
  const [isCreating, setIsCreating] = useState(false)

  // Calculate total steps based on skip parameters
  const totalSteps = 3
    - (hasValidInitialName ? 1 : 0) // skip name step if pre-provided
    - (skipSocialStep ? 1 : 0)
    - (skipAvatarStep ? 1 : 0)

  const handleNameNext = (enteredName: string) => {
    setName(enteredName)

    // Skip to avatar if social step is disabled
    if (skipSocialStep) {
      if (skipAvatarStep) {
        // Both steps skipped - create profile immediately
        handleComplete(enteredName, [], null)
      } else {
        setStep('avatar')
      }
    } else {
      setStep('socials')
    }
  }

  const handleNameBack = () => {
    if (onBack) {
      onBack()
    }
  }

  const handleSocialsNext = (selectedSocials: SocialLink[]) => {
    setSocials(selectedSocials)

    // Skip to completion if avatar step is disabled
    if (skipAvatarStep) {
      handleComplete(name, selectedSocials, null)
    } else {
      setStep('avatar')
    }
  }

  const handleSocialsBack = () => {
    // If name was pre-provided, go back to the combined screen
    if (hasValidInitialName && onBack) {
      onBack()
    } else {
      setStep('name')
    }
  }

  const handleAvatarBack = () => {
    if (skipSocialStep) {
      // If socials is skipped and name was pre-provided, go back to combined screen
      if (hasValidInitialName && onBack) {
        onBack()
      } else {
        setStep('name')
      }
    } else {
      setStep('socials')
    }
  }

  const handleComplete = async (
    finalName: string,
    finalSocials: SocialLink[],
    avatar: string | null
  ) => {
    setIsCreating(true)

    try {
      // Create the profile
      const profile = await createProfile(
        finalName,
        finalSocials.length > 0 ? finalSocials : undefined,
        avatar
      )

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(profile)
      }
    } catch (error) {
      console.error('Failed to create profile:', error)
      alert('Failed to create profile. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  if (isCreating) {
    const {
      backgroundColor = '#ffffff',
      textColor = '#403B51',
      fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      useSafeAreaInsets = true
    } = customStyles

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: useSafeAreaInsets
            ? 'calc(48px + env(safe-area-inset-top)) calc(20px + env(safe-area-inset-right)) calc(48px + env(safe-area-inset-bottom)) calc(20px + env(safe-area-inset-left))'
            : '48px 20px',
          backgroundColor,
          fontFamily,
          color: textColor,
          minHeight: '100vh'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>⏳</div>
          <div style={{ fontSize: '18px', opacity: 0.7 }}>Creating your profile...</div>
        </div>
      </div>
    )
  }

  // Render current step
  switch (step) {
    case 'name':
      return (
        <NameStep
          onNext={handleNameNext}
          onBack={onBack ? handleNameBack : undefined}
          currentStep={1}
          totalSteps={totalSteps}
          initialValue={name}
          customStyles={customStyles}
        />
      )

    case 'socials':
      return (
        <SocialsStep
          name={name}
          onNext={handleSocialsNext}
          onBack={handleSocialsBack}
          currentStep={hasValidInitialName ? 1 : 2}
          totalSteps={totalSteps}
          initialValue={socials}
          customStyles={customStyles}
        />
      )

    case 'avatar':
      // Calculate current step for avatar
      // Start from 1, add 1 if name step shown, add 1 if socials step shown
      const avatarStep = 1 + (hasValidInitialName ? 0 : 1) + (skipSocialStep ? 0 : 1)
      return (
        <AvatarStep
          name={name}
          socials={socials}
          onComplete={(avatar) => handleComplete(name, socials, avatar)}
          onBack={handleAvatarBack}
          currentStep={avatarStep}
          totalSteps={totalSteps}
          customStyles={customStyles}
        />
      )
  }
}
