const express = require('express');
const {
  getEmbeddingsBatch,
  cosineSimilarity,
} = require('../services/compareService');
const { supabase } = require('../services/supabaseClient'); // ✅ düzeltildi

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { userId, ingredients } = req.body;
    console.log('📥 Gelen body:', req.body);

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res
        .status(400)
        .json({ error: 'ingredients must be a non-empty array' });
    }

    // ✅ Kullanıcının ürünlerini al
    const { data: shelfData, error } = await supabase
      .from('products')
      .select('id, name, ingredients')
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Supabase error:', error);
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

    const matches = [];
    const productSimilarities = [];
    let anyProductAboveThreshold = false;

    // 🔹 Yeni ürün embeddingleri
    const newEmbeddings = await getEmbeddingsBatch(ingredients);

    for (const row of shelfData) {
      const shelfIngredients = Array.isArray(row.ingredients)
        ? row.ingredients.map((i) => i.trim().toLowerCase())
        : [];

      if (shelfIngredients.length === 0) continue;

      // 🔹 Raf ürünü embeddingleri
      const shelfEmbeddings = await getEmbeddingsBatch(shelfIngredients);

      let matchCount = 0;
      const productMatches = [];

      // Pairwise karşılaştırma (lokalde)
      for (let i = 0; i < ingredients.length; i++) {
        for (let j = 0; j < shelfIngredients.length; j++) {
          const score = cosineSimilarity(newEmbeddings[i], shelfEmbeddings[j]);
          const percentScore = (score * 100).toFixed(1);

          console.log(
            `🔍 ${ingredients[i]} vs ${shelfIngredients[j]} → ${percentScore}%`
          );

          if (score > 0.6) {
            matchCount++;
            productMatches.push({
              ingredient: ingredients[i],
              shelfItem: shelfIngredients[j],
              similarity: percentScore + '%',
            });
            matches.push({
              ingredient: ingredients[i],
              shelfItem: shelfIngredients[j],
              similarity: percentScore + '%',
              productName: row.name,
            });
          }
        }
      }

      // Ürün bazlı yüzde hesapla
      const percent = ((matchCount / ingredients.length) * 100).toFixed(1) + '%';
      productSimilarities.push({
        productId: row.id,
        productName: row.name,
        similarity: percent,
        matchedIngredients: productMatches,
      });

      if (matchCount > 0) {
        anyProductAboveThreshold = true;
        console.log(`✅ ${row.name} bu ürünle içerikleri benzer`);
        console.log(
          `   Benzer içerikler:`,
          productMatches
            .map((m) => `${m.ingredient} ↔ ${m.shelfItem}`)
            .join(', ')
        );
      } else {
        console.log(`ℹ️ ${row.name} için %60'tan fazla benzerlik yok`);
      }
    }

    if (!anyProductAboveThreshold) {
      console.log('⚠️ No product similarity above threshold');
      return res.json({
        matches: [],
        productSimilarities,
        message: 'No product similarity above threshold',
      });
    }

    res.json({ matches, productSimilarities });
  } catch (err) {
    console.error('❌ Compare error:', err);
    res.status(500).json({ error: 'Comparison failed', details: err.message });
  }
});

module.exports = router;
