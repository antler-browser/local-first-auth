import { useState } from 'react'
import {
  generateProfileKeys,
  createJWT,
  saveProfile,
  getProfile,
  getPrivateKey,
  savePrivateKey,
  clearProfile,
  createProfile,
  injectLocalFirstAuthAPI,
  validateHandle,
  normalizeHandle,
  createSocialLink,
  type Profile,
  type SocialPlatform,
  type SocialLink,
} from 'local-first-auth'

function CoreApiDemo() {
  const [output, setOutput] = useState<string>('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const log = (message: string) => {
    setOutput(prev => prev + '\n' + message)
    console.log(message)
  }

  const testCrypto = async () => {
    setOutput('')
    log('=== Testing Crypto Module ===')

    const keys = await generateProfileKeys()
    log(`✓ Generated Ed25519 keypair`)
    log(`  DID: ${keys.did}`)
    log(`  Public key: ${keys.publicKey.substring(0, 20)}...`)
    log(`  Private key: ${keys.privateKey.substring(0, 20)}...`)

    const payload = {
      iss: keys.did,
      aud: window.location.origin,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 120,
      type: 'test',
      data: { message: 'Test payload' }
    }
    const jwt = await createJWT(payload, keys.privateKey)
    log(`✓ Signed JWT with EdDSA`)
    log(`  JWT: ${jwt.substring(0, 50)}...`)
    log(`  Parts: ${jwt.split('.').length} (header.payload.signature)`)
  }

  const testStorage = () => {
    setOutput('')
    log('=== Testing Storage Module ===')

    const socialLink = createSocialLink('X' as SocialPlatform, 'testuser')
    const testProfile: Profile = {
      did: 'did:key:z6MkTestStorage',
      name: 'Storage Test',
      socials: socialLink ? [socialLink] : [],
      avatar: null,
    }

    saveProfile(testProfile)
    log('✓ Saved profile to LocalStorage')

    const loaded = getProfile()
    log(`✓ Loaded profile: ${loaded?.name}`)

    const privateKey = getPrivateKey()
    log(`✓ Private key exists: ${privateKey ? 'Yes' : 'No'}`)

    clearProfile()
    log('✓ Cleared storage')

    const afterClear = getProfile()
    log(`✓ After clear: ${afterClear ? 'Profile exists' : 'No profile'}`)
  }

  const testProfile = async () => {
    setOutput('')
    log('=== Testing Profile Module ===')

    clearProfile()
    log('✓ Cleared existing data')

    const socials = [
      createSocialLink('X' as SocialPlatform, 'coreapi'),
      createSocialLink('GITHUB' as SocialPlatform, 'coreapi-gh'),
    ].filter((link): link is SocialLink => link !== null)

    const profile = await createProfile('Core API User', socials)
    log(`✓ Created profile: ${profile.name}`)
    log(`  DID: ${profile.did}`)
    log(`  Socials: ${profile.socials?.map(s => s.platform).join(', ')}`)

    const hasAPI = (window as any).localFirstAuth !== undefined
    log(`✓ Mock API injected: ${hasAPI}`)

    if (hasAPI) {
      const jwt = await (window as any).localFirstAuth.getProfileDetails()
      log(`✓ API getProfileDetails(): ${jwt.substring(0, 50)}...`)

      const avatar = await (window as any).localFirstAuth.getAvatar()
      log(`✓ API getAvatar(): ${avatar || 'null'}`)
    }
  }

  const testValidation = () => {
    setOutput('')
    log('=== Testing Social Validation ===')

    const tests = [
      { platform: 'X' as SocialPlatform, handle: '@username', expected: 'username' },
      { platform: 'X' as SocialPlatform, handle: 'username', expected: 'username' },
      { platform: 'GITHUB' as SocialPlatform, handle: 'github-user', expected: 'github-user' },
      { platform: 'INSTAGRAM' as SocialPlatform, handle: 'insta.user_123', expected: 'insta.user_123' },
      { platform: 'LINKEDIN' as SocialPlatform, handle: 'https://linkedin.com/in/person', expected: 'person' },
      { platform: 'YOUTUBE' as SocialPlatform, handle: '@channelname', expected: 'channelname' },
    ]

    tests.forEach(({ platform, handle, expected }) => {
      const normalized = normalizeHandle(platform, handle)
      const isValid = normalized ? validateHandle(platform, normalized) : false
      const status = (normalized === expected && isValid) ? '✓' : '✗'
      log(`${status} ${platform}: "${handle}" → "${normalized || 'null'}" (valid: ${isValid})`)
    })

    log('')
    log('Testing invalid handle:')
    const invalidNormalized = normalizeHandle('X' as SocialPlatform, '')
    log(`Empty handle: ${invalidNormalized || 'null'}`)
  }

  const testImageProcessing = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setOutput('')
    log('=== Testing Image Processing ===')

    const file = e.target.files?.[0]
    if (!file) return

    log(`✓ File selected: ${file.name}`)
    log(`  Size: ${(file.size / 1024).toFixed(2)} KB`)
    log(`  Type: ${file.type}`)

    try {
      // Simple image preview without processing
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        log(`✓ Image loaded successfully`)
        log(`  Preview available below`)
        setImagePreview(result)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      log(`✗ Error: ${error}`)
    }
  }

  const testMockAPI = async () => {
    setOutput('')
    log('=== Testing Mock API Injection ===')

    const before = (window as any).localFirstAuth !== undefined
    log(`Before injection: ${before}`)

    // Generate keys and profile
    const keys = await generateProfileKeys()
    const testProfile: Profile = {
      did: keys.did,
      name: 'Mock API Test',
      socials: [],
      avatar: null,
    }

    // Save profile and private key to LocalStorage
    saveProfile(testProfile)
    savePrivateKey(keys.privateKey)
    log('✓ Saved profile and private key to LocalStorage')

    // Inject API (reads from LocalStorage)
    injectLocalFirstAuthAPI()

    const after = (window as any).localFirstAuth !== undefined
    log(`✓ After injection: ${after}`)
    log(`✓ window.localFirstAuth.getProfileDetails: ${typeof (window as any).localFirstAuth?.getProfileDetails}`)
    log(`✓ window.localFirstAuth.getAvatar: ${typeof (window as any).localFirstAuth?.getAvatar}`)
    log(`✓ window.localFirstAuth.getAppDetails: ${typeof (window as any).localFirstAuth?.getAppDetails}`)
  }

  return (
    <div className="demo">
      <h2>Core API Demo: Vanilla JavaScript</h2>
      <p>
        Test the framework-agnostic core logic directly (no React components).
      </p>

      <div className="action-grid">
        <button onClick={testCrypto} className="action-btn">
          Test Crypto Module
        </button>
        <button onClick={testStorage} className="action-btn">
          Test Storage Module
        </button>
        <button onClick={testProfile} className="action-btn">
          Test Profile Module
        </button>
        <button onClick={testValidation} className="action-btn">
          Test Social Validation
        </button>
        <button onClick={testMockAPI} className="action-btn">
          Test Mock API Injection
        </button>
        <div className="file-input-wrapper">
          <label className="action-btn">
            Test Image Processing
            <input
              type="file"
              accept="image/*"
              onChange={testImageProcessing}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {imagePreview && (
        <div className="image-preview">
          <h3>Processed Image (512x512):</h3>
          <img src={imagePreview} alt="Processed" style={{ maxWidth: '256px', border: '1px solid #ccc' }} />
        </div>
      )}

      <pre className="output-log">{output || 'Click a button to run tests...'}</pre>

      <div className="explanation">
        <h3>What This Tests:</h3>
        <ul>
          <li><strong>Crypto:</strong> generateProfileKeys() - Ed25519 keypair + DID generation</li>
          <li><strong>JWT:</strong> createJWT() - Sign payloads with EdDSA algorithm</li>
          <li><strong>Storage:</strong> saveProfile(), getProfile(), clearProfile() - LocalStorage operations</li>
          <li><strong>Profile:</strong> createProfile() - Complete profile creation flow with API injection</li>
          <li><strong>Validation:</strong> validateHandle() - Social handle validation for 23+ platforms</li>
          <li><strong>Social Links:</strong> createSocialLink() - Create platform-specific social links</li>
          <li><strong>Mock API:</strong> injectLocalFirstAuthAPI() - Inject window.localFirstAuth API</li>
          <li><strong>Image:</strong> Basic image loading and preview</li>
        </ul>
      </div>
    </div>
  )
}

export default CoreApiDemo
