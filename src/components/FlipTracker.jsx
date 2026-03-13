import { useState } from 'react'

const FLIP_COMPONENTS = [
  { key: 'cpu',         label: 'CPU',         icon: '⚙️' },
  { key: 'gpu',         label: 'GPU',         icon: '🎮' },
  { key: 'motherboard', label: 'Motherboard', icon: '🔲' },
  { key: 'ram',         label: 'RAM',         icon: '💾' },
  { key: 'storage',     label: 'Storage',     icon: '💽' },
  { key: 'psu',         label: 'PSU',         icon: '⚡' },
  { key: 'cooler',      label: 'CPU Cooler',  icon: '❄️' },
  { key: 'case',        label: 'Case',        icon: '🖥️' },
  { key: 'os',          label: 'OS',          icon: '🪟' },
]

const EMPTY_FORM = {
  date: new Date().toISOString().split('T')[0],
  title: '',
  cpu: '', cpuPaid: '',
  gpu: '', gpuPaid: '',
  motherboard: '', motherboardPaid: '',
  ram: '', ramPaid: '',
  storage: '', storagePaid: '',
  psu: '', psuPaid: '',
  cooler: '', coolerPaid: '',
  case: '', casePaid: '',
  os: '', osPaid: '',
  notes: '',
  paid: '',
  sold: '',
}

function computeComponentTotal(form) {
  return FLIP_COMPONENTS.reduce((sum, c) => {
    const val = parseFloat(form[`${c.key}Paid`])
    return sum + (isNaN(val) ? 0 : val)
  }, 0)
}

export default function FlipTracker({ flips, setFlips }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [editId, setEditId] = useState(null)

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const saveFlip = () => {
    if (!form.title || !form.sold) return
    const componentTotal = computeComponentTotal(form)
    const finalPaid = componentTotal > 0 ? componentTotal.toFixed(2) : form.paid
    if (!finalPaid) return
    const flipData = { ...form, paid: finalPaid }
    if (editId !== null) {
      setFlips(prev => prev.map(f => f.id === editId ? { ...flipData, id: editId } : f))
      setEditId(null)
    } else {
      setFlips(prev => [...prev, { ...flipData, id: Date.now() }])
    }
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  const deleteFlip = (id) => {
    if (confirm('Delete this flip entry?')) {
      setFlips(prev => prev.filter(f => f.id !== id))
    }
  }

  const editFlip = (flip) => {
    setForm({ ...flip })
    setEditId(flip.id)
    setShowForm(true)
  }

  const cancelForm = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowForm(false)
  }

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sortedFlips = [...flips].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey]
    if (sortKey === 'paid' || sortKey === 'sold' || sortKey === 'profit') {
      av = sortKey === 'profit' ? parseFloat(a.sold) - parseFloat(a.paid) : parseFloat(av)
      bv = sortKey === 'profit' ? parseFloat(b.sold) - parseFloat(b.paid) : parseFloat(bv)
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  // Summary stats
  const totalProfit = flips.reduce((s, f) => s + (parseFloat(f.sold) - parseFloat(f.paid)), 0)
  const totalRevenue = flips.reduce((s, f) => s + parseFloat(f.sold || 0), 0)
  const totalInvested = flips.reduce((s, f) => s + parseFloat(f.paid || 0), 0)
  const bestFlip = flips.reduce((best, f) => {
    const p = parseFloat(f.sold) - parseFloat(f.paid)
    return (!best || p > best.profit) ? { ...f, profit: p } : best
  }, null)

  // GPU/CPU performance grouping
  const gpuStats = {}
  const cpuStats = {}
  flips.forEach(f => {
    const profit = parseFloat(f.sold) - parseFloat(f.paid)
    if (f.gpu) {
      gpuStats[f.gpu] = gpuStats[f.gpu] ?? { count: 0, profit: 0 }
      gpuStats[f.gpu].count++
      gpuStats[f.gpu].profit += profit
    }
    if (f.cpu) {
      cpuStats[f.cpu] = cpuStats[f.cpu] ?? { count: 0, profit: 0 }
      cpuStats[f.cpu].count++
      cpuStats[f.cpu].profit += profit
    }
  })

  const topGPUs = Object.entries(gpuStats).sort((a, b) => b[1].profit - a[1].profit).slice(0, 3)
  const topCPUs = Object.entries(cpuStats).sort((a, b) => b[1].profit - a[1].profit).slice(0, 3)

  return (
    <div className="tracker-container">
      <div className="tracker-header">
        <div>
          <h2 className="section-title">Flip Tracker</h2>
          <p className="section-sub">Log completed flips and track your profitability over time.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM) }}>
          + Log Flip
        </button>
      </div>

      {/* Stats Dashboard */}
      {flips.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-card-label">Total Flips</span>
            <span className="stat-card-value">{flips.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Total Invested</span>
            <span className="stat-card-value cost">${totalInvested.toFixed(2)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Total Revenue</span>
            <span className="stat-card-value">${totalRevenue.toFixed(2)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Total Profit</span>
            <span className={`stat-card-value ${totalProfit >= 0 ? 'green' : 'red'}`}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Avg Margin</span>
            <span className={`stat-card-value ${totalInvested > 0 && totalProfit / totalInvested * 100 >= 15 ? 'green' : 'yellow'}`}>
              {totalInvested > 0 ? (totalProfit / totalInvested * 100).toFixed(1) + '%' : '—'}
            </span>
          </div>
          {bestFlip && (
            <div className="stat-card">
              <span className="stat-card-label">Best Flip</span>
              <span className="stat-card-value green">+${bestFlip.profit.toFixed(2)}</span>
              <span className="stat-card-sub">{bestFlip.title}</span>
            </div>
          )}
        </div>
      )}

      {/* Top Performers */}
      {(topGPUs.length > 0 || topCPUs.length > 0) && (
        <div className="performers-grid">
          {topGPUs.length > 0 && (
            <div className="performers-card">
              <h4 className="performers-title">🎮 Best GPU Combos</h4>
              {topGPUs.map(([gpu, stats]) => (
                <div key={gpu} className="performer-row">
                  <span className="performer-name">{gpu}</span>
                  <span className="performer-meta">{stats.count} flip{stats.count !== 1 ? 's' : ''}</span>
                  <span className={`performer-profit ${stats.profit >= 0 ? 'green' : 'red'}`}>
                    {stats.profit >= 0 ? '+' : ''}${stats.profit.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          )}
          {topCPUs.length > 0 && (
            <div className="performers-card">
              <h4 className="performers-title">⚙️ Best CPU Combos</h4>
              {topCPUs.map(([cpu, stats]) => (
                <div key={cpu} className="performer-row">
                  <span className="performer-name">{cpu}</span>
                  <span className="performer-meta">{stats.count} flip{stats.count !== 1 ? 's' : ''}</span>
                  <span className={`performer-profit ${stats.profit >= 0 ? 'green' : 'red'}`}>
                    {stats.profit >= 0 ? '+' : ''}${stats.profit.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="flip-form-card">
          <h3 className="form-title">{editId ? 'Edit Flip' : 'Log New Flip'}</h3>

          <div className="flip-form-grid">
            <div className="form-field full-width">
              <label>Build Title</label>
              <input className="input-mono" placeholder="e.g. AMD AM4 Gaming Build" value={form.title} onChange={e => updateForm('title', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Date Sold</label>
              <input className="input-mono" type="date" value={form.date} onChange={e => updateForm('date', e.target.value)} />
            </div>
          </div>

          {/* Component Breakdown */}
          <div className="flip-components-section">
            <div className="flip-components-header">
              <span>Component</span>
              <span>Part Name</span>
              <span>What I Paid</span>
            </div>
            {FLIP_COMPONENTS.map(({ key, label, icon }) => (
              <div className="flip-component-row" key={key}>
                <div className="flip-comp-label">
                  <span className="part-icon">{icon}</span>
                  <span>{label}</span>
                </div>
                <input
                  className="input-mono"
                  placeholder="—"
                  value={form[key] || ''}
                  onChange={e => updateForm(key, e.target.value)}
                />
                <div className="input-prefix-wrap">
                  <span className="input-prefix">$</span>
                  <input
                    className="input-mono input-short"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form[`${key}Paid`] || ''}
                    onChange={e => updateForm(`${key}Paid`, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flip-form-grid" style={{ marginTop: '12px' }}>
            <div className="form-field">
              <label>Total Invested</label>
              {(() => {
                const componentTotal = computeComponentTotal(form)
                return componentTotal > 0 ? (
                  <div className="input-prefix-wrap">
                    <span className="input-prefix">$</span>
                    <input className="input-mono input-short" value={componentTotal.toFixed(2)} readOnly style={{ opacity: 0.6 }} />
                  </div>
                ) : (
                  <div className="input-prefix-wrap">
                    <span className="input-prefix">$</span>
                    <input className="input-mono input-short" type="number" placeholder="0.00" value={form.paid} onChange={e => updateForm('paid', e.target.value)} />
                  </div>
                )
              })()}
            </div>
            <div className="form-field">
              <label>Sold For</label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">$</span>
                <input className="input-mono input-short" type="number" placeholder="0.00" value={form.sold} onChange={e => updateForm('sold', e.target.value)} />
              </div>
            </div>
            <div className="form-field full-width">
              <label>Notes</label>
              <input className="input-mono" placeholder="Platform sold on, condition, anything notable…" value={form.notes} onChange={e => updateForm('notes', e.target.value)} />
            </div>
          </div>

          {form.sold && (parseFloat(form.paid) > 0 || computeComponentTotal(form) > 0) && (
            <div className="form-profit-preview">
              {(() => {
                const componentTotal = computeComponentTotal(form)
                const totalPaid = componentTotal > 0 ? componentTotal : parseFloat(form.paid)
                const p = parseFloat(form.sold) - totalPaid
                const pct = totalPaid > 0 ? (p / totalPaid) * 100 : 0
                return (
                  <span className={p >= 0 ? 'green' : 'red'}>
                    Profit: {p >= 0 ? '+' : ''}${p.toFixed(2)} ({pct.toFixed(1)}% margin)
                  </span>
                )
              })()}
            </div>
          )}

          <div className="form-actions">
            <button className="btn btn-ghost" onClick={cancelForm}>Cancel</button>
            <button className="btn btn-primary" onClick={saveFlip} disabled={!form.title || !form.sold}>
              {editId ? 'Save Changes' : 'Log Flip'}
            </button>
          </div>
        </div>
      )}

      {/* Flip Table */}
      {sortedFlips.length === 0 ? (
        <div className="tracker-empty">
          <div className="empty-icon">📋</div>
          <h3>No flips logged yet</h3>
          <p>Click "Log Flip" to record your first completed build sale.</p>
        </div>
      ) : (
        <div className="flip-table-wrap">
          <table className="flip-table">
            <thead>
              <tr>
                {[
                  { key: 'date',   label: 'Date' },
                  { key: 'title',  label: 'Build' },
                  { key: 'gpu',    label: 'GPU' },
                  { key: 'cpu',    label: 'CPU' },
                  { key: 'paid',   label: 'Paid' },
                  { key: 'sold',   label: 'Sold' },
                  { key: 'profit', label: 'Profit' },
                ].map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="sortable-th">
                    {col.label}
                    {sortKey === col.key && <span className="sort-arrow">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>}
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedFlips.map(flip => {
                const profit = parseFloat(flip.sold) - parseFloat(flip.paid)
                const pct = parseFloat(flip.paid) > 0 ? (profit / parseFloat(flip.paid)) * 100 : 0
                return (
                  <tr key={flip.id}>
                    <td className="mono">{flip.date}</td>
                    <td>
                      <div className="flip-title-cell">{flip.title}</div>
                      {flip.notes && <div className="flip-notes">{flip.notes}</div>}
                    </td>
                    <td className="mono">{flip.gpu || '—'}</td>
                    <td className="mono">{flip.cpu || '—'}</td>
                    <td className="mono cost">${parseFloat(flip.paid).toFixed(2)}</td>
                    <td className="mono">${parseFloat(flip.sold).toFixed(2)}</td>
                    <td className={`mono ${profit >= 0 ? 'green' : 'red'}`}>
                      {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                      <div className="flip-pct">{pct.toFixed(1)}%</div>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="action-btn edit" onClick={() => editFlip(flip)}>Edit</button>
                        <button className="action-btn delete" onClick={() => deleteFlip(flip.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
