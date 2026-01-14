import { useState } from 'react'
import BasicDemo from './demos/BasicDemo'
import FullFlowDemo from './demos/FullFlowDemo'
import CoreApiDemo from './demos/CoreApiDemo'
import CustomStyleDemo from './demos/CustomStyleDemo'

type Tab = 'basic' | 'fullFlow' | 'coreApi' | 'customStyle'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('basic')

  const clearStorage = () => {
    if (confirm('Clear all localStorage data? This will reset all profiles and demo state.')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Local First Auth - Example App</h1>
        <p className="subtitle">
          Test all features without bloating the npm package
        </p>
        <button onClick={clearStorage} className="clear-btn">
          Clear LocalStorage
        </button>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'basic' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('basic')}
        >
          Basic Demo
        </button>
        <button
          className={activeTab === 'fullFlow' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('fullFlow')}
        >
          Full Flow
        </button>
        <button
          className={activeTab === 'coreApi' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('coreApi')}
        >
          Core API
        </button>
        <button
          className={activeTab === 'customStyle' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('customStyle')}
        >
          Custom Style
        </button>
      </nav>

      <main className="content">
        {activeTab === 'basic' && <BasicDemo />}
        {activeTab === 'fullFlow' && <FullFlowDemo />}
        {activeTab === 'coreApi' && <CoreApiDemo />}
        {activeTab === 'customStyle' && <CustomStyleDemo />}
      </main>

      <footer className="footer">
        <p>
          This example app is excluded from npm via <code>package.json "files": ["dist"]</code>
        </p>
      </footer>
    </div>
  )
}

export default App
