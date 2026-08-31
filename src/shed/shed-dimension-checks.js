export function checkMissingShedDetails(plan = {}) {
  const missing = [];

  if (!plan.widthM) missing.push('shed width (m)');
  if (!plan.lengthM) missing.push('shed length (m)');
  if (!plan.wallHeightM) missing.push('wall height (m)');
  if (plan.boundaryDistanceM == null) missing.push('distance to nearest boundary (m)');

  return missing;
}
