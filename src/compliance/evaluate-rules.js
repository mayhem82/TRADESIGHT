import { getRulesForTask } from './rule-registry.js';
import { getRuleSource } from './rule-sources.js';
import { resolveJurisdiction } from './jurisdictions.js';

export function evaluateComplianceRules({ type = 'unknown', input = '', jurisdiction = 'NSW' } = {}) {
  const resolvedJurisdiction = resolveJurisdiction(jurisdiction);
  const rules = getRulesForTask(type, resolvedJurisdiction.id);
  const text = input.trim();

  const matchedRules = rules
    .filter((rule) => {
      if (!rule.pattern) return type === 'unknown' || !text;
      return new RegExp(rule.pattern, 'i').test(text);
    })
    .map((rule) => ({
      ...rule,
      source: getRuleSource(rule.sourceId)
    }));

  const unresolvedItems = [];
  if (!text) unresolvedItems.push('No user request supplied.');
  if (!matchedRules.length) unresolvedItems.push('No matching TRADESIGHT rule has been validated for this request.');

  return {
    jurisdiction: resolvedJurisdiction,
    matchedRules,
    unresolvedItems,
    highestRule: selectHighestRule(matchedRules)
  };
}

function selectHighestRule(rules = []) {
  const stateRank = { CS6: 6, CS5: 5, CS4: 4, CS3: 3, CS2: 2, CS1: 1, CS7: 0 };
  return [...rules].sort((a, b) => {
    const rankDelta = (stateRank[b.state] || 0) - (stateRank[a.state] || 0);
    if (rankDelta !== 0) return rankDelta;
    return b.confidence - a.confidence;
  })[0] || null;
}
