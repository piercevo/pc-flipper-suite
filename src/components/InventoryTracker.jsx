import { useState, useMemo } from 'react'
import AutocompleteInput from './AutocompleteInput'

const PART_TYPES  = ['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Case', 'CPU Cooler', 'Other']
const CONDITIONS  = ['New', 'Like New', 'Good', 'Fair']
const STATUSES    = ['In Stock', 'In Build', 'Sold']

// Maps inventory partType → BuildBuilder part key (for autocomplete)
const TYPE_TO_KEY = {
  'CPU':        'cpu',
  'GPU':        'gpu',
  'RAM':        'ram',
  'Storage':    'storage',
  'Motherboard':'motherboard',
  'PSU':        'psu',
  'Case':       'case',
  'CPU Cooler': 'cooler',
  'Other':      'cpu', // fallback — autocomplete still works
}

const STATUS_COLOR = { 'In Stock': 'green', 'In Build': 'blue', 'Sold': 'muted' }

const EMPTY_FORM = {
  partName:      '',
  partType:      'GPU',
  condition:     'Good',
  source:        '',
  datePurchased: new Date().toISOString().split('T')[0],
  pricePaid:     '',
  notes:         '',
}

function daysSince(dateStr) {
  const now  = new Date()
  const then = new Date(dateStr)
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)))
}

const SORTABLE_COLS = [
  { key: 'datePurchased', label: 'Date'  },
  { key: 'pricePaid',     label: 'Paid'  },
  { key: 'daysInStock',   label: 'Days'  },
]

export default function InventoryTracker({ inventory, setInventory, navigateTo, setBuild }) {
  const [form,          setForm]          = useState(EMPTY_FORM)
  const [editId,        setEditId]        = useState(null)
  const [editForm,      setEditForm]      = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // id of item pending delete
  const [filterType,    setFilterType]    = useState('')
  const [filterStatus,  setFilterStatus]  = useState('')
  const [filterSearch,  setFilterSearch]  = useState('')
  const [sortKey,       setSortKey]       = useState('datePurchased')
  const [sortDir,       setSortDir]       = useState('desc')

  const updateForm     = (f, v) => setForm(prev     => ({ ...prev,     [f]: v }))
  const updateEditForm = (f, v) => setEditForm(prev => ({ ...prev, [f]: v }))

  // ── Stats ──────────────────────────────────────────────────────────────
  const inStock      = inventory.filter(i => i.status === 'In Stock')
  const inBuild      = inventory.filter(i => i.status === 'In Build')
  const capitalTiedUp = inStock.reduce((s, i) => s + (parseFloat(i.pricePaid) || 0), 0)
  const flaggedCount = inStock.filter(i => daysSince(i.datePurchased) > 30).length

  // ── CRUD ───────────────────────────────────────────────────────────────
  const addPart = () => {
    if (!form.partName.trim() || !form.pricePaid) return
    setInventory(prev => [...prev, { ...form, id: Date.now(), status: 'In Stock', linkedBuildId: '' }])
    setForm(EMPTY_FORM)
  }

  const startEdit = (item) => { setEditForm({ ...item }); setEditId(item.id) }
  const cancelEdit = () => { setEditForm(null); setEditId(null) }
  const saveEdit = () => {
    setInventory(prev => prev.map(i => i.id === editId ? { ...editForm, id: editId } : i))
    setEditForm(null)
    setEditId(null)
  }

  const confirmDelete = (id) => setDeleteConfirm(id)
  const doDelete = () => {
    setInventory(prev => prev.filter(i => i.id !== deleteConfirm))
    setDeleteConfirm(null)
  }

  // ── Use in Build ───────────────────────────────────────────────────────
  const useInBuild = (item) => {
    const partKey = TYPE_TO_KEY[item.partType]
    if (partKey && item.partType !== 'Other') {
      setBuild(prev => ({ ...prev, [partKey]: { ...prev[partKey], name: item.partName } }))
    }
    setInventory(prev => prev.map(i =>
      i.id === item.id ? { ...i, status: 'In Build', linkedBuildId: 'current' } : i
    ))
    navigateTo('builder')
  }

  // ── Sort / Filter ──────────────────────────────────────────────────────
  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const processed = useMemo(() => {
    const filtered = inventory.filter(item => {
      if (filterType   && item.partType !== filterType) return false
      if (filterStatus && item.status   !== filterStatus) return false
      if (filterSearch && !item.partName.toLowerCase().includes(filterSearch.toLowerCase())) return false
      return true
    })
    return [...filtered].sort((a, b) => {
      let av = sortKey === 'daysInStock' ? daysSince(a.datePurchased)
             : sortKey === 'pricePaid'   ? parseFloat(a.pricePaid)
             : a[sortKey]
      let bv = sortKey === 'daysInStock' ? daysSince(b.datePurchased)
             : sortKey === 'pricePaid'   ? parseFloat(b.pricePaid)
             : b[sortKey]
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ?  1 : -1
      return 0
    })
  }, [inventory, filterType, filterStatus, filterSearch, sortKey, sortDir])

  const hasFilters = filterType || filterStatus || filterSearch

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="inventory-container">

      {/* Header */}
      <div className="builder-header">
        <div>
          <h2 className="section-title">Inventory</h2>
          <p className="section-sub">Track individual parts not yet in a completed build.</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="inv-stats-bar">
        <div className="inv-stat-card">
          <span className="inv-stat-label">In Stock</span>
          <span className="inv-stat-value">{inStock.length}</span>
        </div>
        <div className="inv-stat-card">
          <span className="inv-stat-label">Capital Tied Up</span>
          <span className="inv-stat-value cost">${capitalTiedUp.toFixed(2)}</span>
        </div>
        <div className="inv-stat-card">
          <span className="inv-stat-label">In Active Builds</span>
          <span className="inv-stat-value">{inBuild.length}</span>
        </div>
        <div className="inv-stat-card">
          <span className="inv-stat-label">Flagged (30+ days)</span>
          <span className={`inv-stat-value ${flaggedCount > 0 ? 'inv-flagged-text' : ''}`}>
            {flaggedCount > 0 ? `⚑ ${flaggedCount}` : flaggedCount}
          </span>
        </div>
      </div>

      {/* Add Part Form */}
      <div className="inv-add-form">
        <h3 className="inv-form-title">Add Part to Inventory</h3>
        <div className="inv-form-grid">
          <div className="inv-field">
            <label>Part Name</label>
            <AutocompleteInput
              partKey={TYPE_TO_KEY[form.partType]}
              value={form.partName}
              onChange={val => updateForm('partName', val)}
              placeholder="Search or type part name…"
              className="input-mono"
            />
          </div>
          <div className="inv-field">
            <label>Part Type</label>
            <select className="input-mono inv-select" value={form.partType} onChange={e => updateForm('partType', e.target.value)}>
              {PART_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="inv-field">
            <label>Condition</label>
            <select className="input-mono inv-select" value={form.condition} onChange={e => updateForm('condition', e.target.value)}>
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="inv-field">
            <label>Source</label>
            <input className="input-mono" placeholder="e.g. Facebook Marketplace" value={form.source} onChange={e => updateForm('source', e.target.value)} />
          </div>
          <div className="inv-field">
            <label>Date Purchased</label>
            <input className="input-mono" type="date" value={form.datePurchased} onChange={e => updateForm('datePurchased', e.target.value)} />
          </div>
          <div className="inv-field">
            <label>Price Paid</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">$</span>
              <input className="input-mono input-short" type="number" min="0" step="0.01" placeholder="0.00"
                value={form.pricePaid} onChange={e => updateForm('pricePaid', e.target.value)} />
            </div>
          </div>
          <div className="inv-field inv-notes-field">
            <label>Notes <span className="inv-optional">(optional)</span></label>
            <input className="input-mono" placeholder="Condition details, serial number, etc."
              value={form.notes} onChange={e => updateForm('notes', e.target.value)} />
          </div>
          <div className="inv-field inv-submit-field">
            <button className="btn btn-primary inv-add-btn"
              onClick={addPart} disabled={!form.partName.trim() || !form.pricePaid}>
              + Add to Inventory
            </button>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {editId && editForm && (
        <div className="inv-edit-card">
          <div className="inv-edit-header">
            <h3 className="inv-form-title" style={{ margin: 0 }}>Edit Part</h3>
            <button className="modal-close" onClick={cancelEdit}>✕</button>
          </div>
          <div className="inv-form-grid">
            <div className="inv-field">
              <label>Part Name</label>
              <input className="input-mono" value={editForm.partName}
                onChange={e => updateEditForm('partName', e.target.value)} />
            </div>
            <div className="inv-field">
              <label>Part Type</label>
              <select className="input-mono inv-select" value={editForm.partType}
                onChange={e => updateEditForm('partType', e.target.value)}>
                {PART_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="inv-field">
              <label>Condition</label>
              <select className="input-mono inv-select" value={editForm.condition}
                onChange={e => updateEditForm('condition', e.target.value)}>
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="inv-field">
              <label>Source</label>
              <input className="input-mono" value={editForm.source}
                onChange={e => updateEditForm('source', e.target.value)} />
            </div>
            <div className="inv-field">
              <label>Date Purchased</label>
              <input className="input-mono" type="date" value={editForm.datePurchased}
                onChange={e => updateEditForm('datePurchased', e.target.value)} />
            </div>
            <div className="inv-field">
              <label>Price Paid</label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">$</span>
                <input className="input-mono input-short" type="number" min="0" step="0.01"
                  value={editForm.pricePaid} onChange={e => updateEditForm('pricePaid', e.target.value)} />
              </div>
            </div>
            <div className="inv-field">
              <label>Status</label>
              <select className="input-mono inv-select" value={editForm.status}
                onChange={e => updateEditForm('status', e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="inv-field inv-notes-field">
              <label>Notes</label>
              <input className="input-mono" value={editForm.notes}
                onChange={e => updateEditForm('notes', e.target.value)} />
            </div>
          </div>
          <div className="inv-edit-actions">
            <button className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
            <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      {inventory.length > 0 && (
        <div className="inv-filter-bar">
          <input className="input-mono inv-search" placeholder="Search parts…"
            value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
          <select className="input-mono inv-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {PART_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="input-mono inv-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          {hasFilters && (
            <button className="btn btn-ghost" onClick={() => { setFilterType(''); setFilterStatus(''); setFilterSearch('') }}>
              Clear
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {inventory.length === 0 ? (
        <div className="tracker-empty">
          <div className="empty-icon">📦</div>
          <h3>No parts in inventory</h3>
          <p>Add individual parts above to start tracking your stock.</p>
        </div>
      ) : processed.length === 0 ? (
        <div className="tracker-empty">
          <div className="empty-icon">🔍</div>
          <h3>No matches</h3>
          <p>Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="flip-table-wrap">
          <table className="flip-table inv-table">
            <thead>
              <tr>
                <th>Part Name</th>
                <th>Type</th>
                <th>Condition</th>
                <th>Source</th>
                {SORTABLE_COLS.map(col => (
                  <th key={col.key} className="sortable-th" onClick={() => handleSort(col.key)}>
                    {col.label}
                    {sortKey === col.key && <span className="sort-arrow">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>}
                  </th>
                ))}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {processed.map(item => {
                const days    = daysSince(item.datePurchased)
                const isFlagged = item.status === 'In Stock' && days > 30
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="flip-title-cell">{item.partName}</div>
                      {item.notes && <div className="flip-notes">{item.notes}</div>}
                    </td>
                    <td className="mono">{item.partType}</td>
                    <td className="mono">{item.condition}</td>
                    <td className="mono">{item.source || '—'}</td>
                    <td className="mono">{item.datePurchased}</td>
                    <td className="mono cost">${parseFloat(item.pricePaid || 0).toFixed(2)}</td>
                    <td className={`mono ${isFlagged ? 'inv-days-flagged' : ''}`}>
                      {days}d{isFlagged && ' ⚑'}
                    </td>
                    <td>
                      <span className={`inv-status-badge inv-status-${STATUS_COLOR[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        {item.status === 'In Stock' && (
                          <button className="action-btn inv-use-btn" onClick={() => useInBuild(item)}>
                            Use
                          </button>
                        )}
                        <button className="action-btn edit" onClick={() => startEdit(item)}>Edit</button>
                        <button className="action-btn delete" onClick={() => confirmDelete(item.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Remove Part?</h3>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <p className="inv-delete-msg">
              This will permanently remove the part from your inventory and cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn inv-btn-danger" onClick={doDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
