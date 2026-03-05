/**
 * Name Step Component
 * First step: Enter your name
 */

import React, { useState } from 'react'
import type { NameStepProps } from '../../types'

export function NameStep({ onNext, onBack, currentStep, totalSteps, initialValue = '', customStyles = {} }: NameStepProps) {
  const [name, setName] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError('Please enter your name')
      return
    }

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters')
      return
    }

    if (trimmedName.length > 50) {
      setError('Name must be less than 50 characters')
      return
    }

    setError(null)
    onNext(trimmedName)
  }

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
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '24px'
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
      border: `2px solid ${error ? '#ff3b30' : 'rgba(0, 0, 0, 0.1)'}`,
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
    button: {
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
      marginTop: '16px',
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
        {onBack && (
          <button onClick={onBack} style={styles.backButton}>
            ← Back
          </button>
        )}
        <div style={styles.header}>
          {totalSteps > 1 && <div style={styles.progress}>Step {currentStep} of {totalSteps}</div>}
          <h1 style={styles.title}>What's your name?</h1>
          {/* <p style={styles.subtitle}>This is how others will see you</p> */}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Enter your name"
              style={styles.input}
              autoFocus
              maxLength={50}
              autoComplete="name"
              inputMode="text"
            />
            {error && <div style={styles.errorText}>{error}</div>}
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              transform: pressedButton === 'next' ? `scale(${mobileButtonPressScale})` : 'scale(1)',
              opacity: !name.trim() ? 0.5 : pressedButton === 'next' ? 0.9 : 1
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
                ;(e.currentTarget as HTMLElement).style.opacity = !name.trim() ? '0.5' : '1'
                ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
              }
            }}
            disabled={!name.trim()}
          >
            Next
          </button>
        </form>
      </div>
    </div>
  )
}
