const express = require('express')
const axios = require('axios')
const supabase = require('../services/supabaseClient')

const router = express.Router()

// Generate AI-powered skincare routine
router.post('/generate', async (req, res) => {
  try {
    const { userId, routineType } = req.body
    console.log('📥 Routine generation request:', { userId, routineType })

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    if (!routineType || !['morning', 'night'].includes(routineType)) {
      return res
        .status(400)
        .json({ error: 'routineType must be "morning" or "night"' })
    }

    // Get user's products from shelf
    const { data: shelfData, error } = await supabase
      .from('products')
      .select('id, name, brand, ingredients, type')
      .eq('user_id', userId)

    if (error) {
      console.error('❌ Supabase error:', error)
      return res
        .status(500)
        .json({ error: 'Failed to fetch shelf', details: error.message })
    }

    if (!shelfData || shelfData.length === 0) {
      return res.json({
        routine: [],
        message:
          'No products found in shelf. Add products to generate routines.',
        routineType,
      })
    }

    // Prepare products data for AI
    const productsInfo = shelfData.map((product) => ({
      name: product.name,
      brand: product.brand,
      type: product.type,
      ingredients: Array.isArray(product.ingredients)
        ? product.ingredients.join(', ')
        : product.ingredients,
    }))

    // Create AI prompt for routine generation
    const prompt = `
Görev: Kullanıcının sahip olduğu ürünlere göre ${
      routineType === 'morning' ? 'sabah' : 'gece'
    } cilt bakım rutini oluştur.

Ürünler:
${productsInfo
  .map(
    (p) =>
      `- ${p.name} (${p.brand}) - Tür: ${p.type}\n  İçerikler: ${p.ingredients}`
  )
  .join('\n')}

Çıktını JSON formatında ver:
{
  "routine": [
    {
      "step": 1,
      "title": "Adım başlığı",
      "product": "Önerilen ürün adı",
      "productId": "veritabanındaki ürün id'si",
      "description": "Bu adımın açıklaması",
      "waitTime": "Bekleme süresi (isteğe bağlı)",
      "tips": "Kullanım ipuçları"
    }
  ],
  "totalTime": "Toplam süre",
  "benefits": "Bu rutinin faydaları",
  "warnings": "Dikkat edilmesi gerekenler"
}

Kurallar:
- ${
      routineType === 'morning'
        ? 'Sabah rutini: temizleme, tonik, serum, nemlendirici, güneş kremi sırası'
        : 'Gece rutini: temizleme, tonik, aktif maddeler, nemlendirici sırası'
    }
- Sadece mevcut ürünleri kullan
- Her ürünü uygun sırada yerleştir
- Detaylı açıklamalar yap
- ${
      routineType === 'morning'
        ? 'SPF kullanımını vurgula'
        : 'Gece aktif maddelerini (retinol, AHA/BHA) öner'
    }
- Cilt tipine uygun öneriler ver
`

    // Call Groq API
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    let raw = response.data.choices[0].message.content.trim()
    raw = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    try {
      // Extract JSON from response
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      let parsedRoutine = {}

      if (jsonMatch) {
        parsedRoutine = JSON.parse(jsonMatch[0])

        // Match products with actual database IDs
        if (parsedRoutine.routine && Array.isArray(parsedRoutine.routine)) {
          parsedRoutine.routine = parsedRoutine.routine.map((step) => {
            // Find matching product in shelf
            const matchingProduct = shelfData.find(
              (product) =>
                product.name
                  .toLowerCase()
                  .includes(step.product?.toLowerCase()) ||
                step.product?.toLowerCase().includes(product.name.toLowerCase())
            )

            if (matchingProduct) {
              step.productId = matchingProduct.id
              step.product = matchingProduct.name
              step.brand = matchingProduct.brand
            }

            return step
          })
        }
      }

      res.json({
        routine: parsedRoutine.routine || [],
        totalTime: parsedRoutine.totalTime || 'Belirtilmedi',
        benefits: parsedRoutine.benefits || '',
        warnings: parsedRoutine.warnings || '',
        routineType,
        products: shelfData,
      })
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      res.json({
        error: 'Failed to parse routine',
        raw,
        routineType,
        products: shelfData,
      })
    }
  } catch (err) {
    console.error(
      'Routine generation error:',
      err?.response?.data || err.message
    )
    res.status(500).json({ error: 'Routine generation failed' })
  }
})

module.exports = router
