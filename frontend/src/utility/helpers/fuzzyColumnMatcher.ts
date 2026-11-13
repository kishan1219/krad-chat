/**
 * Fuzzy Column Matcher for WhatsApp Campaign Audience Ingestion
 * Intelligently matches CSV header variations (e.g. 'Mobile No', 'Full Name', 'Customer_Company')
 * to WhatsApp template dynamic variables {{1}}, {{2}}, etc.
 */

export interface MatchCandidate {
  column: string;
  confidence: number; // 0 - 100%
  concept: string;
}

export interface AutoMappingResult {
  variable: string;
  column: string;
  confidence: number;
  concept: string;
  reason: string;
}

export const CANONICAL_CONCEPTS: Record<string, string[]> = {
  phone: [
    'phone', 'mobile', 'cell', 'whatsapp', 'contact', 'telephone', 'tel',
    'mobile no', 'mobile number', 'phone no', 'phone number', 'contact no',
    'contact number', 'cell phone', 'wa number', 'whatsapp number', 'destination'
  ],
  first_name: [
    'first name', 'firstname', 'first', 'fname', 'given name', 'customer first name',
    'client first name', 'user first name'
  ],
  full_name: [
    'name', 'full name', 'fullname', 'customer name', 'client name', 'user name',
    'contact name', 'person name', 'lead name', 'subscriber name'
  ],
  last_name: [
    'last name', 'lastname', 'last', 'lname', 'surname', 'family name'
  ],
  company: [
    'company', 'company name', 'customer company', 'client company', 'business',
    'business name', 'organization', 'organisation', 'org', 'firm', 'agency',
    'employer', 'workplace', 'account name'
  ],
  email: [
    'email', 'email address', 'mail', 'e mail', 'contact email', 'customer email'
  ],
  amount: [
    'amount', 'total amount', 'price', 'bill amount', 'balance', 'due amount',
    'fee', 'payment', 'inr', 'cost', 'charge', 'subtotal', 'total'
  ],
  order_id: [
    'order id', 'order no', 'order number', 'booking id', 'booking no',
    'invoice id', 'invoice no', 'invoice number', 'ref no', 'reference',
    'ticket no', 'ticket id', 'tracking id', 'order'
  ],
  date: [
    'date', 'due date', 'appointment date', 'scheduled date', 'expiry date',
    'expiration date', 'valid till', 'created date', 'event date'
  ],
  code: [
    'code', 'coupon', 'coupon code', 'promo', 'promo code', 'voucher', 'voucher code',
    'otp', 'token', 'discount code'
  ],
  city: [
    'city', 'location', 'town', 'branch', 'state', 'address', 'city name'
  ]
};

/**
 * Normalizes a string for robust fuzzy comparison.
 */
export function normalizeToken(raw: string): string {
  if (!raw) return '';
  return String(raw)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Creates character bigrams for Sørensen-Dice similarity.
 */
function getBigrams(str: string): Set<string> {
  const bigrams = new Set<string>();
  const normalized = normalizeToken(str);
  for (let i = 0; i < normalized.length - 1; i++) {
    bigrams.add(normalized.slice(i, i + 2));
  }
  return bigrams;
}

/**
 * Calculates similarity coefficient (0 to 1) between two tokenized strings.
 */
export function calculateSimilarity(s1: string, s2: string): number {
  const norm1 = normalizeToken(s1);
  const norm2 = normalizeToken(s2);

  if (!norm1 || !norm2) return 0;
  if (norm1 === norm2) return 1.0;

  // Exact word containment
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');
  const intersection = words1.filter(w => words2.includes(w));

  if (intersection.length > 0) {
    const containmentScore = (2 * intersection.length) / (words1.length + words2.length);
    if (containmentScore >= 0.5) {
      return 0.8 + 0.2 * containmentScore;
    }
  }

  // Bigram Dice coefficient
  const bg1 = getBigrams(norm1);
  const bg2 = getBigrams(norm2);

  if (bg1.size === 0 || bg2.size === 0) return 0;

  let common = 0;
  bg1.forEach(b => {
    if (bg2.has(b)) common++;
  });

  return (2 * common) / (bg1.size + bg2.size);
}

/**
 * Detects the best matching primary phone column from a list of CSV headers.
 */
export function detectPhoneColumn(headers: string[]): string {
  let bestCol = '';
  let bestScore = 0;

  const phoneAliases = CANONICAL_CONCEPTS.phone;

  for (const header of headers) {
    const norm = normalizeToken(header);
    // Direct regex check for immediate high-confidence hits
    if (/^(?:phone|mobile|contact|cell|whatsapp)(?:[_\s]*(?:no|number|num))?$/i.test(norm)) {
      return header;
    }

    for (const alias of phoneAliases) {
      const score = calculateSimilarity(norm, alias);
      if (score > bestScore) {
        bestScore = score;
        bestCol = header;
      }
    }
  }

  return bestScore >= 0.55 ? bestCol : (headers[0] || '');
}

/**
 * Infers semantic concept for a template variable placeholder {{varId}} based on surrounding text.
 */
export function inferConceptFromTemplate(templateText: string, varId: string): string[] {
  if (!templateText) {
    if (varId === '1') return ['first_name', 'full_name'];
    if (varId === '2') return ['company', 'order_id'];
    if (varId === '3') return ['amount', 'date'];
    return ['amount', 'date', 'code'];
  }

  // Extract surrounding context (up to 35 chars before the placeholder)
  const regex = new RegExp(`(?:([\\w\\s,':$-]{2,35}))?\\{\\{${varId}\\}\\}`, 'i');
  const match = templateText.match(regex);
  const prefix = (match?.[1] || '').toLowerCase().trim();

  if (/\b(?:hi|hello|dear|hey|greetings|welcome|namaste|mr|mrs|ms)\b/i.test(prefix)) {
    return ['first_name', 'full_name'];
  }
  if (/\b(?:at|from|with|choosing|team at|company|welcome to)\b/i.test(prefix)) {
    return ['company', 'first_name'];
  }
  if (/\b(?:order|booking|invoice|bill|ticket|ref|reference|id)\b/i.test(prefix)) {
    return ['order_id', 'amount'];
  }
  if (/\b(?:amount|rs|inr|\$|total|balance|due|pay|fee|cost)\b/i.test(prefix)) {
    return ['amount', 'order_id'];
  }
  if (/\b(?:on|date|scheduled|appointment|valid till|expiry|till)\b/i.test(prefix)) {
    return ['date', 'time'];
  }
  if (/\b(?:code|coupon|promo|voucher|otp|pin)\b/i.test(prefix)) {
    return ['code'];
  }
  if (/\b(?:in|at|city|branch|store|location)\b/i.test(prefix)) {
    return ['city', 'company'];
  }

  // Fallbacks by variable index
  if (varId === '1') return ['first_name', 'full_name', 'company'];
  if (varId === '2') return ['company', 'order_id', 'amount'];
  if (varId === '3') return ['amount', 'date', 'order_id'];
  return ['amount', 'date', 'code'];
}

/**
 * Automatically maps CSV column headers to template variables with fuzzy string matching.
 */
export function autoMapCsvColumns(
  csvHeaders: string[],
  templateText: string,
  detectedVars: string[]
): AutoMappingResult[] {
  const results: AutoMappingResult[] = [];
  const assignedColumns = new Set<string>();

  // Exclude detected phone column from being auto-mapped to text variables if other columns exist
  const phoneCol = detectPhoneColumn(csvHeaders);
  if (csvHeaders.length > 1) {
    assignedColumns.add(phoneCol);
  }

  for (const varId of detectedVars) {
    const candidateConcepts = inferConceptFromTemplate(templateText, varId);
    let bestMatch: MatchCandidate | null = null;

    for (const concept of candidateConcepts) {
      const aliases = CANONICAL_CONCEPTS[concept] || [concept];

      for (const col of csvHeaders) {
        if (assignedColumns.has(col) && csvHeaders.length > detectedVars.length + 1) {
          continue; // Prioritize unused columns
        }

        const normCol = normalizeToken(col);
        for (const alias of aliases) {
          const sim = calculateSimilarity(normCol, alias);
          if (!bestMatch || sim > bestMatch.confidence) {
            bestMatch = {
              column: col,
              confidence: Math.round(sim * 100),
              concept
            };
          }
        }
      }

      if (bestMatch && bestMatch.confidence >= 80) {
        break; // High confidence match found
      }
    }

    if (bestMatch && bestMatch.confidence >= 55) {
      assignedColumns.add(bestMatch.column);
      results.push({
        variable: varId,
        column: bestMatch.column,
        confidence: bestMatch.confidence,
        concept: bestMatch.concept,
        reason: `Matched "${bestMatch.column}" to {{${varId}}} based on ${bestMatch.concept.replace('_', ' ')} (${bestMatch.confidence}% confidence)`
      });
    }
  }

  return results;
}

