import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthGate() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const sendLink = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="auth-gate">
      <div className="auth-box">
        <div className="auth-logo">
          <span className="logo-icon" style={{ fontSize: 28 }}>⚡</span>
          <div className="logo-text">
            <span className="logo-main">PC Flipper</span>
            <span className="logo-sub">Suite</span>
          </div>
        </div>

        {sent ? (
          <div className="auth-sent">
            <div className="auth-sent-icon">📬</div>
            <h2 className="auth-title">Check your email</h2>
            <p className="auth-sub">
              We sent a sign-in link to <strong style={{ color: 'var(--text)' }}>{email}</strong>.
              Click it to sign in — no password needed.
            </p>
            <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => setSent(false)}>
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <h2 className="auth-title">Sign in to continue</h2>
            <p className="auth-sub">
              Your builds, flips, and inventory sync across all your devices.
              No password required.
            </p>
            <div className="auth-form">
              <input
                className="input-mono auth-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendLink()}
                autoFocus
              />
              <button
                className="btn btn-primary auth-btn"
                onClick={sendLink}
                disabled={loading || !email.trim()}
              >
                {loading ? 'Sending…' : 'Send Magic Link'}
              </button>
            </div>
            {error && <p className="auth-error">{error}</p>}
          </>
        )}
      </div>
    </div>
  )
}
