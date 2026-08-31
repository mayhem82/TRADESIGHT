import { getAppConfig } from '../config/app-config.js';
import { runTradesight } from '../runtime/run-tradesight.js';
import { classifyTask } from '../lib/classify-task.js';
import { buildShedPlanPathway } from '../shed/shed-review-pathway.js';
import { buildShedModel, disposeShedModel } from '../shed/build-shed-model.js';
import { imputeRoundPostDiameterMM } from '../shed/shed-item-list.js';

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

  const openShedPathway = buildShedPlanPathway({
    widthM: 6,
    lengthM: 6,
    wallHeightM: 2.4,
    roofType: 'gable',
    floorType: 'none',
    openSides: true,
    doorCount: 0,
    windowCount: 0,
    boundaryDistanceM: 3
  });

  const checks = [
    check('config-loaded', Boolean(config.name && config.version)),
    check('runtime-completes', runtime.status === 'complete'),
    check('assessment-created', Boolean(runtime.assessment?.id)),
    check('report-created', Boolean(runtime.report?.title)),
    check('project-created', Boolean(runtime.project?.id)),
    check('boundary-preserved', runtime.assessment?.finalConclusionAllowed === false),
    check('shed-task-classified', classifyTask('I want to build a garden shed') === 'shed'),
    check('shed-item-list-generated', shedPathway.itemList.status === 'estimate' && shedPathway.itemList.items.length > 0),
    check('shed-model-builds', shedModelHasWallsAndRoof(shedPathway.plan)),
    check('shed-open-sides-no-floor', openShedItemListHasNoWallFramingOrFloor(openShedPathway)),
    check('shed-open-sides-model-builds', shedModelHasWallsAndRoof(openShedPathway.plan)),
    check('shed-post-diameter-imputed', shedPostDiameterIsImputed(openShedPathway))
  ];

  return {
    status: checks.every((item) => item.pass) ? 'pass' : 'fail',
    checks,
    generatedAt: new Date().toISOString()
  };
}

function shedModelHasWallsAndRoof(plan) {
  const group = buildShedModel(plan);
  const hasGeometry = group.children.length >= 2;
  disposeShedModel(group);
  return hasGeometry;
}

function openShedItemListHasNoWallFramingOrFloor(pathway) {
  const categories = pathway.itemList.items.map((item) => item.category);
  return pathway.itemList.status === 'estimate'
    && !categories.includes('Wall framing')
    && !categories.includes('Wall cladding')
    && categories.includes('Structure')
    && pathway.itemList.items.some((item) => item.item === 'No floor specified');
}

function shedPostDiameterIsImputed(pathway) {
  const expectedDiameterMM = imputeRoundPostDiameterMM(pathway.plan.wallHeightM);
  return pathway.itemList.items.some((item) => item.category === 'Structure' && item.item.includes(`⌀${expectedDiameterMM}mm`));
}

function check(id, pass) {
  return { id, pass };
}
