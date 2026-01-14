/**
 * Mock Local First Auth API implementation
 * Implements the LocalFirstAuth interface from the Local First Auth Specification
 */

import type { LocalFirstAuth, AppDetails, JWTPayload } from '../types'
import { getProfile, getPrivateKey } from './storage'
import { createJWT } from './crypto'

/**
 * Implementation of the Local First Auth API
 * This gets injected as window.localFirstAuth after profile creation
 */
export class MockLocalFirstAuth implements LocalFirstAuth {

  /**
   * Get profile details as a signed JWT
   */
  async getProfileDetails(): Promise<string> {
    const profile = getProfile()
    const privateKey = getPrivateKey()

    if (!profile || !privateKey) {
      throw new Error('No profile found. User must create a profile first.')
    }

    // Create JWT payload
    const now = Math.floor(Date.now() / 1000)
    const payload: JWTPayload = {
      iss: profile.did,
      aud: window.location.origin,
      iat: now,
      exp: now + 120, // 2 minutes expiration
      type: 'localFirstAuth:profile:details',
      data: {
        did: profile.did,
        name: profile.name,
        socials: profile.socials || []
      }
    }

    // Sign and return JWT
    return createJWT(payload, privateKey)
  }

  /**
   * Get avatar as base64-encoded string in a signed JWT
   */
  async getAvatar(): Promise<string | null> {
    const profile = getProfile()
    const privateKey = getPrivateKey()

    if (!profile || !privateKey) {
      throw new Error('No profile found. User must create a profile first.')
    }

    // Return null if no avatar
    if (!profile.avatar) {
      return null
    }

    // Create JWT payload
    const now = Math.floor(Date.now() / 1000)
    const payload: JWTPayload = {
      iss: profile.did,
      aud: window.location.origin,
      iat: now,
      exp: now + 120, // 2 minutes expiration
      type: 'localFirstAuth:avatar',
      data: {
        did: profile.did,
        avatar: profile.avatar
      }
    }

    // Sign and return JWT
    return createJWT(payload, privateKey)
  }

  /**
   * Get details about the Local First Auth app
   */
  getAppDetails(): AppDetails {
    return {
      name: 'Local First Auth',
      version: '2.0.0',
      platform: 'browser',
      supportedPermissions: ['profile']
    }
  }

  /**
   * Request additional permissions (future use)
   * For v1, only 'profile' permission is supported and auto-granted
   */
  async requestPermission(permission: string): Promise<boolean> {
    // Only profile permission is supported in v1
    if (permission === 'profile') {
      return true
    }

    // For future permissions, show browser confirm dialog
    console.warn(`Permission "${permission}" is not yet supported`)
    return false
  }

  /**
   * Close the WebView (no-op for web version)
   * In a real Local First Auth app, this would close the WebView and return to QR scanner
   */
  close(): void {
    console.log('close() called - no-op in web version')
    // In web version, this is a no-op
    // Developers can override this behavior if needed
  }
}

/**
 * Inject the Local First Auth API into window object
 */
export function injectLocalFirstAuthAPI(): void {
  if (typeof window === 'undefined') {
    console.warn('Cannot inject Local First Auth API: window is undefined (not in browser)')
    return
  }

  if ((window as any).localFirstAuth) {
    console.warn('Local First Auth API already exists on window object')
    return
  }

  // Create and inject the API
  const api = new MockLocalFirstAuth()
  ;(window as any).localFirstAuth = api

  console.log('Local First Auth API injected successfully')
}

/**
 * Remove the Local First Auth API from window object
 */
export function removeLocalFirstAuthAPI(): void {
  if (typeof window === 'undefined') {
    return
  }

  delete (window as any).localFirstAuth
  console.log('Local First Auth API removed')
}

/**
 * Check if Local First Auth API is available
 */
export function hasLocalFirstAuthAPI(): boolean {
  return typeof window !== 'undefined' && !!(window as any).localFirstAuth
}
