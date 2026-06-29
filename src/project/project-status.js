export function summariseProjectStatus(project = {}) {
  const assessments = project.assessments || [];
  const evidence = project.evidence || [];
  const latestAssessment = assessments[assessments.length - 1] || null;

  return {
    assessmentCount: assessments.length,
    evidenceCount: evidence.length,
    latestState: latestAssessment?.stateLabel || latestAssessment?.state || 'CS7',
    latestPriority: latestAssessment?.priority?.label || 'Not scored',
    restrictedItems: assessments.filter((assessment) => assessment.restricted).length,
    unresolvedItems: assessments.reduce((total, assessment) => total + (assessment.unresolvedItems?.length || 0), 0),
    statusLabel: labelProjectStatus({ assessments, evidence, latestAssessment })
  };
}

function labelProjectStatus({ assessments, evidence, latestAssessment }) {
  if (!assessments.length && !evidence.length) return 'Empty project';
  if (latestAssessment?.restricted) return 'Restricted review pathway';
  if (latestAssessment?.unresolvedItems?.length) return 'Open assessment pathway';
  if (evidence.length) return 'Evidence captured';
  return 'Assessment started';
}
