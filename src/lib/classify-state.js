import { COMPLIANCE_STATES } from '../models/states.js';
import { evaluateBoundaries } from './boundaries.js';

export function formatState(code = 'CS7') {
  return `${code} - ${COMPLIANCE_STATES[code] || COMPLIANCE_STATES.CS7}`;
}

export function classifyComplianceState({ type = 'unknown', input = '', missingInformation = [] } = {}) {
  const boundaries = evaluateBoundaries(input);
  const hasInput = Boolean(input.trim());
  const hasMissingInformation = missingInformation.length > 0;

  if (!hasInput || type === 'unknown') {
    return buildState('CS7', 'The request is not specific enough to classify under NSW compliance boundaries.', boundaries);
  }

  if (boundaries.urgentReview) {
    return buildState('CS6', 'Urgent or hazardous terms require a restricted review pathway.', boundaries);
  }

  if (boundaries.restricted) {
    return buildState('CS2', 'Licensed, certified, or restricted work signals require professional review.', boundaries);
  }

  if (boundaries.complianceClaim) {
    return buildState('CS3', 'A compliance claim was detected, but it must remain conditional until evidence is validated.', boundaries);
  }

  if (hasMissingInformation) {
    return buildState('CS4', 'The pathway can continue, but missing information prevents a final conclusion.', boundaries);
  }

  return buildState('CS7', 'No verified rule or evidence set has been supplied, so the outcome remains unknown.', boundaries);
}

function buildState(code, reason, boundaries) {
  return {
    code,
    label: formatState(code),
    reason,
    restricted: boundaries.requiresReview,
    finalConclusionAllowed: boundaries.finalConclusionAllowed,
    boundary: boundaries.note
  };
}
