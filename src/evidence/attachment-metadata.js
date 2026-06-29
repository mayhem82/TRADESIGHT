export function createAttachmentMetadata(data = {}) {
  return {
    id: data.id || `ATT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    filename: data.filename || data.name || 'unnamed-attachment',
    mimeType: data.mimeType || data.type || 'application/octet-stream',
    sizeBytes: data.sizeBytes || data.size || 0,
    source: data.source || 'browser-local',
    storageStatus: data.storageStatus || 'metadata-only',
    uploaded: false,
    createdAt: data.createdAt || new Date().toISOString(),
    boundary: 'Attachment metadata is recorded locally. File storage and upload handling are not active in this build.'
  };
}

export function normaliseAttachments(attachments = []) {
  return attachments.map((attachment) => createAttachmentMetadata(attachment));
}

export function summariseAttachments(attachments = []) {
  const normalised = normaliseAttachments(attachments);
  const totalSizeBytes = normalised.reduce((total, attachment) => total + (attachment.sizeBytes || 0), 0);

  return {
    count: normalised.length,
    totalSizeBytes,
    storageStatus: normalised.length ? 'metadata-only' : 'none'
  };
}
