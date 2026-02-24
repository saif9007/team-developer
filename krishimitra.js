// krishimitra.js
// Frontend (browser) version of KrishiMitra core logic – offline JSON + pure JS.

// ---------- Utility: load JSON once and cache ----------
async function loadJsonOnce(url) {
    if (!loadJsonOnce.cache) loadJsonOnce.cache = {};
    if (!loadJsonOnce.cache[url]) {
      const res = await fetch(url);
      loadJsonOnce.cache[url] = await res.json();
    }
    return loadJsonOnce.cache[url];
  }
  
  // ---------- Keyword Mapper (frontend) ----------
  let keywordMap = null;
  
  async function initKeywordMap() {
    if (keywordMap) return keywordMap;
    keywordMap = await loadJsonOnce("./data/hindi_keyword_mapping.json");
    return keywordMap;
  }
  
  function tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[\.,!?;:()\[\]{}]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  }
  
  function normalizeTokens(tokens, map) {
    return tokens.map(t => map[t] || t);
  }
  
  function normalizeText(text, map) {
    return normalizeTokens(tokenize(text), map);
  }
  
  function normalizedTokenSet(text, map) {
    return new Set(normalizeText(text, map));
  }
  
  // ---------- Disease Detection (frontend) ----------
  let diseaseData = null;
  
  async function detectDiseaseFromText(userText) {
    const map = await initKeywordMap();
    if (!diseaseData) {
      diseaseData = await loadJsonOnce("./data/crop_diseases.json");
    }
    const userTokensSet = normalizedTokenSet(userText, map);
  
    function scoreDisease(d) {
      const allKeywords = [
        ...(d.symptoms_keywords_en || []),
        ...(d.symptoms_keywords_hi || [])
      ]
        .map(k => normalizeText(k, map))
        .flat();
      if (!allKeywords.length) return 0;
      let matches = 0;
      allKeywords.forEach(k => {
        if (userTokensSet.has(k)) matches++;
      });
      return matches / allKeywords.length;
    }
  
    let best = null;
    for (const d of diseaseData) {
      const score = scoreDisease(d);
      if (!best || score > best.score) best = { disease: d, score };
    }
    if (!best || best.score < 0.2) return null;
    return best;
  }
  
  // ---------- Fertilizer Service (frontend) ----------
  let fertData = null;
  
  async function normalizeCropNameFrontend(raw) {
    const map = await initKeywordMap();
    const tokens = normalizeText(raw || "", map);
    if (!fertData) {
      fertData = await loadJsonOnce("./data/fertilizers.json");
    }
    const crops = new Set(fertData.map(f => f.crop_name));
    for (const t of tokens) {
      if (crops.has(t)) return t;
      if (map[t] && crops.has(map[t])) return map[t];
    }
    return null;
  }
  
  function scoreGrowthStage(queryStage, dataStage) {
    if (!queryStage) return 0;
    const q = queryStage.toLowerCase();
    const d = dataStage.toLowerCase();
    if (q === d) return 1;
    if (d.includes(q) || q.includes(d)) return 0.7;
    return 0;
  }
  
  async function getFertilizerRecommendationFrontend({ cropText, growthStageText, soilType }) {
    if (!fertData) {
      fertData = await loadJsonOnce("./data/fertilizers.json");
    }
    const cropName = await normalizeCropNameFrontend(cropText);
    let best = null;
  
    fertData.forEach(f => {
      if (cropName && f.crop_name !== cropName) return;
      let score = 0.5;
      score += scoreGrowthStage(growthStageText || "", f.growth_stage);
      if (soilType && (f.soil_type === soilType || f.soil_type === "all")) score += 0.2;
      if (!best || score > best.score) best = { fert: f, score };
    });
  
    return best;
  }
  
  // ---------- Scheme Service (frontend) ----------
  let schemeData = null;
  
  async function findRelevantSchemesFrontend(userText, topN = 3) {
    const map = await initKeywordMap();
    if (!schemeData) {
      schemeData = await loadJsonOnce("./data/schemes.json");
    }
    const userTokensSet = normalizedTokenSet(userText, map);
  
    function scoreScheme(s) {
      const allKeywords = [
        ...(s.keywords_en || []),
        ...(s.keywords_hi || [])
      ]
        .map(k => normalizeText(k, map))
        .flat();
      if (!allKeywords.length) return 0;
      let matches = 0;
      allKeywords.forEach(k => {
        if (userTokensSet.has(k)) matches++;
      });
      return matches / allKeywords.length;
    }
  
    const scored = schemeData.map(s => ({
      scheme: s,
      score: scoreScheme(s)
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.filter(s => s.score > 0.1).slice(0, topN).map(s => s.scheme);
  }
  
  // ---------- Helper guesses ----------
  function guessGrowthStageFrontend(text) {
    const t = text.toLowerCase();
    if (/sowing|बोवाई|बुवाई|रोपाई|transplanting/.test(t)) return "basal";
    if (/tillering|कवली|गुब्बारा/.test(t)) return "tillering";
    if (/flower|फूल|square|bolting|कली/.test(t)) return "flowering";
    if (/harvest|कटाई|तोड़ाई/.test(t)) return "maturity";
    return "";
  }
  
  function guessSoilTypeFrontend(text) {
    const t = text.toLowerCase();
    if (/sandy|रेतीली/.test(t)) return "sandy";
    if (/clay|चिकनी/.test(t)) return "clay";
    if (/black|काली मिट्टी/.test(t)) return "black";
    return "";
  }
  
  async function detectCropFromTextFrontend(userText) {
    return normalizeCropNameFrontend(userText);
  }
  
  // ---------- MAIN: analyzeQuery for browser ----------
  async function analyzeQueryFrontend(userInput) {
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
  
    const detectedCrop = (await detectCropFromTextFrontend(text)) || "";
    const diseaseResult = await detectDiseaseFromText(text);
    const detectedDisease = diseaseResult ? diseaseResult.disease.disease_name : "";
    const confidenceScore = diseaseResult ? Math.round(diseaseResult.score * 100) + "%" : "";
  
    let suggestedMedicine = "";
    let preventionSteps = [];
    if (diseaseResult) {
      suggestedMedicine = diseaseResult.disease.recommended_medicine;
      preventionSteps = diseaseResult.disease.prevention_steps || [];
    }
  
    const fertStageGuess = guessGrowthStageFrontend(text);
    const fertRes = await getFertilizerRecommendationFrontend({
      cropText: detectedCrop || text,
      growthStageText: fertStageGuess,
      soilType: guessSoilTypeFrontend(text)
    });
  
    let fertText = "";
    if (fertRes) {
      fertText =
        `${fertRes.fert.recommended_fertilizer} ` +
        `(Stage: ${fertRes.fert.growth_stage}, Organic: ${fertRes.fert.alternative_organic_option})`;
    }
  
    const relevantSchemes = await findRelevantSchemesFrontend(text, 3);
  
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
  
  // Expose globally for your other scripts
  window.analyzeQueryFrontend = analyzeQueryFrontend;