import React from 'react';
import { reportToText } from '../lib/generate-report.js';

export function ReportPreview({ report }) {
  if (!report) {
    return null;
  }

  return (
    <article>
      <h2>{report.title}</h2>
      <pre>{reportToText(report)}</pre>
    </article>
  );
}
