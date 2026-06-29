import { createReport } from '../models/report.js';
import { resolveReportType } from '../reports/report-types.js';
import { getAudienceProfile } from '../reports/audience-profiles.js';
import { buildReportSections } from '../reports/build-report-sections.js';

export function generateReport({ assessment, evidence = [], type = 'homeowner' } = {}) {
  const reportType = resolveReportType(type);
  const audienceProfile = getAudienceProfile(reportType.audience);
  const sections = buildReportSections({ reportType, audienceProfile, assessment, evidence });
  const findings = sections.flatMap((section) => section.lines.map((line) => `${section.title}: ${line}`));

  return createReport({
    title: `TRADESIGHT ${reportType.label}`,
    type: reportType.id,
    audience: reportType.audience,
    purpose: reportType.purpose,
    summary: assessment?.summary || 'No assessment summary supplied.',
    sections,
    findings,
    unsupportedItems: assessment?.unresolvedItems || []
  });
}

export function reportToText(report) {
  const sections = (report.sections || []).map((section) => {
    const lines = (section.lines || []).map((item) => `- ${item}`).join('\n');
    return `${section.title}\n${lines}`;
  }).join('\n\n');

  if (sections) {
    return `${report.title}\n\n${report.summary}\n\n${sections}`;
  }

  const findings = (report.findings || []).map((item) => `- ${item}`).join('\n');
  return `${report.title}\n\n${report.summary}\n\nFindings\n${findings}`;
}
