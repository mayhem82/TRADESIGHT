export const RESTRICTED_WORK_PATTERNS = [
  /licensed/i,
  /licen[cs]e/i,
  /certified/i,
  /certifier/i,
  /structural/i,
  /load[- ]?bearing/i,
  /waterproof/i,
  /waterproofing/i,
  /electrical/i,
  /plumbing/i,
  /gas/i,
  /fire safety/i,
  /asbestos/i,
  /excavation/i,
  /demolition/i
];

export const URGENT_REVIEW_PATTERNS = [
  /collapse/i,
  /unsafe/i,
  /immediate danger/i,
  /fire/i,
  /fall risk/i,
  /severe leak/i,
  /mould/i,
  /asbestos/i
];

export const COMPLIANCE_CLAIM_PATTERNS = [
  /compliant/i,
  /approved/i,
  /certified/i,
  /meets? the standard/i,
  /legal/i,
  /allowed/i
];

export function matchesAny(text = '', patterns = []) {
  return patterns.some((pattern) => pattern.test(text));
}

export function evaluateBoundaries(input = '') {
  const text = input.trim();
  const restricted = matchesAny(text, RESTRICTED_WORK_PATTERNS);
  const urgentReview = matchesAny(text, URGENT_REVIEW_PATTERNS);
  const complianceClaim = matchesAny(text, COMPLIANCE_CLAIM_PATTERNS);

  return {
    restricted,
    urgentReview,
    complianceClaim,
    requiresReview: restricted || urgentReview,
    finalConclusionAllowed: false,
    note: restricted || urgentReview
      ? 'Professional review required before any compliance outcome can be asserted.'
      : 'TRADESIGHT can prepare a conservative pathway, but final compliance remains unverified until evidence and rules are validated.'
  };
}
