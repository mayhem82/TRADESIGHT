import { evidenceSummary } from '../lib/evidence-register.js';

export function buildReportSections({ reportType, audienceProfile, assessment, evidence = [] } = {}) {
  const summary = evidenceSummary(evidence);
  const sections = [
    buildOverviewSection(reportType, audienceProfile, assessment),
    buildAssessmentSection(assessment),
    buildEvidenceSection(summary),
    buildBoundarySection(assessment)
  ];

  if (audienceProfile?.includeActionPathway) {
    sections.push(buildActionPathwaySection(assessment));
  }

  return sections;
}

function buildOverviewSection(reportType, audienceProfile, assessment) {
  return {
    id: 'overview',
    title: 'Overview',
    lines: [
      `Report type: ${reportType?.label || 'TRADESIGHT Report'}`,
      `Audience: ${audienceProfile?.label || 'General'}`,
      `Purpose: ${reportType?.purpose || 'Evidence-based assessment pathway.'}`,
      `Issue summary: ${assessment?.summary || 'No assessment summary supplied.'}`
    ]
  };
}

function buildAssessmentSection(assessment) {
  return {
    id: 'assessment',
    title: 'Assessment',
    lines: [
      `Detected type: ${assessment?.type || 'unknown'}`,
      `Compliance state: ${assessment?.stateLabel || assessment?.state || 'CS7'}`,
      `State reason: ${assessment?.stateReason || 'Unknown until validated.'}`,
      `Risk: ${assessment?.riskLabel || assessment?.risk || 'Unclassified'}`,
      `Priority: ${assessment?.priority?.label || 'Not scored'} (${assessment?.priority?.score ?? 0})`,
      `Evidence completeness: ${assessment?.evidenceCompleteness?.label || 'Not scored'} (${assessment?.evidenceCompleteness?.score ?? 0})`
    ]
  };
}

function buildEvidenceSection(summary) {
  return {
    id: 'evidence',
    title: 'Evidence Register',
    lines: [
      `Evidence records: ${summary.total}`,
      `Verified evidence: ${summary.verified}`,
      `Unverified evidence: ${summary.unverified}`,
      `Possible duplicates: ${summary.duplicates || 0}`,
      `Average quality: ${summary.averageQuality || 0}%`
    ]
  };
}

function buildBoundarySection(assessment) {
  const unsupported = assessment?.unresolvedItems?.length
    ? assessment.unresolvedItems.join('; ')
    : 'No additional unresolved rule items recorded.';

  return {
    id: 'boundary',
    title: 'Boundary and Unsupported Items',
    lines: [
      `Boundary: ${assessment?.boundary || 'Evidence and rule validation required.'}`,
      `Conclusion status: ${assessment?.finalConclusionAllowed ? 'Available' : 'Not asserted'}`,
      `Unsupported or unresolved: ${unsupported}`
    ]
  };
}

function buildActionPathwaySection(assessment) {
  const pathway = assessment?.restricted
    ? 'Hold conclusion. Collect evidence and refer the restricted pathway to qualified review.'
    : 'Collect missing information, attach evidence records, and keep the pathway conditional until validated.';

  return {
    id: 'pathway',
    title: 'Action Pathway',
    lines: [pathway]
  };
}
