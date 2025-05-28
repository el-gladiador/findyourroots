import { Person } from '@/types/family';

export interface DuplicateMatch {
  person: Person;
  confidence: number; // 0-1 scale
  reasons: string[];
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  matches: DuplicateMatch[];
  suggestedAction: 'proceed' | 'review' | 'block';
}

/**
 * Calculates similarity between two strings using Levenshtein distance
 */
function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
  
  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const substitutionCost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }
  
  const maxLength = Math.max(s1.length, s2.length);
  return 1 - (matrix[s2.length][s1.length] / maxLength);
}

/**
 * Persian/Arabic character normalization mappings
 */
const PERSIAN_ARABIC_NORMALIZATIONS: Record<string, string> = {
  'ک': 'ك', 'ی': 'ي', 'ء': '', 'أ': 'ا', 'إ': 'ا', 'آ': 'ا',
  'ة': 'ه', 'ۀ': 'ه', 'ؤ': 'و', 'ئ': 'ي', '‌': ' ', '‍': ''
};

/**
 * Normalize name for comparison (handle common variations including Persian/Arabic)
 */
function normalizeName(name: string): string {
  let normalized = name.toLowerCase().trim();
  
  // Check if text contains Persian/Arabic characters
  const hasPersianArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(normalized);
  
  if (hasPersianArabic) {
    // Remove Arabic diacritics
    normalized = normalized.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
    
    // Normalize common Persian/Arabic variants
    normalized = normalized.replace(/[یي]/g, 'ي').replace(/[کك]/g, 'ك');
    
    // Apply character mappings
    Object.entries(PERSIAN_ARABIC_NORMALIZATIONS).forEach(([from, to]) => {
      normalized = normalized.replace(new RegExp(from, 'g'), to);
    });
    
    // Remove zero-width characters
    normalized = normalized.replace(/[\u200C\u200D]/g, ' ');
  } else {
    // Handle Latin script normalization
    normalized = normalized
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\b(jr|sr|ii|iii|iv)\b/g, ''); // Remove suffixes
  }
  
  return normalized.replace(/\s+/g, ' ').trim();
}

/**
 * Extract name parts for more detailed comparison
 */
function extractNameParts(name: string): { first: string; middle: string; last: string; full: string } {
  const normalized = normalizeName(name);
  const parts = normalized.split(' ').filter(p => p.length > 0);
  
  return {
    first: parts[0] || '',
    middle: parts.slice(1, -1).join(' '),
    last: parts[parts.length - 1] || '',
    full: normalized
  };
}

/**
 * Check if two people might be the same person based on name similarity
 */
function calculateNameSimilarity(name1: string, name2: string): { similarity: number; reasons: string[] } {
  const parts1 = extractNameParts(name1);
  const parts2 = extractNameParts(name2);
  const reasons: string[] = [];
  
  // Exact match
  if (parts1.full === parts2.full) {
    return { similarity: 1.0, reasons: ['Exact name match'] };
  }
  
  // Check for various similarity patterns
  let maxSimilarity = 0;
  
  // Full name similarity
  const fullSimilarity = stringSimilarity(parts1.full, parts2.full);
  if (fullSimilarity > maxSimilarity) {
    maxSimilarity = fullSimilarity;
    if (fullSimilarity > 0.8) {
      reasons.push(`Very similar full name (${Math.round(fullSimilarity * 100)}% match)`);
    }
  }
  
  // First and last name match exactly
  if (parts1.first === parts2.first && parts1.last === parts2.last && parts1.first && parts1.last) {
    maxSimilarity = Math.max(maxSimilarity, 0.9);
    reasons.push('Same first and last name');
  }
  
  // Similar first and last names
  if (parts1.first && parts2.first && parts1.last && parts2.last) {
    const firstSim = stringSimilarity(parts1.first, parts2.first);
    const lastSim = stringSimilarity(parts1.last, parts2.last);
    
    if (firstSim > 0.8 && lastSim > 0.8) {
      const avgSim = (firstSim + lastSim) / 2;
      if (avgSim > maxSimilarity) {
        maxSimilarity = avgSim;
        reasons.push(`Similar first and last names (${Math.round(avgSim * 100)}% match)`);
      }
    }
  }
  
  // Check for potential nickname matches
  const nicknames: Record<string, string[]> = {
    'william': ['bill', 'will', 'billy'],
    'robert': ['bob', 'rob', 'bobby'],
    'richard': ['rick', 'dick', 'rich'],
    'michael': ['mike', 'mick'],
    'elizabeth': ['liz', 'beth', 'betty'],
    'margaret': ['meg', 'maggie', 'peggy'],
    'catherine': ['cathy', 'kate', 'katie'],
    'christopher': ['chris'],
    'anthony': ['tony'],
    'patricia': ['pat', 'patty'],
    'jennifer': ['jen', 'jenny'],
    'jonathan': ['jon', 'john'],
    'matthew': ['matt'],
    'andrew': ['andy', 'drew'],
    'joshua': ['josh'],
    'daniel': ['dan', 'danny'],
    'david': ['dave', 'davy'],
    'joseph': ['joe', 'joey'],
    'thomas': ['tom', 'tommy'],
    'james': ['jim', 'jimmy'],
    'samuel': ['sam', 'sammy']
  };
  
  // Check nickname matches
  for (const [fullName, nicks] of Object.entries(nicknames)) {
    if ((parts1.first === fullName && nicks.includes(parts2.first)) ||
        (parts2.first === fullName && nicks.includes(parts1.first)) ||
        (nicks.includes(parts1.first) && nicks.includes(parts2.first))) {
      maxSimilarity = Math.max(maxSimilarity, 0.85);
      reasons.push('Possible nickname match');
      break;
    }
  }
  
  return { similarity: maxSimilarity, reasons };
}

/**
 * Check relationship context for duplicate detection
 */
function checkRelationshipContext(
  newPerson: { name: string; fatherName?: string; fatherId?: string },
  existingPerson: Person
): { similarity: number; reasons: string[] } {
  const reasons: string[] = [];
  let similarity = 0;
  
  // Same father relationship
  if (newPerson.fatherId === existingPerson.fatherId && newPerson.fatherId) {
    similarity += 0.3;
    reasons.push('Same father ID');
  } else if (newPerson.fatherName && existingPerson.fatherName) {
    const fatherSim = stringSimilarity(newPerson.fatherName, existingPerson.fatherName);
    if (fatherSim > 0.8) {
      similarity += 0.2;
      reasons.push('Similar father name');
    }
  }
  
  return { similarity, reasons };
}

/**
 * Main duplicate detection function
 */
export function detectDuplicates(
  newPerson: { name: string; fatherName?: string; fatherId?: string },
  existingPeople: Person[]
): DuplicateDetectionResult {
  if (existingPeople.length === 0) {
    return {
      isDuplicate: false,
      matches: [],
      suggestedAction: 'proceed'
    };
  }
  
  const matches: DuplicateMatch[] = [];
  
  for (const person of existingPeople) {
    const nameResult = calculateNameSimilarity(newPerson.name, person.name);
    const relationshipResult = checkRelationshipContext(newPerson, person);
    
    // Enhanced father name differentiation logic
    // Only consider this a strong differentiator if both father names exist and are meaningfully different
    const hasDifferentFathers = newPerson.fatherName && person.fatherName && 
      newPerson.fatherName.trim() !== '' && person.fatherName.trim() !== '' &&
      normalizeName(newPerson.fatherName) !== normalizeName(person.fatherName);
    
    // Check if father names are similar but not exact (could be spelling variations)
    const hasSimilarFathers = newPerson.fatherName && person.fatherName &&
      newPerson.fatherName.trim() !== '' && person.fatherName.trim() !== '' &&
      stringSimilarity(normalizeName(newPerson.fatherName), normalizeName(person.fatherName)) > 0.7 &&
      normalizeName(newPerson.fatherName) !== normalizeName(person.fatherName);
    
    let totalSimilarity = Math.min(1.0, nameResult.similarity + relationshipResult.similarity);
    
    if (hasDifferentFathers) {
      // Father names are clearly different - this is a strong indicator they are different people
      if (nameResult.similarity > 0.8) {
        // Very similar names but different fathers - likely different people with similar names
        totalSimilarity = Math.min(totalSimilarity * 0.2, 0.3);
        nameResult.reasons.push(`Strong evidence of different people: different fathers (${newPerson.fatherName} ≠ ${person.fatherName})`);
      } else if (nameResult.similarity > 0.6) {
        // Moderately similar names with different fathers
        totalSimilarity = Math.min(totalSimilarity * 0.4, 0.5);
        nameResult.reasons.push(`Different fathers suggest different people: ${newPerson.fatherName} vs ${person.fatherName}`);
      }
    } else if (hasSimilarFathers) {
      // Father names are similar but not exact - could be spelling variations
      // Don't reduce confidence as much, but note the difference
      totalSimilarity = Math.min(totalSimilarity * 0.8, 0.7);
      nameResult.reasons.push(`Similar but different father names: ${newPerson.fatherName} vs ${person.fatherName} (possible spelling variation)`);
    }
    
    const allReasons = [...nameResult.reasons, ...relationshipResult.reasons];
    
    // Only include if there's meaningful similarity
    if (totalSimilarity > 0.3) {
      matches.push({
        person,
        confidence: totalSimilarity,
        reasons: allReasons
      });
    }
  }
  
  // Sort by confidence
  matches.sort((a, b) => b.confidence - a.confidence);
  
  // Determine suggested action based on highest confidence match
  let suggestedAction: 'proceed' | 'review' | 'block' = 'proceed';
  const isDuplicate = matches.length > 0;
  
  if (matches.length > 0) {
    const highestConfidence = matches[0].confidence;
    if (highestConfidence >= 0.9) {
      suggestedAction = 'block';
    } else if (highestConfidence >= 0.8) {
      suggestedAction = 'review';
    }
  }
  
  return {
    isDuplicate,
    matches: matches.slice(0, 1), // Show only the highest confidence match
    suggestedAction
  };
}

/**
 * Generate user-friendly description of why something is flagged as duplicate
 */
export function generateDuplicateDescription(match: DuplicateMatch): string {
  const confidence = Math.round(match.confidence * 100);
  const mainReason = match.reasons[0] || 'Similar information';
  
  return `${confidence}% match - ${mainReason}`;
}
