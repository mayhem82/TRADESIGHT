export const APP_CONFIG = {
  name: 'TRADESIGHT',
  version: '0.1.0',
  jurisdiction: 'NSW',
  environment: 'local-browser',
  storageKey: 'tradesight-current-project',
  reportDefaultType: 'homeowner',
  boundaries: {
    finalComplianceOutcomeAllowed: false,
    unknownItemsRemainUnknown: true,
    qualifiedReviewRequiredForRestrictedPathways: true
  }
};

export function getAppConfig() {
  return APP_CONFIG;
}
