# 🔒 SkinGlow Security Setup Guide

## 📁 Sensitive Data Management

All sensitive data (API keys, URLs, tokens) have been moved to separate configuration files and environment variables.

### 🔧 **Backend Setup**

1. **Create `.env` file** in the `backend/` directory:

   ```bash
   cd backend
   cp ENV-SETUP.md .env  # Then edit the .env file with your values
   ```

2. **Environment Variables** are managed in:
   - `backend/config/environment.js` - Configuration management
   - `backend/.env` - Actual sensitive values (create this file)
   - `backend/ENV-SETUP.md` - Setup instructions

### 🎨 **Frontend Setup**

1. **Environment files** are in:

   - `frontend/src/environments/environment.ts` - Development config
   - `frontend/src/environments/environment.prod.ts` - Production config

2. **Configuration is used in**:
   - `frontend/src/app/core/supabase.service.ts` - Auth service
   - `frontend/src/app/core/api.service.ts` - API service

## 🛡️ **Security Features**

### ✅ **What's Protected:**

- Supabase API keys moved to environment variables
- Server configuration separated from code
- API URLs configurable per environment
- No hardcoded sensitive data in source code

### ✅ **Git Security:**

- `.env` files are in `.gitignore`
- Only example/template files are tracked
- Sensitive keys never committed to repository

### ✅ **Environment Separation:**

- Development vs Production configurations
- Different API endpoints per environment
- Proper environment variable validation

## 🚀 **Quick Setup**

1. **Backend:**

   ```bash
   cd backend
   # Create .env file with your values (see ENV-SETUP.md)
   echo "PORT=3000" > .env
   echo "SUPABASE_URL=https://ebjadjicrbjwcevnxdza.supabase.co" >> .env
   echo "SUPABASE_ANON_KEY=your_key_here" >> .env
   npm start
   ```

2. **Frontend:**
   ```bash
   cd frontend
   # Environment files are already configured
   npm start
   ```

## 🔄 **For Production:**

1. Set environment variables on your hosting platform
2. Update `environment.prod.ts` with production API URLs
3. Use `npm run build --prod` for optimized frontend build
4. Consider using service role keys for enhanced backend security

## 📋 **Environment Variables Reference:**

### Backend (.env):

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key (optional)
```

### Frontend (environments/):

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'your_supabase_url',
    anonKey: 'your_anon_key',
  },
  api: {
    baseUrl: 'http://localhost:3000/api',
  },
}
```

Your sensitive data is now properly secured and separated from your source code! 🎉
