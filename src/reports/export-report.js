import { reportToText } from '../lib/generate-report.js';

export function createReportExport(report = {}) {
  const text = reportToText(report);
  const filename = buildReportFilename(report);

  return {
    filename,
    mimeType: 'text/plain;charset=utf-8',
    text,
    size: text.length,
    createdAt: new Date().toISOString()
  };
}

export function buildReportFilename(report = {}) {
  const type = report.type || 'report';
  const created = report.createdAt ? report.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
  return `tradesight-${type}-${created}.txt`;
}

export function downloadReportText(report = {}) {
  const reportExport = createReportExport(report);
  const blob = new Blob([reportExport.text], { type: reportExport.mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = reportExport.filename;
  link.click();
  URL.revokeObjectURL(url);
  return reportExport;
}
