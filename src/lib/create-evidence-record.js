import { createEvidence } from '../models/evidence.js';

export function createEvidenceRecord(data = {}) {
  return createEvidence({
    id: data.id,
    source: data.source || 'user-input',
    description: data.description || '',
    status: data.status || 'unverified',
    createdAt: data.createdAt
  });
}
