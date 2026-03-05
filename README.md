# Local First Auth JS Library

An easy way to add auth to your web app - no servers, no passwords, no third-party auth providers.

# Client-Side Auth

This library provides a simple way to add auth to your web app without the need for email or passwords.

Use the `Onboarding` component to let users enter a name (and optionally add an avatar). Behind the scenes, when a user enters in these details, they get a unique public and private key pair stored on their device. When your app needs to authenticate a request, call `getProfileDetails()` to generate a signed JWT containing the user's profile. Your backend can then verify the signature is valid and extract the profile data.

The usecase for this library is particularly useful if you are builing a web app that is going to be used by a small number of users who are physically present at the same time.

Think:
- Meetups
- Social clubs
- Local community events
- Game nights with friends
- Any lightweight gathering where people are physically present

Drawbacks:
- Since this is a client-side library, if a user deletes their browsering history or clears their local storage, they will lose their keys and will have to create a new account Therefore, use this library only if it is useful to add temporary / one-time accounts for simple apps that do not require a persistent account.

## Demo

![Local First Auth Demo](https://github.com/AntlerBrowser/local-first-auth/blob/main/demo.gif?raw=true)

## Features

- **Simple 3-step onboarding**: Name, socials, avatar
- **DID-based authentication**: Uses W3C Decentralized Identifiers (did:key)
- **Local First Auth API compatible**: Generates profiles compatible with any Local First Auth app
- **Zero configuration**: Works out-of-the-box with sensible defaults
- **Customizable styling**: Match your web app's branding
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
        onComplete={(profile) => {
          console.log('Profile created:', profile)
          setShowOnboarding(false)
        }}
        customStyles={{ primaryColor: '#403B51' }}
      />
    )
  }

  return <YourApp />
}
```

### Vanilla JavaScript

```js
import { createOnboarding } from 'local-first-auth'

const onboarding = createOnboarding({
  container: '#onboarding-root',
  onComplete: (profile) => {
    console.log('Profile created:', profile)
    // window.localFirstAuth is now available
  }
})
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

When a user creates an account:

1. **DID Generation**: Generates an Ed25519 keypair and did:key identifier
2. **Profile Storage**: Saves profile data to LocalStorage
3. **API Injection**: Injects `window.localFirstAuth` object
4. **JWT Signing**: All API methods return signed JWTs (compatible with Local First Auth spec)

The generated profile is compatible with the Local First Auth specification. Your backend can verify JWTs the same way it would for a profile from any Local First Auth compatible app.

## API Reference

### React Components

#### `<Onboarding />`
Main wrapper component.

```tsx
interface OnboardingProps {
  skipSocialStep?: boolean
  skipAvatarStep?: boolean
  customStyles?: CustomStyles
  onComplete?: (profile: Profile) => void
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

All methods are compatible with the [Local First Auth Specification](./docs/local-first-auth-spec.md). Users can generate an account and your backend can verify JWTs that are generated by this package the same way it would for a profile from any Local First Auth compatible app.

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
- **Full Flow Demo**: Complete onboarding flow with account creation
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
