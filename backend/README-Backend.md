# SkinGlow Backend API

## 🚀 Features

- **Supabase Authentication Integration** - Validates JWT tokens from frontend
- **Protected API Routes** - Secure endpoints requiring authentication
- **Rate Limiting** - Prevents API abuse
- **CORS Configuration** - Secure cross-origin requests
- **Security Headers** - Enhanced security with Helmet.js

## 📁 Project Structure

```
backend/
├── config/
│   └── supabase.js         # Supabase client configuration
├── middleware/
│   └── auth.js             # Authentication middleware
├── routes/
│   └── api.js              # API route handlers
├── server.js               # Main server file
└── package.json           # Dependencies
```

## 🔧 Installation & Setup

1. **Install dependencies:**

   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup:**
   Create a `.env` file with:

   ```
   PORT=3000
   FRONTEND_URL=http://localhost:4200
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ```

3. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## 🔒 Authentication Flow

1. **Frontend** authenticates with Supabase
2. **Frontend** gets JWT token from Supabase
3. **Frontend** sends requests with `Authorization: Bearer <token>`
4. **Backend** validates token with Supabase
5. **Backend** processes request with user context

## 📊 API Endpoints

### Public Endpoints

- `GET /` - API information
- `GET /api/health` - Health check
- `GET /api/products` - Product list (optional auth)

### Protected Endpoints (Require Authentication)

- `GET /api/routines` - Get user routines
- `POST /api/routines` - Create new routine
- `POST /api/analysis` - Skin analysis
- `GET /api/profile` - User profile data

## 🛡️ Security Features

- **JWT Token Validation** - All protected routes verify Supabase tokens
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **CORS Protection** - Only allows frontend origin
- **Security Headers** - Helmet.js for common vulnerabilities
- **Input Validation** - Request body validation

## 🔗 Frontend Integration

The frontend ApiService automatically:

- Adds JWT tokens to requests
- Handles authentication errors
- Provides typed responses

Example usage in Angular:

```typescript
// Get user routines
this.apiService.getUserRoutines().subscribe((routines) => {
  console.log(routines)
})

// Create new routine
this.apiService
  .createRoutine({
    name: 'Morning Routine',
    steps: ['Cleanser', 'Moisturizer', 'Sunscreen'],
  })
  .subscribe((result) => {
    console.log('Routine created:', result)
  })
```

## 📝 Example Responses

### GET /api/routines

```json
{
  "message": "User routines",
  "user_id": "user-uuid",
  "user_email": "user@example.com",
  "routines": [
    {
      "id": 1,
      "name": "Morning Routine",
      "steps": ["Cleanser", "Vitamin C Serum", "Moisturizer", "Sunscreen"],
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### POST /api/analysis

```json
{
  "message": "Skin analysis completed",
  "user_id": "user-uuid",
  "analysis": {
    "skin_type": "combination",
    "concerns": ["dryness", "fine_lines"],
    "recommendations": [
      "Use a gentle cleanser twice daily",
      "Apply a vitamin C serum in the morning"
    ],
    "recommended_products": [
      {
        "name": "Gentle Foam Cleanser",
        "category": "cleanser"
      }
    ]
  }
}
```

## 🔄 Development Workflow

1. Frontend authenticates user with Supabase
2. Frontend calls backend APIs with JWT token
3. Backend validates token and processes business logic
4. Backend returns data specific to authenticated user

This hybrid approach gives you:

- **Fast authentication** (Supabase handles it)
- **Custom business logic** (Your backend processes it)
- **Secure communication** (JWT token validation)
- **Scalable architecture** (Both systems can scale independently)
