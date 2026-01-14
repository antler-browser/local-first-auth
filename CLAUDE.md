# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`local-first-auth` is a TypeScript library providing onboarding UI for Local First Auth mini-apps. It enables users without the Antler app (or another Local First Auth compatible app) to either download the app OR create a one-time web-based account using decentralized identity (DID).

## Common Commands

```bash
npm run build        # Production build (dual CJS+ESM output)
npm run dev          # Watch mode for development
npm run type-check   # TypeScript type validation
npm run dev:example  # Start example app dev server
```

Note: `prepublishOnly` hook automatically runs build before npm publish.

## Testing & Development

### Example App

The `/example` directory contains a comprehensive React test application:

```bash
npm run dev:example   # Start example dev server (http://localhost:5173)
```

**Structure:**
```
example/
├── src/
│   ├── App.tsx                 # Tab navigation wrapper
│   ├── demos/
│   │   ├── BasicDemo.tsx       # Hook testing (useOnboarding, useProfile)
│   │   ├── FullFlowDemo.tsx    # Complete onboarding UI flow
│   │   ├── CoreApiDemo.tsx     # Vanilla JS core API testing
│   │   └── CustomStyleDemo.tsx # Theming examples
│   └── styles.css              # Demo styling
├── vite.config.ts              # Vite config with path aliases
└── package.json                # Separate dependencies (Vite + React)
```

**Important:**
- The example app is **excluded from npm** via `"files": ["dist"]` in package.json
- Uses Vite aliases to resolve local package during development
- Fully functional test harness covering all library features

**Testing Coverage:**
- All 6 React components
- Both hooks (useOnboarding, useProfile)
- Core crypto/storage/profile modules
- Social validation for 23+ platforms
- Mock API injection
- Custom styling
- LocalStorage persistence

## Architecture

### Three-Layer Structure

The codebase follows a layered architecture with clear separation of concerns:

**Docs**
- `/docs/`: Documentation
  - `local-first-auth-spec.md` - Local First Auth Specification

**Core Layer** (`src/core/`): Framework-agnostic business logic
- `crypto.ts`: Ed25519 keypair generation, DID creation (`did:key` format), JWT signing with EdDSA
- `storage.ts`: LocalStorage wrapper for profiles and private keys
- `profile.ts`: Orchestrates crypto + storage, manages profile lifecycle
- `api.ts`: Mock `LocalFirstAuth` API implementation that returns signed JWTs

**Utils Layer** (`src/utils/`):
- `deviceDetection.ts`: Platform detection (iOS/Android/Web), Local First Auth detection
- `validation.ts`: Social link validation for 23+ platforms with handle normalization
- `imageProcessing.ts`: Browser-based image resize/crop to 512x512px using Canvas API

**React Layer** (`src/react/`): UI framework bindings
- `components/`: Main `Onboarding` wrapper, download prompts, 3-step account creation flow
- `hooks/`:
  - `useOnboarding()`: Returns `{shouldShowOnboarding, profile, isLoading}` - simplified API for status detection
  - `useProfile()`: Returns current profile or null

### Dual Package Build

The project produces two separate entry points via tsup:

1. **Core package** (`./dist/index.{js,mjs}`): Exported as default from package
2. **React bindings** (`./dist/react.{js,mjs}`): Exported as `./react` subpath

Both output CommonJS and ESM formats with TypeScript declarations and source maps.

### DID-Based Authentication

- Uses W3C-compliant `did:key` identifiers with Ed25519 keys
- Private keys stored in browser LocalStorage (`local-first-auth:privateKey`)
- JWTs signed with EdDSA algorithm, 2-minute expiration
- Mock API (`api.ts`) mimics native Local First Auth Specification API
- **Important**: All cryptography happens client-side; no server-side key storage

### Key Integration Points

When the user opens a mini-app:
1. `useOnboarding()` detects if native Local First Auth exists via `window.localFirstAuth` and returns:
   - `shouldShowOnboarding`: Whether to show onboarding UI
   - `profile`: User's web account profile (or null for native app/no account)
   - `isLoading`: Initial loading state
2. If `shouldShowOnboarding` is true, show choice: download app OR create web account
3. `createProfile()` in `profile.ts` generates DID, saves to LocalStorage, injects mock API at `window.localFirstAuth`
4. Mock API returns signed JWTs matching native app format for compatibility

## Important Patterns

- **Framework Agnostic Core**: Core logic can be used without React
- **Progressive Enhancement**: Works entirely client-side, no server required
- **Type Safety**: Strict TypeScript mode with full coverage
- **Privacy-First**: Private keys never leave the browser
- **Spec Compliance**: Follows Local First Auth Specification for API compatibility
- **One-Time Accounts**: Web-based profiles are device-specific (tied to LocalStorage)

## Dependencies

- `@stablelib/ed25519`: Ed25519 cryptography implementation
- `base58-universal`: Base58 encoding for DID identifiers
- `base64-js`: Base64 encoding/decoding for JWTs
- `react`: Peer dependency for React bindings only

## Publishing
- `npm version <major|minor|patch>`
- `git push origin develop && git checkout main && git merge develop && git push origin main && git checkout develop`
- `git push --tags`
- `npm publish`
- `gh release create v<version> --generate-notes`
