import { createEvidence } from '../models/evidence.js';
import { inferEvidenceType } from '../evidence/evidence-types.js';
import { tagEvidence } from '../evidence/tag-evidence.js';
import { scoreEvidenceQuality } from '../evidence/evidence-quality.js';

export function createEvidenceRecord(data = {}) {
  const type = data.type || inferEvidenceType(data);
  const tags = tagEvidence({ ...data, type });
  const quality = scoreEvidenceQuality({ ...data, type, tags });

  return createEvidence({
    id: data.id,
    source: data.source || 'user-input',
    description: data.description || '',
    status: data.status || 'unverified',
    type,
    tags,
    quality,
    confidence: data.confidence ?? quality.score / 100,
    timelineDate: data.timelineDate,
    observedAt: data.observedAt,
    duplicateOf: data.duplicateOf,
    createdAt: data.createdAt
  });
}
