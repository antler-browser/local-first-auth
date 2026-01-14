/**
 * Local First Auth Types
 * Compatible with Local First Auth Specification
 */

// ============================================================================
// Profile Types
// ============================================================================

export interface SocialLink {
  platform: SocialPlatform
  handle: string
}

export type SocialPlatform =
  | 'INSTAGRAM'
  | 'X'
  | 'BLUESKY'
  | 'LINKEDIN'
  | 'YOUTUBE'
  | 'SPOTIFY'
  | 'TIKTOK'
  | 'SNAPCHAT'
  | 'GITHUB'
  | 'FACEBOOK'
  | 'REDDIT'
  | 'DISCORD'
  | 'TWITCH'
  | 'TELEGRAM'
  | 'PINTEREST'
  | 'TUMBLR'
  | 'SOUNDCLOUD'
  | 'BANDCAMP'
  | 'PATREON'
  | 'KO_FI'
  | 'MASTODON'
  | 'WEBSITE'
  | 'EMAIL'

export interface Profile {
  did: string
  name: string
  socials?: SocialLink[]
  avatar?: string | null
}

export interface ProfileKeys {
  did: string
  privateKey: string // base64-encoded 64-byte Ed25519 key
  publicKey: string // base64-encoded 32-byte public key
}

// ============================================================================
// Local First Auth API Types (from specification)
// ============================================================================

export interface LocalFirstAuth {
  /**
   * Get profile details as a signed JWT
   */
  getProfileDetails(): Promise<string>

  /**
   * Get avatar as base64-encoded string in a signed JWT
   */
  getAvatar(): Promise<string | null>

  /**
   * Get details about the Local First Auth app
   */
  getAppDetails(): AppDetails

  /**
   * Request additional permissions (future use)
   */
  requestPermission(permission: string): Promise<boolean>

  /**
   * Close the WebView (no-op for web version)
   */
  close(): void
}

export interface AppDetails {
  name: string
  version: string
  platform: 'ios' | 'android' | 'browser'
  supportedPermissions: string[]
}

// ============================================================================
// JWT Types
// ============================================================================

export interface JWTHeader {
  alg: 'EdDSA'
  typ: 'JWT'
}

export interface JWTPayload {
  iss: string // Issuer - user's DID
  aud: string // Audience - origin URL
  iat: number // Issued at timestamp
  exp: number // Expiration timestamp
  type: string // Operation type
  data?: any // Type-specific payload
}

// ============================================================================
// Storage Types
// ============================================================================

export interface StoredProfile {
  did: string
  name: string
  socials?: SocialLink[]
  avatar?: string | null
}

export interface StorageKeys {
  PROFILE: 'local-first-auth:profile'
  PRIVATE_KEY: 'local-first-auth:privateKey'
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface OnboardingConfig {
  /**
   * Mode to display
   */
  mode?: 'download-prompt' | 'choice'

  /**
   * Skip the social links step
   */
  skipSocialStep?: boolean

  /**
   * Skip the avatar step
   */
  skipAvatarStep?: boolean

  /**
   * Custom styles for theming
   */
  customStyles?: CustomStyles

  /**
   * Callback when profile creation is complete
   */
  onComplete?: (profile: Profile) => void

  /**
   * Container element (vanilla JS only)
   */
  container?: string | HTMLElement
}

export interface CustomStyles {
  primaryColor?: string
  backgroundColor?: string
  textColor?: string
  borderRadius?: string
  fontFamily?: string
  buttonRadius?: string
  inputRadius?: string

  // Mobile-specific styling options
  /**
   * Scale factor for button press animation on mobile (0-1)
   * Default: 0.95
   */
  mobileButtonPressScale?: number

  /**
   * Color for mobile tap highlight
   * Default: 'transparent' (disables browser default)
   */
  mobileTapHighlightColor?: string

  /**
   * Enable safe area insets for iOS notch and Android navigation bars
   * Default: true
   */
  useSafeAreaInsets?: boolean
}

// ============================================================================
// Component Props Types (React)
// ============================================================================

export interface OnboardingProps extends Omit<OnboardingConfig, 'container'> {
  children?: React.ReactNode
}

export interface DownloadPromptProps {
  title?: string
  description?: string
  customStyles?: CustomStyles
}

export interface CreateAccountFlowProps {
  initialName?: string
  skipSocialStep?: boolean
  skipAvatarStep?: boolean
  onComplete?: (profile: Profile) => void
  onBack?: () => void
  customStyles?: CustomStyles
}

export interface NameStepProps {
  onNext: (name: string) => void
  onBack?: () => void
  currentStep: number
  totalSteps: number
  initialValue?: string
  customStyles?: CustomStyles
}

export interface SocialsStepProps {
  name: string
  onNext: (socials: SocialLink[]) => void
  onBack: () => void
  currentStep: number
  totalSteps: number
  initialValue?: SocialLink[]
  customStyles?: CustomStyles
}

export interface AvatarStepProps {
  name: string
  socials?: SocialLink[]
  onComplete: (avatar: string | null) => void
  onBack: () => void
  currentStep: number
  totalSteps: number
  initialValue?: string | null
  customStyles?: CustomStyles
}
