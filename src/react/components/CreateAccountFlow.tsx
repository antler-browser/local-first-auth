/**
 * Create Account Flow Component
 * Orchestrates the 3-step onboarding process
 */

import React, { useState } from 'react'
import type { CreateAccountFlowProps, SocialLink } from '../../types'
import { NameStep } from './NameStep'
import { SocialsStep } from './SocialsStep'
import { AvatarStep } from './AvatarStep'
import { createProfile, updateProfile } from '../../core/profile'

export function CreateAccountFlow({
  initialName,
  skipSocialStep = false,
  skipAvatarStep = false,
  onComplete,
  onBack,
  customStyles = {},
  mode = 'create',
  initialSocials = [],
  initialAvatar = null
}: CreateAccountFlowProps) {
  // Pre-fill the name if a valid one (2-50 chars) was provided
  const hasValidInitialName = !!(initialName && initialName.trim().length >= 2 && initialName.trim().length <= 50)

  const [step, setStep] = useState<'name' | 'socials' | 'avatar'>('name')
  const [name, setName] = useState(hasValidInitialName ? initialName!.trim() : '')
  const [socials, setSocials] = useState<SocialLink[]>(initialSocials)
  const [isSaving, setIsSaving] = useState(false)

  // Calculate total steps based on skip parameters
  const totalSteps = 3
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
    setStep('name')
  }

  const handleAvatarBack = () => {
    if (skipSocialStep) {
      setStep('name')
    } else {
      setStep('socials')
    }
  }

  const handleComplete = async (
    finalName: string,
    finalSocials: SocialLink[],
    avatar: string | null
  ) => {
    setIsSaving(true)

    try {
      // Edit mode updates the current profile in place (keeps the DID);
      // create mode mints a brand-new identity.
      const profile =
        mode === 'edit'
          ? await updateProfile({
              name: finalName,
              socials: finalSocials.length > 0 ? finalSocials : undefined,
              avatar
            })
          : await createProfile(
              finalName,
              finalSocials.length > 0 ? finalSocials : undefined,
              avatar
            )

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(profile)
      }
    } catch (error) {
      console.error(`Failed to ${mode === 'edit' ? 'update' : 'create'} profile:`, error)
      alert(`Failed to ${mode === 'edit' ? 'update' : 'create'} profile. Please try again.`)
    } finally {
      setIsSaving(false)
    }
  }

  if (isSaving) {
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
          <div style={{ fontSize: '18px', opacity: 0.7 }}>
            {mode === 'edit' ? 'Saving your changes...' : 'Creating your profile...'}
          </div>
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
          currentStep={2}
          totalSteps={totalSteps}
          initialValue={socials}
          customStyles={customStyles}
        />
      )

    case 'avatar':
      // Calculate current step for avatar
      // Name is always step 1; add 1 if the socials step is shown
      const avatarStep = 2 + (skipSocialStep ? 0 : 1)
      return (
        <AvatarStep
          name={name}
          socials={socials}
          onComplete={(avatar) => handleComplete(name, socials, avatar)}
          onBack={handleAvatarBack}
          currentStep={avatarStep}
          totalSteps={totalSteps}
          initialValue={initialAvatar}
          customStyles={customStyles}
        />
      )
  }
}
