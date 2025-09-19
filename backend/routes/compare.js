const express = require("express");
const { getSimilarity } = require("../services/compareService");
const supabase = require("../services/supabaseClient");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, ingredients } = req.body;
    console.log("📥 Gelen body:", req.body);

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "ingredients must be a non-empty array" });
    }

    // Supabase’den ürün içerikleri
    const { data: shelfData, error } = await supabase
      .from("products")
      .select("ingredients")
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch shelf", details: error.message });
    }

    console.log("📦 Supabase shelfData:", shelfData);

    if (!shelfData || shelfData.length === 0) {
      return res.json({ matches: [], message: "Shelf is empty" });
    }

    // ingredients array düzleştir
    const shelf = shelfData
      .flatMap(row => Array.isArray(row.ingredients) ? row.ingredients : [])
      .map(i => i.trim().toLowerCase());

    console.log("📂 Kullanıcı rafı (ingredients):", shelf);

    const matches = [];
    for (const shelfItem of shelf) {
      for (const ing of ingredients) {
        const score = await getSimilarity(ing, shelfItem);
        console.log(`🔍 ${ing} vs ${shelfItem} → ${score}`);
        if (score > 0.6) {
          matches.push({
            ingredient: ing,
            shelfItem,
            similarity: (score * 100).toFixed(1) + "%"
          });
        }
      }
    }

    if (matches.length === 0) {
      console.log("ℹ️ No similarities found.");
      return res.json({ matches: [], message: "No similarities found" });
    }

    console.log("✅ Matches found:", matches);
    res.json({ matches });
  } catch (err) {
    console.error("❌ Compare error:", err);
    res.status(500).json({ error: "Comparison failed", details: err.message });
  }
});

module.exports = router;

