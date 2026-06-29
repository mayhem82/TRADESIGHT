export const RULE_SOURCES = {
  USER_SUPPLIED: {
    id: 'USER_SUPPLIED',
    label: 'User supplied evidence or instruction',
    verified: false
  },
  TRADESIGHT_BOUNDARY: {
    id: 'TRADESIGHT_BOUNDARY',
    label: 'TRADESIGHT conservative boundary rule',
    verified: true
  },
  REVIEW_REQUIRED: {
    id: 'REVIEW_REQUIRED',
    label: 'Requires qualified review',
    verified: true
  }
};

export function getRuleSource(id = 'TRADESIGHT_BOUNDARY') {
  return RULE_SOURCES[id] || RULE_SOURCES.TRADESIGHT_BOUNDARY;
}
