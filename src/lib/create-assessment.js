import { createAssessment } from '../models/assessment.js';
import { classifyComplianceState } from './classify-state.js';
import { classifyRisk } from './risk-classifier.js';
import { classifyTask } from './classify-task.js';
import { getRequiredInformation } from './required-information.js';
import { scoreAssessmentRisk } from '../assessment/score-risk.js';
import { scoreEvidenceCompleteness } from '../assessment/evidence-completeness.js';
import { calculateAssessmentPriority } from '../assessment/priority.js';
import { runAgentPipeline } from '../agents/run-agent-pipeline.js';

export function createAssessmentFromInput(input = '', context = {}) {
  const type = classifyTask(input);
  const missingInformation = getRequiredInformation(type);
  const complianceState = classifyComplianceState({ type, input, missingInformation });
  const risk = classifyRisk({ type, input, stateCode: complianceState.code });
  const riskScore = scoreAssessmentRisk({
    state: complianceState.code,
    risk: risk.level,
    unresolvedItems: complianceState.unresolvedItems,
    matchedRules: complianceState.matchedRules
  });
  const evidenceCompleteness = scoreEvidenceCompleteness({
    evidenceSummary: context.evidenceSummary,
    requiredInformation: missingInformation
  });
  const priority = calculateAssessmentPriority({
    riskScore,
    evidenceCompleteness,
    restricted: complianceState.restricted
  });

  const assessment = {
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
    riskScore,
    evidenceCompleteness,
    priority,
    missingInformation
  };

  return {
    ...assessment,
    agentPipeline: runAgentPipeline({
      assessment,
      evidenceSummary: context.evidenceSummary,
      report: context.report || { type: context.reportType || 'homeowner' }
    })
  };
}
