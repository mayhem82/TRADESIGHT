import { analyzeImageRecord } from '../image/analyze-image-record.js';

export const imageModule = {
  id: 'image',
  name: 'Image DNA / As-Built Scanner',
  status: 'active',
  run(assessment) {
    const imageResult = analyzeImageRecord({
      description: assessment?.summary || '',
      observations: assessment?.summary ? [{ description: assessment.summary }] : []
    });

    return {
      moduleId: 'image',
      state: assessment?.state || 'CS7',
      confidence: imageResult.confidence,
      confidenceLabel: imageResult.confidenceLabel,
      observations: imageResult.observations,
      unresolvedItems: imageResult.unresolvedItems,
      notes: [
        'Image DNA pathway active.',
        'Visual observations are separated from conclusions.',
        imageResult.conclusionBoundary
      ]
    };
  }
};
