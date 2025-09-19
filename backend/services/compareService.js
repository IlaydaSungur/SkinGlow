const { HfInference } = require("@huggingface/inference");

const hf = new HfInference(process.env.HF_API_KEY);

// ✅ Tek seferde embedding al (batch)
async function getEmbeddingsBatch(texts) {
  try {
    const res = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: texts
    });
    return res;
  } catch (err) {
    console.error("Embedding batch error:", err);
    return [];
  }
}

// ✅ Cosine similarity hesapla
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

module.exports = { getEmbeddingsBatch, cosineSimilarity };

