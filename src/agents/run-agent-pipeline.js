import { selectAgentsForTask } from './select-agents.js';

export function runAgentPipeline({ assessment, evidenceSummary = null, report = null } = {}) {
  const agents = selectAgentsForTask(assessment?.type || 'unknown');
  const events = agents.map((agent, index) => runAgent(agent, index, { assessment, evidenceSummary, report }));

  return {
    id: `PIPE-${Date.now()}`,
    taskType: assessment?.type || 'unknown',
    agents,
    events,
    status: events.some((event) => event.status === 'blocked') ? 'blocked' : 'complete',
    boundary: 'Agent outputs are orchestration records. They do not override compliance rules, evidence gaps, or qualified review boundaries.'
  };
}

function runAgent(agent, index, context) {
  const notes = buildAgentNotes(agent.id, context);

  return {
    step: index + 1,
    agentId: agent.id,
    agentName: agent.name,
    status: 'complete',
    notes,
    timestamp: new Date().toISOString()
  };
}

function buildAgentNotes(agentId, { assessment, evidenceSummary, report }) {
  if (agentId === 'intake') return [`Task classified as ${assessment?.type || 'unknown'}.`];
  if (agentId === 'compliance') return [`State is ${assessment?.stateLabel || assessment?.state || 'CS7'}.`];
  if (agentId === 'evidence') return [`Evidence records available: ${evidenceSummary?.total || 0}.`];
  if (agentId === 'report') return [`Report type prepared: ${report?.type || 'homeowner'}.`];
  if (agentId === 'image') return ['Visual pathway records observations only.'];
  if (agentId === 'plan') return ['Plan pathway identifies missing details and review boundaries.'];
  if (agentId === 'engineer') return ['Engineering matters remain qualified review pathways.'];
  if (agentId === 'builder') return ['Builder pathway organises defect, dispute, and rectification material.'];
  if (agentId === 'government') return ['Government pathway structures authority-facing review material.'];
  return ['Agent completed without additional notes.'];
}
