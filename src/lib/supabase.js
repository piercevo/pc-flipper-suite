import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// If env vars aren't set yet, run in offline (localStorage-only) mode.
// The app will work normally — just no cross-device sync or auth.
export const supabaseReady = !!(url && key)

export const supabase = supabaseReady
  ? createClient(url, key)
  : null
