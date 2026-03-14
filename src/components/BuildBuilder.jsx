import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { pcppCategoryUrl, amazonUrl, runCompatibilityChecks, getRowChecks, getRowStatus } from '../utils/compatibility'
import AutocompleteInput from './AutocompleteInput'

const COMPONENTS = [
  { key: 'cpu',         label: 'CPU',         icon: '⚙️',  placeholder: 'e.g. AMD Ryzen 7 5800X3D' },
  { key: 'gpu',         label: 'GPU',         icon: '🎮',  placeholder: 'e.g. NVIDIA GeForce RTX 3070' },
  { key: 'motherboard', label: 'Motherboard', icon: '🔲',  placeholder: 'e.g. ASUS ROG Strix B550-F (AM4, ATX)' },
  { key: 'ram',         label: 'RAM',         icon: '💾',  placeholder: 'e.g. Corsair Vengeance 32GB DDR4-3200' },
  { key: 'storage',     label: 'Storage',     icon: '💽',  placeholder: 'e.g. Samsung 980 Pro 1TB NVMe M.2' },
  { key: 'psu',         label: 'PSU',         icon: '⚡',  placeholder: 'e.g. Corsair RM750x 750W 80+ Gold' },
  { key: 'cooler',      label: 'CPU Cooler',  icon: '❄️',  placeholder: 'e.g. Noctua NH-D15' },
  { key: 'case',        label: 'Case',        icon: '🖥️',  placeholder: 'e.g. Fractal Design Meshify 2 (ATX)' },
  { key: 'os',          label: 'OS',          icon: '🪟',  placeholder: 'e.g. Windows 11 Home OEM' },
]

const DEFAULT_BUILD = Object.fromEntries(
  COMPONENTS.map(c => [c.key, { name: '', paid: '' }])
)

const STATUS_ICON = { ok: '✓', warn: '⚠', error: '✗' }
const STATUS_LABELS = { ok: 'Compatible', warn: 'Verify', error: 'Conflict' }

function CompatBadge({ partKey, allChecks }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos]   = useState({ top: 0, left: 0 })
  const dotRef          = useRef(null)
  const status = getRowStatus(partKey, allChecks)
  const checks = getRowChecks(partKey, allChecks)
  if (!status) return null

  const handleMouseEnter = () => {
    if (dotRef.current) {
      const r = dotRef.current.getBoundingClientRect()
      setPos({ top: r.top + r.height / 2, left: r.right + 10 })
    }
    setOpen(true)
  }

  return (
    <div className="compat-badge-wrap" onMouseEnter={handleMouseEnter} onMouseLeave={() => setOpen(false)}>
      <span ref={dotRef} className={`inline-compat-dot status-${status}`}>
        {STATUS_ICON[status]}
      </span>
      {open && checks.length > 0 && createPortal(
        <div
          className="compat-tooltip"
          style={{ position: 'fixed', top: pos.top, left: pos.left, transform: 'translateY(-50%)', zIndex: 9999 }}
        >
          {checks.map(c => (
            <div key={c.id} className={`tooltip-row status-${c.status}`}>
              <span className="tooltip-icon">{STATUS_ICON[c.status]}</span>
              <span>{c.detail}</span>
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

// Maps build part key → inventory partType label
const KEY_TO_INV_TYPE = {
  cpu: 'CPU', gpu: 'GPU', motherboard: 'Motherboard', ram: 'RAM',
  storage: 'Storage', psu: 'PSU', cooler: 'CPU Cooler', case: 'Case',
}

export default function BuildBuilder({ build, setBuild, askingPrice, setAskingPrice, setFlips, navigateTo, inventory, setInventory }) {
  const [copied,      setCopied]      = useState(false)
  const [logged,      setLogged]      = useState(false)
  const [invDropdown, setInvDropdown] = useState(null) // key of open inventory dropdown

  // Close dropdown on outside click
  useEffect(() => {
    if (!invDropdown) return
    const handler = () => setInvDropdown(null)
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [invDropdown])

  const getInvOptions = (partKey) => {
    const invType = KEY_TO_INV_TYPE[partKey]
    if (!invType || !inventory) return []
    return inventory.filter(i => i.partType === invType && i.status === 'In Stock')
  }

  const selectFromInventory = (partKey, item, e) => {
    e.stopPropagation()
    updatePart(partKey, 'name', item.partName)
    setInventory(prev => prev.map(i =>
      i.id === item.id ? { ...i, status: 'In Build', linkedBuildId: 'current' } : i
    ))
    setInvDropdown(null)
  }

  const updatePart = (key, field, value) => {
    setBuild(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  const totalPaid = COMPONENTS.reduce((sum, c) => {
    const val = parseFloat(build[c.key]?.paid)
    return sum + (isNaN(val) ? 0 : val)
  }, 0)

  const askingNum  = parseFloat(askingPrice)
  const profit     = isNaN(askingNum) ? null : askingNum - totalPaid
  const profitPct  = profit !== null && totalPaid > 0 ? (profit / totalPaid) * 100 : null

  const clearBuild = () => {
    if (confirm('Clear all build data?')) {
      setBuild(DEFAULT_BUILD)
      setAskingPrice('')
    }
  }

  const logAsFlip = () => {
    const gpu = build.gpu?.name?.trim() || ''
    const cpu = build.cpu?.name?.trim() || ''
    const titleParts = [gpu, cpu].filter(Boolean)
    const title = titleParts.length > 0 ? titleParts.join(' + ') + ' Build' : 'Custom PC Build'
    const flip = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      title,
      cpu,         cpuPaid:         build.cpu?.paid         || '',
      gpu,         gpuPaid:         build.gpu?.paid         || '',
      motherboard: build.motherboard?.name?.trim() || '', motherboardPaid: build.motherboard?.paid || '',
      ram:         build.ram?.name?.trim()         || '', ramPaid:         build.ram?.paid         || '',
      storage:     build.storage?.name?.trim()     || '', storagePaid:     build.storage?.paid     || '',
      psu:         build.psu?.name?.trim()         || '', psuPaid:         build.psu?.paid         || '',
      cooler:      build.cooler?.name?.trim()      || '', coolerPaid:      build.cooler?.paid      || '',
      case:        build.case?.name?.trim()        || '', casePaid:        build.case?.paid        || '',
      os:          build.os?.name?.trim()          || '', osPaid:          build.os?.paid          || '',
      paid: totalPaid.toFixed(2),
      sold: askingPrice,
      notes: '',
    }
    setFlips(prev => [...prev, flip])
    setLogged(true)
    setTimeout(() => {
      setLogged(false)
      navigateTo('tracker')
    }, 1200)
  }

  const shareCustomerPage = () => {
    const data = btoa(JSON.stringify({ build, askingPrice }))
    const url = `${window.location.origin}${window.location.pathname}#customer?d=${data}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Run all compat checks once for the current build
  const allChecks = runCompatibilityChecks(build)
  const errorCount = allChecks.filter(c => c.status === 'error').length
  const warnCount  = allChecks.filter(c => c.status === 'warn').length
  const okCount    = allChecks.filter(c => c.status === 'ok').length

  return (
    <div className="builder-container">
      <div className="builder-header">
        <div>
          <h2 className="section-title">Build Builder</h2>
          <p className="section-sub">Enter component names and costs. Compatibility is checked live as you type.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={clearBuild}>Clear</button>
          <button className="btn btn-primary" onClick={shareCustomerPage}>
            {copied ? '✓ Copied!' : '🔗 Share Customer Page'}
          </button>
        </div>
      </div>

      <div className="parts-table">
        <div className="parts-header-row">
          <div>Component</div>
          <div>Part Name</div>
          <div>What I Paid</div>
          <div>Links</div>
          <div>Compat</div>
        </div>

        {COMPONENTS.map(({ key, label, icon, placeholder }) => {
          const part = build[key] ?? { name: '', paid: '' }
          return (
            <div className="parts-row" key={key}>
              <div className="part-label">
                <span className="part-icon">{icon}</span>
                <span>{label}</span>
              </div>

              <div className="part-name-cell">
                <AutocompleteInput
                  partKey={key}
                  value={part.name}
                  onChange={val => updatePart(key, 'name', val)}
                  placeholder={placeholder}
                  className="input-mono"
                />
                {getInvOptions(key).length > 0 && (
                  <div className="inv-from-wrap" onMouseDown={e => e.stopPropagation()}>
                    <button
                      className="inv-from-btn"
                      onClick={e => { e.stopPropagation(); setInvDropdown(invDropdown === key ? null : key) }}
                    >
                      📦 From Inventory ({getInvOptions(key).length})
                    </button>
                    {invDropdown === key && (
                      <div className="inv-from-dropdown">
                        {getInvOptions(key).map(item => (
                          <button key={item.id} className="inv-from-option" onMouseDown={e => selectFromInventory(key, item, e)}>
                            <span className="inv-opt-name">{item.partName}</span>
                            <span className="inv-opt-meta">{item.condition} · ${parseFloat(item.pricePaid || 0).toFixed(2)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="part-paid-cell">
                <div className="input-prefix-wrap">
                  <span className="input-prefix">$</span>
                  <input
                    className="input-mono input-short"
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                    value={part.paid}
                    onChange={e => updatePart(key, 'paid', e.target.value)}
                  />
                </div>
              </div>

              <div className="part-links-cell">
                {part.name.trim() ? (
                  <>
                    <a href={pcppCategoryUrl(key, part.name)} target="_blank" rel="noopener noreferrer" className="link-badge pcpp">PCPP</a>
                    <a href={amazonUrl(part.name)} target="_blank" rel="noopener noreferrer" className="link-badge amzn">AMZ</a>
                  </>
                ) : (
                  <span className="link-placeholder">—</span>
                )}
              </div>

              <div className="part-compat-cell">
                <CompatBadge partKey={key} allChecks={allChecks} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Inline Compat Summary */}
      {allChecks.length > 0 && (
        <div className="compat-inline-summary">
          <div className="compat-summary-left">
            <span className="compat-summary-title">Compatibility</span>
            <div className="compat-summary-badges">
              {okCount > 0    && <span className="summary-badge ok">{okCount} OK</span>}
              {warnCount > 0  && <span className="summary-badge warn">{warnCount} Warning{warnCount > 1 ? 's' : ''}</span>}
              {errorCount > 0 && <span className="summary-badge error">{errorCount} Conflict{errorCount > 1 ? 's' : ''}</span>}
            </div>
          </div>
          <div className="compat-check-list">
            {allChecks.map(c => (
              <div key={c.id} className={`compat-inline-row status-${c.status}`}>
                <span className={`compat-inline-icon status-${c.status}`}>{STATUS_ICON[c.status]}</span>
                <div className="compat-inline-body">
                  <span className="compat-inline-label">{c.label}</span>
                  <span className="compat-inline-detail">{c.detail}</span>
                </div>
                <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="compat-inline-source">
                  ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profit Calculator */}
      <div className="profit-panel">
        <h3 className="panel-title">Profit Calculator</h3>
        <div className="profit-grid">
          <div className="profit-stat">
            <span className="stat-label">Total Invested</span>
            <span className="stat-value cost">${totalPaid.toFixed(2)}</span>
          </div>
          <div className="profit-stat asking">
            <span className="stat-label">Asking Price</span>
            <div className="input-prefix-wrap">
              <span className="input-prefix asking-prefix">$</span>
              <input
                className="input-mono input-asking"
                placeholder="0.00"
                type="number"
                min="0"
                step="1"
                value={askingPrice}
                onChange={e => setAskingPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="profit-stat">
            <span className="stat-label">Profit</span>
            <span className={`stat-value ${profit === null ? '' : profit >= 0 ? 'green' : 'red'}`}>
              {profit === null ? '—' : `${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`}
            </span>
          </div>
          <div className="profit-stat">
            <span className="stat-label">Margin</span>
            <span className={`stat-value ${profitPct === null ? '' : profitPct >= 20 ? 'green' : profitPct >= 0 ? 'yellow' : 'red'}`}>
              {profitPct === null ? '—' : `${profitPct.toFixed(1)}%`}
            </span>
          </div>
        </div>
        {profit !== null && askingNum > 0 && (
          <div className="buyer-savings-bar">
            <span className="savings-label">Ready to share:</span>
            <span className="savings-note">Click "Share Customer Page" to copy a buyer-facing link with specs, benchmarks, and pricing.</span>
            <button
              className={`btn ${logged ? 'btn-success' : 'btn-primary'} log-flip-btn`}
              onClick={logAsFlip}
              disabled={logged}
            >
              {logged ? '✓ Logged!' : '📋 Log as Flip'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
