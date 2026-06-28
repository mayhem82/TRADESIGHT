import React from 'react';

export function AssessmentPanel({ assessment }) {
  if (!assessment) return null;

  return (
    <article>
      <h2>Assessment Object</h2>
      <dl className="facts">
        <div>
          <dt>Assessment ID</dt>
          <dd>{assessment.id}</dd>
        </div>
        <div>
          <dt>Detected type</dt>
          <dd>{assessment.type}</dd>
        </div>
        <div>
          <dt>Compliance state</dt>
          <dd>{assessment.stateLabel}</dd>
        </div>
        <div>
          <dt>Risk classification</dt>
          <dd>{assessment.riskLabel}</dd>
        </div>
        <div>
          <dt>Final conclusion</dt>
          <dd>{assessment.finalConclusionAllowed ? 'Available' : 'Not asserted'}</dd>
        </div>
      </dl>
      <p><strong>State reason:</strong> {assessment.stateReason}</p>
      <p><strong>Boundary:</strong> {assessment.boundary}</p>
      {assessment.riskReasons?.length > 0 && (
        <ul>{assessment.riskReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
      )}
    </article>
  );
}
