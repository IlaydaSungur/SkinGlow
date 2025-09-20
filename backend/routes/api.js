const express = require('express')
const router = express.Router()
const { authenticateToken, optionalAuth } = require('../middleware/auth')
const supabase = require('../config/supabase')

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

// Protected route - get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Get profile data from profiles table
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      console.error('Profile fetch error:', error)
      return res.status(500).json({
        error: 'Failed to fetch profile',
        details: error.message,
      })
    }

    res.json({
      message: 'User profile data',
      user: {
        id: req.user.id,
        email: req.user.email,
        created_at: req.user.created_at,
        last_sign_in: req.user.last_sign_in_at,
        email_confirmed: req.user.email_confirmed_at ? true : false,
      },
      profile: profileData || {
        id: req.user.id,
        full_name: null,
        age: null,
        gender: null,
        birth_date: null,
        country: null,
        skin_condition: null,
        allergies: null,
        created_at: null,
        updated_at: null,
      },
    })
  } catch (error) {
    console.error('Profile API error:', error)
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    })
  }
})

// Protected route - update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const {
      full_name,
      age,
      gender,
      birth_date,
      country,
      skin_condition,
      allergies,
    } = req.body

    // Validate age if provided
    if (age !== null && age !== undefined && (age < 0 || age > 150)) {
      return res.status(400).json({
        error: 'Invalid age',
        message: 'Age must be between 0 and 150',
      })
    }

    // Validate gender if provided
    const validGenders = ['male', 'female', 'non-binary', 'prefer-not-to-say']
    if (gender && !validGenders.includes(gender.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid gender',
        message:
          'Gender must be one of: male, female, non-binary, prefer-not-to-say',
      })
    }

    // Prepare the data for upsert
    const profileData = {
      id: req.user.id,
      full_name: full_name || null,
      age: age || null,
      gender: gender ? gender.toLowerCase() : null,
      birth_date: birth_date || null,
      country: country || null,
      skin_condition: skin_condition || null,
      allergies: allergies || null,
      updated_at: new Date().toISOString(),
    }

    // Use upsert to create or update profile
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id',
        returning: 'representation',
      })
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return res.status(500).json({
        error: 'Failed to update profile',
        details: error.message,
      })
    }

    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    })
  } catch (error) {
    console.error('Profile update API error:', error)
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    })
  }
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
