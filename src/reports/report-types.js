export const REPORT_TYPES = {
  HOMEOWNER: {
    id: 'homeowner',
    label: 'Homeowner Report',
    audience: 'homeowner',
    purpose: 'Plain-language issue summary and next-step pathway.'
  },
  BUILDER: {
    id: 'builder',
    label: 'Builder Report',
    audience: 'builder',
    purpose: 'Defect, evidence, and rectification pathway summary.'
  },
  ENGINEER: {
    id: 'engineer',
    label: 'Engineer Brief',
    audience: 'engineer',
    purpose: 'Technical review brief with boundaries and unresolved items.'
  },
  GOVERNMENT: {
    id: 'government',
    label: 'Government Submission',
    audience: 'government',
    purpose: 'Structured record for authority review or escalation.'
  },
  INSURANCE: {
    id: 'insurance',
    label: 'Insurance Report',
    audience: 'insurance',
    purpose: 'Evidence and impact summary for claim preparation.'
  }
};

export function resolveReportType(type = 'homeowner') {
  return Object.values(REPORT_TYPES).find((reportType) => reportType.id === type) || REPORT_TYPES.HOMEOWNER;
}
