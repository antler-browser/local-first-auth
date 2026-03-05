/**
 * Socials Step Component
 * Second step: Add social links (optional)
 */

import React, { useState } from 'react'
import type { SocialsStepProps, SocialPlatform, SocialLink } from '../../types'
import {
  getPlatformDisplayName,
  getPlatformPlaceholder,
  normalizeHandle,
  validateHandle,
  getFullURL,
  createSocialLink
} from '../../utils/validation'

interface SocialInput {
  value: string
  error: string | null
  platform: SocialPlatform
}

export function SocialsStep({
  name,
  onNext,
  onBack,
  currentStep,
  totalSteps,
  initialValue = [],
  customStyles = {}
}: SocialsStepProps) {
  const [pressedButton, setPressedButton] = useState<string | null>(null)

  const {
    primaryColor = '#403B51',
    backgroundColor = '#ffffff',
    textColor = '#403B51',
    borderRadius = '12px',
    fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    inputRadius = '8px',
    mobileButtonPressScale = 0.95,
    mobileTapHighlightColor = 'transparent',
    useSafeAreaInsets = true
  } = customStyles

  // Primary platforms shown by default
  const primaryPlatforms: SocialPlatform[] = ['INSTAGRAM', 'X', 'BLUESKY', 'LINKEDIN']

  // Additional platforms
  const additionalPlatforms: SocialPlatform[] = [
    'YOUTUBE',
    'SPOTIFY',
    'TIKTOK',
    'SNAPCHAT',
    'GITHUB',
    'FACEBOOK',
    'REDDIT',
    'DISCORD',
    'TWITCH',
    'TELEGRAM',
    'PINTEREST',
    'TUMBLR',
    'SOUNDCLOUD',
    'BANDCAMP',
    'PATREON',
    'KO_FI',
    'MASTODON',
    'WEBSITE',
    'EMAIL'
  ]

  const allPlatforms = [...primaryPlatforms, ...additionalPlatforms]

  // Initialize inputs
  const [socialInputs, setSocialInputs] = useState<SocialInput[]>(() => {
    return allPlatforms.map((platform) => {
      const existing = initialValue.find((s) => s.platform === platform)
      return {
        value: existing?.handle || '',
        error: null,
        platform
      }
    })
  })

  const [showMore, setShowMore] = useState(() => {
    // Auto-expand if user has data in additional platforms
    return additionalPlatforms.some((platform) =>
      initialValue.some((s) => s.platform === platform)
    )
  })

  const handleInputChange = (platform: SocialPlatform, value: string) => {
    setSocialInputs((prev) =>
      prev.map((input) =>
        input.platform === platform
          ? { ...input, value, error: null }
          : input
      )
    )
  }

  const handleInputBlur = (platform: SocialPlatform) => {
    setSocialInputs((prev) =>
      prev.map((input) => {
        if (input.platform !== platform) return input

        if (input.value.trim()) {
          const normalized = normalizeHandle(platform, input.value)
          const value = normalized ?? ''
          const error = !validateHandle(platform, value)
            ? 'Invalid format for this platform'
            : null

          return { ...input, value, error }
        }

        return input
      })
    )
  }

  const handleNext = () => {
    const socials: SocialLink[] = []
    let hasErrors = false

    socialInputs.forEach((input) => {
      if (input.value.trim()) {
        const socialLink = createSocialLink(input.platform, input.value)
        if (socialLink) {
          socials.push(socialLink)
        } else {
          hasErrors = true
        }
      }
    })

    if (hasErrors) {
      // Re-validate to show errors
      setSocialInputs((prev) =>
        prev.map((input) => {
          if (input.value.trim()) {
            const normalized = normalizeHandle(input.platform, input.value)
            const isValid = validateHandle(input.platform, normalized ?? '')
            return {
              ...input,
              value: normalized ?? '',
              error: isValid ? null : 'Invalid format for this platform'
            }
          }
          return input
        })
      )
      return
    }

    onNext(socials)
  }

  const renderSocialInput = (input: SocialInput) => {
    const previewNotNeeded = ['EMAIL', 'WEBSITE'].includes(input.platform)
    const inputMode = input.platform === 'EMAIL' ? 'email' : input.platform === 'WEBSITE' ? 'url' : 'text'

    return (
      <div key={input.platform} style={styles.inputGroup}>
        <label style={styles.label}>{getPlatformDisplayName(input.platform)}</label>
        <div>
          <input
            type="text"
            placeholder={getPlatformPlaceholder(input.platform)}
            value={input.value}
            onChange={(e) => handleInputChange(input.platform, e.target.value)}
            onBlur={() => handleInputBlur(input.platform)}
            style={{
              ...styles.input,
              borderColor: input.error ? '#ff3b30' : 'rgba(0, 0, 0, 0.1)'
            }}
            autoCapitalize="none"
            autoCorrect="off"
            inputMode={inputMode}
          />
          {input.error && <div style={styles.errorText}>{input.error}</div>}
          {input.value && !input.error && !previewNotNeeded && (
            <div style={styles.previewText}>
              {getFullURL(input.platform, input.value)}
            </div>
          )}
        </div>
      </div>
    )
  }

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      padding: useSafeAreaInsets
        ? 'calc(48px + env(safe-area-inset-top)) calc(20px + env(safe-area-inset-right)) calc(48px + env(safe-area-inset-bottom)) calc(20px + env(safe-area-inset-left))'
        : '48px 20px',
      backgroundColor,
      fontFamily,
      color: textColor,
      minHeight: '100vh'
    },
    content: {
      width: '100%',
      maxWidth: '500px'
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '40px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: primaryColor,
      marginBottom: '8px',
      lineHeight: 1.2
    },
    subtitle: {
      fontSize: '16px',
      opacity: 0.7,
      marginTop: '12px'
    },
    progress: {
      fontSize: '14px',
      opacity: 0.5,
      marginBottom: '16px'
    },
    middle: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '24px',
      marginBottom: '24px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      paddingLeft: '4px',
      opacity: 0.8
    },
    input: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      border: '2px solid rgba(0, 0, 0, 0.1)',
      borderRadius: inputRadius,
      outline: 'none',
      transition: 'border-color 0.2s',
      fontFamily,
      boxSizing: 'border-box' as const,
      WebkitTapHighlightColor: mobileTapHighlightColor
    },
    errorText: {
      fontSize: '12px',
      color: '#ff3b30',
      marginTop: '4px',
      paddingLeft: '4px'
    },
    previewText: {
      fontSize: '11px',
      opacity: 0.5,
      marginTop: '4px',
      paddingLeft: '4px'
    },
    moreButton: {
      fontSize: '14px',
      opacity: 0.6,
      textAlign: 'center' as const,
      cursor: 'pointer',
      padding: '8px',
      background: 'none',
      border: 'none',
      fontFamily,
      color: textColor,
      transition: 'transform 0.1s ease, opacity 0.2s',
      WebkitTapHighlightColor: mobileTapHighlightColor
    },
    footer: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
      marginTop: '24px'
    },
    buttonPrimary: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      fontWeight: '600',
      color: '#ffffff',
      backgroundColor: primaryColor,
      border: 'none',
      borderRadius: borderRadius,
      cursor: 'pointer',
      transition: 'transform 0.1s ease, opacity 0.2s',
      fontFamily,
      WebkitTapHighlightColor: mobileTapHighlightColor
    },
    buttonSecondary: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      fontWeight: '600',
      color: textColor,
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      opacity: 0.6,
      fontFamily,
      transition: 'transform 0.1s ease, opacity 0.2s',
      WebkitTapHighlightColor: mobileTapHighlightColor
    },
    backButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500' as const,
      color: textColor,
      opacity: 0.6,
      padding: '4px 0',
      fontFamily,
      transition: 'opacity 0.2s',
      alignSelf: 'flex-start' as const,
      marginBottom: '8px',
      WebkitTapHighlightColor: mobileTapHighlightColor
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button onClick={onBack} style={styles.backButton}>
          ← Back
        </button>
        <div style={styles.header}>
          <div style={styles.progress}>Step {currentStep} of {totalSteps}</div>
          <h1 style={styles.title}>Add your socials</h1>
          <p style={styles.subtitle}>(optional)</p>
        </div>

        <div style={styles.middle}>
          {/* Primary platforms */}
          {socialInputs
            .filter((input) => primaryPlatforms.includes(input.platform))
            .map(renderSocialInput)}

          {/* More options toggle */}
          {!showMore && (
            <button
              onClick={() => setShowMore(true)}
              style={{
                ...styles.moreButton,
                transform: pressedButton === 'more' ? `scale(${mobileButtonPressScale})` : 'scale(1)'
              }}
              onTouchStart={() => setPressedButton('more')}
              onTouchEnd={() => setPressedButton(null)}
              onTouchCancel={() => setPressedButton(null)}
            >
              + More options
            </button>
          )}

          {/* Additional platforms */}
          {showMore &&
            socialInputs
              .filter((input) => additionalPlatforms.includes(input.platform))
              .map(renderSocialInput)}

          {/* Less options toggle */}
          {showMore && (
            <button
              onClick={() => setShowMore(false)}
              style={{
                ...styles.moreButton,
                transform: pressedButton === 'less' ? `scale(${mobileButtonPressScale})` : 'scale(1)'
              }}
              onTouchStart={() => setPressedButton('less')}
              onTouchEnd={() => setPressedButton(null)}
              onTouchCancel={() => setPressedButton(null)}
            >
              - Less options
            </button>
          )}
        </div>

        <div style={styles.footer}>
          <button
            onClick={handleNext}
            style={{
              ...styles.buttonPrimary,
              transform: pressedButton === 'next' ? `scale(${mobileButtonPressScale})` : 'scale(1)',
              opacity: pressedButton === 'next' ? 0.9 : 1
            }}
            onTouchStart={() => setPressedButton('next')}
            onTouchEnd={() => setPressedButton(null)}
            onTouchCancel={() => setPressedButton(null)}
            onMouseEnter={(e) => {
              if (!pressedButton) {
                ;(e.currentTarget as HTMLElement).style.opacity = '0.9'
              }
            }}
            onMouseLeave={(e) => {
              if (!pressedButton) {
                ;(e.currentTarget as HTMLElement).style.opacity = '1'
                ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
              }
            }}
          >
            Next
          </button>
          <button
            onClick={() => onNext([])}
            style={{
              ...styles.buttonSecondary,
              transform: pressedButton === 'skip' ? `scale(${mobileButtonPressScale})` : 'scale(1)',
              opacity: pressedButton === 'skip' ? 0.8 : 0.6
            }}
            onTouchStart={() => setPressedButton('skip')}
            onTouchEnd={() => setPressedButton(null)}
            onTouchCancel={() => setPressedButton(null)}
            onMouseEnter={(e) => {
              if (!pressedButton) {
                ;(e.currentTarget as HTMLElement).style.opacity = '0.8'
              }
            }}
            onMouseLeave={(e) => {
              if (!pressedButton) {
                ;(e.currentTarget as HTMLElement).style.opacity = '0.6'
                ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
              }
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
