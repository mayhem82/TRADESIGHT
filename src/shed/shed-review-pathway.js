import { createShedPlan } from './shed-plan.js';
import { checkMissingShedDetails } from './shed-dimension-checks.js';
import { generateShedItemList } from './shed-item-list.js';

export function buildShedPlanPathway(data = {}) {
  const plan = createShedPlan(data);
  const missingDetails = checkMissingShedDetails(plan, data);
  const itemList = generateShedItemList(plan);

  return {
    plan,
    missingDetails,
    itemList,
    developmentPathwayFlags: buildDevelopmentPathwayFlags(plan),
    reviewStatus: missingDetails.length ? 'incomplete' : 'plan-and-item-list-ready'
  };
}

function buildDevelopmentPathwayFlags(plan) {
  const flags = [];

  if (plan.floorAreaM2 != null) {
    flags.push(`Floor area is approximately ${plan.floorAreaM2}m2. Confirm against council exempt/complying development floor area limits for this lot before assuming no development approval is needed.`);
  }

  if (plan.wallHeightM != null) {
    flags.push('Wall and overall height must be checked against exempt/complying development height limits, which vary by boundary setback.');
  }

  if (plan.boundaryDistanceM != null) {
    flags.push(`Boundary distance entered as ${plan.boundaryDistanceM}m. Setback limits vary by council and zone and must be verified, not assumed.`);
  } else {
    flags.push('Distance to the nearest boundary has not been entered. Setback is a common trigger for requiring a development application.');
  }

  if (plan.openSides) {
    flags.push('Open-sided structures (carports, shelters) are generally assessed under the same exempt/complying development floor area, height, and setback provisions as enclosed sheds. Being open-sided does not exempt it from these checks.');
  }

  if (plan.floorType === 'none') {
    flags.push('No floor type was specified. Ground preparation and drainage still affect siting and may still fall under council requirements even without a slab or floor structure.');
  }

  if (plan.leanToEnabled) {
    const totalFootprintM2 = round2(plan.floorAreaM2 + plan.leanToFloorAreaM2);
    flags.push(`Lean-to adds approximately ${plan.leanToFloorAreaM2}m2, for a total covered footprint of approximately ${totalFootprintM2}m2. The combined footprint counts toward exempt/complying development floor area and setback limits, not just the main structure.`);
  }

  return flags;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}
