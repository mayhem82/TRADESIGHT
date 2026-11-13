// General ADE20K scene suggestions. These classes are not geological identities.
export const SCENE_CUES = {
  'scene-rock': { label: 'AI suggests rock surface', color: [96, 210, 245],
    explanation: 'The scene model suggests a rock-like surface here. Check the actual boundary and material. It cannot establish rock type, mineral identity, whether the rock is in place, or gold content.' },
  'scene-vegetation': { label: 'AI suggests vegetation', color: [109, 225, 115],
    explanation: 'The scene model suggests vegetation. Check leaves, grass or branches in this region. Fine plants, shadows and textured ground can be confused; covered geology remains unknown.' },
  'scene-ground': { label: 'AI suggests ground / soil-like surface', color: [225, 177, 100],
    explanation: 'The scene model suggests an earth- or ground-like surface. Leaf litter, weathered rock and vegetation can be confused with ground. This does not establish sediment type, origin or grain size.' },
  'scene-sand': { label: 'AI suggests sand-like surface', color: [245, 223, 148],
    explanation: 'The scene model suggests a sand-like appearance. Verify grains and scale; pale soil, rock or glare can look similar. Mineral content and gold remain unconfirmed.' },
  'scene-water': { label: 'AI suggests water-like surface', color: [116, 161, 255],
    explanation: 'The scene model suggests water-like appearance. Shadows and smooth rock can produce false labels. This is not a measurement of water depth, movement or near-bed flow.' }
};
const groups = { rock: 'scene-rock', tree: 'scene-vegetation', grass: 'scene-vegetation', plant: 'scene-vegetation', palm: 'scene-vegetation',
  earth: 'scene-ground', dirt: 'scene-ground', land: 'scene-ground', field: 'scene-ground', sand: 'scene-sand',
  water: 'scene-water', river: 'scene-water', sea: 'scene-water', lake: 'scene-water', waterfall: 'scene-water' };

export function buildSceneResult({ predictions, width, height, labels, targetWidth, targetHeight, model, elapsedMs }) {
  if (![width, height, targetWidth, targetHeight].every(n => Number.isInteger(n) && n > 0 && n <= 1024) ||
      predictions?.length !== width * height || !Array.isArray(labels) || labels.length < 1 || labels.length > 256)
    throw new RangeError('Invalid scene segmentation dimensions or labels');
  const names = Object.keys(SCENE_CUES), size = targetWidth * targetHeight, groupIds = new Uint8Array(size), rawCounts = {};
  for (let y = 0; y < targetHeight; y++) for (let x = 0; x < targetWidth; x++) {
    const sx = Math.min(width - 1, Math.floor(x * width / targetWidth)), sy = Math.min(height - 1, Math.floor(y * height / targetHeight));
    const value = predictions[sy * width + sx];
    if (!Number.isInteger(value) || value < 0 || value >= labels.length) throw new RangeError('Unknown model class identifier');
    const label = labels[value]; rawCounts[label] = (rawCounts[label] || 0) + 1;
    const group = groups[label]; groupIds[y * targetWidth + x] = group ? names.indexOf(group) + 1 : 0;
  }
  const visited = new Uint8Array(size), queue = new Int32Array(size), components = [];
  let belowThreshold = 0, belowThresholdPixels = 0;
  for (let start = 0; start < size; start++) {
    const group = groupIds[start]; if (!group || visited[start]) continue;
    let head = 0, tail = 1, minX = targetWidth, minY = targetHeight, maxX = 0, maxY = 0;
    queue[0] = start; visited[start] = 1;
    while (head < tail) {
      const p = queue[head++], x = p % targetWidth, y = Math.floor(p / targetWidth);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || nx >= targetWidth || ny < 0 || ny >= targetHeight) continue;
        const next = ny * targetWidth + nx;
        if (!visited[next] && groupIds[next] === group) { visited[next] = 1; queue[tail++] = next; }
      }
    }
    if (tail < Math.max(12, size * .002)) { belowThreshold++; belowThresholdPixels += tail; continue; }
    components.push({ kind: names[group - 1], pixelCount: tail, pixels: queue.slice(0, tail),
      box: { x: minX / targetWidth, y: minY / targetHeight, width: (maxX - minX + 1) / targetWidth, height: (maxY - minY + 1) / targetHeight } });
  }
  // Give each detected class one place before filling the remaining slots by area.
  // This changes presentation only; the underlying predictions are unchanged.
  components.sort((a, b) => b.pixelCount - a.pixelCount);
  const selected = [], seen = new Set();
  for (const component of components) if (!seen.has(component.kind)) { selected.push(component); seen.add(component.kind); }
  for (const component of components) if (selected.length < 12 && !selected.includes(component)) selected.push(component);
  selected.sort((a, b) => b.pixelCount - a.pixelCount);
  const mask = new Uint8ClampedArray(size * 4), regionMap = new Uint8Array(size);
  const cues = selected.map((component, index) => {
    const definition = SCENE_CUES[component.kind];
    for (const p of component.pixels) { mask.set([...definition.color, 95], p * 4); regionMap[p] = index + 1; }
    return { id: index + 1, kind: component.kind, label: definition.label, box: component.box,
      pixelCount: component.pixelCount, status: 'unconfirmed model suggestion', confidence: null };
  });
  return { version: 'scene-deeplab-ade20k-wasm-v1', mode: 'scene', width: targetWidth, height: targetHeight,
    cues, mask, regionMap, model, elapsedMs, rawClassCounts: rawCounts,
    suppressed: { belowThreshold, belowThresholdPixels, overLimit: components.length - selected.length },
    geologicalIdentification: 'unconfirmed' };
}

// Coordinates are normalized to the actual image, not the surrounding letterbox.
export function sceneCueAt(result, x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x >= 1 || y >= 1 ||
      result.regionMap?.length !== result.width * result.height) return null;
  const id = result.regionMap[Math.floor(y * result.height) * result.width + Math.floor(x * result.width)];
  return result.cues.find(cue => cue.id === id) || null;
}
