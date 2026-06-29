export function createRuntimeState(data = {}) {
  return {
    id: data.id || `RUN-${Date.now()}`,
    status: data.status || 'idle',
    input: data.input || '',
    assessment: data.assessment || null,
    evidence: data.evidence || [],
    evidenceSummary: data.evidenceSummary || null,
    report: data.report || null,
    project: data.project || null,
    events: data.events || [],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

export function completeRuntimeState(state = {}, updates = {}) {
  return createRuntimeState({
    ...state,
    ...updates,
    status: updates.status || 'complete',
    updatedAt: new Date().toISOString()
  });
}
