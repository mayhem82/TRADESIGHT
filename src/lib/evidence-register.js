import { createEvidenceRecord } from './create-evidence-record.js';

export function createEvidenceRegister(records = []) {
  return records.map((record) => createEvidenceRecord(record));
}

export function appendEvidence(register = [], record = {}) {
  return [...register, createEvidenceRecord(record)];
}

export function evidenceSummary(register = []) {
  return {
    total: register.length,
    verified: register.filter((item) => item.status === 'verified').length,
    unverified: register.filter((item) => item.status !== 'verified').length
  };
}
