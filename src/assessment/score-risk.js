export function scoreAssessmentRisk({ state = 'CS7', risk = 'Unclassified', unresolvedItems = [], matchedRules = [] } = {}) {
  let score = 0;
  const reasons = [];

  if (state === 'CS6') {
    score += 45;
    reasons.push('Restricted pathway state detected.');
  } else if (state === 'CS2') {
    score += 35;
    reasons.push('Qualified review state detected.');
  } else if (state === 'CS3' || state === 'CS4') {
    score += 20;
    reasons.push('Conditional or revision pathway detected.');
  } else if (state === 'CS7') {
    score += 15;
    reasons.push('Unknown state requires conservative handling.');
  }

  if (/high/i.test(risk)) {
    score += 30;
    reasons.push('High risk label present.');
  } else if (/medium/i.test(risk)) {
    score += 18;
    reasons.push('Medium risk label present.');
  }

  if (unresolvedItems.length) {
    score += Math.min(unresolvedItems.length * 5, 20);
    reasons.push(`${unresolvedItems.length} unresolved item(s) present.`);
  }

  if (matchedRules.length) {
    score += 5;
    reasons.push(`${matchedRules.length} rule match(es) present.`);
  }

  const cappedScore = Math.min(score, 100);

  return {
    score: cappedScore,
    label: labelRiskScore(cappedScore),
    reasons
  };
}

function labelRiskScore(score) {
  if (score >= 75) return 'Priority review required';
  if (score >= 45) return 'Elevated review priority';
  if (score >= 20) return 'Managed review priority';
  return 'Low information priority';
}
