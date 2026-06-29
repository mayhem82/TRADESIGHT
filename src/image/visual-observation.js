export const VISUAL_OBSERVATION_TYPES = {
  DEFECT_SIGNAL: 'defect-signal',
  MATERIAL_SIGNAL: 'material-signal',
  HAZARD_SIGNAL: 'hazard-signal',
  MOISTURE_SIGNAL: 'moisture-signal',
  UNKNOWN: 'unknown'
};

export function createVisualObservation(data = {}) {
  return {
    id: data.id || `OBS-${Date.now()}`,
    type: data.type || inferObservationType(data.description),
    description: data.description || '',
    location: data.location || '',
    confidence: data.confidence ?? estimateObservationConfidence(data.description),
    requiresCorroboration: true,
    boundary: 'Observation only. Verification requires supporting evidence, context, and applicable rule checks.'
  };
}

export function inferObservationType(description = '') {
  const text = description.toLowerCase();

  if (/crack|gap|movement|damage|rot|failed|defect/.test(text)) return VISUAL_OBSERVATION_TYPES.DEFECT_SIGNAL;
  if (/timber|steel|concrete|brick|sheet|cladding|membrane/.test(text)) return VISUAL_OBSERVATION_TYPES.MATERIAL_SIGNAL;
  if (/unsafe|fall|exposed|sharp|collapse|danger/.test(text)) return VISUAL_OBSERVATION_TYPES.HAZARD_SIGNAL;
  if (/water|leak|moisture|damp|mould|stain/.test(text)) return VISUAL_OBSERVATION_TYPES.MOISTURE_SIGNAL;

  return VISUAL_OBSERVATION_TYPES.UNKNOWN;
}

export function estimateObservationConfidence(description = '') {
  if (!description.trim()) return 0;
  if (description.length > 120) return 0.65;
  if (description.length > 40) return 0.45;
  return 0.25;
}
