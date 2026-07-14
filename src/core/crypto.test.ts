import { describe, it, expect } from 'vitest'
import * as base64 from 'base64-js'
import { deriveOriginKeys, deriveKeysFromPrivateKey, createJWT, decodeJWT, verifyJWT } from './crypto'
import type { JWTPayload } from '../types'

/**
 * Test vectors from the Local First Auth spec ("Per-Origin Key Derivation").
 * These MUST be reproducible by every implementation holding the same root key.
 */
const ROOT_PRIVATE_KEY =
  'BwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwfqSmxj4pxSCr71UHsTLsX5lUd2rr6+e5JCHuppFEbSLA=='
const ROOT_DID = 'did:key:z6MkvDqGT54cXesYGvABpF1UapVNwjCqRcafi4Px6Thv5T3Z'

const SPEC_VECTORS: Array<[origin: string, did: string]> = [
  ['https://example.com', 'did:key:z6MksHmq5juqxMRUt6UYxnbCfprSmsEcaLd9riXhYZPB7hCF'],
  ['https://other.app', 'did:key:z6MkuPzxjqnHVeV3eupgRqjD9Me4EhAyKoohjU6PkkoBhLSt'],
  ['http://localhost:8787', 'did:key:z6MkoShWB63jPRQAMhWJD3J2Gq5BizC65JnRetMj5uj7EepD']
]

describe('deriveOriginKeys', () => {
  it.each(SPEC_VECTORS)('reproduces the spec test vector for %s', async (origin, expectedDid) => {
    const keys = await deriveOriginKeys(ROOT_PRIVATE_KEY, origin)
    expect(keys.did).toBe(expectedDid)
  })

  it('is deterministic for the same root key and origin', async () => {
    const a = await deriveOriginKeys(ROOT_PRIVATE_KEY, 'https://example.com')
    const b = await deriveOriginKeys(ROOT_PRIVATE_KEY, 'https://example.com')
    expect(a.did).toBe(b.did)
    expect(a.privateKey).toBe(b.privateKey)
    expect(a.publicKey).toBe(b.publicKey)
  })

  it('derives distinct DIDs across subdomains, schemes, and ports, all different from the root DID', async () => {
    const origins = [
      'https://example.com',
      'https://sub.example.com',
      'http://example.com',
      'https://example.com:8443'
    ]
    const dids = await Promise.all(
      origins.map(async (origin) => (await deriveOriginKeys(ROOT_PRIVATE_KEY, origin)).did)
    )

    expect(new Set(dids).size).toBe(origins.length)
    for (const did of dids) {
      expect(did).not.toBe(ROOT_DID)
    }
  })

  it('returns a 64-byte secret key whose last 32 bytes are the public key', async () => {
    const keys = await deriveOriginKeys(ROOT_PRIVATE_KEY, 'https://example.com')
    const secretKeyBytes = base64.toByteArray(keys.privateKey)
    const publicKeyBytes = base64.toByteArray(keys.publicKey)

    expect(secretKeyBytes.length).toBe(64)
    expect(publicKeyBytes.length).toBe(32)
    expect(Array.from(secretKeyBytes.subarray(32))).toEqual(Array.from(publicKeyBytes))
  })

  it('signs JWTs that verify with the derived public key but not the root public key', async () => {
    const keys = await deriveOriginKeys(ROOT_PRIVATE_KEY, 'https://example.com')
    const now = Math.floor(Date.now() / 1000)
    const payload: JWTPayload = {
      iss: keys.did,
      aud: 'https://example.com',
      iat: now,
      exp: now + 120,
      type: 'localFirstAuth:profile:details',
      data: { did: keys.did }
    }

    const jwt = await createJWT(payload, keys.privateKey)
    const decoded = decodeJWT(jwt)
    expect(decoded.payload.iss).toBe(keys.did)
    expect(decoded.payload.iss).not.toBe(ROOT_DID)

    const derivedPublicKey = base64.toByteArray(keys.publicKey)
    const rootPublicKey = base64.toByteArray(ROOT_PRIVATE_KEY).subarray(32)
    expect(verifyJWT(jwt, derivedPublicKey)).toBe(true)
    expect(verifyJWT(jwt, rootPublicKey)).toBe(false)
  })

  it('rejects a root key that is not 64 bytes', async () => {
    const shortKey = base64.fromByteArray(new Uint8Array(32))
    await expect(deriveOriginKeys(shortKey, 'https://example.com')).rejects.toThrow(
      'Invalid private key length. Expected 64 bytes.'
    )
  })

  it('rejects empty and opaque ("null") origins', async () => {
    await expect(deriveOriginKeys(ROOT_PRIVATE_KEY, '')).rejects.toThrow(
      'origin is opaque or empty'
    )
    await expect(deriveOriginKeys(ROOT_PRIVATE_KEY, 'null')).rejects.toThrow(
      'origin is opaque or empty'
    )
  })
})

describe('deriveKeysFromPrivateKey', () => {
  it('round-trips the spec fixture root key to the root DID', () => {
    const keys = deriveKeysFromPrivateKey(ROOT_PRIVATE_KEY)
    expect(keys.did).toBe(ROOT_DID)
    expect(keys.privateKey).toBe(ROOT_PRIVATE_KEY)
  })

  it('recomputes the public key from the seed, ignoring tampered trailing bytes', () => {
    const tampered = base64.toByteArray(ROOT_PRIVATE_KEY)
    tampered.fill(0xff, 32) // corrupt the public-key half of the secret key
    const keys = deriveKeysFromPrivateKey(base64.fromByteArray(tampered))

    expect(keys.did).toBe(ROOT_DID)
    expect(keys.publicKey).toBe(base64.fromByteArray(base64.toByteArray(ROOT_PRIVATE_KEY).subarray(32)))
  })

  it('rejects a key that is not 64 bytes', () => {
    expect(() => deriveKeysFromPrivateKey(base64.fromByteArray(new Uint8Array(32)))).toThrow(
      'Invalid private key length. Expected 64 bytes.'
    )
  })
})
