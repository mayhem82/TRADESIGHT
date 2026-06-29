import React, { useMemo, useState } from 'react';
import { reportToText } from '../lib/generate-report.js';
import { createReportExport, downloadReportText } from '../reports/export-report.js';

export function ReportPreview({ report, assessment }) {
  const [copyStatus, setCopyStatus] = useState('');
  const reportExport = useMemo(() => report ? createReportExport(report) : null, [report]);

  if (!report) return null;

  async function handleCopy() {
    const text = reportToText(report);

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      setCopyStatus('Copied report text.');
    } else {
      setCopyStatus('Clipboard unavailable. Select and copy the preview text manually.');
    }
  }

  function handleDownload() {
    const exported = downloadReportText(report);
    setCopyStatus(`Downloaded ${exported.filename}.`);
  }

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
        <div>
          <dt>Export file</dt>
          <dd>{reportExport?.filename}</dd>
        </div>
      </dl>
      <div className="actions">
        <button type="button" onClick={handleCopy}>Copy Report Text</button>
        <button type="button" onClick={handleDownload}>Download TXT</button>
      </div>
      {copyStatus && <p className="muted">{copyStatus}</p>}
      <pre>{reportToText(report)}</pre>
    </article>
  );
}
