import { useState, useEffect } from 'react'
import {
  pcppCategoryUrl, amazonUrl, getPerformanceTier,
  youtubeBenchmarkSearchUrl, youtubeBenchmarkApiQuery,
  shortPartName, runCompatibilityChecks,
} from '../utils/compatibility'
import DB from '../data/compatibility-db.json'

// Find a pre-saved benchmark video ID for the given GPU name
function getPreSavedVideoId(gpuName) {
  if (!gpuName?.trim()) return null
  const input = gpuName.trim().toUpperCase()
  let best = null
  let bestLen = 0
  for (const entry of DB.gpus) {
    if (!entry.benchmarkVideoId) continue
    const key = entry.name.toUpperCase()
    if (input.includes(key) && key.length > bestLen) {
      best = entry.benchmarkVideoId
      bestLen = key.length
    }
  }
  return best
}

const COMPONENTS = [
  { key: 'cpu',         label: 'Processor (CPU)',     icon: '⚙️'  },
  { key: 'gpu',         label: 'Graphics Card (GPU)', icon: '🎮'  },
  { key: 'motherboard', label: 'Motherboard',         icon: '🔲'  },
  { key: 'ram',         label: 'Memory (RAM)',         icon: '💾'  },
  { key: 'storage',     label: 'Storage',             icon: '💽'  },
  { key: 'psu',         label: 'Power Supply',        icon: '⚡'  },
  { key: 'cooler',      label: 'CPU Cooler',          icon: '❄️'  },
  { key: 'case',        label: 'Case',                icon: '🖥️'  },
  { key: 'os',          label: 'Operating System',    icon: '🪟'  },
]

const STATUS_ICON  = { ok: '✓', warn: '⚠', error: '✗' }
const STATUS_LABEL = { ok: 'Compatible', warn: 'Needs Verification', error: 'Incompatible' }

function parseBuildFromHash() {
  try {
    const hash = window.location.hash
    const match = hash.match(/[?&]d=([^&]+)/)
    if (!match) return null
    return JSON.parse(atob(match[1]))
  } catch {
    return null
  }
}

// Fetches a YouTube video ID via Data API v3 for the given query
async function fetchYoutubeVideoId(query, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`YouTube API error ${res.status}`)
  const data = await res.json()
  return data.items?.[0]?.id?.videoId ?? null
}

function BenchmarkSection({ gpuName, cpuName, youtubeApiKey }) {
  const preSavedId = getPreSavedVideoId(gpuName)

  const [videoId, setVideoId]   = useState(preSavedId)
  const [loading, setLoading]   = useState(false)
  const [apiError, setApiError] = useState(null)

  const gpu = shortPartName(gpuName)
  const cpu = shortPartName(cpuName)
  const queryLabel  = [gpu, cpu].filter(Boolean).join(' + ')
  const searchUrl   = youtubeBenchmarkSearchUrl(gpuName, cpuName)
  const apiQuery    = youtubeBenchmarkApiQuery(gpuName, cpuName)

  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

  useEffect(() => {
    // Skip API call if we already have a pre-saved video ID
    if (preSavedId) return
    if (!youtubeApiKey || !apiQuery || isLocalhost) return
    setLoading(true)
    setVideoId(null)
    setApiError(null)
    fetchYoutubeVideoId(apiQuery, youtubeApiKey)
      .then(id => { setVideoId(id); setLoading(false) })
      .catch(err => { setApiError(err.message); setLoading(false) })
  }, [youtubeApiKey, apiQuery, isLocalhost, preSavedId])

  if (!queryLabel) return null

  // Real embed when we have a video ID
  if (videoId) {
    return (
      <div className="benchmark-embed-block">
        <div className="benchmark-embed-label">
          <span className="benchmark-icon">▶</span>
          <span className="benchmark-part-name">{queryLabel}</span>
          <span className="benchmark-sub">Gaming Benchmark</span>
        </div>
        <div className="benchmark-iframe-container">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0`}
            title={`${queryLabel} benchmark`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="benchmark-loading">
        <div className="benchmark-spinner" />
        <span>Fetching benchmark video…</span>
      </div>
    )
  }

  // Fallback: styled YouTube search card (no API key, or API error)
  return (
    <>
      {apiError && (
        <div className="benchmark-api-error">
          YouTube API error: {apiError} — showing search link instead.
        </div>
      )}
      <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="benchmark-card">
        <div className="benchmark-card-bg" />
        <div className="benchmark-card-content">
          <div className="benchmark-play-btn">
            <span className="benchmark-play-icon">▶</span>
          </div>
          <div className="benchmark-card-text">
            <div className="benchmark-card-query">{queryLabel}</div>
            <div className="benchmark-card-label">
              {youtubeApiKey
                ? 'No video found — click to search on YouTube'
                : 'Gaming Benchmark · Opens YouTube Search'}
            </div>
          </div>
          <div className="benchmark-yt-logo">
            <svg viewBox="0 0 90 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="72" height="16">
              <path d="M27.97 3.04C27.62 1.74 26.6.73 25.3.38 23.07-.2 14.39-.2 14.39-.2S5.7-.2 3.47.38C2.17.73 1.15 1.74.8 3.04.23 5.27.23 10 .23 10s0 4.73.57 6.96c.35 1.3 1.37 2.31 2.67 2.66 2.23.58 10.92.58 10.92.58s8.69 0 10.92-.58c1.3-.35 2.32-1.36 2.67-2.66.57-2.23.57-6.96.57-6.96s0-4.73-.58-6.96z" fill="#FF0000"/>
              <path d="M11.5 14.29V5.71L18.8 10l-7.3 4.29z" fill="white"/>
              <text x="32" y="14" fill="white" fontSize="11" fontFamily="Arial,sans-serif" fontWeight="bold">YouTube</text>
            </svg>
          </div>
        </div>
      </a>
    </>
  )
}

export default function CustomerSpecPage({ build: liveBuild, askingPrice: liveAskingPrice, youtubeApiKey = '' }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    const fromHash = parseBuildFromHash()
    if (fromHash) {
      setData(fromHash)
    } else {
      setData({ build: liveBuild, askingPrice: liveAskingPrice })
    }
  }, [liveBuild, liveAskingPrice])

  if (!data) return <div className="customer-loading">Loading…</div>

  const { build, askingPrice } = data
  const parts = COMPONENTS.filter(c => build[c.key]?.name?.trim())

  const asking = parseFloat(askingPrice)
  const tier   = getPerformanceTier(build)
  const gpuName = build.gpu?.name?.trim()
  const cpuName = build.cpu?.name?.trim()

  // Run compat checks for the customer page
  const compatChecks = runCompatibilityChecks(build)
  const hasConflicts = compatChecks.some(c => c.status === 'error')
  const allCompatOk  = compatChecks.length > 0 && compatChecks.every(c => c.status === 'ok')

  if (parts.length === 0) {
    return (
      <div className="customer-empty">
        <div className="empty-icon">🖥️</div>
        <h2>No build data found</h2>
        <p>Enter components in the Build Builder, then click "Share Customer Page" to generate a link.</p>
      </div>
    )
  }

  return (
    <div className="customer-page">
      {/* Hero */}
      <div className="customer-hero">
        <div className="customer-hero-inner">
          <div className="customer-badge-row">
            <span className="tier-badge" style={{ background: tier.color + '22', color: tier.color, border: `1px solid ${tier.color}55` }}>
              {tier.badge}
            </span>
            {allCompatOk && (
              <span className="compat-hero-badge ok">✓ Fully Compatible</span>
            )}
          </div>
          <h1 className="customer-title">Custom PC Build</h1>
          <p className="customer-tagline">Professionally assembled. Every part sourced, tested, and priced below retail.</p>
          {asking > 0 && (
            <div className="customer-price-hero">
              <span className="price-label">Asking Price</span>
              <span className="price-value">${asking.toFixed(0)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="customer-body">
        {/* Performance Tier */}
        <div className="customer-card tier-card" style={{ borderColor: tier.color + '44' }}>
          <h2 className="customer-card-title">
            <span className="card-title-dot" style={{ background: tier.color }} />
            Performance Profile
          </h2>
          <div className="tier-tasks">
            {tier.tasks.map(task => (
              <div key={task} className="tier-task">
                <span className="tier-checkmark" style={{ color: tier.color }}>✓</span>
                <span>{task}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Benchmark Video */}
        {(gpuName || cpuName) && (
          <div className="customer-card benchmarks-card">
            <h2 className="customer-card-title">
              <span className="card-title-dot" style={{ background: '#ff4444' }} />
              Real-World Benchmarks
            </h2>
            <p className="benchmarks-subtitle">
              See exactly how this build performs in real gaming tests.
            </p>
            <BenchmarkSection
              gpuName={gpuName}
              cpuName={cpuName}
              youtubeApiKey={youtubeApiKey}
            />
          </div>
        )}

        {/* Full Specs */}
        <div className="customer-card">
          <h2 className="customer-card-title">
            <span className="card-title-dot" style={{ background: '#60a5fa' }} />
            Full Specifications
          </h2>
          <div className="spec-list">
            {parts.map(({ key, label, icon }) => {
              const part = build[key]
              return (
                <div key={key} className="spec-row">
                  <div className="spec-left">
                    <span className="spec-icon">{icon}</span>
                    <span className="spec-label">{label}</span>
                  </div>
                  <div className="spec-right">
                    <span className="spec-name">{part.name}</span>
                    <div className="spec-links">
                      <a href={pcppCategoryUrl(key, part.name)} target="_blank" rel="noopener noreferrer" className="spec-link">PCPartPicker ↗</a>
                      <a href={amazonUrl(part.name)} target="_blank" rel="noopener noreferrer" className="spec-link">Amazon ↗</a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Compatibility Report */}
        {compatChecks.length > 0 && (
          <div className="customer-card compat-report-card">
            <h2 className="customer-card-title">
              <span className="card-title-dot" style={{ background: allCompatOk ? '#34d399' : hasConflicts ? '#f87171' : '#fbbf24' }} />
              Parts Compatibility
              <span className={`compat-report-badge ${allCompatOk ? 'ok' : hasConflicts ? 'error' : 'warn'}`}>
                {allCompatOk ? '✓ All Clear' : hasConflicts ? '✗ Conflicts Found' : '⚠ Review Recommended'}
              </span>
            </h2>
            <p className="compat-report-intro">
              {allCompatOk
                ? 'All detected parts are confirmed compatible with each other.'
                : 'Compatibility checks based on detected part specifications:'}
            </p>
            <div className="compat-report-list">
              {compatChecks.map(c => (
                <div key={c.id} className={`compat-report-row status-${c.status}`}>
                  <span className={`compat-report-icon status-${c.status}`}>{STATUS_ICON[c.status]}</span>
                  <div className="compat-report-body">
                    <span className="compat-report-name">{c.label}</span>
                    <span className="compat-report-detail">{c.detail}</span>
                  </div>
                  <span className={`compat-report-status-label status-${c.status}`}>{STATUS_LABEL[c.status]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Value Proposition */}
        {asking > 0 && (
          <div className="customer-card value-card">
            <h2 className="customer-card-title">
              <span className="card-title-dot" style={{ background: '#34d399' }} />
              Why Buy This Build?
            </h2>
            <div className="value-points">
              <div className="value-point">
                <span className="value-icon">💰</span>
                <div>
                  <strong>Save money vs building yourself</strong>
                  <p>Retail parts are hard to find at MSRP. This build is priced to save you time and money.</p>
                </div>
              </div>
              <div className="value-point">
                <span className="value-icon">🔧</span>
                <div>
                  <strong>Already assembled & tested</strong>
                  <p>No compatibility headaches. The build has been assembled and is ready to use.</p>
                </div>
              </div>
              {allCompatOk && (
                <div className="value-point">
                  <span className="value-icon">✅</span>
                  <div>
                    <strong>Verified compatible parts</strong>
                    <p>All components confirmed compatible — sockets, RAM type, PSU wattage, and form factors.</p>
                  </div>
                </div>
              )}
              {parts.some(p => p.key === 'os') && (
                <div className="value-point">
                  <span className="value-icon">🪟</span>
                  <div>
                    <strong>OS included</strong>
                    <p>Turn it on and start using it immediately.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="value-cta">
              <div className="cta-price-row">
                <div className="cta-asking">
                  <span className="cta-label">Asking Price</span>
                  <span className="cta-price">${asking.toFixed(0)}</span>
                </div>
                <div className="cta-vs">Verify retail prices for every component via the links above →</div>
              </div>
            </div>
          </div>
        )}

        {/* Retail Price Reference */}
        <div className="customer-card ref-card">
          <h2 className="customer-card-title">
            <span className="card-title-dot" style={{ background: '#f59e0b' }} />
            Retail Price Reference
          </h2>
          <p className="ref-note">Click any link to check current retail prices:</p>
          <div className="ref-table">
            {parts.map(({ key, label, icon }) => {
              const part = build[key]
              return (
                <div key={key} className="ref-row">
                  <span className="ref-label">{icon} {label}</span>
                  <span className="ref-name">{part.name}</span>
                  <div className="ref-links">
                    <a href={pcppCategoryUrl(key, part.name)} target="_blank" rel="noopener noreferrer" className="ref-link pcpp">PCPP ↗</a>
                    <a href={amazonUrl(part.name)} target="_blank" rel="noopener noreferrer" className="ref-link amzn">AMZ ↗</a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="customer-footer">
          <p>Built with PC Flipper Suite · Prices verified by buyer via retail links above</p>
        </div>
      </div>
    </div>
  )
}
