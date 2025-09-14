const supabase = require('../config/supabase')

/**
 * Middleware to authenticate requests using Supabase JWT tokens
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid authorization token',
      })
    }

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired',
      })
    }

    // Add user info to request object
    req.user = user
    req.token = token

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal server error during authentication',
    })
  }
}

/**
 * Optional authentication - user info if token provided, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token)
      if (!error && user) {
        req.user = user
        req.token = token
      }
    }

    next()
  } catch (error) {
    console.error('Optional auth error:', error)
    // Don't fail the request, just continue without user info
    next()
  }
}

module.exports = {
  authenticateToken,
  optionalAuth,
}
