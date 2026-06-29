import { createAssessment } from '../models/assessment.js';
import { classifyComplianceState } from './classify-state.js';
import { classifyRisk } from './risk-classifier.js';
import { classifyTask } from './classify-task.js';
import { getRequiredInformation } from './required-information.js';

export function createAssessmentFromInput(input = '') {
  const type = classifyTask(input);
  const missingInformation = getRequiredInformation(type);
  const complianceState = classifyComplianceState({ type, input, missingInformation });
  const risk = classifyRisk({ type, input, stateCode: complianceState.code });

  return {
    ...createAssessment({
      type,
      summary: input,
      state: complianceState.code,
      risk: risk.level
    }),
    stateLabel: complianceState.label,
    stateReason: complianceState.reason,
    boundary: complianceState.boundary,
    jurisdiction: complianceState.jurisdiction,
    matchedRules: complianceState.matchedRules,
    unresolvedItems: complianceState.unresolvedItems,
    restricted: complianceState.restricted,
    finalConclusionAllowed: complianceState.finalConclusionAllowed,
    riskLabel: risk.label,
    riskReasons: risk.reasons,
    missingInformation
  };
}
