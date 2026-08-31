// Estimation assumptions. These are planning defaults, not engineering values.
// A real footing, framing, or bracing design must be verified against AS 1684,
// a manufacturer's shed engineering certificate, or a qualified designer.
export const SHED_ESTIMATE_ASSUMPTIONS = {
  studSpacingM: 0.6,
  rafterSpacingM: 0.6,
  postSpacingM: 1.8,
  wastageFactor: 1.1,
  standardDoorM: { width: 0.82, height: 2.04 },
  standardWindowM: { width: 1.2, height: 1.2 },
  claddingSheetAreaM2: 2.88,
  claddingScrewsPerM2: 6,
  framingFixingsPerJunction: 4,
  openPostSpacingM: 2.4,
  postFixingsPerPost: 4,
  roundPostDiameterBandsMM: [
    { maxHeightM: 2.4, diameterMM: 100 },
    { maxHeightM: 3.0, diameterMM: 125 },
    { maxHeightM: 3.6, diameterMM: 150 },
    { maxHeightM: Infinity, diameterMM: 175 }
  ]
};

export function imputeRoundPostDiameterMM(heightM, a = SHED_ESTIMATE_ASSUMPTIONS) {
  const band = a.roundPostDiameterBandsMM.find((candidate) => heightM <= candidate.maxHeightM);
  return band ? band.diameterMM : a.roundPostDiameterBandsMM[a.roundPostDiameterBandsMM.length - 1].diameterMM;
}

export function pitchAllowanceFromDegrees(pitchDeg) {
  return 1 / Math.cos((pitchDeg * Math.PI) / 180);
}

export function generateShedItemList(plan = {}) {
  const { widthM, lengthM, wallHeightM } = plan;

  if (!widthM || !lengthM || !wallHeightM) {
    return {
      status: 'incomplete',
      items: [],
      note: 'Enter shed width, length, and wall height to generate an item list.'
    };
  }

  const a = SHED_ESTIMATE_ASSUMPTIONS;
  const perimeterM = 2 * (widthM + lengthM);
  const openingCount = plan.doorCount + plan.windowCount;

  const items = [
    ...floorItems(plan, a, perimeterM),
    ...(plan.openSides ? supportPostItems(plan, a, perimeterM) : wallFramingItems(plan, a, perimeterM, openingCount)),
    ...roofFramingItems(plan, a),
    ...roofingItems(plan, a),
    ...(plan.openSides ? [] : claddingItems(plan, a, perimeterM)),
    ...(plan.openSides ? [] : openingItems(plan, a)),
    ...fastenerItems(plan, a, perimeterM),
    ...(plan.leanToEnabled ? leanToItems(plan, a) : [])
  ];

  return {
    status: 'estimate',
    generatedAt: new Date().toISOString(),
    items,
    note: 'Quantities are a planning estimate using standard framing spacings and 10% wastage. Confirm final quantities and bracing/footing design against AS 1684, a shed manufacturer engineering certificate, or a qualified designer before ordering or building.'
  };
}

function floorItems(plan, a, perimeterM) {
  if (plan.floorType === 'none') {
    return [
      row('Floor', 'No floor specified', '-', '-', 'Structure will sit directly on prepared ground (compaction, gravel, or pavers). Site preparation is not included in this estimate.')
    ];
  }

  if (plan.floorType === 'concrete-slab') {
    return [
      row('Floor', 'Concrete slab', 'm2', plan.floorAreaM2, 'Slab area only. Thickness, reinforcement, and vapour barrier need separate specification.'),
      row('Floor', 'Slab edge formwork', 'm', round(perimeterM))
    ];
  }

  const postCount = Math.max(4, Math.ceil(perimeterM / a.postSpacingM));

  return [
    row('Floor', 'Stump/pier footings', 'ea', postCount, `Assumes posts at approx. ${a.postSpacingM}m centres around the perimeter.`),
    row('Floor', 'Bearers', 'm', round(perimeterM)),
    row('Floor', 'Floor joists', 'm', round(plan.lengthM * Math.ceil(plan.widthM / a.studSpacingM))),
    row('Floor', 'Flooring sheet (structural ply)', 'm2', round(plan.floorAreaM2 * a.wastageFactor))
  ];
}

function supportPostItems(plan, a, perimeterM) {
  const postCount = Math.max(4, Math.ceil(perimeterM / a.openPostSpacingM));
  const diameterMM = imputeRoundPostDiameterMM(plan.wallHeightM, a);

  return [
    row('Structure', `Support posts (round timber, ⌀${diameterMM}mm)`, 'ea', postCount, `Open-sided structure: assumes round timber posts at approx. ${a.openPostSpacingM}m centres, ${plan.wallHeightM}m long. Diameter is imputed from post height, not a span or wind-load calculation — confirm against timber span tables or an engineer before ordering.`),
    row('Structure', 'Bracing', 'ea', postCount, 'Diagonal or knee bracing per post to resist lateral load. Bracing design must be verified — an open structure carries wind load differently to a fully clad shed.')
  ];
}

function wallFramingItems(plan, a, perimeterM, openingCount) {
  const studCount = Math.ceil(perimeterM / a.studSpacingM) + 4 + openingCount * 2;

  return [
    row('Wall framing', 'Bottom plate', 'm', round(perimeterM)),
    row('Wall framing', 'Top plate', 'm', round(perimeterM), 'Single top plate assumed; doubled top plate may be required by the framing design.'),
    row('Wall framing', 'Wall studs', 'ea', studCount, `Assumes studs at ${a.studSpacingM * 1000}mm centres plus corner and opening jamb studs.`),
    row('Wall framing', 'Noggins/blocking', 'm', round(perimeterM), 'One row of mid-height blocking assumed.')
  ];
}

function roofFramingItems(plan, a) {
  const memberCount = Math.ceil(plan.lengthM / a.rafterSpacingM) + 1;
  const pitchAllowance = pitchAllowanceFromDegrees(plan.roofPitchDeg);

  if (plan.roofType === 'gable') {
    const rafterLengthEach = round((plan.widthM / 2) * pitchAllowance, 2);
    return [
      row('Roof framing', 'Rafters (pair per station)', 'ea', memberCount * 2, `Each rafter approx. ${rafterLengthEach}m, at ${plan.roofPitchDeg} deg pitch.`),
      row('Roof framing', 'Ridge board', 'm', round(plan.lengthM))
    ];
  }

  const rafterLengthEach = round(plan.widthM * pitchAllowance, 2);
  return [
    row('Roof framing', 'Rafters', 'ea', memberCount, `Each rafter approx. ${rafterLengthEach}m, at ${plan.roofPitchDeg} deg pitch.`)
  ];
}

function roofingItems(plan, a) {
  const pitchAllowance = pitchAllowanceFromDegrees(plan.roofPitchDeg);
  const roofAreaM2 = round(plan.widthM * plan.lengthM * pitchAllowance, 2);

  return [
    row('Roofing', 'Roof sheeting', 'm2', round(roofAreaM2 * a.wastageFactor), `Colorbond sheet coverage at ${plan.roofPitchDeg} deg pitch; cut sheets to actual run length on site.`),
    row('Roofing', plan.roofType === 'gable' ? 'Ridge capping' : 'Top/back flashing', 'm', round(plan.lengthM)),
    row('Roofing', 'Eave/barge flashing', 'm', round(2 * plan.lengthM + plan.widthM))
  ];
}

function claddingItems(plan, a, perimeterM) {
  const openingAreaM2 = plan.doorCount * a.standardDoorM.width * a.standardDoorM.height
    + plan.windowCount * a.standardWindowM.width * a.standardWindowM.height;
  const wallAreaM2 = Math.max(0, perimeterM * plan.wallHeightM - openingAreaM2);
  const sheetCount = Math.ceil((wallAreaM2 * a.wastageFactor) / a.claddingSheetAreaM2);

  return [
    row('Wall cladding', claddingLabel(plan.claddingType), 'ea', sheetCount, `Based on ${wallAreaM2.toFixed(2)}m2 net wall area after door/window deductions.`)
  ];
}

function openingItems(plan, a) {
  const items = [];
  if (plan.doorCount) items.push(row('Openings', 'Door frame + lintel', 'ea', plan.doorCount));
  if (plan.windowCount) items.push(row('Openings', 'Window frame + lintel', 'ea', plan.windowCount));
  return items;
}

function fastenerItems(plan, a, perimeterM) {
  const pitchAllowance = pitchAllowanceFromDegrees(plan.roofPitchDeg);
  const roofAreaM2 = plan.widthM * plan.lengthM * pitchAllowance;
  const roofingScrews = Math.ceil(roofAreaM2 * a.claddingScrewsPerM2);

  if (plan.openSides) {
    const postCount = Math.max(4, Math.ceil(perimeterM / a.openPostSpacingM));
    const postFixings = postCount * a.postFixingsPerPost;

    return [
      row('Fasteners', 'Roofing screws', 'ea', roofingScrews, `Assumes ${a.claddingScrewsPerM2} fixings per m2 of roofing.`),
      row('Fasteners', 'Post fixings/brackets', 'ea', postFixings, `Assumes ${a.postFixingsPerPost} fixings per post-to-bearer or post-to-roof connection.`)
    ];
  }

  const openingAreaM2 = plan.doorCount * a.standardDoorM.width * a.standardDoorM.height
    + plan.windowCount * a.standardWindowM.width * a.standardWindowM.height;
  const wallAreaM2 = Math.max(0, perimeterM * plan.wallHeightM - openingAreaM2);
  const claddingScrews = Math.ceil(wallAreaM2 * a.claddingScrewsPerM2);
  const framingJunctions = Math.ceil(perimeterM / a.studSpacingM) * 2;
  const framingFixings = framingJunctions * a.framingFixingsPerJunction;

  return [
    row('Fasteners', 'Wall cladding screws', 'ea', claddingScrews, `Assumes ${a.claddingScrewsPerM2} fixings per m2 of wall cladding.`),
    row('Fasteners', 'Roofing screws', 'ea', roofingScrews, `Assumes ${a.claddingScrewsPerM2} fixings per m2 of roofing.`),
    row('Fasteners', 'Framing nails/screws', 'ea', framingFixings, `Assumes ${a.framingFixingsPerJunction} fixings per stud-to-plate junction.`)
  ];
}

const MIN_LEAN_TO_POST_HEIGHT_M = 1.8;

export function computeLeanToPostHeightM(plan) {
  const pitchRad = (plan.roofPitchDeg * Math.PI) / 180;
  const drop = plan.leanToDepthM * Math.tan(pitchRad);
  return Math.max(MIN_LEAN_TO_POST_HEIGHT_M, round(plan.wallHeightM - drop, 2));
}

function leanToItems(plan, a) {
  const postHeightM = computeLeanToPostHeightM(plan);
  const postCount = Math.max(2, Math.ceil(plan.widthM / a.openPostSpacingM) + 1);
  const diameterMM = imputeRoundPostDiameterMM(postHeightM, a);
  const pitchAllowance = pitchAllowanceFromDegrees(plan.roofPitchDeg);
  const rafterCount = Math.ceil(plan.widthM / a.rafterSpacingM) + 1;
  const rafterLengthEach = round(plan.leanToDepthM * pitchAllowance, 2);
  const roofAreaM2 = round(plan.widthM * plan.leanToDepthM * pitchAllowance, 2);
  const roofingScrews = Math.ceil(roofAreaM2 * a.claddingScrewsPerM2);
  const postFixings = postCount * a.postFixingsPerPost;

  return [
    row('Lean-to', `Support posts (round timber, ⌀${diameterMM}mm)`, 'ea', postCount, `Attached off the back wall, dropping to approx. ${postHeightM}m at the outer edge over a ${plan.leanToDepthM}m depth. Open-sided by design — no wall framing or cladding assumed.`),
    row('Lean-to', 'Roof rafters', 'ea', rafterCount, `Each rafter approx. ${rafterLengthEach}m, at ${plan.roofPitchDeg} deg pitch.`),
    row('Lean-to', 'Roof sheeting', 'm2', round(roofAreaM2 * a.wastageFactor), 'Colorbond sheet coverage for the lean-to roof only.'),
    row('Lean-to', 'Roofing screws', 'ea', roofingScrews, `Assumes ${a.claddingScrewsPerM2} fixings per m2 of roofing.`),
    row('Lean-to', 'Post fixings/brackets', 'ea', postFixings, `Assumes ${a.postFixingsPerPost} fixings per post-to-bearer or post-to-roof connection.`)
  ];
}

function claddingLabel(claddingType) {
  const labels = {
    'colorbond-steel': 'Colorbond steel wall sheet',
    'fibre-cement': 'Fibre cement sheet',
    'timber-weatherboard': 'Timber weatherboard'
  };
  return labels[claddingType] || 'Wall cladding sheet';
}

function row(category, item, unit, quantity, notes = '') {
  return { category, item, unit, quantity, notes };
}

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}
