import React from 'react';

export function ProjectPanel({ project, onSave, onClear }) {
  if (!project) return null;

  return (
    <article>
      <h2>Project Record</h2>
      <p><strong>Project ID:</strong> {project.id}</p>
      <p><strong>Name:</strong> {project.name}</p>
      <p><strong>Assessments:</strong> {project.assessments.length}</p>
      <p><strong>Evidence:</strong> {project.evidence.length}</p>
      <div className="actions">
        <button type="button" onClick={onSave}>Save Project</button>
        <button type="button" onClick={onClear}>Clear Project</button>
      </div>
    </article>
  );
}
