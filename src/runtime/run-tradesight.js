import { routeIntake } from '../agents/intake-router.js';
import { createAssessmentFromInput } from '../lib/create-assessment.js';
import { createEvidenceRegister, evidenceSummary } from '../lib/evidence-register.js';
import { generateReport } from '../lib/generate-report.js';
import { createProject } from '../models/project.js';
import { summariseProjectStatus } from '../project/project-status.js';
import { createRuntimeState, completeRuntimeState } from './runtime-state.js';
import { appendRuntimeEvent } from './runtime-events.js';

export function runTradesight({ input = '', evidence = [], project = null, reportType = 'homeowner', attachments = [] } = {}) {
  let events = [];
  const intakeRoute = routeIntake(input, { attachments });
  const runtime = createRuntimeState({ input, evidence, project, intakeRoute, status: 'running' });

  events = appendRuntimeEvent(events, {
    stage: 'routing',
    detail: `Intake routed as ${intakeRoute.routeType} through ${intakeRoute.primaryAgent}.`,
    data: intakeRoute
  });

  const evidenceRegister = createEvidenceRegister(evidence);
  const summary = evidenceSummary(evidenceRegister);
  events = appendRuntimeEvent(events, {
    stage: 'evidence',
    detail: `Evidence register prepared with ${summary.total} record(s).`,
    data: summary
  });

  const assessment = createAssessmentFromInput(input, { evidenceSummary: summary, reportType, intakeRoute });
  events = appendRuntimeEvent(events, {
    stage: 'assessment',
    detail: `Assessment created as ${assessment.type} with state ${assessment.state}.`,
    data: { id: assessment.id, type: assessment.type, state: assessment.state }
  });

  const report = generateReport({ assessment, evidence: evidenceRegister, type: reportType });
  events = appendRuntimeEvent(events, {
    stage: 'report',
    detail: `Report generated as ${report.type}.`,
    data: { title: report.title, sections: report.sections.length }
  });

  const projectRecord = createProject({
    ...(project || {}),
    assessments: input.trim() ? [assessment] : project?.assessments || [],
    evidence: evidenceRegister,
    status: null,
    updatedAt: new Date().toISOString()
  });
  const projectStatus = summariseProjectStatus(projectRecord);
  const projectWithStatus = createProject({ ...projectRecord, status: projectStatus });
  events = appendRuntimeEvent(events, {
    stage: 'project',
    detail: `Project status calculated as ${projectStatus.statusLabel}.`,
    data: projectStatus
  });

  return completeRuntimeState(runtime, {
    intakeRoute,
    assessment,
    evidence: evidenceRegister,
    evidenceSummary: summary,
    report,
    project: projectWithStatus,
    events
  });
}
