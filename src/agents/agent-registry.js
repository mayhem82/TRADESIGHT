export const AGENT_REGISTRY = {
  intake: {
    id: 'intake',
    name: 'Intake Agent',
    scope: 'Capture user request, classify task, and preserve uncertainty.',
    status: 'active'
  },
  compliance: {
    id: 'compliance',
    name: 'Compliance Agent',
    scope: 'Apply conservative compliance state and rule provenance checks.',
    status: 'active'
  },
  evidence: {
    id: 'evidence',
    name: 'Evidence Agent',
    scope: 'Summarise evidence status, quality, and gaps.',
    status: 'active'
  },
  plan: {
    id: 'plan',
    name: 'Plan Review Agent',
    scope: 'Review plan pathway, missing details, and qualified review boundaries.',
    status: 'active'
  },
  image: {
    id: 'image',
    name: 'Image DNA Agent',
    scope: 'Separate visual observations from conclusions.',
    status: 'active'
  },
  report: {
    id: 'report',
    name: 'Report Agent',
    scope: 'Prepare audience-aware evidence-based report sections.',
    status: 'active'
  },
  builder: {
    id: 'builder',
    name: "Builder's Advocate",
    scope: 'Route building defect, dispute, and rectification pathway matters.',
    status: 'active'
  },
  engineer: {
    id: 'engineer',
    name: "Engineer's Advocate",
    scope: 'Route structural, services, and design adequacy items to qualified review.',
    status: 'active'
  },
  government: {
    id: 'government',
    name: 'Government Review Agent',
    scope: 'Prepare structured authority-facing review pathway.',
    status: 'active'
  }
};

export function getAgent(id) {
  return AGENT_REGISTRY[id] || null;
}
