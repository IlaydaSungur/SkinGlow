const express = require('express');
const { supabase } = require('../services/supabaseClient');

const router = express.Router();

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('products')
    .select('ingredients')
    .eq('user_id', userId);

  if (error) {
    console.error('Shelf fetch error:', error);
    return res.status(500).json({ error: 'Shelf fetch failed' });
  }

  const allIngredients = data.flatMap(p => p.ingredients || []);
  res.json({ ingredients: allIngredients });
});

module.exports = router;

