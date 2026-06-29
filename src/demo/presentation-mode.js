import { runTradesight } from '../runtime/run-tradesight.js';
import { DEMO_CASES } from './demo-cases.js';
import { buildDemoScript } from './demo-script.js';

export function buildPresentationMode() {
  const script = buildDemoScript();
  const cases = DEMO_CASES.map((demoCase) => {
    const runtime = runTradesight({
      input: demoCase.input,
      evidence: demoCase.evidence,
      reportType: demoCase.audience
    });

    return {
      ...demoCase,
      runtime,
      summary: {
        state: runtime.assessment?.stateLabel,
        priority: runtime.assessment?.priority?.label,
        evidenceRecords: runtime.evidenceSummary?.total || 0,
        reportTitle: runtime.report?.title,
        conclusionStatus: runtime.assessment?.finalConclusionAllowed ? 'available' : 'not asserted'
      }
    };
  });

  return {
    title: 'TRADESIGHT NSW Demonstration Platform',
    cases,
    script,
    boundary: 'Presentation mode demonstrates workflow and evidence discipline. It does not replace qualified professional review.'
  };
}
