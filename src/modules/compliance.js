import { classifyComplianceState } from '../lib/classify-state.js';

export const complianceModule = {
  id: 'compliance',
  name: 'Compliance Engine',
  status: 'active',
  run(assessment) {
    const result = classifyComplianceState({
      type: assessment?.type,
      input: assessment?.summary,
      missingInformation: assessment?.missingInformation || []
    });

    return {
      moduleId: 'compliance',
      state: result.code,
      label: result.label,
      restricted: result.restricted,
      finalConclusionAllowed: result.finalConclusionAllowed,
      jurisdiction: result.jurisdiction,
      matchedRules: result.matchedRules,
      unresolvedItems: result.unresolvedItems,
      notes: [result.reason, result.boundary]
    };
  }
};
