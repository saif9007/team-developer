// keywordMapper.js
// Loads Hindi/English keyword mapping and provides helper functions for normalization

const fs = require("fs");
const path = require("path");

const mappingPath = path.join(__dirname, "..", "data", "hindi_keyword_mapping.json");
const keywordMap = JSON.parse(fs.readFileSync(mappingPath, "utf8"));

/**
 * Basic tokenizer: lowercases, splits on spaces and punctuation.
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[\.,!?;:()\[\]{}]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Map each token using hindi_keyword_mapping.json when available.
 * If no mapping is found, token is kept as‑is.
 */
function normalizeTokens(tokens) {
  return tokens.map(t => keywordMap[t] || t);
}

/**
 * Normalize full text to tokens (with Hindi→English mapping).
 */
function normalizeText(text) {
  const tokens = tokenize(text);
  return normalizeTokens(tokens);
}

/**
 * Convenience: returns a Set of normalized tokens
 * (faster for membership checking).
 */
function normalizedTokenSet(text) {
  return new Set(normalizeText(text));
}

module.exports = {
  tokenize,
  normalizeText,
  normalizedTokenSet,
  keywordMap
};