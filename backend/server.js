const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const config = require('./config/environment')
const dotenv = require('dotenv')
const axios = require('axios')

// Load env vars
dotenv.config()

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
    version: '3.0.0',
    status: 'Running',
    features: [
      'User Authentication with Supabase',
      'Protected API Routes',
      'Skin Analysis (via Groq)',
      'Routine Management',
      'Product Recommendations',
    ],
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      routines: '/api/routines (protected)',
      analysis: '/api/analysis (protected)',
      profile: '/api/profile (protected)',
      analyse: '/api/analyse',
    },
  })
})

// Analyse route (Groq)
app.post('/api/analyse', async (req, res) => {
  const { text } = req.body

  const prompt = `
  Görev: Sana bir ürünün içerikleri verilecek. Çıktını iki bölümde ver:

BÖLÜM 1 → Ingredients (JSON)
- Sadece geçerli JSON ver
- Format şu şekilde olsun:
{
  "ingredients": [
    { "name": "..." },
    { "name": "..." }
  ]
}

BÖLÜM 2 → Açıklamalar (Normal Metin)
- JSON bittikten sonra normal kullanıcı diliyle açıklama yap
- Her içerik için kısa ama anlaşılır açıklama yaz
- Ne işe yaradığını, cilt/sağlık için genel etkilerini anlat
- Bu kısımda JSON kullanma, sadece düz metin

  Input:
  ${text}
  `

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    let raw = response.data.choices[0].message.content.trim()
    raw = raw.replace(/```json/g, '').replace(/```/g, '').trim()

    try {
      const parsed = JSON.parse(raw)
      res.json(parsed)
    } catch (e) {
      res.json({ raw })
    }
  } catch (err) {
    console.error('Groq API error:', err?.response?.data || err.message)
    res.status(500).json({ error: 'API request failed' })
  }
})

// API Routes
app.use('/api', apiRoutes)

// Start server
app.listen(PORT, () => {
  console.log(`✅ SkinGlow Backend running on port ${PORT}`)
})

