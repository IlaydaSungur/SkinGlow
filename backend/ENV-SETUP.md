# Backend Environment Setup

## Create .env file

Create a `.env` file in the `backend/` directory with the following content:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:4200

# Supabase Configuration
SUPABASE_URL=https://ebjadjicrbjwcevnxdza.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViamFkamljcmJqd2Nldm54ZHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3ODg1ODgsImV4cCI6MjA3MzM2NDU4OH0.mST0KB8OzeiG2wf2IV5_HpFlcqofq0V7EPmO_dYumYE

# Optional: Service Role Key for admin operations (get from Supabase dashboard)
# SUPABASE_SERVICE_KEY=your_service_role_key_here
```

## Production Setup

For production deployment:

1. Set `NODE_ENV=production`
2. Update `FRONTEND_URL` to your production frontend URL
3. Consider using a service role key for enhanced backend operations
4. Ensure all environment variables are set in your hosting platform

## Security Notes

- Never commit the `.env` file to version control
- The `.env` file is already in `.gitignore`
- For production, use your hosting platform's environment variable system
- Rotate keys periodically for enhanced security
