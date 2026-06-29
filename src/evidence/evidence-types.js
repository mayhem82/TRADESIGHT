export const EVIDENCE_TYPES = {
  NOTE: 'note',
  PHOTO: 'photo',
  DOCUMENT: 'document',
  PLAN: 'plan',
  OBSERVATION: 'observation',
  CORRESPONDENCE: 'correspondence',
  UNKNOWN: 'unknown'
};

export function inferEvidenceType({ source = '', description = '' } = {}) {
  const text = `${source} ${description}`.toLowerCase();

  if (/photo|image|jpg|jpeg|png|heic/.test(text)) return EVIDENCE_TYPES.PHOTO;
  if (/plan|drawing|sketch|pdf/.test(text)) return EVIDENCE_TYPES.PLAN;
  if (/email|letter|message|correspondence/.test(text)) return EVIDENCE_TYPES.CORRESPONDENCE;
  if (/document|report|file|attachment/.test(text)) return EVIDENCE_TYPES.DOCUMENT;
  if (/observed|saw|inspection|site/.test(text)) return EVIDENCE_TYPES.OBSERVATION;
  if (description.trim()) return EVIDENCE_TYPES.NOTE;

  return EVIDENCE_TYPES.UNKNOWN;
}
