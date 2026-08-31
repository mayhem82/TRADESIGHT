import { getAppConfig } from '../config/app-config.js';
import { runTradesight } from '../runtime/run-tradesight.js';
import { classifyTask } from '../lib/classify-task.js';
import { buildShedPlanPathway } from '../shed/shed-review-pathway.js';

export function runSelfCheck() {
  const config = getAppConfig();
  const runtime = runTradesight({
    input: 'Check a leaking balcony defect with no verified evidence yet.',
    evidence: []
  });

  const shedPathway = buildShedPlanPathway({
    widthM: 3,
    lengthM: 4,
    wallHeightM: 2.1,
    roofType: 'skillion',
    claddingType: 'colorbond-steel',
    floorType: 'concrete-slab',
    doorCount: 1,
    windowCount: 0,
    boundaryDistanceM: 1.2
  });

  const checks = [
    check('config-loaded', Boolean(config.name && config.version)),
    check('runtime-completes', runtime.status === 'complete'),
    check('assessment-created', Boolean(runtime.assessment?.id)),
    check('report-created', Boolean(runtime.report?.title)),
    check('project-created', Boolean(runtime.project?.id)),
    check('boundary-preserved', runtime.assessment?.finalConclusionAllowed === false),
    check('shed-task-classified', classifyTask('I want to build a garden shed') === 'shed'),
    check('shed-item-list-generated', shedPathway.itemList.status === 'estimate' && shedPathway.itemList.items.length > 0)
  ];

  return {
    status: checks.every((item) => item.pass) ? 'pass' : 'fail',
    checks,
    generatedAt: new Date().toISOString()
  };
}

function check(id, pass) {
  return { id, pass };
}
