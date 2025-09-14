const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const config = require('./config/environment')

// Import routes
const apiRoutes = require('./routes/api')

const app = express()
const PORT = config.port

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Please try again later',
  },
})
app.use('/api/', limiter)

// CORS configuration
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
)

// Body parser middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'SkinGlow Backend API',
    version: '2.0.0',
    status: 'Running',
    features: [
      'User Authentication with Supabase',
      'Protected API Routes',
      'Skin Analysis',
      'Routine Management',
      'Product Recommendations',
    ],
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      routines: '/api/routines (protected)',
      analysis: '/api/analysis (protected)',
      profile: '/api/profile (protected)',
    },
  })
})

// API Routes
app.use('/api', apiRoutes)

// Start server
app.listen(PORT, () => {
  console.log(`SkinGlow Backend running on port ${PORT}`)
})
