// Environment configuration for SkinGlow Backend
require('dotenv').config()

const config = {
  // Server Configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Frontend URL for CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',

  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL || 'https://ebjadjicrbjwcevnxdza.supabase.co',
    anonKey:
      process.env.SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViamFkamljcmJqd2Nldm54ZHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3ODg1ODgsImV4cCI6MjA3MzM2NDU4OH0.mST0KB8OzeiG2wf2IV5_HpFlcqofq0V7EPmO_dYumYE',
    serviceKey: process.env.SUPABASE_SERVICE_KEY, // Optional, for admin operations
  },
}

// Validation
if (!config.supabase.url) {
  throw new Error('SUPABASE_URL environment variable is required')
}

if (!config.supabase.anonKey) {
  throw new Error('SUPABASE_ANON_KEY environment variable is required')
}

module.exports = config
