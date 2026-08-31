const ROOF_TYPES = ['skillion', 'gable'];
const CLADDING_TYPES = ['colorbond-steel', 'fibre-cement', 'timber-weatherboard'];
const ROOFING_TYPES = ['colorbond-sheet'];
const FLOOR_TYPES = ['concrete-slab', 'bearers-and-joists', 'none'];
const MIN_ROOF_PITCH_DEG = 2;
const MAX_ROOF_PITCH_DEG = 45;
const DEFAULT_ROOF_PITCH_DEG = 10;

export function createShedPlan(data = {}) {
  const widthM = toPositiveNumber(data.widthM);
  const lengthM = toPositiveNumber(data.lengthM);
  const wallHeightM = toPositiveNumber(data.wallHeightM);
  const doorCount = toNonNegativeInt(data.doorCount, 1);
  const windowCount = toNonNegativeInt(data.windowCount, 0);
  const leanToEnabled = Boolean(data.leanToEnabled);
  const leanToDepthM = leanToEnabled ? toPositiveNumber(data.leanToDepthM) : null;

  return {
    id: data.id || `SHED-${Date.now()}`,
    widthM,
    lengthM,
    wallHeightM,
    roofType: ROOF_TYPES.includes(data.roofType) ? data.roofType : 'skillion',
    roofPitchDeg: clampRoofPitch(data.roofPitchDeg),
    claddingType: CLADDING_TYPES.includes(data.claddingType) ? data.claddingType : 'colorbond-steel',
    roofingType: ROOFING_TYPES.includes(data.roofingType) ? data.roofingType : 'colorbond-sheet',
    floorType: FLOOR_TYPES.includes(data.floorType) ? data.floorType : 'concrete-slab',
    openSides: Boolean(data.openSides),
    doorCount,
    windowCount,
    boundaryDistanceM: data.boundaryDistanceM === '' || data.boundaryDistanceM == null ? null : toPositiveNumber(data.boundaryDistanceM),
    floorAreaM2: widthM && lengthM ? round(widthM * lengthM, 2) : null,
    leanToEnabled: leanToEnabled && leanToDepthM != null,
    leanToDepthM,
    leanToFloorAreaM2: leanToEnabled && leanToDepthM != null && widthM ? round(widthM * leanToDepthM, 2) : null,
    createdAt: data.createdAt || new Date().toISOString(),
    boundary: 'This is a homeowner planning estimate, not a certified structural design or a development approval outcome.'
  };
}

function clampRoofPitch(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_ROOF_PITCH_DEG;
  return Math.min(MAX_ROOF_PITCH_DEG, Math.max(MIN_ROOF_PITCH_DEG, parsed));
}

function toPositiveNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function toNonNegativeInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function round(value, places) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}
