# Local First Auth JS Library

This library provides an easy way to add auth to your web app - no servers, no passwords, no third-party auth providers.

## Onboarding flow

![local-first-auth-flow](https://github.com/user-attachments/assets/a04e6f08-1635-4522-97f0-9507c1ca718c)

# In Between Static Websites and Traditional Auth Systems

<img width="1200" height="600" alt="static-vs-trad-auth-2" src="https://github.com/user-attachments/assets/8f5abb22-3ba7-4752-a529-94ea02b6aaeb" />

Show the `Onboarding` component to let users pick a name (and optionally an avatar) — behind the scenes, the user gets a public and private key pair that is stored on their device. When your app needs to authenticate a request, call `getProfileDetails()` to get a signed JWT containing the user's profile. Pass the JWT with any request so your backend can verify the signature, confirm who made the request, and extract the profile data. 

This is a great fit for apps where people are physically present together in the same place, such as:

- Meetups
- Social clubs
- Local community events
- Game nights with friends
- Any lightweight gathering where people are in the same place

Drawbacks of using this library:
- When a user clears their browsing data, their keys are lost and they'll need to create a new account. Therefore this library is best suited for apps where temporary or one-time accounts are useful. If you need a persistent account, a traditional email-based auth system is a better fit as your users can access their account from multiple devices and not have to create a new account if they clear their browsing data.

## Features

- **Simple 3-step onboarding**: Name, socials, avatar
- **Skip any screens you don't need**: You can skip the add socials and the avatar screens if your app doesn't need them.
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

## Long Term Storage of your keys

This library was inspired by a recent trip to China. ie) One really innovative user experience in China is the idea that you don’t always need to download an app, sometimes the better experience is to just scan a QR code. Here is an example: When I enter a cafe, I don't have to download the cafe's app, I just scan a QR code and it allows me to pay for my coffee and track my loyalty points - no signup or app download required.

This works because of WeChat's prominence in China. When I entered the cafe, I opened up WeChat and scanned the QR code. The cafe has built a WeChat mini app that uses my WeChat Id and WeChat Pay to authenticate me to allow me to pay for my coffee and track my loyalty points.

It's cool and really convenient UX for users, BUT it would be cooler if we could build something like this but use open standards (so we don't need to have a super app like WeChat). This library uses the [Local First Auth specification](https://antlerbrowser.com/local-first-auth-specification) to make it easy to build in simple auth into your web app.

However, [Antler](https://github.com/antler-browser/antler) is a demo app that showcases how any native mobile app can integrate this spec into their app. When you download Antler, you do the same onboarding process as you would with this library (enter your name and optionally an avatar). It generates a public and private key pair that is stored locally on your device. Whenever you scan a QR code using Antler, your profile details are shared with the web app. This means users don't have to go through account creation for every web app you use, and you don't have to worry about losing your keys if you clear your browsing data.

My dream would be that if other messaging or event apps like Telegram, Signal, Meetup.com, etc. would build this spec into their app. It would give users the same great UX you get with WeChat but use open standards instead of requiring a super app like WeChat.