/**
 * Cryptographic utilities for DID generation and JWT signing
 * Ported from local-first-auth-simulator
 */

import * as ed25519 from '@stablelib/ed25519'
import { HKDF } from '@stablelib/hkdf'
import { SHA256 } from '@stablelib/sha256'
import { encode as base58Encode } from 'base58-universal'
import * as base64 from 'base64-js'
import type { JWTHeader, JWTPayload, ProfileKeys } from '../types'

/**
 * Ed25519 multicodec prefix for did:key format
 * 0xed = 237 (Ed25519 public key)
 * 0x01 = 1 (key type identifier)
 */
const ED25519_MULTICODEC_PREFIX = new Uint8Array([0xed, 0x01])

// Key sizes
const SEED_SIZE = 32 // Ed25519 seed size in bytes

/**
 * HKDF salt for per-origin key derivation, pinned by the Local First Auth spec.
 * Changing it changes every per-origin DID.
 */
const ORIGIN_KEY_SALT = 'local-first-auth:origin-key:v1'

/**
 * Helper function to encode to base64url (RFC 4648)
 * Converts standard base64 to base64url by replacing + with -, / with _, and removing padding =
 */
export const base64url = {
  encode: (input: Uint8Array): string => {
    const base64String = base64.fromByteArray(input)
    return base64String
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  },

  decode: (input: string): Uint8Array => {
    // Convert base64url back to base64
    let base64String = input
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    // Add padding if needed
    const padding = (4 - (base64String.length % 4)) % 4
    base64String += '='.repeat(padding)

    return base64.toByteArray(base64String)
  }
}

/**
 * Generates a cryptographically secure random seed for key generation
 */
function generateRandomSeed(): Uint8Array {
  // Use crypto.getRandomValues in browser, or crypto.randomBytes in Node.js
  const seed = new Uint8Array(SEED_SIZE)

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Browser environment
    crypto.getRandomValues(seed)
  } else if (typeof require !== 'undefined') {
    // Node.js environment
    const nodeCrypto = require('crypto')
    const randomBytes = nodeCrypto.randomBytes(SEED_SIZE)
    seed.set(randomBytes)
  } else {
    throw new Error('No secure random number generator available')
  }

  return seed
}

/**
 * Generate a new Ed25519 keypair
 * @returns Object containing privateKey (base64 string, 64 bytes) and publicKey (Uint8Array, 32 bytes)
 */
async function generateKeyPair(): Promise<{
  privateKey: string
  publicKey: Uint8Array
}> {
  // Generate random seed (32 bytes)
  const seed = generateRandomSeed()

  // Generate keypair from seed
  const keyPair = ed25519.generateKeyPairFromSeed(seed)

  // Ed25519 secretKey is 64 bytes (includes 32-byte seed + 32-byte public key)
  // Encode as base64 for storage
  const privateKey = base64.fromByteArray(keyPair.secretKey)

  return {
    privateKey,
    publicKey: keyPair.publicKey
  }
}

/**
 * Create a did:key DID from an Ed25519 public key
 * @param publicKey - The Ed25519 public key as Uint8Array
 * @returns The did:key formatted DID string
 */
function createDidFromPublicKey(publicKey: Uint8Array): string {
  // Prepend multicodec prefix to public key
  const multicodecKey = new Uint8Array(ED25519_MULTICODEC_PREFIX.length + publicKey.length)
  multicodecKey.set(ED25519_MULTICODEC_PREFIX)
  multicodecKey.set(publicKey, ED25519_MULTICODEC_PREFIX.length)

  // Base58 encode and prepend 'z' for base58btc multibase encoding
  const encoded = base58Encode(multicodecKey)

  // Return did:key format (z prefix indicates base58btc encoding)
  return `did:key:z${encoded}`
}

/**
 * Generate a complete profile with Ed25519 keypair and DID
 * @returns Object containing privateKey (base64), publicKey (base64), and did (string)
 */
export async function generateProfileKeys(): Promise<ProfileKeys> {
  const { privateKey, publicKey } = await generateKeyPair()
  const did = createDidFromPublicKey(publicKey)

  return {
    privateKey,
    publicKey: base64.fromByteArray(publicKey),
    did
  }
}

/**
 * Rebuild the full ProfileKeys from a base64-encoded 64-byte Ed25519 secret key.
 *
 * The keypair is regenerated from the seed (first 32 bytes), so the returned
 * public key and DID are authoritative — a tampered trailing 32 bytes or a
 * stale stored `did` can never switch the signing identity.
 *
 * Used for origin-scoped identities (stored profile has `scope`): the stored
 * key is already the per-origin key and must sign directly, never be derived
 * from again.
 *
 * @param privateKey - Base64-encoded 64-byte Ed25519 secret key
 * @returns ProfileKeys: privateKey (base64), publicKey (base64), did
 */
export function deriveKeysFromPrivateKey(privateKey: string): ProfileKeys {
  const keyBytes = base64.toByteArray(privateKey)

  if (keyBytes.length !== 64) {
    throw new Error('Invalid private key length. Expected 64 bytes.')
  }

  const seed = keyBytes.subarray(0, SEED_SIZE)
  const keyPair = ed25519.generateKeyPairFromSeed(seed)

  return {
    privateKey: base64.fromByteArray(keyPair.secretKey),
    publicKey: base64.fromByteArray(keyPair.publicKey),
    did: createDidFromPublicKey(keyPair.publicKey)
  }
}

/**
 * Derive the per-origin (pairwise) keypair and DID for a website origin,
 * as defined by the Local First Auth spec's Per-Origin Key Derivation section:
 *
 *   originSeed = HKDF-SHA256(ikm = rootSeed, salt = "local-first-auth:origin-key:v1",
 *                            info = origin, length = 32)
 *
 * The derivation is deterministic, so any implementation holding the same root
 * key computes the same DID for the same origin. The root key never signs
 * mini-app payloads; JWTs are signed with the derived key.
 *
 * @param rootPrivateKey - Base64-encoded 64-byte Ed25519 root secret key
 * @param origin - WHATWG origin (e.g. "https://example.com"). Subdomains,
 *   schemes, and ports each derive a distinct DID. Opaque origins ("null")
 *   are rejected.
 * @returns ProfileKeys for the origin: privateKey (base64), publicKey (base64), did
 */
export async function deriveOriginKeys(rootPrivateKey: string, origin: string): Promise<ProfileKeys> {
  const rootKeyBytes = base64.toByteArray(rootPrivateKey)

  if (rootKeyBytes.length !== 64) {
    throw new Error('Invalid private key length. Expected 64 bytes.')
  }

  if (!origin || origin === 'null') {
    throw new Error('Cannot derive origin keys: origin is opaque or empty')
  }

  // Ed25519 secret key layout is seed (32 bytes) || public key (32 bytes)
  const rootSeed = rootKeyBytes.subarray(0, SEED_SIZE)

  const encoder = new TextEncoder()
  const originSeed = new HKDF(
    SHA256,
    rootSeed,
    encoder.encode(ORIGIN_KEY_SALT),
    encoder.encode(origin)
  ).expand(SEED_SIZE)

  const keyPair = ed25519.generateKeyPairFromSeed(originSeed)

  return {
    privateKey: base64.fromByteArray(keyPair.secretKey),
    publicKey: base64.fromByteArray(keyPair.publicKey),
    did: createDidFromPublicKey(keyPair.publicKey)
  }
}

/**
 * Create and sign a JWT using Ed25519
 * @param payload - JWT payload containing claims
 * @param privateKey - Base64-encoded 64-byte Ed25519 secret key
 * @returns Signed JWT string
 */
export async function createJWT(payload: JWTPayload, privateKey: string): Promise<string> {
  // Decode the private key from base64
  const privateKeyBytes = base64.toByteArray(privateKey)

  // Ed25519 secret key is 64 bytes (32-byte seed + 32-byte public key)
  if (privateKeyBytes.length !== 64) {
    throw new Error('Invalid private key length. Expected 64 bytes.')
  }

  // Build JWT header
  const header: JWTHeader = {
    alg: 'EdDSA',
    typ: 'JWT',
  }

  // Encode header and payload as base64url
  const headerB64 = base64url.encode(new TextEncoder().encode(JSON.stringify(header)))
  const payloadB64 = base64url.encode(new TextEncoder().encode(JSON.stringify(payload)))

  // Create signing input: "header.payload"
  const signingInput = `${headerB64}.${payloadB64}`
  const signingInputBytes = new TextEncoder().encode(signingInput)

  // Sign with Ed25519
  const signature = ed25519.sign(privateKeyBytes, signingInputBytes)

  // Encode signature as base64url
  const signatureB64 = base64url.encode(signature)

  // Return complete JWT: "header.payload.signature"
  return `${signingInput}.${signatureB64}`
}

/**
 * Decode a JWT (for debugging - does NOT verify signature)
 * Use verifyJWT() to verify the signature
 */
export function decodeJWT(jwt: string): { header: JWTHeader; payload: JWTPayload; signature: string } {
  const parts = jwt.split('.')

  if (parts.length !== 3) {
    throw new Error('Invalid JWT format. Expected 3 parts separated by dots.')
  }

  const [encodedHeader, encodedPayload, signature] = parts

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error('Invalid JWT format: missing parts')
  }

  // Decode header and payload
  const headerBytes = base64url.decode(encodedHeader)
  const payloadBytes = base64url.decode(encodedPayload)

  const header = JSON.parse(new TextDecoder().decode(headerBytes)) as JWTHeader
  const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as JWTPayload

  return { header, payload, signature }
}

/**
 * Verify a JWT signature using the public key from the DID
 *
 * @param jwt - The JWT string to verify
 * @param publicKey - The Ed25519 public key (32 bytes) to verify against
 * @returns true if signature is valid, false otherwise
 */
export function verifyJWT(jwt: string, publicKey: Uint8Array): boolean {
  try {
    const parts = jwt.split('.')

    if (parts.length !== 3) {
      return false
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts

    // Reconstruct the signing input
    const signingInput = `${encodedHeader}.${encodedPayload}`
    const signingInputBytes = new TextEncoder().encode(signingInput)

    // Decode the signature
    const signatureBytes = base64url.decode(encodedSignature)

    // Verify the signature
    return ed25519.verify(publicKey, signingInputBytes, signatureBytes)
  } catch (error) {
    console.error('JWT verification error:', error)
    return false
  }
}
