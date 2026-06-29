import React from 'react';
import { reportToText } from '../lib/generate-report.js';

export function ReportPreview({ report, assessment }) {
  if (!report) return null;

  return (
    <article className="wide-card">
      <div className="panel-heading">
        <div>
          <h2>Report Studio</h2>
          <p className="muted">{report.purpose}</p>
        </div>
        <span className="status-pill">{assessment?.finalConclusionAllowed ? 'Conclusion available' : 'Draft only'}</span>
      </div>
      <dl className="facts compact">
        <div>
          <dt>Type</dt>
          <dd>{report.type}</dd>
        </div>
        <div>
          <dt>Audience</dt>
          <dd>{report.audience}</dd>
        </div>
        <div>
          <dt>Sections</dt>
          <dd>{report.sections?.length || 0}</dd>
        </div>
      </dl>
      <pre>{reportToText(report)}</pre>
    </article>
  );
}
