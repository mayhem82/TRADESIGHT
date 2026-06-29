import { getAppConfig } from '../config/app-config.js';
import { runTradesight } from '../runtime/run-tradesight.js';

export function runSelfCheck() {
  const config = getAppConfig();
  const runtime = runTradesight({
    input: 'Check a leaking balcony defect with no verified evidence yet.',
    evidence: []
  });

  const checks = [
    check('config-loaded', Boolean(config.name && config.version)),
    check('runtime-completes', runtime.status === 'complete'),
    check('assessment-created', Boolean(runtime.assessment?.id)),
    check('report-created', Boolean(runtime.report?.title)),
    check('project-created', Boolean(runtime.project?.id)),
    check('boundary-preserved', runtime.assessment?.finalConclusionAllowed === false)
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
