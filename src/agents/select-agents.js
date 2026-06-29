import { getAgent } from './agent-registry.js';

export const TASK_AGENT_MAP = {
  compliance: ['intake', 'compliance', 'evidence', 'report'],
  defect: ['intake', 'image', 'builder', 'compliance', 'evidence', 'report'],
  plan: ['intake', 'plan', 'engineer', 'compliance', 'evidence', 'report'],
  dispute: ['intake', 'builder', 'evidence', 'report'],
  materials: ['intake', 'builder', 'compliance', 'evidence', 'report'],
  safety: ['intake', 'image', 'compliance', 'evidence', 'report'],
  government: ['intake', 'government', 'compliance', 'evidence', 'report'],
  unknown: ['intake', 'compliance']
};

export function selectAgentsForTask(type = 'unknown') {
  const agentIds = TASK_AGENT_MAP[type] || TASK_AGENT_MAP.unknown;
  return agentIds.map(getAgent).filter(Boolean);
}
