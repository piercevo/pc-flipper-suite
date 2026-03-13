import { runCompatibilityChecks } from '../utils/compatibility'

const STATUS_CONFIG = {
  ok:   { icon: '✓', label: 'Compatible',    className: 'status-ok' },
  warn: { icon: '⚠', label: 'Verify',        className: 'status-warn' },
  error:{ icon: '✗', label: 'Incompatible',  className: 'status-error' },
}

export default function CompatibilityChecker({ build }) {
  const checks = runCompatibilityChecks(build)

  const hasAnyParts = Object.values(build).some(p => p?.name?.trim())

  if (!hasAnyParts) {
    return (
      <div className="compat-empty">
        <div className="empty-icon">🔍</div>
        <h3>No parts entered yet</h3>
        <p>Fill in component names in the Build Builder and compatibility checks will appear here automatically.</p>
      </div>
    )
  }

  if (checks.length === 0) {
    return (
      <div className="compat-empty">
        <div className="empty-icon">💡</div>
        <h3>Not enough parts to check</h3>
        <p>Enter at least two related components (e.g., CPU + Motherboard, RAM + Motherboard) to run compatibility checks.</p>
      </div>
    )
  }

  const errorCount = checks.filter(c => c.status === 'error').length
  const warnCount  = checks.filter(c => c.status === 'warn').length
  const okCount    = checks.filter(c => c.status === 'ok').length

  return (
    <div className="compat-container">
      <div className="compat-header">
        <div>
          <h2 className="section-title">Compatibility Checker</h2>
          <p className="section-sub">Auto-detected from component names. Include socket types and wattage in names for best results.</p>
        </div>
        <div className="compat-summary">
          {okCount > 0    && <span className="summary-badge ok">   {okCount} OK</span>}
          {warnCount > 0  && <span className="summary-badge warn"> {warnCount} Warn</span>}
          {errorCount > 0 && <span className="summary-badge error">{errorCount} Error{errorCount > 1 ? 's' : ''}</span>}
        </div>
      </div>

      <div className="compat-list">
        {checks.map(check => {
          const cfg = STATUS_CONFIG[check.status]
          return (
            <div key={check.id} className={`compat-card ${cfg.className}`}>
              <div className="compat-card-left">
                <div className={`compat-icon ${cfg.className}`}>{cfg.icon}</div>
              </div>
              <div className="compat-card-body">
                <div className="compat-card-title">
                  <span className="compat-check-name">{check.label}</span>
                  <span className={`compat-badge ${cfg.className}`}>{cfg.label}</span>
                </div>
                <p className="compat-detail">{check.detail}</p>
                <a
                  href={check.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="compat-source-link"
                >
                  ↗ {check.sourceLabel}
                </a>
              </div>
            </div>
          )
        })}
      </div>

      <div className="compat-tip">
        <span className="tip-icon">💡</span>
        <span>
          Tip: Include socket type in motherboard and CPU names (e.g., "AM5", "LGA1700"), wattage in PSU (e.g., "750W"),
          form factor in case and motherboard (e.g., "ATX", "mATX"), and RAM type (e.g., "DDR5") for automatic detection.
        </span>
      </div>
    </div>
  )
}
