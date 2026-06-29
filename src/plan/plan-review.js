import { createPlanRecord } from './plan-record.js';
import { checkMissingPlanDetails } from './missing-detail-checks.js';

export function reviewPlan(data = {}) {
  const plan = createPlanRecord(data);
  const missingDetails = checkMissingPlanDetails(plan);
  const professionalBoundary = requiresProfessionalReview(plan);

  return {
    ...plan,
    missingDetails,
    professionalBoundary,
    reviewStatus: missingDetails.length ? 'incomplete' : 'ready-for-review',
    unresolvedItems: buildUnresolvedItems(plan, missingDetails, professionalBoundary)
  };
}

function requiresProfessionalReview(plan) {
  return ['structural-plan', 'services-plan'].includes(plan.drawingType);
}

function buildUnresolvedItems(plan, missingDetails, professionalBoundary) {
  const items = [];

  if (!plan.evidenceId) items.push('Plan is not linked to an evidence register item.');
  if (plan.scaleStatus !== 'known') items.push('Plan scale has not been verified.');
  if (missingDetails.length) items.push(`Missing plan details: ${missingDetails.join(', ')}.`);
  if (professionalBoundary) items.push('Professional review pathway required before design adequacy can be asserted.');

  return items;
}
