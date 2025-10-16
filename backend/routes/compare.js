// filepath: routes/compare.js
const express = require('express');
const {
  getEmbeddingsBatch,
  cosineSimilarity,
} = require('../services/compareService');
const { supabase } = require('../services/supabaseClient');
const axios = require('axios'); // For Groq API

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { userId, ingredients } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res
        .status(400)
        .json({ error: 'ingredients must be a non-empty array' });
    }

    const { data: shelfData, error } = await supabase
      .from('products')
      .select('id, name, ingredients')
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase error:', error);
      return res
        .status(500)
        .json({ error: 'Failed to fetch shelf', details: error.message });
    }

    if (!shelfData || shelfData.length === 0) {
      return res.json({
        matches: [],
        productSimilarities: [],
        message: 'Shelf is empty',
      });
    }

    const productSimilarities = [];

    for (const row of shelfData) {
      const shelfIngredients = Array.isArray(row.ingredients)
        ? row.ingredients.map((i) => i.trim().toLowerCase())
        : [];

      if (shelfIngredients.length === 0) continue;

      // 🧮 Compute embeddings for all ingredients together
      const allTexts = [...ingredients, ...shelfIngredients];
      let embeddings = [];
      try {
        embeddings = await getEmbeddingsBatch(allTexts);
      } catch (embedErr) {
        console.error('Embedding error:', embedErr);
      }

      // Default max similarity
      let maxSim = 0;
      if (embeddings.length === allTexts.length) {
        for (let i = 0; i < ingredients.length; i++) {
          for (let j = 0; j < shelfIngredients.length; j++) {
            const sim = cosineSimilarity(
              embeddings[i],
              embeddings[ingredients.length + j]
            );
            if (sim > maxSim) maxSim = sim;
          }
        }
      }

      const prompt = `
        Task: You will be given the ingredients of two products. Determine if they are safe to use together.
        - If safe: "It is okay to use."
        - If not safe: "These products are not advised to be used together. Because ..." and explain why.

        Product 1 Ingredients: ${ingredients.join(', ')}
        Product 2 Ingredients: ${shelfIngredients.join(', ')}
      `;

      let safetyMessage = 'It is okay to use.';
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
        );

        safetyMessage = response.data.choices[0].message.content.trim();

        // Limit harmful output length
        if (safetyMessage.includes('not advised')) {
          const words = safetyMessage.split(' ');
          if (words.length > 70) {
            safetyMessage =
              words.slice(0, 70).join(' ') +
              '. We recommend you ask a doctor since it may be harmful to your skin.';
          }
        }
      } catch (err) {
        console.error('Groq API error:', err?.response?.data || err.message);
        safetyMessage = 'Failed to check safety.';
      }

      productSimilarities.push({
        productName: row.name,
        similarity: (maxSim * 100).toFixed(1) + '%', 
        safetyMessage,
      });
    }

    res.json({ productSimilarities });
  } catch (err) {
    console.error('Compare error:', err);
    res.status(500).json({ error: 'Comparison failed', details: err.message });
  }
});

module.exports = router;
