import { COMPLIANCE_STATES } from '../models/states.js';
import { evaluateBoundaries } from './boundaries.js';
import { evaluateComplianceRules } from '../compliance/evaluate-rules.js';

export function formatState(code = 'CS7') {
  return `${code} - ${COMPLIANCE_STATES[code] || COMPLIANCE_STATES.CS7}`;
}

export function classifyComplianceState({ type = 'unknown', input = '', missingInformation = [], jurisdiction = 'NSW' } = {}) {
  const boundaries = evaluateBoundaries(input);
  const ruleResult = evaluateComplianceRules({ type, input, jurisdiction });
  const hasInput = Boolean(input.trim());
  const hasMissingInformation = missingInformation.length > 0;

  if (!hasInput || type === 'unknown') {
    return buildState('CS7', 'The request is not specific enough to classify under NSW compliance boundaries.', boundaries, ruleResult);
  }

  if (ruleResult.highestRule) {
    return buildState(ruleResult.highestRule.state, ruleResult.highestRule.note, boundaries, ruleResult);
  }

  if (boundaries.urgentReview) {
    return buildState('CS6', 'Urgent or hazardous terms require a restricted review pathway.', boundaries, ruleResult);
  }

  if (boundaries.restricted) {
    return buildState('CS2', 'Licensed, certified, or restricted work signals require professional review.', boundaries, ruleResult);
  }

  if (boundaries.complianceClaim) {
    return buildState('CS3', 'A compliance claim was detected, but it must remain conditional until evidence is validated.', boundaries, ruleResult);
  }

  if (hasMissingInformation) {
    return buildState('CS4', 'The pathway can continue, but missing information prevents a final conclusion.', boundaries, ruleResult);
  }

  return buildState('CS7', 'No verified rule or evidence set has been supplied, so the outcome remains unknown.', boundaries, ruleResult);
}

function buildState(code, reason, boundaries, ruleResult) {
  return {
    code,
    label: formatState(code),
    reason,
    restricted: boundaries.requiresReview || ['CS2', 'CS6'].includes(code),
    finalConclusionAllowed: false,
    boundary: boundaries.note,
    jurisdiction: ruleResult?.jurisdiction,
    matchedRules: ruleResult?.matchedRules || [],
    unresolvedItems: ruleResult?.unresolvedItems || []
  };
}
