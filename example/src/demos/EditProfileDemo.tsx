import { useState } from 'react'
import { EditProfile, getCurrentProfile } from 'local-first-auth/react'
import type { Profile } from 'local-first-auth'

function EditProfileDemo() {
  // Snapshot the profile as it was when the demo mounted, so we can compare
  // the DID before and after editing and prove identity is preserved.
  const [originalProfile] = useState<Profile | null>(() => getCurrentProfile())
  const [skipSocialStep, setSkipSocialStep] = useState(false)
  const [skipAvatarStep, setSkipAvatarStep] = useState(false)
  const [updatedProfile, setUpdatedProfile] = useState<Profile | null>(null)

  const handleComplete = (profile: Profile) => {
    console.log('Profile updated:', profile)
    setUpdatedProfile(profile)
  }

  const resetDemo = () => {
    setUpdatedProfile(null)
  }

  // No profile exists yet — EditProfile renders null, so prompt the user to create one.
  if (!originalProfile) {
    return (
      <div className="demo">
        <h2>Edit Profile Demo: EditProfile Component</h2>
        <p>
          The <code>&lt;EditProfile /&gt;</code> component edits an existing profile in place.
        </p>
        <div className="completion-message">
          <h3>No Profile Found</h3>
          <p>
            Create a profile first using the <strong>Full Flow</strong> tab, then come back
            here to edit it.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="demo">
      <h2>Edit Profile Demo: EditProfile Component</h2>
      <p>
        This demo shows the <code>&lt;EditProfile /&gt;</code> component. It pre-fills the
        current profile and saves changes via <code>updateProfile()</code>, keeping the
        same DID / identity.
      </p>

      <div className="explanation">
        <h3>Original DID (before edit):</h3>
        <p><code style={{ wordBreak: 'break-all' }}>{originalProfile.did}</code></p>
      </div>

      {!updatedProfile ? (
        <>
          <div className="controls">
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={skipSocialStep}
                  onChange={(e) => setSkipSocialStep(e.target.checked)}
                />
                Skip Social Step
              </label>
            </div>

            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={skipAvatarStep}
                  onChange={(e) => setSkipAvatarStep(e.target.checked)}
                />
                Skip Avatar Step
              </label>
            </div>
          </div>

          <div className="onboarding-container">
            <EditProfile
              skipSocialStep={skipSocialStep}
              skipAvatarStep={skipAvatarStep}
              onComplete={handleComplete}
            />
          </div>
        </>
      ) : (
        <div className="completion-message">
          <h3>Profile Updated!</h3>
          <p>
            <strong>Name:</strong> {updatedProfile.name}
          </p>
          <p>
            <strong>Socials:</strong>{' '}
            {updatedProfile.socials?.length
              ? updatedProfile.socials.map((s) => `${s.platform}: ${s.handle}`).join(', ')
              : 'none'}
          </p>
          <p>
            <strong>Avatar:</strong> {updatedProfile.avatar ? 'set' : 'none'}
          </p>
          <p>
            <strong>DID after edit:</strong>{' '}
            <code style={{ wordBreak: 'break-all' }}>{updatedProfile.did}</code>
          </p>
          <p style={{ fontWeight: 'bold' }}>
            {updatedProfile.did === originalProfile.did
              ? '✅ DID unchanged — identity preserved.'
              : '❌ DID changed — identity was NOT preserved!'}
          </p>
          <button onClick={resetDemo} className="action-btn">
            Edit Again
          </button>
        </div>
      )}

      <div className="explanation">
        <h3>What This Tests:</h3>
        <ul>
          <li><strong>Pre-fill:</strong> Name, socials, and avatar seeded from the current profile</li>
          <li><strong>Update path:</strong> Completing calls <code>updateProfile()</code>, not <code>createProfile()</code></li>
          <li><strong>Stable identity:</strong> The DID and private key are unchanged across edits</li>
          <li><strong>Skip Options:</strong> Social/avatar steps can be skipped in edit mode too</li>
        </ul>
      </div>
    </div>
  )
}

export default EditProfileDemo
