export function classifyRisk({ type = 'unknown', input = '', stateCode = 'CS7' } = {}) {
  const text = input.toLowerCase();

  if (stateCode === 'CS6' || /collapse|asbestos|fire|load[- ]?bearing|structural|immediate danger/.test(text)) {
    return {
      level: 'High',
      label: 'High - restricted or urgent review pathway',
      reasons: ['Restricted, hazardous, or urgent terms were detected.']
    };
  }

  if (stateCode === 'CS2' || ['defect', 'safety', 'compliance'].includes(type)) {
    return {
      level: 'Medium',
      label: 'Medium - review required before action',
      reasons: ['The task may affect compliance, safety, defects, or statutory obligations.']
    };
  }

  if (stateCode === 'CS7' || type === 'unknown') {
    return {
      level: 'Unclassified',
      label: 'Unclassified - insufficient validated information',
      reasons: ['The request does not yet provide enough reliable detail to classify risk.']
    };
  }

  return {
    level: 'Low to Medium',
    label: 'Low to Medium - pathway preparation only',
    reasons: ['No restricted or urgent signals were detected, but final compliance remains unverified.']
  };
}
