export const MODULE_REGISTRY = {
  compliance: {
    id: 'compliance',
    name: 'Compliance Engine',
    scope: 'State classification and conservative boundary checks',
    status: 'active'
  },
  builder: {
    id: 'builder',
    name: "Builder's Advocate",
    scope: 'Defect, dispute, and project evidence support',
    status: 'scaffolded'
  },
  engineer: {
    id: 'engineer',
    name: "Engineer's Advocate",
    scope: 'Engineering review pathway and professional referral boundary',
    status: 'scaffolded'
  },
  image: {
    id: 'image',
    name: 'Image DNA / As-Built Scanner',
    scope: 'Photo and visual record assessment pathway',
    status: 'scaffolded'
  },
  materials: {
    id: 'materials',
    name: 'Materials & Specification Engine',
    scope: 'Material and specification review pathway',
    status: 'scaffolded'
  },
  hazard: {
    id: 'hazard',
    name: 'Hazard Prediction Engine',
    scope: 'Hazard identification and safety escalation pathway',
    status: 'scaffolded'
  },
  report: {
    id: 'report',
    name: 'Compliance Summary Generator',
    scope: 'Report and summary generation',
    status: 'active'
  }
};

export const TASK_MODULE_MAP = {
  compliance: ['compliance', 'report'],
  defect: ['image', 'builder', 'compliance', 'report'],
  plan: ['engineer', 'compliance', 'report'],
  dispute: ['builder', 'report'],
  materials: ['materials', 'compliance', 'report'],
  safety: ['hazard', 'compliance', 'report'],
  government: ['compliance', 'report'],
  unknown: ['compliance']
};

export function getModulesForTask(type = 'unknown') {
  const moduleIds = TASK_MODULE_MAP[type] || TASK_MODULE_MAP.unknown;
  return moduleIds.map((id) => MODULE_REGISTRY[id]);
}
