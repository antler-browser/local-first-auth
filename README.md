# Local First Auth JS Library

This library provides an easy way to add auth to your web app - no servers, no passwords, no third-party auth providers.

A useful usecase of this library is to use it in a mini app where people are physically present together in the same place and they can authenticate by scanning a QR code. Such as:
- Meetups
- Social clubs
- Local community events
- Game nights with friends
- TouchDesigner art installations
- Any lightweight gathering where people are in the same place

## How it works

Show the `<Onboarding />` component to create a profile for the user. This will show a popup to the user to collect their name, and optionally an avatar.

![local-first-auth-flow](https://github.com/user-attachments/assets/a04e6f08-1635-4522-97f0-9507c1ca718c)

After the user has created a profile, you get a public and private key pair that is stored on the user's device. When your app needs to authenticate a request, call `getProfileDetails()` to get a signed JWT containing the user's profile. Pass the JWT with any request so your backend can verify the signature, confirm who made the request, and get the profile data.

**Don't need any user details?** Skip onboarding flow entirely with `createAnonymousProfile()` — you still get the same public and private key pair identity but no UI popup / user input is required. Useful for apps that just need identity and don't want any user details.

## Features

- **Simple 3-step onboarding**: Name, socials, avatar
- **No onboarding required**: Create an identity instantly with `createAnonymousProfile()` — no UI, no user input — for apps that only need a keypair.
- **Skip any screen you don't need**: You can skip the add socials and the avatar screens if your app doesn't need them.
- **Edit user details** Use the `EditProfile` component to let users update their name, socials, or avatar after they have created an account.
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

## Anonymous Accounts (No Onboarding)

If your app only needs an identity — a DID + keypair to sign user activity — you can skip the
onboarding UI completely. `createAnonymousProfile()` creates the account with no user input.

```ts
import { createAnonymousProfile } from 'local-first-auth'

// name defaults to 'anonymous'; no socials, no avatar
const profile = await createAnonymousProfile()

// or pass a display name
const guest = await createAnonymousProfile('Guest')
```

It does everything `createProfile` does — generates the Ed25519 keypair, persists the profile and
private key to LocalStorage, and injects `window.localFirstAuth` — just without the wizard. The
result is a normal `Profile`, fully compatible with the Local First Auth spec, so you can later
let the user fill in details via `EditProfile` while keeping the same DID.

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

## Editing a Profile

Once a profile exists, let users update their name, socials, or avatar with the
`EditProfile` component. It's the symmetric counterpart to `Onboarding`: the same
wizard, but pre-filled with the current profile and saved **in place**, so the user's
DID and keypair (their identity) are preserved — no new account is created.

```tsx
import { EditProfile } from 'local-first-auth/react'

function EditProfilePage() {
  return (
    <EditProfile
      onComplete={(profile) => {
        // Same did as before — identity is preserved
        console.log('Profile updated:', profile)
      }}
    />
  )
}
```

Key behaviors:

- **Pre-filled**: Seeds the name, socials, and avatar from the current profile
  (via `getCurrentProfile()`).
- **Stable identity**: Saves via `updateProfile()` under the hood, so the DID and
  private key are unchanged across edits.
- **No profile, no UI**: Renders nothing (`null`) if no profile exists yet — create
  one with `Onboarding` first.
- **Same options**: Supports the same `skipSocialStep`, `skipAvatarStep`, and
  `customStyles` props as `Onboarding`.

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

#### `<EditProfile />`
Edits the current profile in place, preserving the user's DID and identity. Renders
nothing if no profile exists.

```tsx
interface EditProfileProps {
  skipSocialStep?: boolean
  skipAvatarStep?: boolean
  customStyles?: CustomStyles
  onComplete?: (profile: Profile) => void
  onBack?: () => void
}
```

#### `<CreateAccountFlow />`
The 3-step account creation flow. Used internally by `<Onboarding />` (create) and
`<EditProfile />` (edit).

```tsx
interface CreateAccountFlowProps {
  initialName?: string
  skipSocialStep?: boolean
  skipAvatarStep?: boolean
  onComplete?: (profile: Profile) => void
  onBack?: () => void
  customStyles?: CustomStyles
  mode?: 'create' | 'edit'        // 'edit' updates in place, keeping the DID
  initialSocials?: SocialLink[]   // pre-fill socials (used by edit mode)
  initialAvatar?: string | null   // pre-fill avatar (used by edit mode)
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
  createAnonymousProfile,
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
- **Edit Profile Demo**: Editing an existing profile in place with `<EditProfile />`, verifying the DID stays unchanged
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