// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!supabaseConfigured) {
  console.warn(
    '[CitiFix Admin] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'Auth and data calls will fail until .env is set up.'
  )
}

// Fall back to harmless placeholders so createClient() never throws and
// crashes the whole render tree — real calls will just fail cleanly later
// with a normal Supabase error instead of a blank white screen.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)