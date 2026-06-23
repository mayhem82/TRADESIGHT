export function createReport(data = {}) {
  return {
    title: data.title || 'TRADESIGHT Report',
    summary: data.summary || '',
    findings: data.findings || [],
    createdAt: data.createdAt || new Date().toISOString()
  };
}
