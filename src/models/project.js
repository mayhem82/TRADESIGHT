export function createProject(data = {}) {
  return {
    id: data.id || String(Date.now()),
    name: data.name || 'Untitled Project',
    assessments: data.assessments || [],
    evidence: data.evidence || [],
    createdAt: data.createdAt || new Date().toISOString()
  };
}
