// mainController.js
// Central orchestrator for KrishiMitra backend.
// Works fully offline using local JSON files only.

const { detectDiseaseFromText } = require("./diseaseDetection");
const { getFertilizerRecommendation, normalizeCropName } = require("./fertilizerService");
const { findRelevantSchemes } = require("./schemeService");
const { normalizeText } = require("./keywordMapper");

/**
 * Detect probable crop from query using normalized tokens.
 */
function detectCropFromText(userText) {
  const tokens = normalizeText(userText);
  // Try to reuse fertilizerService normalization logic
  return normalizeCropName(tokens.join(" "));
}

/**
 * Analyze user query and produce final response.
 * This is what you call from CLI or Express route.
 */
function analyzeQuery(userInput) {
  const text = (userInput || "").trim();
  if (!text) {
    return {
      detected_crop: "",
      detected_disease: "",
      confidence_score: "",
      suggested_medicine: "",
      fertilizer_recommendation: "",
      relevant_schemes: [],
      prevention_steps: []
    };
  }

  // 1) Try to detect crop from text
  const detectedCrop = detectCropFromText(text) || "";

  // 2) Disease detection
  const diseaseResult = detectDiseaseFromText(text);
  const detectedDisease = diseaseResult ? diseaseResult.disease.disease_name : "";
  const confidenceScore = diseaseResult
    ? Math.round(diseaseResult.score * 100) + "%"
    : "";

  // 3) Fertilizer logic:
  //    - If disease detected: mostly medicine advice
  //    - Otherwise general crop query: fertilizer suggestion
  let suggestedMedicine = "";
  let preventionSteps = [];
  if (diseaseResult) {
    suggestedMedicine = diseaseResult.disease.recommended_medicine;
    preventionSteps = diseaseResult.disease.prevention_steps || [];
  }

  // Heuristic: look for words like "fertilizer", "खाद" etc. – here just always give a fert suggestion if crop is known
  let fertText = "";
  if (!diseaseResult || detectedCrop) {
    const fertStageGuess = guessGrowthStage(text);
    const fertRes = getFertilizerRecommendation({
      cropText: detectedCrop || text,
      growthStageText: fertStageGuess,
      soilType: guessSoilType(text)
    });
    if (fertRes) {
      fertText =
        `${fertRes.fert.recommended_fertilizer} ` +
        `(Stage: ${fertRes.fert.growth_stage}, Organic: ${fertRes.fert.alternative_organic_option})`;
    }
  }

  // 4) Relevant government schemes
  const relevantSchemes = findRelevantSchemes(text, 3);

  // 5) Final object
  return {
    detected_crop: detectedCrop,
    detected_disease: detectedDisease,
    confidence_score: confidenceScore,
    suggested_medicine: suggestedMedicine,
    fertilizer_recommendation: fertText,
    relevant_schemes: relevantSchemes.map(s => ({
      scheme_id: s.scheme_id,
      scheme_name_en: s.scheme_name_en,
      scheme_name_hi: s.scheme_name_hi,
      benefits: s.benefits,
      application_mode: s.application_mode,
      official_link: s.official_link
    })),
    prevention_steps: preventionSteps
  };
}

/**
 * Very lightweight guess for growth stage from text.
 * You can expand this with more Hindi words.
 */
function guessGrowthStage(text) {
  const t = text.toLowerCase();
  if (/sowing|बोवाई|बुवाई|रोपाई|transplanting/.test(t)) return "basal";
  if (/tillering|कवली|गुब्बारा/.test(t)) return "tillering";
  if (/flower|फूल|square|bolting|कली/.test(t)) return "flowering";
  if (/harvest|कटाई|तोड़ाई/.test(t)) return "maturity";
  return ""; // unknown
}

/**
 * Simple soil type guess.
 */
function guessSoilType(text) {
  const t = text.toLowerCase();
  if (/sandy|रेतीली/.test(t)) return "sandy";
  if (/clay|चिकनी/.test(t)) return "clay";
  if (/black|काली मिट्टी/.test(t)) return "black";
  return ""; // let fertilizerService treat as "all"
}

module.exports = {
  analyzeQuery
};