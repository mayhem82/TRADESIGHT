import { createProject } from '../models/project.js';
import { summariseProjectStatus } from '../project/project-status.js';
import { appendVersionHistory } from '../project/version-history.js';
import { appendAuditTrail } from '../project/audit-trail.js';

const STORAGE_KEY = 'tradesight-current-project';

export function saveProject(project) {
  const status = summariseProjectStatus(project);
  const withStatus = createProject({ ...project, status, updatedAt: new Date().toISOString() });
  const withHistory = appendVersionHistory(withStatus, {
    action: 'save',
    summary: `Project saved with ${status.assessmentCount} assessment(s) and ${status.evidenceCount} evidence record(s).`
  });
  const withAudit = appendAuditTrail(withHistory, {
    event: 'project-save',
    detail: 'Project saved to browser storage.',
    targetId: withHistory.id
  });

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withAudit));
  return withAudit;
}

export function loadProject() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return createProject();

  try {
    return createProject(JSON.parse(raw));
  } catch {
    return createProject();
  }
}

export function clearProject() {
  window.localStorage.removeItem(STORAGE_KEY);
  return createProject();
}
