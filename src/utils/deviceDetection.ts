/**
 * Device detection utilities
 */

/**
 * Check if running in a Local First Auth compatible app
 */
export function isLocalFirstAuth(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return !!(window as any).localFirstAuth
}

/**
 * Get the device platform
 */
export function getPlatform(): 'ios' | 'android' | 'browser' {
  return 'browser'
}
