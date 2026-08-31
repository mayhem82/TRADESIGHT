import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { buildShedPlanPathway } from '../shed/shed-review-pathway.js';
import { buildShedModel, disposeShedModel, SHED_MODEL_COLORS } from '../shed/build-shed-model.js';

const initialForm = {
  widthM: '3',
  lengthM: '4',
  wallHeightM: '2.1',
  roofType: 'skillion',
  claddingType: 'colorbond-steel',
  floorType: 'concrete-slab',
  doorCount: '1',
  windowCount: '0',
  boundaryDistanceM: ''
};

export function ShedPlanner() {
  const [form, setForm] = useState(initialForm);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  const pathway = useMemo(() => buildShedPlanPathway(form), [form]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const width = mount.clientWidth || 640;
    const height = mount.clientHeight || 420;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.62));
    const key = new THREE.DirectionalLight(0xffffff, 0.95);
    key.position.set(6, 9, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x7dd3fc, 0.25);
    fill.position.set(-6, 4, -4);
    scene.add(fill);

    const ground = new THREE.Mesh(new THREE.CircleGeometry(30, 48), new THREE.MeshStandardMaterial({ color: 0x0b1119, roughness: 1, metalness: 0 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);
    scene.add(new THREE.GridHelper(30, 30, 0x2a3a4c, 0x18232f));

    const view = { theta: Math.PI * 0.28, phi: Math.PI * 0.36, radius: 9, target: new THREE.Vector3(0, 1, 0) };
    const drag = { active: false, x: 0, y: 0, theta: 0, phi: 0 };
    let autoRotate = true;
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrame;
    let shedGroup = null;

    function updateCamera() {
      const { theta, phi, radius, target } = view;
      camera.position.set(
        target.x + radius * Math.sin(phi) * Math.sin(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(target);
    }

    function onPointerDown(event) {
      drag.active = true;
      autoRotate = false;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.theta = view.theta;
      drag.phi = view.phi;
    }
    function onPointerMove(event) {
      if (!drag.active) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      view.theta = drag.theta - dx * 0.006;
      view.phi = Math.min(Math.PI * 0.49, Math.max(Math.PI * 0.08, drag.phi - dy * 0.006));
      updateCamera();
    }
    function onPointerUp() { drag.active = false; }
    function onWheel(event) {
      event.preventDefault();
      view.radius = Math.min(22, Math.max(3.5, view.radius + event.deltaY * 0.01));
      updateCamera();
    }
    function onResize() {
      const nextWidth = mount.clientWidth || width;
      const nextHeight = mount.clientHeight || height;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    }

    function animate() {
      animationFrame = requestAnimationFrame(animate);
      if (autoRotate && !reducedMotion) {
        view.theta += 0.0022;
        updateCamera();
      }
      renderer.render(scene, camera);
    }

    mount.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    mount.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);

    updateCamera();
    animate();

    sceneRef.current = {
      setPlan(plan) {
        if (shedGroup) {
          scene.remove(shedGroup);
          disposeShedModel(shedGroup);
        }
        shedGroup = buildShedModel(plan);
        scene.add(shedGroup);
        view.target.set(0, plan.wallHeightM / 2, 0);
        view.radius = Math.max(6, Math.max(plan.widthM, plan.lengthM) * 1.6);
        onResize();
        updateCamera();
      }
    };

    return () => {
      cancelAnimationFrame(animationFrame);
      mount.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      mount.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      disposeShedModel(shedGroup);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (pathway.itemList.status === 'estimate') {
      sceneRef.current?.setPlan(pathway.plan);
    }
  }, [pathway]);

  return (
    <article className="wide-card">
      <div className="panel-heading">
        <div>
          <h2>Shed Model Builder</h2>
          <p>Enter shed dimensions to build a 3D model and a materials item list estimate.</p>
        </div>
        <span className="status-pill">Homeowner planning tool</span>
      </div>

      <div className="shed-form-grid">
        <label>
          Width (m)
          <input type="number" min="0" step="0.1" value={form.widthM} onChange={(event) => updateField('widthM', event.target.value)} />
        </label>
        <label>
          Length (m)
          <input type="number" min="0" step="0.1" value={form.lengthM} onChange={(event) => updateField('lengthM', event.target.value)} />
        </label>
        <label>
          Wall height (m)
          <input type="number" min="0" step="0.1" value={form.wallHeightM} onChange={(event) => updateField('wallHeightM', event.target.value)} />
        </label>
        <label>
          Distance to nearest boundary (m)
          <input type="number" min="0" step="0.1" value={form.boundaryDistanceM} onChange={(event) => updateField('boundaryDistanceM', event.target.value)} placeholder="Not entered" />
        </label>
        <label>
          Roof type
          <select value={form.roofType} onChange={(event) => updateField('roofType', event.target.value)}>
            <option value="skillion">Skillion</option>
            <option value="gable">Gable</option>
          </select>
        </label>
        <label>
          Wall cladding
          <select value={form.claddingType} onChange={(event) => updateField('claddingType', event.target.value)}>
            <option value="colorbond-steel">Colorbond steel</option>
            <option value="fibre-cement">Fibre cement</option>
            <option value="timber-weatherboard">Timber weatherboard</option>
          </select>
        </label>
        <label>
          Floor type
          <select value={form.floorType} onChange={(event) => updateField('floorType', event.target.value)}>
            <option value="concrete-slab">Concrete slab</option>
            <option value="bearers-and-joists">Bearers and joists</option>
          </select>
        </label>
        <label>
          Doors
          <input type="number" min="0" step="1" value={form.doorCount} onChange={(event) => updateField('doorCount', event.target.value)} />
        </label>
        <label>
          Windows
          <input type="number" min="0" step="1" value={form.windowCount} onChange={(event) => updateField('windowCount', event.target.value)} />
        </label>
      </div>

      {pathway.missingDetails.length > 0 && (
        <div className="shed-warning">
          <strong>Missing before a model can be built:</strong>
          <ul>{pathway.missingDetails.map((detail) => <li key={detail}>{detail}</li>)}</ul>
        </div>
      )}

      {pathway.itemList.status === 'estimate' && (
        <div className="shed-model-wrap">
          <div className="shed-model-stage" ref={mountRef}>
            <span className="shed-model-hint">drag to orbit &middot; scroll to zoom</span>
          </div>
          <div className="shed-model-legend">
            <span><i className="shed-swatch" style={{ background: `#${(SHED_MODEL_COLORS.cladding[pathway.plan.claddingType] || SHED_MODEL_COLORS.cladding['colorbond-steel']).color.toString(16).padStart(6, '0')}` }} />Wall cladding</span>
            <span><i className="shed-swatch" style={{ background: `#${SHED_MODEL_COLORS.roof.color.toString(16).padStart(6, '0')}` }} />Roofing</span>
            <span><i className="shed-swatch" style={{ background: `#${SHED_MODEL_COLORS.door.toString(16).padStart(6, '0')}` }} />Door</span>
            <span><i className="shed-swatch" style={{ background: `#${SHED_MODEL_COLORS.window.toString(16).padStart(6, '0')}` }} />Window</span>
            <span><i className="shed-swatch" style={{ background: `#${SHED_MODEL_COLORS.boundary.toString(16).padStart(6, '0')}` }} />Boundary offset</span>
          </div>
        </div>
      )}

      {pathway.plan.floorAreaM2 != null && (
        <dl className="facts compact">
          <div><dt>Floor area</dt><dd>{pathway.plan.floorAreaM2} m2</dd></div>
          <div><dt>Roof type</dt><dd>{pathway.plan.roofType}</dd></div>
          <div><dt>Floor type</dt><dd>{pathway.plan.floorType}</dd></div>
        </dl>
      )}

      {pathway.itemList.status === 'estimate' && (
        <div className="shed-item-table-wrap">
          <table className="shed-item-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {pathway.itemList.items.map((item) => (
                <tr key={`${item.category}-${item.item}`}>
                  <td>{item.category}</td>
                  <td>{item.item}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td className="muted">{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted">{pathway.itemList.note}</p>
        </div>
      )}

      <div className="shed-warning">
        <strong>Development pathway - verify before building:</strong>
        <ul>{pathway.developmentPathwayFlags.map((flag) => <li key={flag}>{flag}</li>)}</ul>
      </div>
    </article>
  );
}
