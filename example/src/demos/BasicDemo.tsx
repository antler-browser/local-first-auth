import { useOnboarding, useProfile } from 'local-first-auth/react'

function BasicDemo() {
  const { shouldShowOnboarding, profile, isLoading } = useOnboarding()
  const profileFromHook = useProfile()

  // Derive values for display
  const hasApi = !shouldShowOnboarding
  const isNativeApp = !shouldShowOnboarding && profile === null
  const hasWebAccount = profile !== null

  const simulateNativeApp = () => {
    // Inject a mock native API to simulate Local First Auth app
    (window as any).localFirstAuth = {
      getProfileDetails: async () => 'mock.native.jwt',
      getAvatar: async () => null,
      getAppDetails: () => ({
        name: 'Native Local First Auth',
        version: '1.0.0',
        platform: 'browser' as const,
        supportedPermissions: [],
      }),
      requestPermission: async () => false,
      close: () => {},
    }
    window.location.reload()
  }

  return (
    <div className="demo">
      <h2>Basic Demo: useOnboarding Hook</h2>
      <p>
        This demo shows the state detection from <code>useOnboarding()</code> hook.
      </p>

      <div className="status-grid">
        <div className="status-item">
          <strong>Has API:</strong>
          <span className={hasApi ? 'badge success' : 'badge error'}>
            {hasApi ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="status-item">
          <strong>Is Native App:</strong>
          <span className={isNativeApp ? 'badge success' : 'badge neutral'}>
            {isNativeApp ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="status-item">
          <strong>Has Web Account:</strong>
          <span className={hasWebAccount ? 'badge success' : 'badge neutral'}>
            {hasWebAccount ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="status-item">
          <strong>Should Show Onboarding:</strong>
          <span className={shouldShowOnboarding ? 'badge warning' : 'badge success'}>
            {shouldShowOnboarding ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="status-item">
          <strong>Is Loading:</strong>
          <span className={isLoading ? 'badge neutral' : 'badge success'}>
            {isLoading ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      {profile && (
        <div className="profile-display">
          <h3>Profile Data</h3>
          <div className="profile-info">
            <p><strong>DID:</strong> <code>{profile.did}</code></p>
            <p><strong>Name:</strong> {profile.name}</p>
            {profile.avatar && (
              <div>
                <strong>Avatar:</strong>
                <img src={profile.avatar} alt="Avatar" style={{ width: 100, height: 100, borderRadius: '50%' }} />
              </div>
            )}
            {profile.socials && profile.socials.length > 0 && (
              <div>
                <strong>Socials:</strong>
                <ul>
                  {profile.socials.map((social) => (
                    <li key={social.platform}>{social.platform}: {social.handle}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {profileFromHook && (
        <div className="hook-comparison">
          <h3>useProfile() Hook</h3>
          <p>Returns the same profile: <code>{profileFromHook.did}</code></p>
        </div>
      )}

      <div className="actions">
        <button onClick={simulateNativeApp} className="action-btn">
          Simulate Native Local First Auth
        </button>
        <p className="hint">
          Click to inject a mock <code>window.localFirstAuth</code> API
        </p>
      </div>

      <div className="explanation">
        <h3>What This Tests:</h3>
        <ul>
          <li><code>useOnboarding()</code> hook state detection</li>
          <li><code>useProfile()</code> hook profile access</li>
          <li>Native app vs web account detection</li>
          <li>LocalStorage persistence across page reloads</li>
        </ul>
      </div>
    </div>
  )
}

export default BasicDemo
