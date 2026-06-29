export function getEvidenceDate(record = {}) {
  return record.timelineDate || record.observedAt || record.createdAt || null;
}

export function sortEvidenceTimeline(records = []) {
  return [...records].sort((a, b) => {
    const dateA = new Date(getEvidenceDate(a) || 0).getTime();
    const dateB = new Date(getEvidenceDate(b) || 0).getTime();
    return dateA - dateB;
  });
}

export function createTimelineSummary(records = []) {
  const ordered = sortEvidenceTimeline(records);
  return {
    firstDate: getEvidenceDate(ordered[0]),
    latestDate: getEvidenceDate(ordered[ordered.length - 1]),
    count: ordered.length,
    ordered
  };
}
