export function scoreEvidenceQuality(record = {}) {
  const reasons = [];
  let score = 0;

  if (record.description?.trim()) {
    score += 25;
    reasons.push('Description supplied.');
  }

  if (record.source?.trim()) {
    score += 20;
    reasons.push('Source supplied.');
  }

  if (record.type && record.type !== 'unknown') {
    score += 15;
    reasons.push('Evidence type identified.');
  }

  if (record.timelineDate || record.observedAt || record.createdAt) {
    score += 15;
    reasons.push('Timeline date available.');
  }

  if (record.tags?.length) {
    score += 10;
    reasons.push('Tags assigned.');
  }

  if (record.status === 'verified') {
    score += 15;
    reasons.push('Record is marked verified.');
  }

  return {
    score: Math.min(score, 100),
    label: labelScore(score),
    reasons
  };
}

export function findPossibleDuplicate(record, register = []) {
  const description = normalise(record.description);
  if (!description) return null;

  return register.find((item) => item.id !== record.id && normalise(item.description) === description) || null;
}

function labelScore(score) {
  if (score >= 75) return 'Strong evidence record';
  if (score >= 45) return 'Usable evidence record';
  if (score >= 20) return 'Partial evidence record';
  return 'Weak evidence record';
}

function normalise(value = '') {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}
