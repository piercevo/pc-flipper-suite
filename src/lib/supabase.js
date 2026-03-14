import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidUrl = (s) => {
  try { return s && new URL(s).hostname.endsWith('supabase.co') } catch { return false }
}

// Only initialize if both vars are present and the URL looks correct.
// If misconfigured the app runs in localStorage-only mode — no crash.
export const supabaseReady = isValidUrl(url) && !!(key)

export const supabase = supabaseReady ? createClient(url, key) : null
