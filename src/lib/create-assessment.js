import { createAssessment } from '../models/assessment.js';
import { classifyTask } from './classify-task.js';
import { getRequiredInformation } from './required-information.js';

export function createAssessmentFromInput(input = '') {
  const type = classifyTask(input);
  const missingInformation = getRequiredInformation(type);

  return {
    ...createAssessment({
      type,
      summary: input,
      state: type === 'unknown' ? 'CS7' : 'CS7',
      risk: type === 'unknown' ? 'Unclassified' : 'Pending review'
    }),
    missingInformation
  };
}
