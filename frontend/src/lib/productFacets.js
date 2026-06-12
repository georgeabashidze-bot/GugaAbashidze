/**
 * Derive optional facets from a product's free-text fields.
 *
 * Returns:
 *   - lifeStage: 'puppy' | 'junior' | 'adult' | 'senior' | 'kitten' | 'cat' | null
 *   - sizeBucket: normalised weight string like "1 kg", "12.5 kg", "250 ml" or null
 *
 * Used by the catalogue filters when the back-end doesn't (yet) store these as
 * structured fields. Designed to be cheap and idempotent so we can run it on
 * every render.
 */
const LIFE_STAGE_KEYWORDS = [
  ['puppy',   /\b(puppy|puppies|ლეკვ)/i],
  ['junior',  /\b(junior|jr|მოზარდ)/i],
  ['senior',  /\b(senior|7\+|8\+|10\+|mature)/i],
  ['kitten',  /\b(kitten|kit\.?|კნუტ)/i],
  // adult must come last so 'puppy adult' counts as puppy
  ['adult',   /\b(adult|grown|ზრდასრულ|adulto)/i],
];

export function deriveLifeStage(product) {
  const haystack = [product?.name, product?.description, ...(product?.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  for (const [stage, re] of LIFE_STAGE_KEYWORDS) {
    if (re.test(haystack)) return stage;
  }
  if ((product?.pet_type || '') === 'cat') return 'cat';
  return null;
}

// Accepts "2kg", "2 kg", "2.5KG", "250 ml", "12.5 kg" etc.
const SIZE_RE = /(\d{1,4}(?:[.,]\d+)?)\s?(kg|gr?|ml|l)\b/i;

export function deriveSizeBucket(product) {
  if (product?.size) {
    const m = SIZE_RE.exec(product.size);
    if (m) return normaliseSize(m[1], m[2]);
  }
  const m = SIZE_RE.exec(product?.name || '');
  if (m) return normaliseSize(m[1], m[2]);
  return null;
}

function normaliseSize(amount, unit) {
  const u = unit.toLowerCase();
  // collapse 'g' and 'gr' to 'g'
  const unitNorm = u === 'gr' ? 'g' : u;
  const amt = String(amount).replace(',', '.');
  return `${amt} ${unitNorm}`;
}

/** Sort sizes naturally (1kg < 2kg < 10kg, not lexically). */
export function compareSizes(a, b) {
  const re = /^(\d+(?:\.\d+)?)\s?([a-z]+)$/i;
  const ma = re.exec(a);
  const mb = re.exec(b);
  if (!ma || !mb) return a.localeCompare(b);
  const ua = ma[2].toLowerCase();
  const ub = mb[2].toLowerCase();
  if (ua !== ub) return ua.localeCompare(ub);
  return parseFloat(ma[1]) - parseFloat(mb[1]);
}

export const LIFE_STAGE_LABELS = {
  puppy:  'Puppy',
  junior: 'Junior',
  adult:  'Adult',
  senior: 'Senior',
  kitten: 'Kitten',
  cat:    'Cat',
};
