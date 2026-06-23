export const COMPLIANCE_STATES = {
  CS1: 'Fully Compliant',
  CS2: 'Professional Review Required',
  CS3: 'Conditional User Action',
  CS4: 'Revision Recommended',
  CS5: 'Revision Required',
  CS6: 'Restricted Pathway',
  CS7: 'Unknown'
};

export function isValidState(state) {
  return Object.keys(COMPLIANCE_STATES).includes(state);
}
