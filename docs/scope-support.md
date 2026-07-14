# Spec: Honor Origin-Scoped Identities

*A change to `local-first-auth` so an imported origin-scoped identity signs with its stored key directly instead of being double-derived.*

## Summary

This package already implements the Local First Auth spec's per-origin key derivation: the stored key is a **root** key, and `getProfileDetails()` / `getAvatar()` sign with a key derived for the page's origin (`deriveOriginKeys` in `src/core/crypto.ts`).

There is one identity shape it does not yet handle: an **origin-scoped identity** — a profile imported from a native Local First Auth app (e.g. Antler) whose export file carried a `scope` field. In that file, the private key is *already* the derived per-origin key for exactly one origin. If this package treats it as a root key and derives again, it produces a DID no other implementation ever computes, and the site sees a stranger.

The fix is one branch in the signing path: if the stored profile has a `scope`, verify it matches the page's origin and sign with the stored key as-is.

## Background: the two identity shapes

Every identity is an Ed25519 keypair (64-byte secret key, base64 in storage). The Local First Auth spec defines per-origin derivation from a root key:

```
originSeed = HKDF-SHA256(
  ikm  = rootSeed,                                 // first 32 bytes of the 64-byte Ed25519 secret key
  salt = UTF-8("local-first-auth:origin-key:v1"),
  info = UTF-8(origin),                            // WHATWG origin, e.g. "https://example.com"
  length = 32
)
originKeyPair = Ed25519.generateKeyPairFromSeed(originSeed)
originDID     = did:key encoding of originKeyPair.publicKey
```

- **Root identity** (no `scope`): derive per-origin at signing time; the root key never signs mini-app payloads directly. This is what `createProfile()` mints and what the package does today.
- **Origin-scoped identity** (`scope` present): the stored key is the *output* of that derivation for one specific origin. Sign with it directly, and only when `scope === window.location.origin`. Deriving from it again is always wrong.

## Storage contract

The stored profile JSON (localStorage key `local-first-auth:profile`) gains one optional field, shared with the `local-first-auth-import-export` package which writes it during import:

```json
{
  "did": "did:key:z6Mk...",
  "name": "...",
  "socials": [],
  "avatar": null,
  "scope": "https://example.com"
}
```

- `scope` **absent** — root identity. Current behavior: derive for `window.location.origin` at signing time.
- `scope` **present** — origin-scoped identity. The private key (localStorage key `local-first-auth:privateKey`) is the per-origin key for that origin, and `did` is the corresponding per-origin DID.

This package never *writes* `scope` — `createProfile()` is unchanged and keeps minting root identities. It only honors a `scope` written by the import path.

## Changes

### `src/types.ts`

Add to `StoredProfile`:

```ts
/**
 * Present when this identity is origin-scoped: the stored private key is the
 * per-origin derived key for exactly this WHATWG origin. Sign with it directly;
 * never derive from it. Absent = root identity (derive per-origin at signing time).
 */
scope?: string
```

### `src/core/api.ts`

`MockLocalFirstAuth.getOriginKeys()` currently derives unconditionally. Branch on the stored profile's `scope`:

```ts
private async getOriginKeys(privateKey: string): Promise<{ origin: string; keys: ProfileKeys }> {
  const origin = window.location.origin
  const profile = getProfile()

  if (profile?.scope) {
    if (profile.scope !== origin) {
      throw new Error(
        `This profile is scoped to ${profile.scope} and cannot be used on ${origin}`
      )
    }
    // The stored key is already the per-origin key — signing with it directly
    // is the only way to reproduce the DID this origin knows the user by.
    return { origin, keys: deriveKeysFromPrivateKey(privateKey) }
  }

  const keys = await deriveOriginKeys(privateKey, origin)
  return { origin, keys }
}
```

If the package has no `deriveKeysFromPrivateKey` helper (rebuild `{ did, publicKey, privateKey }` from a 64-byte secret key: public key is the last 32 bytes, DID is the standard did:key encoding), add it to `src/core/crypto.ts` — do not trust `profile.did` from storage; re-derive it from the key so storage tampering or drift can't change the signing identity.

No other call sites change: both `getProfileDetails()` and `getAvatar()` already go through `getOriginKeys()`.

## Test vectors (unchanged, for reference)

Root private key (base64): `BwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwfqSmxj4pxSCr71UHsTLsX5lUd2rr6+e5JCHuppFEbSLA==`
Root DID: `did:key:z6MkvDqGT54cXesYGvABpF1UapVNwjCqRcafi4Px6Thv5T3Z`

| Origin | Per-origin DID |
| --- | --- |
| `https://example.com` | `did:key:z6MksHmq5juqxMRUt6UYxnbCfprSmsEcaLd9riXhYZPB7hCF` |
| `https://other.app` | `did:key:z6MkuPzxjqnHVeV3eupgRqjD9Me4EhAyKoohjU6PkkoBhLSt` |
| `http://localhost:8787` | `did:key:z6MkoShWB63jPRQAMhWJD3J2Gq5BizC65JnRetMj5uj7EepD` |

A useful scoped-identity fixture falls out of these: derive the key for `https://example.com` from the root vector, store it with `scope: "https://example.com"`, and the JWT `iss` must equal `did:key:z6MksHmq...` exactly.

## Tests

Extend `src/core/api.test.ts` (vitest):

1. **Scoped profile signs directly** — store a profile with `scope` equal to the test origin and the derived per-origin key as the private key; `getProfileDetails()` returns a JWT whose `iss` and `data.did` equal the scoped DID (i.e. the spec-vector DID for that origin), verifiable with the stored public key.
2. **Scope mismatch throws** — same stored profile but `window.location.origin` differs from `scope`; `getProfileDetails()` and `getAvatar()` reject with the scope-mismatch error.
3. **Root behavior unchanged** — existing tests (root profile → `iss` is the derived DID, spec vectors) must pass untouched.

Run: `npm test`.
