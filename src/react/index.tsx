/**
 * Local First Auth - React Bindings
 */

// Export all types
export * from '../types'

// Export React components
export { Onboarding } from './components/Onboarding'
export { DownloadPrompt } from './components/DownloadPrompt'
export { CreateAccountFlow } from './components/CreateAccountFlow'
export { NameStep } from './components/NameStep'
export { SocialsStep } from './components/SocialsStep'
export { AvatarStep } from './components/AvatarStep'

// Export React hooks
export { useOnboarding } from './hooks/useOnboarding'
export type { UseOnboardingReturn } from './hooks/useOnboarding'
export { useProfile } from './hooks/useProfile'

// Re-export core utilities for convenience
export {
  createProfile,
  getCurrentProfile,
  updateProfile
} from '../core/profile'

export {
  hasProfile,
  clearProfile
} from '../core/storage'

export {
  isLocalFirstAuth,
  getPlatform
} from '../utils/deviceDetection'

export {
  getPlatformDisplayName,
  getPlatformPlaceholder,
  normalizeHandle,
  validateHandle,
  getFullURL,
  createSocialLink
} from '../utils/validation'

export {
  injectLocalFirstAuthAPI,
  removeLocalFirstAuthAPI,
  hasLocalFirstAuthAPI
} from '../core/api'
