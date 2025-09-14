// Environment configuration for production
// NOTE: Frontend environment variables are visible to users in the browser!
// Only put public/non-sensitive values here. Supabase anon key is safe to expose.
export const environment = {
  production: true,
  supabase: {
    // These values are safe to be public (Supabase is designed this way)
    url: 'https://ebjadjicrbjwcevnxdza.supabase.co',
    anonKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViamFkamljcmJqd2Nldm54ZHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3ODg1ODgsImV4cCI6MjA3MzM2NDU4OH0.mST0KB8OzeiG2wf2IV5_HpFlcqofq0V7EPmO_dYumYE',
  },
  api: {
    baseUrl: 'https://your-production-api-url.com/api', // Update this for production
  },
  // App configuration
  app: {
    name: 'SkinGlow',
    version: '1.0.0',
  },
}
