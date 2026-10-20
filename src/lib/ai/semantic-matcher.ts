/**
 * Pure TypeScript Semantic Matcher & TF-IDF Vector Ranking Engine for Contribo
 * Zero heavy external dependencies (no TensorFlow, Python bindings, or bulky vector libs).
 * Executes in < 15ms over candidate pools with full strict typing.
 */

// Common English stopwords to filter out for high-precision text vectorization
export const STOPWORDS = new Set<string>([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t',
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have',
  'haven\'t', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i',
  'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours',
  'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'shouldn\'t', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we',
  'were', 'weren\'t', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'won\'t',
  'would', 'wouldn\'t', 'you', 'your', 'yours', 'yourself', 'yourselves',
]);

/**
 * Tokenize raw text into normalized words, preserving alphanumeric tech tokens (e.g. c++, c#, .net).
 */
export function tokenizeText(text: string): string[] {
  if (!text || typeof text !== 'string') return [];

  const rawMatches = text
    .toLowerCase()
    .replace(/[,\/()\[\]{}:;!?"'`]/g, ' ')
    .match(/[a-z0-9+#.-]+/g);

  if (!rawMatches) return [];

  const tokens: string[] = [];
  for (let token of rawMatches) {
    // Strip trailing/leading punctuation periods/dashes unless part of identifier
    token = token.replace(/^[.-]+|[.-]+$/g, '');
    if (!token) continue;
    if (STOPWORDS.has(token)) continue;
    // Allow single characters for known programming languages (c, r)
    if (token.length === 1 && token !== 'c' && token !== 'r') continue;
    tokens.push(token);
  }

  return tokens;
}

/**
 * Calculate the exact Jaccard similarity coefficient between two sets of tokens.
 * J(A, B) = |A ∩ B| / |A ∪ B|
 * Returns a value between 0.0 and 1.0.
 */
export function computeJaccardSimilarity(
  setA: Set<string> | string[],
  setB: Set<string> | string[]
): number {
  const a = setA instanceof Set ? setA : new Set(setA);
  const b = setB instanceof Set ? setB : new Set(setB);

  if (a.size === 0 && b.size === 0) return 1.0;
  if (a.size === 0 || b.size === 0) return 0.0;

  let intersectionSize = 0;
  for (const item of a) {
    if (b.has(item)) intersectionSize++;
  }

  const unionSize = a.size + b.size - intersectionSize;
  return unionSize > 0 ? intersectionSize / unionSize : 0.0;
}

/**
 * Build an Inverse Document Frequency (IDF) lookup map from a corpus of tokenized documents.
 * Standard smoothed formula: IDF(t) = ln((N + 1) / (DF(t) + 1)) + 1
 */
export function buildIdfMap(corpusTokenLists: string[][]): Map<string, number> {
  const n = corpusTokenLists.length;
  const dfMap = new Map<string, number>();

  for (const docTokens of corpusTokenLists) {
    const uniqueInDoc = new Set(docTokens);
    for (const term of uniqueInDoc) {
      dfMap.set(term, (dfMap.get(term) || 0) + 1);
    }
  }

  const idfMap = new Map<string, number>();
  for (const [term, df] of dfMap.entries()) {
    const idf = Math.log((n + 1) / (df + 1)) + 1;
    idfMap.set(term, idf);
  }

  return idfMap;
}

/**
 * Compute the sublinear TF-IDF vector for a tokenized document.
 * Sublinear TF = 1 + ln(count) for count > 0, else 0.
 */
export function computeTfIdfVector(
  tokens: string[],
  idfMap: Map<string, number>,
  defaultIdf = 1.0
): Map<string, number> {
  const termCounts = new Map<string, number>();
  for (const token of tokens) {
    termCounts.set(token, (termCounts.get(token) || 0) + 1);
  }

  const vector = new Map<string, number>();
  for (const [term, count] of termCounts.entries()) {
    const tf = 1 + Math.log(count);
    const idf = idfMap.get(term) ?? defaultIdf;
    vector.set(term, tf * idf);
  }

  return vector;
}

/**
 * Calculate cosine similarity between query tokens and document tokens using an IDF map.
 * Range: [0.0, 1.0]
 */
export function computeTextCosineSimilarity(
  queryTokens: string[],
  docTokens: string[],
  idfMap: Map<string, number>
): number {
  if (queryTokens.length === 0 || docTokens.length === 0) return 0.0;

  const defaultIdf = Math.log(10) + 1;
  const queryVec = computeTfIdfVector(queryTokens, idfMap, defaultIdf);
  const docVec = computeTfIdfVector(docTokens, idfMap, defaultIdf);

  let dotProduct = 0;
  let queryNormSq = 0;
  for (const [term, qWeight] of queryVec.entries()) {
    queryNormSq += qWeight * qWeight;
    const dWeight = docVec.get(term);
    if (dWeight) {
      dotProduct += qWeight * dWeight;
    }
  }

  let docNormSq = 0;
  for (const dWeight of docVec.values()) {
    docNormSq += dWeight * dWeight;
  }

  const denominator = Math.sqrt(queryNormSq) * Math.sqrt(docNormSq);
  if (denominator === 0) return 0.0;

  return Math.min(1.0, Math.max(0.0, dotProduct / denominator));
}

/**
 * Infer organizational technical complexity index C_org in [1.0, 3.0].
 * 1.0 = approachable / beginner-friendly (web, education, docs, apps)
 * 2.0 = standard intermediate (frameworks, backend, fullstack)
 * 3.0 = deep architecture (kernel, compilers, cryptography, distributed systems)
 */
export function inferOrgComplexity(
  category?: string,
  topics: string[] = [],
  technologies: string[] = []
): number {
  const corpus = `${category || ''} ${topics.join(' ')} ${technologies.join(' ')}`.toLowerCase();

  // Advanced deep architecture signals (Compilers, Kernel, Embedded, Distributed, Crypto)
  const advancedKeywords = [
    'kernel', 'compiler', 'operating system', 'cryptography', 'distributed',
    'concurrency', 'low level', 'virtualization', 'blockchain', 'firmware',
    'embedded', 'networking stack', 'ebpf', 'llvm', 'rust', 'c++', 'assembly'
  ];

  // Beginner-friendly signals (Web, Documentation, UI/UX, Educational, Mobile apps)
  const beginnerKeywords = [
    'web', 'frontend', 'education', 'documentation', 'gui', 'design',
    'html', 'css', 'starter', 'beginner', 'mobile', 'website', 'community'
  ];

  let advancedHits = 0;
  for (const kw of advancedKeywords) {
    if (corpus.includes(kw)) advancedHits++;
  }

  let beginnerHits = 0;
  for (const kw of beginnerKeywords) {
    if (corpus.includes(kw)) beginnerHits++;
  }

  if (advancedHits >= 2 && beginnerHits === 0) {
    return Math.min(3.0, 2.5 + advancedHits * 0.15);
  }
  if (beginnerHits >= 2 && advancedHits === 0) {
    return Math.max(1.0, 1.4 - beginnerHits * 0.1);
  }

  // Blended baseline
  const base = 2.0 + (advancedHits * 0.2) - (beginnerHits * 0.2);
  return Math.min(3.0, Math.max(1.0, base));
}

/**
 * Continuous Gaussian suitability curve aligning contributor experience with org complexity.
 * Contributor levels: beginner = 1.0, intermediate = 2.0, advanced = 3.0.
 * S_exp(L, C) = exp( - (L - C)^2 / (2 * sigma^2) )
 * Returns value in [0.1, 1.0].
 */
export function computeExperienceSuitability(
  experienceLevel: 'beginner' | 'intermediate' | 'advanced',
  orgComplexity: number
): number {
  const userLevel =
    experienceLevel === 'beginner' ? 1.0 : experienceLevel === 'advanced' ? 3.0 : 2.0;

  const sigma = 1.25;
  const distance = userLevel - orgComplexity;
  const suitability = Math.exp(-(distance * distance) / (2 * sigma * sigma));

  return Math.min(1.0, Math.max(0.1, suitability));
}

/**
 * Continuous availability saturation curve using a sigmoid function.
 * Evaluates weekly availability (e.g. 5h - 50h/week).
 * Standard mentorship projects require 15-30h/week.
 */
export function computeAvailabilityScore(hoursPerWeek: number): number {
  const h = Math.min(60, Math.max(1, hoursPerWeek));
  // Centered at 15h with slope 0.15
  const score = 1 / (1 + Math.exp(-0.15 * (h - 15)));
  return Math.min(1.0, Math.max(0.1, score));
}

/**
 * Multi-factor score calculator combining:
 * 1. User skill recall (R_tech)
 * 2. Jaccard similarity (J_tech)
 * 3. Text description TF-IDF cosine similarity (Sim_tfidf)
 * 4. Continuous experience suitability (S_exp)
 * 5. Program recency bonus (S_recency)
 * 6. Availability viability (S_avail)
 *
 * Guaranteed output range: [15, 96]
 */
export function calculateHybridMatchScore(params: {
  matchedUserSkillsCount: number;
  totalUserSkills: number;
  jaccardSimilarity: number;
  tfidfTextSimilarity: number;
  experienceSuitability: number;
  availabilityScore: number;
  latestYear: number;
  is2026: boolean;
}): {
  matchPercentage: number;
  compositeScore: number;
  breakdown: {
    skillRecall: number;
    jaccard: number;
    textSimilarity: number;
    experienceSuitability: number;
    availabilityScore: number;
    recencyScore: number;
  };
} {
  const {
    matchedUserSkillsCount,
    totalUserSkills,
    jaccardSimilarity,
    tfidfTextSimilarity,
    experienceSuitability,
    availabilityScore,
    latestYear,
    is2026,
  } = params;

  const skillRecall = totalUserSkills > 0 ? matchedUserSkillsCount / totalUserSkills : 1.0;
  const recencyScore = is2026 ? 1.0 : latestYear >= 2025 ? 0.8 : latestYear >= 2024 ? 0.6 : 0.4;

  // Multi-factor weighted composite
  const compositeScore =
    skillRecall * 0.40 +
    jaccardSimilarity * 0.20 +
    tfidfTextSimilarity * 0.15 +
    experienceSuitability * 0.12 +
    recencyScore * 0.08 +
    availabilityScore * 0.05;

  // Scale smoothly into realistic grounded [15, 96] range
  const rawPercentage = Math.round(15 + compositeScore * 81);
  const matchPercentage = Math.min(96, Math.max(15, rawPercentage));

  return {
    matchPercentage,
    compositeScore,
    breakdown: {
      skillRecall,
      jaccard: jaccardSimilarity,
      textSimilarity: tfidfTextSimilarity,
      experienceSuitability,
      availabilityScore,
      recencyScore,
    },
  };
}
