export const JURISDICTIONS = {
  NSW: {
    id: 'NSW',
    name: 'New South Wales',
    country: 'Australia',
    default: true
  },
  AU: {
    id: 'AU',
    name: 'Australia',
    country: 'Australia',
    default: false
  }
};

export function resolveJurisdiction(id = 'NSW') {
  return JURISDICTIONS[id] || JURISDICTIONS.NSW;
}
