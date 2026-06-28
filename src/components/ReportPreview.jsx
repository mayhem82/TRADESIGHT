import React from 'react';
import { reportToText } from '../lib/generate-report.js';

export function ReportPreview({ report, assessment }) {
  if (!report) return null;

  return (
    <article className="wide-card">
      <div className="panel-heading">
        <h2>Report Preview</h2>
        <span className="status-pill">{assessment?.finalConclusionAllowed ? 'Conclusion available' : 'Draft only'}</span>
      </div>
      <pre>{reportToText(report)}</pre>
    </article>
  );
}
