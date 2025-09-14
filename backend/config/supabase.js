const { createClient } = require('@supabase/supabase-js')
const config = require('./environment')

// Create Supabase client for server-side operations
// Use service key if available, otherwise use anon key
const supabaseKey = config.supabase.serviceKey || config.supabase.anonKey

const supabase = createClient(config.supabase.url, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

module.exports = supabase
