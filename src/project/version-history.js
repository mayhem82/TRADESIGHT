export function createVersionEntry({ action = 'update', summary = '', actor = 'TRADESIGHT', timestamp } = {}) {
  return {
    id: `VER-${Date.now()}`,
    action,
    summary,
    actor,
    timestamp: timestamp || new Date().toISOString()
  };
}

export function appendVersionHistory(project = {}, entry = {}) {
  const history = project.versionHistory || [];
  return {
    ...project,
    versionHistory: [...history, createVersionEntry(entry)],
    updatedAt: new Date().toISOString()
  };
}
