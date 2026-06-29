export const REQUIRED_PLAN_DETAILS = {
  'site-plan': ['boundaries', 'setbacks', 'north point', 'site access'],
  'floor-plan': ['room labels', 'dimensions', 'openings', 'wet areas'],
  'detail-drawing': ['materials', 'junctions', 'dimensions', 'fixing method'],
  'services-plan': ['service type', 'connection points', 'fall direction', 'licensed review path'],
  'structural-plan': ['member sizes', 'loads not assumed', 'support points', 'qualified review path'],
  unknown: ['drawing type', 'scale', 'dimensions', 'purpose']
};

export function checkMissingPlanDetails(plan = {}) {
  const required = REQUIRED_PLAN_DETAILS[plan.drawingType] || REQUIRED_PLAN_DETAILS.unknown;
  const text = `${plan.description || ''} ${(plan.reviewNotes || []).join(' ')}`.toLowerCase();

  return required.filter((item) => !text.includes(item.toLowerCase()));
}
