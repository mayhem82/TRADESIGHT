export function createProject(data = {}) {
  const createdAt = data.createdAt || new Date().toISOString();

  return {
    id: data.id || String(Date.now()),
    name: data.name || 'Untitled Project',
    assessments: data.assessments || [],
    evidence: data.evidence || [],
    versionHistory: data.versionHistory || [],
    auditTrail: data.auditTrail || [],
    status: data.status || null,
    createdAt,
    updatedAt: data.updatedAt || createdAt
  };
}
