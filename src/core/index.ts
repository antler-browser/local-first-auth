/**
 * Local First Auth - Core Package
 * Vanilla JS implementation
 */

// Export types
export * from '../types'

// Export crypto utilities
export { generateProfileKeys, createJWT, decodeJWT, verifyJWT } from './crypto'

// Export storage utilities
export {
  saveProfile,
  getProfile,
  savePrivateKey,
  getPrivateKey,
  clearProfile,
  hasProfile
} from './storage'

// Export profile management
export { createProfile, getCurrentProfile, updateProfile } from './profile'

// Export API
export { injectLocalFirstAuthAPI, removeLocalFirstAuthAPI, hasLocalFirstAuthAPI } from './api'

// Export device detection
export {
  isLocalFirstAuth,
  getPlatform
} from '../utils/deviceDetection'

// Export validation utilities
export {
  getPlatformDisplayName,
  getPlatformPlaceholder,
  normalizeHandle,
  validateHandle,
  getFullURL,
  createSocialLink
} from '../utils/validation'
