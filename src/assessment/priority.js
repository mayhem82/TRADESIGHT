export function calculateAssessmentPriority({ riskScore, evidenceCompleteness, restricted = false } = {}) {
  const risk = riskScore?.score || 0;
  const completeness = evidenceCompleteness?.score || 0;
  const evidenceGap = 100 - completeness;
  const score = Math.min(risk + Math.round(evidenceGap * 0.25) + (restricted ? 15 : 0), 100);

  return {
    score,
    label: labelPriority(score),
    reasons: [
      `Risk score: ${risk}.`,
      `Evidence completeness: ${completeness}.`,
      restricted ? 'Restricted pathway increases priority.' : 'No restricted pathway flag added.'
    ]
  };
}

function labelPriority(score) {
  if (score >= 80) return 'Top priority';
  if (score >= 55) return 'High priority';
  if (score >= 30) return 'Standard priority';
  return 'Low priority';
}
