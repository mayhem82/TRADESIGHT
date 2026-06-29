export const COMPLIANCE_RULES = [
  {
    id: 'TS-NSW-BOUNDARY-001',
    jurisdiction: 'NSW',
    sourceId: 'REVIEW_REQUIRED',
    appliesTo: ['defect', 'plan', 'materials', 'safety', 'compliance', 'unknown'],
    pattern: 'licensed|licence|license|certified|certifier|structural|load bearing|load-bearing|waterproof|waterproofing|electrical|plumbing|gas|fire safety|asbestos|excavation|demolition',
    state: 'CS2',
    confidence: 0.88,
    note: 'Restricted or licensed-work signals require qualified review before TRADESIGHT can assert a pathway outcome.'
  },
  {
    id: 'TS-NSW-BOUNDARY-002',
    jurisdiction: 'NSW',
    sourceId: 'REVIEW_REQUIRED',
    appliesTo: ['defect', 'safety', 'compliance', 'unknown'],
    pattern: 'collapse|unsafe|immediate danger|fire|fall risk|severe leak|mould|asbestos',
    state: 'CS6',
    confidence: 0.92,
    note: 'Urgent or hazardous signals require a restricted review pathway and should not be resolved by app output alone.'
  },
  {
    id: 'TS-NSW-BOUNDARY-003',
    jurisdiction: 'NSW',
    sourceId: 'TRADESIGHT_BOUNDARY',
    appliesTo: ['compliance', 'defect', 'plan', 'materials', 'safety'],
    pattern: 'compliant|approved|certified|meets the standard|meet the standard|legal|allowed',
    state: 'CS3',
    confidence: 0.64,
    note: 'Compliance language can be recorded, but the result remains conditional until evidence and rule sources are validated.'
  },
  {
    id: 'TS-NSW-BOUNDARY-004',
    jurisdiction: 'NSW',
    sourceId: 'TRADESIGHT_BOUNDARY',
    appliesTo: ['unknown'],
    pattern: '',
    state: 'CS7',
    confidence: 0.5,
    note: 'Unknown requests remain unknown until the task, evidence, and applicable rule path are identified.'
  }
];

export function getRulesForTask(type = 'unknown', jurisdiction = 'NSW') {
  return COMPLIANCE_RULES.filter((rule) => {
    const jurisdictionMatches = rule.jurisdiction === jurisdiction;
    const taskMatches = rule.appliesTo.includes(type) || rule.appliesTo.includes('unknown');
    return jurisdictionMatches && taskMatches;
  });
}
