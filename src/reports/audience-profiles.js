export const AUDIENCE_PROFILES = {
  homeowner: {
    label: 'Homeowner',
    tone: 'plain language',
    includeTechnicalBoundary: true,
    includeActionPathway: true
  },
  builder: {
    label: 'Builder',
    tone: 'trade and rectification focused',
    includeTechnicalBoundary: true,
    includeActionPathway: true
  },
  engineer: {
    label: 'Engineer',
    tone: 'technical brief',
    includeTechnicalBoundary: true,
    includeActionPathway: false
  },
  government: {
    label: 'Government or authority',
    tone: 'formal record',
    includeTechnicalBoundary: true,
    includeActionPathway: true
  },
  insurance: {
    label: 'Insurance',
    tone: 'claim evidence summary',
    includeTechnicalBoundary: true,
    includeActionPathway: true
  }
};

export function getAudienceProfile(audience = 'homeowner') {
  return AUDIENCE_PROFILES[audience] || AUDIENCE_PROFILES.homeowner;
}
