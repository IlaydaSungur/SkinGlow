const { HfInference } = require("@huggingface/inference");

const hf = new HfInference(process.env.HF_API_KEY);

async function getEmbedding(text) {
  const res = await hf.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: text,
  });
  return Array.isArray(res[0]) ? res[0] : res;
}

function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== vecB.length) {
    return 0;
  }
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

// ✅ artık yüzde ile dönecek
async function getSimilarity(text1, text2) {
  try {
    const emb1 = await getEmbedding(text1);
    const emb2 = await getEmbedding(text2);
    const sim = cosineSimilarity(emb1, emb2);
    return sim; // 0–1 arası değer
  } catch (err) {
    console.error("Embedding error:", err);
    return 0;
  }
}

module.exports = { getSimilarity };

