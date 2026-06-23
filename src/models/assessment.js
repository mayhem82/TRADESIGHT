export function createAssessment(data = {}) {
  return {
    id: data.id || String(Date.now()),
    type: data.type || 'unknown',
    summary: data.summary || '',
    state: data.state || 'CS7',
    risk: data.risk || 'Unclassified',
    createdAt: data.createdAt || new Date().toISOString()
  };
}
