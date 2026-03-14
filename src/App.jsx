import { useState, useEffect, useRef } from 'react'
import BuildBuilder from './components/BuildBuilder'
import FlipTracker from './components/FlipTracker'
import CustomerSpecPage from './components/CustomerSpecPage'
import InventoryTracker from './components/InventoryTracker'

const DEFAULT_BUILD = {
  cpu:         { name: '', paid: '' },
  gpu:         { name: '', paid: '' },
  motherboard: { name: '', paid: '' },
  ram:         { name: '', paid: '' },
  storage:     { name: '', paid: '' },
  psu:         { name: '', paid: '' },
  cooler:      { name: '', paid: '' },
  case:        { name: '', paid: '' },
  os:          { name: '', paid: '' },
}

function getInitialView() {
  const hash = window.location.hash
  if (hash.startsWith('#customer')) return 'customer'
  return 'builder'
}

const NAV_TABS = [
  { id: 'builder',   label: 'Build Builder', icon: '🔧' },
  { id: 'tracker',   label: 'Flip Tracker',  icon: '📊' },
  { id: 'inventory', label: 'Inventory',      icon: '📦' },
  { id: 'customer',  label: 'Customer Page',  icon: '🛍️' },
]

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function SettingsModal({ apiKey, onSave, onClose }) {
  const [draft, setDraft] = useState(apiKey)
  const envKey = import.meta.env.VITE_YOUTUBE_API_KEY ?? ''
  const usingEnvKey = !loadFromStorage('pfs_yt_key', '') && !!envKey

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Settings</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-section">
          <label className="modal-label">YouTube Data API v3 Key</label>
          {usingEnvKey ? (
            <p className="modal-hint env-key-notice">
              ✓ Key is configured via environment variable — customers will see embedded benchmark videos automatically.
              Enter a value below only if you want to override it.
            </p>
          ) : (
            <p className="modal-hint">
              Enables real embedded benchmark videos on the Customer Page.
              Without it, a YouTube search link is shown instead.
            </p>
          )}
          <input
            className="input-mono modal-input"
            placeholder="AIza..."
            value={draft}
            onChange={e => setDraft(e.target.value)}
            spellCheck={false}
          />
          <div className="modal-steps">
            <p className="steps-title">How to get a free API key:</p>
            <ol className="steps-list">
              <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">console.cloud.google.com</a></li>
              <li>Create a project (or select one)</li>
              <li>Go to <strong>APIs &amp; Services → Library</strong></li>
              <li>Search for <strong>YouTube Data API v3</strong> and enable it</li>
              <li>Go to <strong>APIs &amp; Services → Credentials → Create Credentials → API Key</strong></li>
              <li>Optionally restrict the key to your domain under <strong>API restrictions</strong></li>
              <li>Paste the key above — free tier gives ~100 video searches/day</li>
            </ol>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onSave(draft.trim()); onClose() }}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView]               = useState(getInitialView)
  const [build, setBuild]             = useState(() => loadFromStorage('pfs_build', DEFAULT_BUILD))
  const [askingPrice, setAskingPrice] = useState(() => loadFromStorage('pfs_asking', ''))
  const [flips, setFlips]             = useState(() => loadFromStorage('pfs_flips', []))
  const [inventory, setInventory]     = useState(() => loadFromStorage('pfs_inventory', []))
  // Use localStorage override if set, otherwise fall back to the env var baked in at build time.
  // This means customers who open a shared link get the embedded video automatically —
  // the env var is bundled into the deployed build on Vercel.
  const [youtubeApiKey, setYoutubeApiKey] = useState(() => {
    const stored = loadFromStorage('pfs_yt_key', '')
    return stored || (import.meta.env.VITE_YOUTUBE_API_KEY ?? '')
  })
  const [showSettings, setShowSettings]   = useState(false)

  useEffect(() => { localStorage.setItem('pfs_build',   JSON.stringify(build)) },         [build])
  useEffect(() => { localStorage.setItem('pfs_asking',  JSON.stringify(askingPrice)) },   [askingPrice])
  useEffect(() => { localStorage.setItem('pfs_flips',     JSON.stringify(flips)) },       [flips])
  useEffect(() => { localStorage.setItem('pfs_inventory', JSON.stringify(inventory)) }, [inventory])
  useEffect(() => { localStorage.setItem('pfs_yt_key',  JSON.stringify(youtubeApiKey)) }, [youtubeApiKey])

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash.startsWith('#customer')) setView('customer')
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigateTo = (id) => {
    setView(id)
    if (id !== 'customer') window.location.hash = ''
  }

  const isCustomerView = view === 'customer' && window.location.hash.startsWith('#customer?d=')

  return (
    <div className="app-root">
      {!isCustomerView && (
        <nav className="sidebar">
          <div className="sidebar-logo">
            <span className="logo-icon">⚡</span>
            <div className="logo-text">
              <span className="logo-main">PC Flipper</span>
              <span className="logo-sub">Suite</span>
            </div>
          </div>

          <div className="sidebar-nav">
            {NAV_TABS.map(tab => (
              <button
                key={tab.id}
                className={`nav-btn ${view === tab.id ? 'active' : ''}`}
                onClick={() => navigateTo(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
                {tab.id === 'tracker'   && flips.length > 0 && (
                  <span className="nav-badge">{flips.length}</span>
                )}
                {tab.id === 'inventory' && inventory.filter(i => i.status === 'In Stock').length > 0 && (
                  <span className="nav-badge">{inventory.filter(i => i.status === 'In Stock').length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="sidebar-footer">
            <button className="settings-btn" onClick={() => setShowSettings(true)}>
              <span>⚙</span>
              <span className="nav-label">Settings</span>
            </button>
            <div className="footer-note">Data stored locally.</div>
          </div>
        </nav>
      )}

      <main className={`main-content ${isCustomerView ? 'fullpage' : ''}`}>
        {view === 'builder' && (
          <BuildBuilder
            build={build}
            setBuild={setBuild}
            askingPrice={askingPrice}
            setAskingPrice={setAskingPrice}
            setFlips={setFlips}
            navigateTo={navigateTo}
            inventory={inventory}
            setInventory={setInventory}
          />
        )}
        {view === 'tracker' && (
          <FlipTracker
            flips={flips}
            setFlips={setFlips}
            inventory={inventory}
            setInventory={setInventory}
          />
        )}
        {view === 'inventory' && (
          <InventoryTracker
            inventory={inventory}
            setInventory={setInventory}
            navigateTo={navigateTo}
            setBuild={setBuild}
          />
        )}
        {view === 'customer' && (
          <CustomerSpecPage
            build={build}
            askingPrice={askingPrice}
            youtubeApiKey={youtubeApiKey}
          />
        )}
      </main>

      {showSettings && (
        <SettingsModal
          apiKey={youtubeApiKey}
          onSave={setYoutubeApiKey}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
