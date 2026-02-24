// schemeService.js
// Match user query with govt scheme keywords (EN + HI)

const fs = require("fs");
const path = require("path");
const { normalizedTokenSet, normalizeText } = require("./keywordMapper");

const schemesPath = path.join(__dirname, "..", "data", "schemes.json");
const schemes = JSON.parse(fs.readFileSync(schemesPath, "utf8"));

function computeSchemeScore(userTokensSet, scheme) {
  const allKeywords = [
    ...(scheme.keywords_en || []),
    ...(scheme.keywords_hi || [])
  ]
    .map(k => normalizeText(k))
    .flat();

  if (!allKeywords.length) return 0;

  let matches = 0;
  allKeywords.forEach(k => {
    if (userTokensSet.has(k)) matches += 1;
  });

  return matches / allKeywords.length;
}

/**
 * Return top N schemes relevant to user text.
 */
function findRelevantSchemes(userText, topN = 3) {
  const userTokensSet = normalizedTokenSet(userText);
  const scored = schemes.map(s => ({
    scheme: s,
    score: computeSchemeScore(userTokensSet, s)
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.filter(s => s.score > 0.1).slice(0, topN).map(s => s.scheme);
}

module.exports = {
  findRelevantSchemes
};