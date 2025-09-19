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

router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { name, brand, type, ingredients } = req.body;

  if (!name || !brand || !type || !ingredients) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        user_id: userId,
        name,
        brand,
        type,
        ingredients,
      },
    ]);

  if (error) {
    console.error('Shelf insert error:', error);
    return res.status(500).json({ error: 'Failed to add product to shelf' });
  }

  res.status(201).json({ message: 'Product added successfully', data });
});

