import { createReport } from '../models/report.js';
import { evidenceSummary } from './evidence-register.js';

export function generateReport({ assessment, evidence = [] } = {}) {
  const summary = evidenceSummary(evidence);
  const finalConclusion = assessment?.finalConclusionAllowed
    ? 'Validated final conclusion available.'
    : 'No final compliance conclusion is asserted by TRADESIGHT.';

  return createReport({
    title: 'TRADESIGHT Assessment Report',
    summary: assessment?.summary || 'No assessment summary supplied.',
    findings: [
      `Assessment type: ${assessment?.type || 'unknown'}`,
      `State: ${assessment?.stateLabel || assessment?.state || 'CS7'}`,
      `State reason: ${assessment?.stateReason || 'Unknown until validated.'}`,
      `Boundary: ${assessment?.boundary || 'Evidence and rule validation required.'}`,
      `Risk: ${assessment?.riskLabel || assessment?.risk || 'Unclassified'}`,
      `Evidence records: ${summary.total}`,
      `Verified evidence: ${summary.verified}`,
      `Unverified evidence: ${summary.unverified}`,
      finalConclusion
    ]
  });
}

export function reportToText(report) {
  const findings = (report.findings || []).map((item) => `- ${item}`).join('\n');
  return `${report.title}\n\n${report.summary}\n\nFindings\n${findings}`;
}
