// Pixel appearance proposals only. Thresholds are engineering defaults, not
// calibrated geological classifications, confidence, or evidence of gold.
import { SCENE_CUES } from './scene-core.mjs';
export const DETECTOR_VERSION = 'local-contrast-1';
export const CUE_TYPES = {
  pale: {
    label: 'Pale linear contrast', color: [114, 235, 204],
    explanation: 'A light, low-colour strip contrasts with its surroundings. Check its shape and host material. Foam, glare, lichen and manufactured surfaces can look similar. Mineral identity is unresolved.'
  },
  dark: {
    label: 'Dark linear contrast', color: [202, 173, 255],
    explanation: 'A dark strip contrasts with its surroundings. Change the viewing angle and check for shadow, wet surfaces, organic matter or sediment. This does not identify a crack, black sand or a mineral.'
  },
  ...SCENE_CUES
};

export function fitInside(sourceWidth, sourceHeight, width, height) {
  if (![sourceWidth, sourceHeight, width, height].every(n => Number.isFinite(n) && n > 0)) return null;
  const scale = Math.min(width / sourceWidth, height / sourceHeight);
  const w = sourceWidth * scale, h = sourceHeight * scale;
  return { x: (width - w) / 2, y: (height - h) / 2, width: w, height: h };
}

export function analyseFrame({ data, width, height }, enabled = ['pale', 'dark']) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 ||
      width > 640 || height > 640 || !data || data.length !== width * height * 4) {
    throw new RangeError('Expected an RGBA frame with each side between 1 and 640 pixels.');
  }
  const size = width * height, stride = width + 1;
  const luminance = new Float32Array(size), saturation = new Float32Array(size);
  const integral = new Float64Array((width + 1) * (height + 1));
  for (let y = 0; y < height; y++) {
    let row = 0;
    for (let x = 0; x < width; x++) {
      const p = y * width + x, i = p * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2], max = Math.max(r, g, b);
      luminance[p] = .2126 * r + .7152 * g + .0722 * b;
      saturation[p] = max ? (max - Math.min(r, g, b)) / max : 0;
      row += luminance[p];
      integral[(y + 1) * stride + x + 1] = integral[y * stride + x + 1] + row;
    }
  }
  const radius = Math.max(5, Math.round(Math.min(width, height) / 22));
  const mask = new Uint8ClampedArray(size * 4), proposals = [];
  const queue = new Int32Array(size);
  for (const kind of ['pale', 'dark'].filter(k => enabled.includes(k))) {
    const pixels = new Uint8Array(size);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (data[p * 4 + 3] < 240) continue;
      const left = Math.max(0, x - radius), right = Math.min(width, x + radius + 1);
      const top = Math.max(0, y - radius), bottom = Math.min(height, y + radius + 1);
      const mean = (integral[bottom * stride + right] - integral[top * stride + right] -
        integral[bottom * stride + left] + integral[top * stride + left]) / ((right - left) * (bottom - top));
      const contrast = luminance[p] - mean;
      pixels[p] = kind === 'pale'
        ? +(luminance[p] >= 130 && saturation[p] <= .28 && contrast >= 22)
        : +(luminance[p] <= 120 && saturation[p] <= .5 && contrast <= -22);
    }
    for (let start = 0; start < size; start++) {
      if (!pixels[start]) continue;
      let head = 0, tail = 1, minX = width, minY = height, maxX = 0, maxY = 0;
      queue[0] = start; pixels[start] = 0;
      while (head < tail) {
        const p = queue[head++], x = p % width, y = Math.floor(p / width);
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        // Eight neighbours preserve thin diagonal features; no row wrapping.
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const next = ny * width + nx;
          if (pixels[next]) { pixels[next] = 0; queue[tail++] = next; }
        }
      }
      const w = maxX - minX + 1, h = maxY - minY + 1;
      // A bounding-box ratio also accepts diagonal lines. Broad boundaries,
      // small speckles and whole-frame exposure changes are suppressed.
      const thin = tail / Math.max(w, h);
      if (tail < Math.max(18, size * .00025) || tail > size * .18 ||
          Math.max(w, h) < Math.max(14, Math.min(width, height) * .08) ||
          Math.max(w, h) / Math.max(1, thin) < 3) continue;
      proposals.push({ kind, pixelCount: tail, box: { x: minX / width, y: minY / height,
        width: w / width, height: h / height }, pixels: queue.slice(0, tail) });
    }
  }
  const cues = proposals.sort((a, b) => b.pixelCount - a.pixelCount).slice(0, 8).map((p, i) => {
    const color = CUE_TYPES[p.kind].color;
    for (const pixel of p.pixels) { mask.set([...color, 115], pixel * 4); }
    return { id: i + 1, kind: p.kind, label: CUE_TYPES[p.kind].label,
      box: p.box, pixelCount: p.pixelCount, status: 'unconfirmed visual cue' };
  });
  return { version: DETECTOR_VERSION, width, height, cues, mask };
}
