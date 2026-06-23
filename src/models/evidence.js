export function createEvidence(data = {}) {
  return {
    id: data.id || `EVID-${Date.now()}`,
    source: data.source || '',
    description: data.description || '',
    status: data.status || 'unverified',
    createdAt: data.createdAt || new Date().toISOString()
  };
}
