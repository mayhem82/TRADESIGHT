import { createReport } from '../models/report.js';
import { evidenceSummary } from './evidence-register.js';

export function generateReport({ assessment, evidence = [] } = {}) {
  const summary = evidenceSummary(evidence);

  return createReport({
    title: 'TRADESIGHT Assessment Report',
    summary: assessment?.summary || 'No assessment summary supplied.',
    findings: [
      `Assessment type: ${assessment?.type || 'unknown'}`,
      `State: ${assessment?.state || 'CS7'}`,
      `Risk: ${assessment?.risk || 'Unclassified'}`,
      `Evidence records: ${summary.total}`,
      `Verified evidence: ${summary.verified}`,
      `Unverified evidence: ${summary.unverified}`
    ]
  });
}

export function reportToText(report) {
  const findings = (report.findings || []).map((item) => `- ${item}`).join('\n');
  return `${report.title}\n\n${report.summary}\n\nFindings\n${findings}`;
}
