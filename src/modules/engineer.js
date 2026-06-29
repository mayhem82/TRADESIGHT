import { reviewPlan } from '../plan/plan-review.js';

export const engineerModule = {
  id: 'engineer',
  name: "Engineer's Advocate",
  status: 'active',
  run(assessment) {
    const planResult = reviewPlan({
      description: assessment?.summary || '',
      reviewNotes: assessment?.missingInformation || [],
      scaleStatus: 'unknown'
    });

    return {
      moduleId: 'engineer',
      state: assessment?.state || 'CS7',
      drawingType: planResult.drawingType,
      reviewStatus: planResult.reviewStatus,
      missingDetails: planResult.missingDetails,
      unresolvedItems: planResult.unresolvedItems,
      professionalBoundary: planResult.professionalBoundary,
      notes: [
        'Plan review pathway active.',
        'Missing details are separated from conclusions.',
        planResult.boundary
      ]
    };
  }
};
