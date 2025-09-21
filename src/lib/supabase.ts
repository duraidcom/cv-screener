import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Load environment variables if not already loaded (for scripts)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    require('dotenv').config({ path: '.env.local' })
  } catch (e) {
    // dotenv might not be available in all environments
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser/frontend
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export default supabase