export function searchProject(project = {}, query = '') {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const results = [];

  for (const assessment of project.assessments || []) {
    const text = `${assessment.id || ''} ${assessment.type || ''} ${assessment.summary || ''} ${assessment.stateLabel || ''}`.toLowerCase();
    if (text.includes(term)) {
      results.push({ type: 'assessment', id: assessment.id, item: assessment });
    }
  }

  for (const evidence of project.evidence || []) {
    const text = `${evidence.id || ''} ${evidence.source || ''} ${evidence.description || ''} ${(evidence.tags || []).join(' ')}`.toLowerCase();
    if (text.includes(term)) {
      results.push({ type: 'evidence', id: evidence.id, item: evidence });
    }
  }

  return results;
}
