import { useState } from 'react'
import { Onboarding } from 'local-first-auth/react'

type Mode = 'choice' | 'download-prompt'

function FullFlowDemo() {
  const [mode, setMode] = useState<Mode>('choice')
  const [skipSocialStep, setSkipSocialStep] = useState(false)
  const [skipAvatarStep, setSkipAvatarStep] = useState(false)
  const [completed, setCompleted] = useState(false)

  const handleComplete = (profile: any) => {
    console.log('Onboarding completed:', profile)
    setCompleted(true)
  }

  const resetDemo = () => {
    setCompleted(false)
    setMode('choice')
  }

  return (
    <div className="demo">
      <h2>Full Flow Demo: Onboarding Component</h2>
      <p>
        This demo shows the complete <code>&lt;Onboarding /&gt;</code> component with all modes.
      </p>

      {!completed ? (
        <>
          <div className="controls">
            <div className="control-group">
              <label>Mode:</label>
              <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
                <option value="choice">Choice (Download or Create)</option>
                <option value="download-prompt">Download Prompt</option>
              </select>
            </div>

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
            <Onboarding
              mode={mode}
              skipSocialStep={skipSocialStep}
              skipAvatarStep={skipAvatarStep}
              onComplete={handleComplete}
            />
          </div>
        </>
      ) : (
        <div className="completion-message">
          <h3>Onboarding Complete!</h3>
          <p>Profile created successfully. Check the console for profile data.</p>
          <button onClick={resetDemo} className="action-btn">
            Reset Demo
          </button>
        </div>
      )}

      <div className="explanation">
        <h3>What This Tests:</h3>
        <ul>
          <li><strong>Choice Mode:</strong> Let user pick download app or create web account (3-step wizard: name, socials, avatar)</li>
          <li><strong>Download Prompt:</strong> Show iOS/Android download links only</li>
          <li><strong>Skip Options:</strong> Test optional social/avatar steps</li>
          <li><strong>DID Generation:</strong> Creates Ed25519 keypair and did:key identifier</li>
          <li><strong>LocalStorage:</strong> Persists profile and private key</li>
          <li><strong>Mock API Injection:</strong> Injects window.localFirstAuth after creation</li>
        </ul>
      </div>
    </div>
  )
}

export default FullFlowDemo
