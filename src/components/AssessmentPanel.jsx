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
      {assessment.matchedRules?.length > 0 && (
        <section className="subsection">
          <h3>Rule provenance</h3>
          <ul>
            {assessment.matchedRules.map((rule) => (
              <li key={rule.id}>{rule.id}: {rule.source.label} - confidence {Math.round(rule.confidence * 100)}%</li>
            ))}
          </ul>
        </section>
      )}
      {assessment.unresolvedItems?.length > 0 && (
        <section className="subsection">
          <h3>Unresolved items</h3>
          <ul>{assessment.unresolvedItems.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      )}
    </article>
  );
}
