import { createImageRecord } from './image-record.js';
import { createVisualObservation } from './visual-observation.js';
import { scoreImageConfidence } from './image-confidence.js';

export function analyzeImageRecord(data = {}) {
  const observations = (data.observations || []).map((observation) => createVisualObservation(observation));
  const imageRecord = createImageRecord({
    ...data,
    observations
  });
  const confidence = scoreImageConfidence(imageRecord);

  return {
    ...imageRecord,
    confidence: confidence.confidence,
    confidenceLabel: confidence.label,
    confidenceReasons: confidence.reasons,
    unresolvedItems: buildUnresolvedItems(imageRecord)
  };
}

function buildUnresolvedItems(imageRecord) {
  const items = [];

  if (!imageRecord.evidenceId) items.push('Image is not linked to an evidence register item.');
  if (!imageRecord.calibration?.scaleKnown) items.push('No scale or measurement calibration supplied.');
  if (!imageRecord.observations?.length) items.push('No visual observations have been recorded.');

  return items;
}
