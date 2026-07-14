import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as base64 from 'base64-js'
import { MockLocalFirstAuth } from './api'
import { deriveOriginKeys, decodeJWT, verifyJWT } from './crypto'

const ROOT_PRIVATE_KEY =
  'BwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwfqSmxj4pxSCr71UHsTLsX5lUd2rr6+e5JCHuppFEbSLA=='
const ROOT_DID = 'did:key:z6MkvDqGT54cXesYGvABpF1UapVNwjCqRcafi4Px6Thv5T3Z'

// Spec test vectors for the fixture root key
const EXAMPLE_COM_DID = 'did:key:z6MksHmq5juqxMRUt6UYxnbCfprSmsEcaLd9riXhYZPB7hCF'
const OTHER_APP_DID = 'did:key:z6MkuPzxjqnHVeV3eupgRqjD9Me4EhAyKoohjU6PkkoBhLSt'

function stubBrowserGlobals(
  origin: string,
  profile: Record<string, unknown>,
  privateKey: string = ROOT_PRIVATE_KEY
): void {
  const store = new Map<string, string>()
  store.set('local-first-auth:profile', JSON.stringify(profile))
  store.set('local-first-auth:privateKey', privateKey)

  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key)
  })
  vi.stubGlobal('window', { location: { origin } })
}

const BASE_PROFILE = {
  did: ROOT_DID,
  name: 'Vector User',
  socials: [{ platform: 'INSTAGRAM', handle: 'dmathewwws' }]
}

describe('MockLocalFirstAuth', () => {
  beforeEach(() => {
    stubBrowserGlobals('https://example.com', BASE_PROFILE)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('getProfileDetails() issues a JWT with the per-origin DID, never the root DID', async () => {
    const api = new MockLocalFirstAuth()
    const jwt = await api.getProfileDetails()
    const { payload } = decodeJWT(jwt)

    expect(payload.iss).toBe(EXAMPLE_COM_DID)
    expect(payload.iss).not.toBe(ROOT_DID)
    expect(payload.data.did).toBe(payload.iss)
    expect(payload.aud).toBe('https://example.com')
    expect(payload.type).toBe('localFirstAuth:profile:details')
    expect(payload.exp - payload.iat).toBe(120)
    expect(payload.data.name).toBe('Vector User')

    const derived = await deriveOriginKeys(ROOT_PRIVATE_KEY, 'https://example.com')
    const derivedPublicKey = base64.toByteArray(derived.publicKey)
    const rootPublicKey = base64.toByteArray(ROOT_PRIVATE_KEY).subarray(32)
    expect(verifyJWT(jwt, derivedPublicKey)).toBe(true)
    expect(verifyJWT(jwt, rootPublicKey)).toBe(false)
  })

  it('getAvatar() signs with the per-origin key when an avatar exists', async () => {
    stubBrowserGlobals('https://example.com', {
      ...BASE_PROFILE,
      avatar: 'data:image/jpeg;base64,AAAA'
    })

    const api = new MockLocalFirstAuth()
    const jwt = await api.getAvatar()
    expect(jwt).not.toBeNull()

    const { payload } = decodeJWT(jwt as string)
    expect(payload.iss).toBe(EXAMPLE_COM_DID)
    expect(payload.data.did).toBe(EXAMPLE_COM_DID)
    expect(payload.type).toBe('localFirstAuth:avatar')
    expect(payload.data.avatar).toBe('data:image/jpeg;base64,AAAA')

    const derived = await deriveOriginKeys(ROOT_PRIVATE_KEY, 'https://example.com')
    expect(verifyJWT(jwt as string, base64.toByteArray(derived.publicKey))).toBe(true)
  })

  it('getAvatar() returns null when the profile has no avatar', async () => {
    const api = new MockLocalFirstAuth()
    await expect(api.getAvatar()).resolves.toBeNull()
  })

  it('presents a different DID to a different origin', async () => {
    stubBrowserGlobals('https://other.app', BASE_PROFILE)

    const api = new MockLocalFirstAuth()
    const { payload } = decodeJWT(await api.getProfileDetails())

    expect(payload.iss).toBe(OTHER_APP_DID)
    expect(payload.aud).toBe('https://other.app')
  })

  it('rejects on an opaque origin instead of deriving a key for "null"', async () => {
    stubBrowserGlobals('null', BASE_PROFILE)

    const api = new MockLocalFirstAuth()
    await expect(api.getProfileDetails()).rejects.toThrow('origin is opaque or empty')
  })
})

describe('MockLocalFirstAuth with an origin-scoped identity', () => {
  // An imported scoped profile stores the ALREADY-derived per-origin key,
  // so signing with it directly must reproduce the spec-vector DID exactly.
  async function stubScopedProfile(pageOrigin: string): Promise<void> {
    const derived = await deriveOriginKeys(ROOT_PRIVATE_KEY, 'https://example.com')
    stubBrowserGlobals(
      pageOrigin,
      {
        ...BASE_PROFILE,
        did: derived.did,
        avatar: 'data:image/jpeg;base64,AAAA',
        scope: 'https://example.com'
      },
      derived.privateKey
    )
  }

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('signs with the stored key directly — iss is the scoped DID, not a double-derived one', async () => {
    await stubScopedProfile('https://example.com')

    const api = new MockLocalFirstAuth()
    const jwt = await api.getProfileDetails()
    const { payload } = decodeJWT(jwt)

    expect(payload.iss).toBe(EXAMPLE_COM_DID)
    expect(payload.data.did).toBe(EXAMPLE_COM_DID)
    expect(payload.aud).toBe('https://example.com')

    const derived = await deriveOriginKeys(ROOT_PRIVATE_KEY, 'https://example.com')
    expect(verifyJWT(jwt, base64.toByteArray(derived.publicKey))).toBe(true)
  })

  it('refuses to sign on any origin other than the scope', async () => {
    await stubScopedProfile('https://other.app')

    const api = new MockLocalFirstAuth()
    const scopedError =
      'This profile is scoped to https://example.com and cannot be used on https://other.app'
    await expect(api.getProfileDetails()).rejects.toThrow(scopedError)
    await expect(api.getAvatar()).rejects.toThrow(scopedError)
  })
})
