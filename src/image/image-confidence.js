export function scoreImageConfidence(imageRecord = {}) {
  let score = 0;
  const reasons = [];

  if (imageRecord.filename) {
    score += 15;
    reasons.push('Filename or image reference supplied.');
  }

  if (imageRecord.description) {
    score += 20;
    reasons.push('Image description supplied.');
  }

  if (imageRecord.observations?.length) {
    score += 25;
    reasons.push('Visual observations recorded.');
  }

  if (imageRecord.calibration?.scaleKnown) {
    score += 20;
    reasons.push('Scale or calibration context supplied.');
  }

  if (imageRecord.evidenceId) {
    score += 20;
    reasons.push('Image linked to evidence register.');
  }

  return {
    score: Math.min(score, 100),
    confidence: Math.min(score, 100) / 100,
    label: labelImageConfidence(score),
    reasons
  };
}

function labelImageConfidence(score) {
  if (score >= 75) return 'Strong visual record';
  if (score >= 45) return 'Usable visual record';
  if (score >= 20) return 'Partial visual record';
  return 'Weak visual record';
}
