/**
 * Avatar Step Component
 * Third step: Add avatar (optional)
 */

import React, { useState, useRef } from 'react'
import type { AvatarStepProps } from '../../types'
import { processImageFile, validateImageSize, validateImageType } from '../../utils/imageProcessing'

export function AvatarStep({
  name,
  socials,
  onComplete,
  onBack,
  currentStep,
  totalSteps,
  initialValue = null,
  customStyles = {}
}: AvatarStepProps) {
  const [avatar, setAvatar] = useState<string | null>(initialValue)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pressedButton, setPressedButton] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setIsProcessing(true)

    try {
      // Validate file type
      if (!validateImageType(file)) {
        throw new Error('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      }

      // Validate file size (max 10MB)
      if (!validateImageSize(file, 10)) {
        throw new Error('Image file is too large. Maximum size is 10MB')
      }

      // Process the image
      const processedImage = await processImageFile(file, 0.7)
      setAvatar(processedImage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image')
      console.error('Image processing error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatar(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleComplete = () => {
    onComplete(avatar)
  }

  const handleAddPhoto = () => {
    fileInputRef.current?.click()
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
    middle: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '24px',
      marginBottom: '40px'
    },
    avatarContainer: {
      width: '180px',
      height: '180px',
      borderRadius: '90px',
      border: `2px solid rgba(0, 0, 0, 0.1)`,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'border-color 0.2s, transform 0.1s ease',
      backgroundColor: '#f5f5f5',
      WebkitTapHighlightColor: mobileTapHighlightColor
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const
    },
    placeholder: {
      fontSize: '80px'
    },
    avatarActions: {
      display: 'flex',
      gap: '12px'
    },
    actionButton: {
      padding: '10px 20px',
      borderRadius: '20px',
      border: 'none',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      fontFamily,
      transition: 'transform 0.1s ease, opacity 0.2s',
      WebkitTapHighlightColor: mobileTapHighlightColor
    },
    removeButton: {
      backgroundColor: '#f5f5f5',
      color: '#ff3b30'
    },
    errorText: {
      fontSize: '14px',
      color: '#ff3b30',
      textAlign: 'center' as const
    },
    hiddenInput: {
      display: 'none'
    },
    footer: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px'
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
          <h1 style={styles.title}>Add your avatar</h1>
          <p style={styles.subtitle}>(optional)</p>
        </div>

        <div style={styles.middle}>
          {/* Avatar preview/upload */}
          <div
            style={{
              ...styles.avatarContainer,
              transform: pressedButton === 'avatar' ? `scale(${mobileButtonPressScale})` : 'scale(1)',
              borderColor: pressedButton === 'avatar' ? primaryColor : 'rgba(0, 0, 0, 0.1)'
            }}
            onClick={!isProcessing ? handleAddPhoto : undefined}
            onTouchStart={() => !isProcessing && setPressedButton('avatar')}
            onTouchEnd={() => setPressedButton(null)}
            onTouchCancel={() => setPressedButton(null)}
            onMouseEnter={(e) => {
              if (!isProcessing && !pressedButton) {
                ;(e.currentTarget as HTMLElement).style.borderColor = primaryColor
              }
            }}
            onMouseLeave={(e) => {
              if (!pressedButton) {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(0, 0, 0, 0.1)'
                ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
              }
            }}
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" style={styles.avatarImage} />
            ) : (
              <div style={styles.placeholder}>👤</div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            style={styles.hiddenInput}
            disabled={isProcessing}
          />

          {/* Avatar actions */}
          {avatar && !isProcessing && (
            <div style={styles.avatarActions}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveAvatar()
                }}
                style={{
                  ...styles.actionButton,
                  ...styles.removeButton,
                  transform: pressedButton === 'remove' ? `scale(${mobileButtonPressScale})` : 'scale(1)',
                  opacity: pressedButton === 'remove' ? 0.8 : 1
                }}
                onTouchStart={() => setPressedButton('remove')}
                onTouchEnd={() => setPressedButton(null)}
                onTouchCancel={() => setPressedButton(null)}
                onMouseEnter={(e) => {
                  if (!pressedButton) {
                    ;(e.currentTarget as HTMLElement).style.opacity = '0.8'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!pressedButton) {
                    ;(e.currentTarget as HTMLElement).style.opacity = '1'
                    ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
                  }
                }}
              >
                Remove
              </button>
            </div>
          )}

          {/* Processing state */}
          {isProcessing && (
            <div style={{ textAlign: 'center', opacity: 0.7 }}>Processing image...</div>
          )}

          {/* Error message */}
          {error && <div style={styles.errorText}>{error}</div>}
        </div>

        <div style={styles.footer}>
          {avatar ? (
            <button
              onClick={handleComplete}
              style={{
                ...styles.buttonPrimary,
                transform: pressedButton === 'done' ? `scale(${mobileButtonPressScale})` : 'scale(1)',
                opacity: pressedButton === 'done' ? 0.9 : 1
              }}
              disabled={isProcessing}
              onTouchStart={() => setPressedButton('done')}
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
              Done!
            </button>
          ) : (
            <>
              <button
                onClick={handleAddPhoto}
                style={{
                  ...styles.buttonPrimary,
                  transform: pressedButton === 'add' ? `scale(${mobileButtonPressScale})` : 'scale(1)',
                  opacity: pressedButton === 'add' ? 0.9 : 1
                }}
                disabled={isProcessing}
                onTouchStart={() => setPressedButton('add')}
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
                Add an avatar
              </button>
              <button
                onClick={handleComplete}
                style={{
                  ...styles.buttonSecondary,
                  transform: pressedButton === 'skip' ? `scale(${mobileButtonPressScale})` : 'scale(1)',
                  opacity: pressedButton === 'skip' ? 0.8 : 0.6
                }}
                disabled={isProcessing}
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
