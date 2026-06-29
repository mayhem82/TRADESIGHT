import { DEMO_CASES } from './demo-cases.js';

export function buildDemoScript() {
  return DEMO_CASES.map((demoCase, index) => ({
    step: index + 1,
    caseId: demoCase.id,
    title: demoCase.title,
    audience: demoCase.audience,
    talkingPoints: [
      'Start with the user intake text.',
      'Show that TRADESIGHT classifies the task and preserves uncertainty.',
      'Add the supplied evidence and show quality scoring.',
      'Show runtime events and agent orchestration.',
      'Open Report Studio and explain the audience-specific output.',
      'Point out that unsupported conclusions remain unresolved.'
    ],
    boundary: 'This demonstration shows workflow capability, not a certified compliance determination.'
  }));
}
