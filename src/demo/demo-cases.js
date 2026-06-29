export const DEMO_CASES = [
  {
    id: 'DEMO-HOMEOWNER-001',
    audience: 'homeowner',
    title: 'Leaking balcony defect pathway',
    input: 'Homeowner reports leaking balcony, water stains, mould, and possible waterproofing defect with photos but no verified report yet.',
    evidence: [
      {
        source: 'photo-note',
        description: 'Photo shows water staining under balcony edge and damp wall lining.',
        status: 'unverified'
      }
    ],
    purpose: 'Show intake, evidence quality, restricted review boundary, assessment priority, and homeowner report output.'
  },
  {
    id: 'DEMO-BUILDER-001',
    audience: 'builder',
    title: 'Variation and defect dispute pathway',
    input: 'Builder dispute over variation invoice, incomplete rectification, cracked plaster, and warranty communication.',
    evidence: [
      {
        source: 'email-summary',
        description: 'Email records dispute over variation invoice and incomplete rectification date.',
        status: 'unverified'
      }
    ],
    purpose: 'Show builder-facing issue organisation and evidence record handling.'
  },
  {
    id: 'DEMO-GOVERNMENT-001',
    audience: 'government',
    title: 'Authority-facing compliance pathway',
    input: 'Resident asks whether council-approved work near boundary is compliant under NSW rules and wants an authority-ready record.',
    evidence: [
      {
        source: 'resident-note',
        description: 'Resident note describes boundary concern, council reference, and missing approval documents.',
        status: 'unverified'
      }
    ],
    purpose: 'Show government-facing report structure, unresolved item tracking, and no unsupported conclusion.'
  }
];

export function getDemoCase(id) {
  return DEMO_CASES.find((demoCase) => demoCase.id === id) || DEMO_CASES[0];
}
