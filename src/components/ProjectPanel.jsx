import React from 'react';
import { summariseProjectStatus } from '../project/project-status.js';

export function ProjectPanel({ project, onSave, onClear }) {
  if (!project) return null;

  const status = project.status || summariseProjectStatus(project);

  return (
    <article>
      <h2>Project Record</h2>
      <dl className="facts compact">
        <div>
          <dt>Project ID</dt>
          <dd>{project.id}</dd>
        </div>
        <div>
          <dt>Name</dt>
          <dd>{project.name}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{status.statusLabel}</dd>
        </div>
        <div>
          <dt>Assessments</dt>
          <dd>{status.assessmentCount}</dd>
        </div>
        <div>
          <dt>Evidence</dt>
          <dd>{status.evidenceCount}</dd>
        </div>
        <div>
          <dt>Restricted items</dt>
          <dd>{status.restrictedItems}</dd>
        </div>
        <div>
          <dt>Versions</dt>
          <dd>{project.versionHistory?.length || 0}</dd>
        </div>
        <div>
          <dt>Audit entries</dt>
          <dd>{project.auditTrail?.length || 0}</dd>
        </div>
      </dl>
      <p><strong>Latest state:</strong> {status.latestState}</p>
      <p><strong>Latest priority:</strong> {status.latestPriority}</p>
      <div className="actions">
        <button type="button" onClick={onSave}>Save Project</button>
        <button type="button" onClick={onClear}>Clear Project</button>
      </div>
    </article>
  );
}
