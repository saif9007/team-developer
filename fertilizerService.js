// fertilizerService.js
// Suggest fertilizers based on crop + growth stage (+ soil type)

const fs = require("fs");
const path = require("path");
const { normalizeText, keywordMap } = require("./keywordMapper");

const fertPath = path.join(__dirname, "..", "data", "fertilizers.json");
const fertilizers = JSON.parse(fs.readFileSync(fertPath, "utf8"));

/**
 * Try to normalize a crop name using the keyword map.
 */
function normalizeCropName(raw) {
  if (!raw) return null;
  const tokens = normalizeText(raw);
  // Check if any token maps directly to known crop_name in data
  const crops = new Set(fertilizers.map(f => f.crop_name));
  for (const t of tokens) {
    if (crops.has(t)) return t;
    if (keywordMap[t] && crops.has(keywordMap[t])) return keywordMap[t];
  }
  return null;
}

/**
 * Fuzzy match growth stage by simple substring checking.
 */
function scoreGrowthStage(queryStage, dataStage) {
  if (!queryStage) return 0;
  const q = queryStage.toLowerCase();
  const d = dataStage.toLowerCase();
  if (q === d) return 1;
  if (d.includes(q) || q.includes(d)) return 0.7;
  return 0;
}

/**
 * Get best fertilizer recommendation.
 */
function getFertilizerRecommendation({ cropText, growthStageText, soilType }) {
  const cropName = normalizeCropName(cropText);
  let best = null;

  fertilizers.forEach(f => {
    if (cropName && f.crop_name !== cropName) return;

    let score = 0.5; // base score if crop matches
    score += scoreGrowthStage(growthStageText || "", f.growth_stage);

    if (soilType && (f.soil_type === soilType || f.soil_type === "all")) {
      score += 0.2;
    }

    if (!best || score > best.score) {
      best = { fert: f, score };
    }
  });

  if (!best) return null;
  return best;
}

module.exports = {
  getFertilizerRecommendation,
  normalizeCropName
};