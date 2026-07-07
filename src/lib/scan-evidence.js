export function createScanModelEvidence(scan = {}) {
  return {
    source: 'phone-3d-scan',
    type: 'scan-3d',
    status: 'unverified',
    description: `3D scan model loaded from ${scan.fileName}. Capture source: phone photogrammetry export. Geometry is for spatial review until scale reference is confirmed.`,
    observedAt: scan.observedAt,
    tags: ['visual-record', 'spatial-evidence', 'scale-unverified'],
    attachments: [{
      filename: scan.fileName,
      mimeType: scan.mimeType || 'model/gltf-binary',
      sizeBytes: scan.sizeBytes || 0,
      source: 'browser-local',
      storageStatus: 'metadata-only'
    }]
  };
}

export function createScanObservationEvidence(observation = {}) {
  const point = observation.point || { x: 0, y: 0, z: 0 };
  const pointText = `x ${point.x.toFixed(2)}, y ${point.y.toFixed(2)}, z ${point.z.toFixed(2)}`;
  const modelText = observation.modelName ? ` on ${observation.modelName}` : '';

  return {
    source: 'scan-point-observation',
    type: 'observation',
    status: 'unverified',
    description: `3D scan observation${modelText} at ${pointText}: ${observation.text}`,
    observedAt: observation.observedAt,
    tags: ['spatial-evidence', 'scan-observation', 'scale-unverified']
  };
}
