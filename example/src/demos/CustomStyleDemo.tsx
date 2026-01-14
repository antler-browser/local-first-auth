import { Onboarding } from 'local-first-auth/react'
import { useState } from 'react'

function CustomStyleDemo() {
  const [completed, setCompleted] = useState(false)

  const customStyles = {
    primaryColor: '#764ba2',
    backgroundColor: '#f8f9fa',
    textColor: '#2d3748',
    borderRadius: '16px',
    fontFamily: 'Georgia, serif',
    buttonRadius: '8px',
    inputRadius: '8px',
  }

  return (
    <div className="demo">
      <h2>Custom Style Demo: Styling Props</h2>
      <p>
        Test the <code>customStyles</code> prop to theme the <code>&lt;Onboarding /&gt;</code> component.
      </p>

      {!completed ? (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <Onboarding
            mode="choice"
            customStyles={customStyles}
            onComplete={(profile) => {
              console.log('Custom styled onboarding completed:', profile)
              setCompleted(true)
            }}
          />
        </div>
      ) : (
        <div className="completion-message">
          <h3>Onboarding Complete!</h3>
          <p>Check the console for profile data.</p>
          <button onClick={() => setCompleted(false)} className="action-btn">
            Reset Demo
          </button>
        </div>
      )}

      <div className="code-example">
        <h3>Custom Styling Example:</h3>
        <pre>{`const customStyles = {
  primaryColor: '#764ba2',
  backgroundColor: '#f8f9fa',
  textColor: '#2d3748',
  borderRadius: '16px',
  fontFamily: 'Georgia, serif',
  buttonRadius: '8px',
  inputRadius: '8px',
}

<Onboarding
  mode="choice"
  customStyles={customStyles}
  onComplete={handleComplete}
/>`}</pre>
      </div>

      <div className="explanation">
        <h3>What This Tests:</h3>
        <ul>
          <li><strong>Custom styles:</strong> Use customStyles prop to theme components</li>
          <li><strong>Primary color:</strong> Set button and accent colors</li>
          <li><strong>Typography:</strong> Custom font families and text colors</li>
          <li><strong>Border radius:</strong> Control roundness of buttons and inputs</li>
          <li><strong>Responsive design:</strong> Works with custom layouts</li>
          <li><strong>Theme integration:</strong> Easy to match your app's design system</li>
        </ul>
      </div>

      <div className="styling-tips">
        <h3>Styling Tips:</h3>
        <ul>
          <li>Use <code>customStyles</code> prop to theme the entire component</li>
          <li>Available style options: primaryColor, backgroundColor, textColor, borderRadius, fontFamily, buttonRadius, inputRadius</li>
          <li>Components use inline styles for theming, no CSS required</li>
          <li>All styles are optional - use defaults or customize what you need</li>
        </ul>
      </div>
    </div>
  )
}

export default CustomStyleDemo
