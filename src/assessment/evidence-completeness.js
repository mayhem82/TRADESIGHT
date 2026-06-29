export function scoreEvidenceCompleteness({ evidenceSummary, requiredInformation = [] } = {}) {
  const totalEvidence = evidenceSummary?.total || 0;
  const verifiedEvidence = evidenceSummary?.verified || 0;
  const averageQuality = evidenceSummary?.averageQuality || 0;
  const missingCount = requiredInformation.length;

  let score = 0;
  const reasons = [];

  if (totalEvidence > 0) {
    score += Math.min(totalEvidence * 10, 30);
    reasons.push(`${totalEvidence} evidence record(s) captured.`);
  }

  if (verifiedEvidence > 0) {
    score += Math.min(verifiedEvidence * 12, 24);
    reasons.push(`${verifiedEvidence} verified evidence record(s) captured.`);
  }

  if (averageQuality > 0) {
    score += Math.round(averageQuality * 0.3);
    reasons.push(`Average evidence quality is ${averageQuality}%.`);
  }

  if (missingCount === 0) {
    score += 16;
    reasons.push('No required information items are outstanding.');
  } else {
    reasons.push(`${missingCount} required information item(s) remain outstanding.`);
  }

  const cappedScore = Math.min(score, 100);

  return {
    score: cappedScore,
    label: labelCompleteness(cappedScore),
    reasons,
    missingCount
  };
}

function labelCompleteness(score) {
  if (score >= 80) return 'Strong evidence completeness';
  if (score >= 55) return 'Moderate evidence completeness';
  if (score >= 25) return 'Partial evidence completeness';
  return 'Low evidence completeness';
}
