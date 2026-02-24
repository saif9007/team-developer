// diseaseDetection.js
// Text-based disease detection using keyword matching and Hindi support

const fs = require("fs");
const path = require("path");
const { normalizedTokenSet, normalizeText } = require("./keywordMapper");

const diseasesPath = path.join(__dirname, "..", "data", "crop_diseases.json");
const diseases = JSON.parse(fs.readFileSync(diseasesPath, "utf8"));

/**
 * Compute match score between user tokens and a disease's symptom keywords.
 * We support both English and Hindi symptom lists – all normalized.
 */
function computeDiseaseScore(userTokensSet, disease) {
  const allKeywords = [
    ...(disease.symptoms_keywords_en || []),
    ...(disease.symptoms_keywords_hi || [])
  ]
    .map(k => normalizeText(k))
    .flat();

  if (!allKeywords.length) return 0;

  let matchCount = 0;
  allKeywords.forEach(k => {
    if (userTokensSet.has(k)) matchCount += 1;
  });

  return matchCount / allKeywords.length; // simple percentage (0–1)
}

/**
 * Detect crop disease from text input.
 * Returns: { disease, score } or null if no good match.
 */
function detectDiseaseFromText(userText) {
  const userTokensSet = normalizedTokenSet(userText);

  let best = null;

  for (const d of diseases) {
    const score = computeDiseaseScore(userTokensSet, d);
    if (!best || score > best.score) {
      best = { disease: d, score };
    }
  }

  // Threshold to avoid random matches; tweak as needed.
  if (!best || best.score < 0.2) {
    return null;
  }

  return best;
}

module.exports = {
  detectDiseaseFromText
};