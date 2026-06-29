export function createPlanRecord(data = {}) {
  return {
    id: data.id || `PLAN-${Date.now()}`,
    evidenceId: data.evidenceId || null,
    filename: data.filename || '',
    drawingType: data.drawingType || inferDrawingType(data.description || data.filename || ''),
    description: data.description || '',
    scaleStatus: data.scaleStatus || 'unknown',
    reviewNotes: data.reviewNotes || [],
    missingDetails: data.missingDetails || [],
    createdAt: data.createdAt || new Date().toISOString(),
    boundary: 'Plan review identifies missing details and review pathways. It does not certify design adequacy.'
  };
}

export function inferDrawingType(text = '') {
  const value = text.toLowerCase();

  if (/site|setback|boundary|survey/.test(value)) return 'site-plan';
  if (/floor|layout|room/.test(value)) return 'floor-plan';
  if (/section|elevation|detail/.test(value)) return 'detail-drawing';
  if (/hydraulic|plumbing|drainage/.test(value)) return 'services-plan';
  if (/structural|footing|beam|slab|pier/.test(value)) return 'structural-plan';

  return 'unknown';
}
