export function createReport(data = {}) {
  return {
    title: data.title || 'TRADESIGHT Report',
    type: data.type || 'homeowner',
    audience: data.audience || 'homeowner',
    purpose: data.purpose || '',
    summary: data.summary || '',
    sections: data.sections || [],
    findings: data.findings || [],
    unsupportedItems: data.unsupportedItems || [],
    createdAt: data.createdAt || new Date().toISOString()
  };
}
