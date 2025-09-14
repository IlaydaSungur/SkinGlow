const express = require('express')
const router = express.Router()
const { authenticateToken, optionalAuth } = require('../middleware/auth')

// Public route - no authentication required
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'SkinGlow API is running',
  })
})

// Public route with optional user info
router.get('/products', optionalAuth, (req, res) => {
  const response = {
    message: 'Products endpoint',
    products: [
      { id: 1, name: 'Gentle Cleanser', category: 'cleanser', price: 25.99 },
      { id: 2, name: 'Hydrating Serum', category: 'serum', price: 45.0 },
      { id: 3, name: 'SPF 50 Sunscreen', category: 'sunscreen', price: 18.5 },
    ],
  }

  // Add personalized info if user is authenticated
  if (req.user) {
    response.user_message = `Welcome back, ${req.user.email}! Here are some products for you.`
    response.personalized = true
  }

  res.json(response)
})

// Protected route - requires authentication
router.get('/routines', authenticateToken, (req, res) => {
  res.json({
    message: 'User routines',
    user_id: req.user.id,
    user_email: req.user.email,
    routines: [
      {
        id: 1,
        name: 'Morning Routine',
        steps: ['Cleanser', 'Vitamin C Serum', 'Moisturizer', 'Sunscreen'],
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Evening Routine',
        steps: ['Cleanser', 'Retinol', 'Night Moisturizer'],
        created_at: new Date().toISOString(),
      },
    ],
  })
})

// Protected route - skin analysis
router.post('/analysis', authenticateToken, (req, res) => {
  const { skin_concerns, current_products } = req.body

  res.json({
    message: 'Skin analysis completed',
    user_id: req.user.id,
    analysis: {
      skin_type: 'combination',
      concerns: skin_concerns || ['dryness', 'fine_lines'],
      recommendations: [
        'Use a gentle cleanser twice daily',
        'Apply a vitamin C serum in the morning',
        'Use retinol 2-3 times per week in the evening',
        'Always apply SPF 30+ during the day',
      ],
      recommended_products: [
        { name: 'Gentle Foam Cleanser', category: 'cleanser' },
        { name: 'Vitamin C Brightening Serum', category: 'serum' },
        { name: 'Retinol Renewal Cream', category: 'treatment' },
      ],
    },
    timestamp: new Date().toISOString(),
  })
})

// Protected route - user profile
router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'User profile data',
    user: {
      id: req.user.id,
      email: req.user.email,
      created_at: req.user.created_at,
      last_sign_in: req.user.last_sign_in_at,
      email_confirmed: req.user.email_confirmed_at ? true : false,
    },
    preferences: {
      skin_type: 'combination',
      concerns: ['anti-aging', 'hydration'],
      routine_reminder: true,
    },
  })
})

// Protected route - save user routine
router.post('/routines', authenticateToken, (req, res) => {
  const { name, steps, time_of_day } = req.body

  if (!name || !steps || !Array.isArray(steps)) {
    return res.status(400).json({
      error: 'Invalid input',
      message: 'Name and steps array are required',
    })
  }

  res.json({
    message: 'Routine saved successfully',
    routine: {
      id: Date.now(), // Simple ID generation for demo
      user_id: req.user.id,
      name,
      steps,
      time_of_day: time_of_day || 'morning',
      created_at: new Date().toISOString(),
    },
  })
})

module.exports = router
