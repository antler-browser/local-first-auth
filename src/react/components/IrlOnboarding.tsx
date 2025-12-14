/**
 * IRL Onboarding Component
 * Main wrapper component that handles different modes
 */

import React, { useState } from 'react'
import type { IrlOnboardingProps } from '../../types'
import { DownloadPrompt } from './DownloadPrompt'
import { CreateAccountFlow } from './CreateAccountFlow'
import { DownloadBadges } from './DownloadBadges'
import { usePressState } from '../hooks/usePressState'

export function IrlOnboarding({
  mode = 'choice',
  skipSocialStep = false,
  skipAvatarStep = false,
  customStyles = {},
  onComplete,
  children
}: IrlOnboardingProps) {
  const [selectedMode, setSelectedMode] = useState<'download' | 'create' | null>(
    mode === 'choice' ? null : 'download'
  )
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)

  const { pressedElement, handlePressStart, handlePressEnd } = usePressState()

  // Validate name (2-50 chars)
  const isNameValid = (n: string) => n.trim().length >= 2 && n.trim().length <= 50

  const {
    primaryColor = '#403B51',
    backgroundColor = '#ffffff',
    textColor = '#403B51',
    borderRadius = '12px',
    fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mobileButtonPressScale = 0.95,
    mobileTapHighlightColor = 'transparent',
    useSafeAreaInsets = true
  } = customStyles

  // If mode is choice, show selection screen
  if (mode === 'choice' && !selectedMode) {
    const styles = {
      container: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: useSafeAreaInsets
          ? 'calc(48px + env(safe-area-inset-top)) calc(20px + env(safe-area-inset-right)) calc(48px + env(safe-area-inset-bottom)) calc(20px + env(safe-area-inset-left))'
          : '48px 20px',
        backgroundColor,
        fontFamily,
        color: textColor,
        minHeight: '100vh'
      },
      content: {
        textAlign: 'center' as const,
        maxWidth: '500px',
        width: '100%'
      },
      iconContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '32px'
      },
      icon: {
        width: '120px',
        height: 'auto',
        borderRadius: '24px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
      },
      title: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: primaryColor,
        marginBottom: '16px',
        lineHeight: 1.2
      },
      subtitle: {
        fontSize: '18px',
        marginBottom: '30px',
        lineHeight: 1.5
      },
      buttonsContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px'
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
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        border: 'none',
        borderRadius: borderRadius,
        cursor: 'pointer',
        transition: 'transform 0.1s ease, opacity 0.2s',
        fontFamily,
        WebkitTapHighlightColor: mobileTapHighlightColor
      },
      divider: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        margin: '24px 0',
        opacity: 0.3
      },
      dividerLine: {
        flex: 1,
        height: '1px',
        backgroundColor: textColor
      },
      dividerText: {
        fontSize: '14px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px'
      },
      inputGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
        marginBottom: '16px',
        textAlign: 'left' as const
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
        border: `2px solid ${nameError ? '#ff3b30' : 'rgba(0, 0, 0, 0.1)'}`,
        borderRadius: customStyles.inputRadius || '8px',
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
      secondaryText: {
        fontSize: '16px',
        opacity: 0.7,
        marginBottom: '16px'
      }
    }

    const handleNextClick = () => {
      const trimmedName = name.trim()
      if (!trimmedName) {
        setNameError('Please enter your name')
        return
      }
      if (trimmedName.length < 2) {
        setNameError('Name must be at least 2 characters')
        return
      }
      if (trimmedName.length > 50) {
        setNameError('Name must be less than 50 characters')
        return
      }
      setNameError(null)
      setSelectedMode('create')
    }

    return (
      <div style={styles.container}>
        <div style={styles.content}>

          {/* Primary: Create Account */}
          <h1 style={styles.title}>What's your name?</h1>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError(null)
              }}
              placeholder="Enter your name"
              style={styles.input}
              maxLength={50}
              autoComplete="name"
              inputMode="text"
            />
            {nameError && <div style={styles.errorText}>{nameError}</div>}
          </div>

          <div style={styles.buttonsContainer}>
            <button
              onClick={handleNextClick}
              style={{
                ...styles.buttonPrimary,
                transform: pressedElement === 'next-button' ? `scale(${mobileButtonPressScale})` : 'scale(1)',
                opacity: !name.trim() ? 0.5 : pressedElement === 'next-button' ? 0.9 : 1
              }}
              onTouchStart={() => handlePressStart('next-button')}
              onTouchEnd={handlePressEnd}
              onTouchCancel={handlePressEnd}
              onMouseEnter={(e) => {
                if (!pressedElement && name.trim()) {
                  ;(e.currentTarget as HTMLElement).style.opacity = '0.9'
                }
              }}
              onMouseLeave={(e) => {
                if (!pressedElement) {
                  ;(e.currentTarget as HTMLElement).style.opacity = !name.trim() ? '0.5' : '1'
                  ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
                }
              }}
              disabled={!name.trim()}
            >
              Next
            </button>

            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <div style={styles.dividerText}>or</div>
              <div style={styles.dividerLine} />
            </div>

            {/* Secondary: Use Antler */}
            <p style={styles.secondaryText}>Sign in instantly with Antler</p>

            <DownloadBadges
              pressedElement={pressedElement}
              onPressStart={handlePressStart}
              onPressEnd={handlePressEnd}
              customStyles={{ mobileButtonPressScale, mobileTapHighlightColor }}
            />
          </div>
        </div>
      </div>
    )
  }

  // If mode is download-prompt, show download prompt directly
  if (mode === 'download-prompt') {
    return <DownloadPrompt customStyles={customStyles} />
  }

  // Render create account mode
  if (selectedMode === 'create') {
    const handleBackToChoice = () => {
      setSelectedMode(null)
    }

    return (
      <CreateAccountFlow
        initialName={name.trim()}
        skipSocialStep={skipSocialStep}
        skipAvatarStep={skipAvatarStep}
        onComplete={onComplete}
        onBack={mode === 'choice' ? handleBackToChoice : undefined}
        customStyles={customStyles}
      />
    )
  }

  // Render children if provided (for custom layouts)
  return <>{children}</>
}
