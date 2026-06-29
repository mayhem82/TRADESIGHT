import { classifyTask } from '../lib/classify-task.js';
import { selectAgentsForTask } from './select-agents.js';

export function routeIntake(input = '', context = {}) {
  const text = input.toLowerCase();
  const taskType = classifyTask(input);
  const routeType = detectRouteType(text, context);
  const agents = selectAgentsForTask(taskType);
  const requiredNextActions = buildRequiredNextActions({ routeType, taskType, text, context });

  return {
    routeType,
    taskType,
    status: input.trim() ? 'routed' : 'waiting-for-user-input',
    primaryAgent: agents[0]?.name || 'Intake Agent',
    agentNames: agents.map((agent) => agent.name),
    requiredNextActions,
    projectRequired: false,
    boundary: 'The user does not choose modules. TRADESIGHT routes the request through agents and only creates a project when the user saves or persistent record keeping is needed.'
  };
}

function detectRouteType(text, context = {}) {
  if (context.attachments?.some((attachment) => attachment.kind === 'plan')) return 'plan-upload';
  if (context.attachments?.some((attachment) => attachment.kind === 'photo')) return 'photo-upload';
  if (/upload|attach|photo|image|picture|video/.test(text)) return 'evidence-capture';
  if (/plan|drawing|sketch|detail|sheet|layout/.test(text)) return 'plan-review';
  if (/standard|ncc|code|clause|australian standard|as\s?\d+/.test(text)) return 'standards-lookup';
  if (/report|letter|submission|brief|summary/.test(text)) return 'report-request';
  return 'question';
}

function buildRequiredNextActions({ routeType, taskType, text }) {
  if (!text.trim()) {
    return ['Enter a question, issue, photo note, plan concern, standard reference, or report request.'];
  }

  const actions = [];

  if (routeType === 'plan-review') actions.push('Ask for or accept the relevant plan sheet, drawing number, or plan image.');
  if (routeType === 'photo-upload' || routeType === 'evidence-capture') actions.push('Create evidence records from the supplied photo, file, or observation.');
  if (routeType === 'standards-lookup') actions.push('Route to standards lookup and return source-controlled references only.');
  if (routeType === 'report-request') actions.push('Prepare report structure from available assessment and evidence.');
  if (taskType === 'unknown') actions.push('Ask one clarifying question before selecting a specialist pathway.');

  actions.push('Preserve unsupported conclusions as unresolved.');

  return actions;
}
