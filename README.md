# Local First Auth

When users don't have a Local First Auth mobile app installed (like Antler), this package gives them options to either create a one-time account or download the app.

This allows you to skip building user management and authentication systems. Users with a Local First Auth app can login with their existing profile, while users without one can still access your mini-app through the one-time account option.

## Demo

![Local First Auth Demo](https://github.com/AntlerBrowser/local-first-auth/blob/main/demo.gif?raw=true)


## Features

- **Dual onboarding paths**: Download app or create web account
- **DID-based authentication**: Uses W3C Decentralized Identifiers (did:key)
- **Local First Auth API compatible**: Generates profiles that work identically to Antler
- **Zero configuration**: Works out-of-the-box with sensible defaults
- **Customizable styling**: Match your mini-app's branding
- **Tiny bundle**: Minimal dependencies
- **Framework agnostic**: Vanilla JS core + React bindings

## Installation

```bash
npm install local-first-auth
```

## Quick Start

### React

```tsx
import { Onboarding } from 'local-first-auth/react'

function App() {
  const hasLocalFirstAuth = typeof window !== 'undefined' && window.localFirstAuth
  const [showOnboarding, setShowOnboarding] = useState(!hasLocalFirstAuth)

  if (showOnboarding) {
    return (
      <Onboarding
        mode="choice" // Shows both download and create account options
        onComplete={(profile) => {
          console.log('Profile created:', profile)
          setShowOnboarding(false)
        }}
        customStyles={{ primaryColor: '#403B51' }}
      />
    )
  }

  return <YourMiniApp />
}
```

### Vanilla JavaScript

```js
import { createOnboarding } from 'local-first-auth'

const onboarding = createOnboarding({
  container: '#onboarding-root',
  mode: 'choice',
  onComplete: (profile) => {
    console.log('Profile created:', profile)
    // window.localFirstAuth is now available
  }
})
```

## Modes

### `choice` (Recommended)
Shows both options: download Antler app or create one-time account.

```tsx
<Onboarding mode="choice" />
```

### `download-prompt`
Only shows download buttons for iOS and Android.

```tsx
<Onboarding mode="download-prompt" />
```

## Customization

### Skip Steps

```tsx
<Onboarding
  skipSocialStep={true}   // Skip social links step
  skipAvatarStep={true}   // Skip avatar upload step
/>
```

### Custom Styling

```tsx
<Onboarding
  customStyles={{
    primaryColor: '#403B51',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    borderRadius: '12px',
    fontFamily: 'Inter, sans-serif',
    inputRadius: '8px',
    buttonRadius: '12px'
  }}
/>
```

## Account Creation Flow

1. **Name Step**: User enters their name (required)
2. **Socials Step**: Add social media links (optional)
   - Instagram, X, Bluesky, LinkedIn, GitHub, and 15+ more
   - Automatic validation and normalization
   - URL preview
3. **Avatar Step**: Upload and crop profile picture (optional)
   - Automatic resize to 512x512px
   - JPEG compression (~1MB max)
   - Browser-based processing (no server required)

## How It Works

When a user creates a one-time account:

1. **DID Generation**: Generates an Ed25519 keypair and did:key identifier
2. **Profile Storage**: Saves profile data to LocalStorage
3. **API Injection**: Injects `window.localFirstAuth` object
4. **JWT Signing**: All API methods return signed JWTs (compatible with Local First Auth spec)

The generated profile works identically to a profile from a Local First Auth mobile app. You can use this package to create a one-time account for users who do not have a Local First Auth mobile app installed and do not want to download one. Your backend can verify JWTs the same way it would for a profile from a Local First Auth mobile app.

## API Reference

### React Components

#### `<Onboarding />`
Main wrapper component.

```tsx
interface OnboardingProps {
  mode?: 'download-prompt' | 'choice'
  skipSocialStep?: boolean
  skipAvatarStep?: boolean
  customStyles?: CustomStyles
  onComplete?: (profile: Profile) => void
}
```

#### `<DownloadPrompt />`
Shows iOS/Android download buttons.

```tsx
interface DownloadPromptProps {
  title?: string
  description?: string
  customStyles?: CustomStyles
}
```

#### `<CreateAccountFlow />`
The 3-step account creation flow.

```tsx
interface CreateAccountFlowProps {
  skipSocialStep?: boolean
  skipAvatarStep?: boolean
  onComplete?: (profile: Profile) => void
  customStyles?: CustomStyles
}
```

### React Hooks

#### `useOnboarding()`
Hook for detecting Local First Auth status and determining whether to show onboarding.

```tsx
import { useOnboarding } from 'local-first-auth/react'

const { shouldShowOnboarding, profile, isLoading } = useOnboarding()

// Returns:
// - shouldShowOnboarding: boolean (true if no API available)
// - profile: Profile | null (user's profile if web account exists)
// - isLoading: boolean (initial loading state)

// Derived values you can compute:
// - hasApi = !shouldShowOnboarding
// - isNativeApp = !shouldShowOnboarding && profile === null
// - hasWebAccount = profile !== null
```

#### `useProfile()`
Hook for accessing the current user profile.

```tsx
import { useProfile } from 'local-first-auth/react'

const profile = useProfile()
// Returns Profile | null
```

### Core Functions

```ts
// Profile management
import {
  createProfile,
  getCurrentProfile,
  updateProfile,
  hasProfile,
  clearProfile
} from 'local-first-auth'

// Device detection
import {
  isLocalFirstAuth
} from 'local-first-auth'

// Social validation
import {
  validateHandle,
  normalizeHandle,
  createSocialLink
} from 'local-first-auth'
```

## Storage

Profile data is stored in LocalStorage:

```js
{
  'local-first-auth:profile': {
    did: 'did:key:z6Mk...',
    name: 'Alice Anderson',
    socials: [{platform: 'INSTAGRAM', handle: 'alice'}],
    avatar: 'data:image/jpeg;base64,...'
  },
  'local-first-auth:privateKey': 'base64-encoded-64-byte-key'
}
```

## Window API

After profile creation, `window.localFirstAuth` is injected with these methods:

```ts
interface LocalFirstAuth {
  getProfileDetails(): Promise<string>  // Returns signed JWT
  getAvatar(): Promise<string | null>   // Returns signed JWT with avatar
  getAppDetails(): AppDetails
  requestPermission(permission: string): Promise<boolean>
  close(): void
}
```

All methods are compatible with the [Local First Auth Specification](./docs/local-first-auth-spec.md). Users can generate a one-time account and your backend can verify JWTs that are generated by this package the same way it would for a profile from a Local First Auth mobile app.

## Development & Testing

### Example App

This package includes a comprehensive example app in `/example` that demonstrates all features. The example app is excluded from the npm package (via `"files": ["dist"]` in package.json).

**Run the example:**
```bash
npm run dev:example
# Opens http://localhost:5173
```

**What it tests:**
- **Basic Demo**: `useOnboarding()` and `useProfile()` hooks, state detection, native API simulation
- **Full Flow Demo**: Complete onboarding flow with both modes (choice, download-prompt)
- **Core API Demo**: Vanilla JS testing of crypto, storage, profile, validation, and mock API injection
- **Custom Style Demo**: Custom theming with `customStyles` prop

**Build example:**
```bash
cd example
npm install
npm run build
```

The example app uses Vite for fast development with hot module replacement and demonstrates both React components and vanilla JS core functionality.

## TypeScript

Full TypeScript support with comprehensive type definitions:

```ts
import type {
  Profile,
  SocialLink,
  SocialPlatform,
  LocalFirstAuth,
  CustomStyles
} from 'local-first-auth'
```

## Migration from v1 (irl-browser-onboarding)

If you're migrating from `irl-browser-onboarding` v1:

### Package name change
```bash
npm uninstall irl-browser-onboarding
npm install local-first-auth
```

### Import changes
```tsx
// Before
import { IrlOnboarding, useIrlOnboarding } from 'irl-browser-onboarding/react'

// After
import { Onboarding, useOnboarding } from 'local-first-auth/react'
```

### API changes
- `window.irlBrowser` → `window.localFirstAuth`
- `getBrowserDetails()` → `getAppDetails()`
- `isIRLBrowser()` → `isLocalFirstAuth()`

### Storage migration
Existing user profiles are automatically migrated from the old storage keys to the new ones on first load.
