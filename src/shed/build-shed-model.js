import * as THREE from 'three';
import { SHED_ESTIMATE_ASSUMPTIONS } from './shed-item-list.js';

export const SHED_MODEL_COLORS = {
  cladding: {
    'colorbond-steel': { color: 0x8a97a6, metalness: 0.55, roughness: 0.4 },
    'fibre-cement': { color: 0xcfc6b8, metalness: 0.02, roughness: 0.88 },
    'timber-weatherboard': { color: 0x8a5a34, metalness: 0.0, roughness: 0.8 }
  },
  roof: { color: 0x3b4552, metalness: 0.5, roughness: 0.35 },
  door: 0x3d4a5c,
  window: 0x8fd0e0,
  boundary: 0xf0b429,
  post: { color: 0x51616f, metalness: 0.35, roughness: 0.55 }
};

function angleFromAllowance(allowance) {
  return Math.acos(Math.min(0.999, 1 / allowance));
}

function material(spec, opts = {}) {
  return new THREE.MeshStandardMaterial({ color: spec.color, metalness: spec.metalness, roughness: spec.roughness, ...opts });
}

function buildOpening(width, height, color, opts = {}) {
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.5, ...opts }));
}

export function disposeShedModel(group) {
  if (!group) return;
  group.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((item) => item.dispose());
    }
  });
}

export function buildShedModel(plan) {
  const group = new THREE.Group();
  const { widthM: w, lengthM: l, wallHeightM: h } = plan;
  const a = SHED_ESTIMATE_ASSUMPTIONS;

  const roofMat = material(SHED_MODEL_COLORS.roof);

  if (plan.openSides) {
    const postMat = material(SHED_MODEL_COLORS.post);
    const postSize = 0.12;
    const postInset = postSize / 2;
    [
      [w / 2 - postInset, l / 2 - postInset],
      [-(w / 2 - postInset), l / 2 - postInset],
      [w / 2 - postInset, -(l / 2 - postInset)],
      [-(w / 2 - postInset), -(l / 2 - postInset)]
    ].forEach(([x, z]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(postSize, h, postSize), postMat);
      post.position.set(x, h / 2, z);
      group.add(post);
    });
  } else {
    const wallMat = material(SHED_MODEL_COLORS.cladding[plan.claddingType] || SHED_MODEL_COLORS.cladding['colorbond-steel']);
    const walls = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), wallMat);
    walls.position.set(0, h / 2, 0);
    group.add(walls);
  }

  const overhang = 0.18;
  const roofThickness = 0.07;

  if (plan.roofType === 'gable') {
    const theta = angleFromAllowance(a.gablePitchAllowance);
    const halfSpan = w / 2 + overhang;
    const slopeLen = halfSpan / Math.cos(theta);
    const ridgeRise = halfSpan * Math.tan(theta);

    [-1, 1].forEach((side) => {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, roofThickness, l + overhang * 2), roofMat);
      panel.position.set(side * halfSpan / 2, h + ridgeRise / 2, 0);
      panel.rotation.z = -side * theta;
      group.add(panel);
    });
  } else {
    const theta = angleFromAllowance(a.skillionFallAllowance);
    const runLen = l + overhang * 2;
    const slopeLen = runLen / Math.cos(theta);
    const rise = runLen * Math.tan(theta);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + overhang * 2, roofThickness, slopeLen), roofMat);
    roof.position.set(0, h + rise / 2, 0);
    roof.rotation.x = -theta;
    group.add(roof);
  }

  if (!plan.openSides) {
    const doorW = a.standardDoorM.width;
    const doorH = a.standardDoorM.height;
    for (let i = 0; i < plan.doorCount; i += 1) {
      const spacing = w / (plan.doorCount + 1);
      const door = buildOpening(doorW, doorH, SHED_MODEL_COLORS.door, { roughness: 0.6 });
      door.position.set(-w / 2 + spacing * (i + 1), doorH / 2, l / 2 + 0.01);
      group.add(door);
    }

    const winW = a.standardWindowM.width;
    const winH = a.standardWindowM.height;
    for (let i = 0; i < plan.windowCount; i += 1) {
      const spacing = l / (plan.windowCount + 1);
      const win = buildOpening(winW, winH, SHED_MODEL_COLORS.window, { roughness: 0.08, metalness: 0.2, opacity: 0.6, transparent: true });
      win.position.set(w / 2 + 0.01, h * 0.58, -l / 2 + spacing * (i + 1));
      win.rotation.y = Math.PI / 2;
      group.add(win);
    }
  }

  if (plan.boundaryDistanceM != null) {
    const points = [];
    const bz = l / 2 + plan.boundaryDistanceM;
    const halfW = w / 2 + 1.2;
    for (let x = -halfW; x <= halfW; x += 0.4) {
      points.push(new THREE.Vector3(x, 0.02, bz), new THREE.Vector3(Math.min(x + 0.22, halfW), 0.02, bz));
    }
    const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.LineSegments(lineGeom, new THREE.LineBasicMaterial({ color: SHED_MODEL_COLORS.boundary }));
    group.add(line);
  }

  return group;
}
