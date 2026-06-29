import { createEvidenceRecord } from './create-evidence-record.js';
import { findPossibleDuplicate } from '../evidence/evidence-quality.js';
import { createTimelineSummary } from '../evidence/timeline.js';

export function createEvidenceRegister(records = []) {
  return records.reduce((register, record) => appendEvidence(register, record), []);
}

export function appendEvidence(register = [], record = {}) {
  const created = createEvidenceRecord(record);
  const duplicate = findPossibleDuplicate(created, register);
  const enriched = duplicate ? { ...created, duplicateOf: duplicate.id } : created;
  return [...register, enriched];
}

export function evidenceSummary(register = []) {
  const timeline = createTimelineSummary(register);

  return {
    total: register.length,
    verified: register.filter((item) => item.status === 'verified').length,
    unverified: register.filter((item) => item.status !== 'verified').length,
    duplicates: register.filter((item) => item.duplicateOf).length,
    averageQuality: average(register.map((item) => item.quality?.score || 0)),
    timeline
  };
}

function average(values = []) {
  if (!values.length) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}
