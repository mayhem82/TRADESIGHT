export function createEvidence(data = {}) {
  return {
    id: data.id || `EVID-${Date.now()}`,
    source: data.source || '',
    description: data.description || '',
    status: data.status || 'unverified',
    type: data.type || 'unknown',
    tags: data.tags || [],
    attachments: data.attachments || [],
    attachmentSummary: data.attachmentSummary || null,
    confidence: data.confidence ?? 0,
    quality: data.quality || null,
    timelineDate: data.timelineDate || data.observedAt || data.createdAt || new Date().toISOString(),
    observedAt: data.observedAt || null,
    duplicateOf: data.duplicateOf || null,
    createdAt: data.createdAt || new Date().toISOString()
  };
}
