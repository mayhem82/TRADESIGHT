export function createImageRecord(data = {}) {
  return {
    id: data.id || `IMG-${Date.now()}`,
    evidenceId: data.evidenceId || null,
    filename: data.filename || '',
    source: data.source || 'user-image',
    description: data.description || '',
    observedAt: data.observedAt || new Date().toISOString(),
    calibration: data.calibration || {
      scaleKnown: false,
      referenceObject: null,
      measurementAllowed: false
    },
    observations: data.observations || [],
    confidence: data.confidence ?? 0,
    conclusionBoundary: 'Visual observations support evidence triage only. They do not create a final compliance outcome without corroborating evidence and applicable rules.'
  };
}
