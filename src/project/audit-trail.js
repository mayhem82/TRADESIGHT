export function createAuditEntry({ event = 'project-event', detail = '', targetId = null, timestamp } = {}) {
  return {
    id: `AUDIT-${Date.now()}`,
    event,
    detail,
    targetId,
    timestamp: timestamp || new Date().toISOString()
  };
}

export function appendAuditTrail(project = {}, entry = {}) {
  const auditTrail = project.auditTrail || [];
  return {
    ...project,
    auditTrail: [...auditTrail, createAuditEntry(entry)],
    updatedAt: new Date().toISOString()
  };
}
