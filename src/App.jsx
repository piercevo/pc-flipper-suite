import { useState, useEffect } from 'react'
import BuildBuilder from './components/BuildBuilder'
import FlipTracker from './components/FlipTracker'
import CustomerSpecPage from './components/CustomerSpecPage'
import InventoryTracker from './components/InventoryTracker'
import AuthGate from './components/AuthGate'
import { supabase } from './lib/supabase'

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

// Read from localStorage as a fast initial value while Supabase loads
function fromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function SettingsModal({ apiKey, onSave, onClose }) {
  const [draft, setDraft] = useState(apiKey)
  const envKey      = import.meta.env.VITE_YOUTUBE_API_KEY ?? ''
  const usingEnvKey = !fromStorage('pfs_yt_key', '') && !!envKey

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
  // ── Auth ──────────────────────────────────────────────────────────────
  const [user,        setUser]        = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [syncing,     setSyncing]     = useState(false)

  // ── App state (seeded from localStorage for instant render) ───────────
  const [view,         setView]         = useState(getInitialView)
  const [build,        setBuild]        = useState(() => fromStorage('pfs_build',   DEFAULT_BUILD))
  const [askingPrice,  setAskingPrice]  = useState(() => fromStorage('pfs_asking',  ''))
  const [flips,        setFlips]        = useState(() => fromStorage('pfs_flips',   []))
  const [inventory,    setInventory]    = useState(() => fromStorage('pfs_inventory', []))
  const [youtubeApiKey, setYoutubeApiKey] = useState(() => {
    const stored = fromStorage('pfs_yt_key', '')
    return stored || (import.meta.env.VITE_YOUTUBE_API_KEY ?? '')
  })
  const [showSettings, setShowSettings] = useState(false)

  // ── Auth listener ─────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── Load data from Supabase when user logs in ─────────────────────────
  useEffect(() => {
    if (!user) return
    setDataLoading(true)
    supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          // Existing user — load their saved data
          setBuild(data.build       || DEFAULT_BUILD)
          setAskingPrice(data.asking_price ?? '')
          setFlips(data.flips       || [])
          setInventory(data.inventory || [])
          const ytKey = data.yt_key || (import.meta.env.VITE_YOUTUBE_API_KEY ?? '')
          setYoutubeApiKey(ytKey)
        } else {
          // First-time login — migrate any existing localStorage data
          const localBuild     = fromStorage('pfs_build',     null)
          const localAsking    = fromStorage('pfs_asking',    '')
          const localFlips     = fromStorage('pfs_flips',     [])
          const localInventory = fromStorage('pfs_inventory', [])
          const localYtKey     = fromStorage('pfs_yt_key',    '')
          if (localBuild)               setBuild(localBuild)
          if (localAsking)              setAskingPrice(localAsking)
          if (localFlips.length)        setFlips(localFlips)
          if (localInventory.length)    setInventory(localInventory)
          if (localYtKey)               setYoutubeApiKey(localYtKey)
        }
        setDataLoading(false)
      })
  }, [user])

  // ── Sync build + asking to Supabase (debounced — changes on every key) ─
  useEffect(() => {
    if (!user || dataLoading) return
    const t = setTimeout(() => {
      setSyncing(true)
      supabase.from('user_data')
        .upsert({ user_id: user.id, build, asking_price: askingPrice, updated_at: new Date().toISOString() })
        .then(() => setSyncing(false))
    }, 800)
    return () => clearTimeout(t)
  }, [build, askingPrice, user, dataLoading])

  // ── Sync flips to Supabase ─────────────────────────────────────────────
  useEffect(() => {
    if (!user || dataLoading) return
    setSyncing(true)
    supabase.from('user_data')
      .upsert({ user_id: user.id, flips, updated_at: new Date().toISOString() })
      .then(() => setSyncing(false))
  }, [flips, user, dataLoading])

  // ── Sync inventory to Supabase ─────────────────────────────────────────
  useEffect(() => {
    if (!user || dataLoading) return
    setSyncing(true)
    supabase.from('user_data')
      .upsert({ user_id: user.id, inventory, updated_at: new Date().toISOString() })
      .then(() => setSyncing(false))
  }, [inventory, user, dataLoading])

  // ── Sync YouTube key to Supabase ───────────────────────────────────────
  useEffect(() => {
    if (!user || dataLoading) return
    supabase.from('user_data')
      .upsert({ user_id: user.id, yt_key: youtubeApiKey, updated_at: new Date().toISOString() })
  }, [youtubeApiKey, user, dataLoading])

  // ── Keep localStorage in sync as a local cache ─────────────────────────
  useEffect(() => { localStorage.setItem('pfs_build',      JSON.stringify(build))        }, [build])
  useEffect(() => { localStorage.setItem('pfs_asking',     JSON.stringify(askingPrice))  }, [askingPrice])
  useEffect(() => { localStorage.setItem('pfs_flips',      JSON.stringify(flips))        }, [flips])
  useEffect(() => { localStorage.setItem('pfs_inventory',  JSON.stringify(inventory))    }, [inventory])
  useEffect(() => { localStorage.setItem('pfs_yt_key',     JSON.stringify(youtubeApiKey))}, [youtubeApiKey])

  // ── Hash change listener ───────────────────────────────────────────────
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

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const isCustomerView = view === 'customer' && window.location.hash.startsWith('#customer?d=')

  // Show a blank screen while checking auth (avoids flash of login page)
  if (authLoading) return <div className="auth-gate"><div className="auth-loading">⚡</div></div>

  // Show login page for non-customer views when not signed in
  if (!user && !isCustomerView) return <AuthGate />

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
            {user && (
              <div className="sidebar-user">
                <span className="user-email" title={user.email}>{user.email}</span>
                <button className="signout-btn" onClick={signOut}>Sign out</button>
              </div>
            )}
            <div className="footer-note">
              {syncing ? '↑ Syncing…' : '✓ Synced'}
            </div>
          </div>
        </nav>
      )}

      <main className={`main-content ${isCustomerView ? 'fullpage' : ''}`}>
        {dataLoading ? (
          <div className="data-loading">
            <div className="data-loading-spinner" />
            <span>Loading your data…</span>
          </div>
        ) : (
          <>
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
          </>
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
