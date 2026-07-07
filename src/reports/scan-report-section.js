export function buildScanReportSection(evidence = []) {
  const scanRecords = evidence.filter(isScanEvidence);
  if (!scanRecords.length) return null;

  const modelCount = scanRecords.filter((item) => item.type === 'scan-3d').length;
  const observationCount = scanRecords.filter((item) => item.source === 'scan-point-observation').length;
  const lines = [
    `3D scan records: ${scanRecords.length}`,
    `Loaded scan models: ${modelCount}`,
    `Spatial observations: ${observationCount}`,
    'Scale status: unverified until a known measurement or reference object is confirmed.'
  ];

  scanRecords.slice(0, 5).forEach((item) => {
    lines.push(`${item.id}: ${item.description}`);
  });

  if (scanRecords.length > 5) {
    lines.push(`Additional scan records not shown in preview: ${scanRecords.length - 5}`);
  }

  return {
    id: 'scan-evidence',
    title: '3D Scan Evidence',
    lines
  };
}

function isScanEvidence(item = {}) {
  return item.type === 'scan-3d'
    || item.source === 'scan-point-observation'
    || item.tags?.includes('spatial-evidence');
}
