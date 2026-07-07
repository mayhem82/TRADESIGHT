import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const captureSteps = [
  'Open Polycam or another phone photogrammetry app and choose Photo Mode / 3D Capture.',
  'Walk a slow clockwise loop with 60-80% overlap between photos.',
  'Capture high, middle, low, and underside angles. Add a tape measure or known board width for scale.',
  'Export the model as GLB when available. OBJ also works later, but GLB is the preferred TRADESIGHT target.',
  'Load the GLB below. Tap the scan surface to create spatial observations for the evidence register.'
];

function disposeObject3D(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value && typeof value.dispose === 'function') value.dispose();
        });
        material.dispose();
      });
    }
  });
}

function formatPoint(point) {
  if (!point) return '';
  return `x ${point.x.toFixed(2)}, y ${point.y.toFixed(2)}, z ${point.z.toFixed(2)}`;
}

export function PhoneScanWorkflow({ onScanEvidence, onScanObservation }) {
  const mountRef = useRef(null);
  const modelRef = useRef(null);
  const markerRef = useRef(null);
  const fileUrlRef = useRef(null);
  const [modelStatus, setModelStatus] = useState('No GLB loaded yet.');
  const [modelName, setModelName] = useState('');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [observationText, setObservationText] = useState('');

  const scanState = useMemo(() => ({
    capture: 'Phone-first',
    reconstruction: 'External photogrammetry app/service',
    viewer: 'TRADESIGHT Three.js GLB viewer',
    evidenceMode: 'Spatial notes + report linkage'
  }), []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1118);

    const width = mount.clientWidth || 640;
    const height = mount.clientHeight || 360;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3, 2.2, 4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.position.set(5, 8, 4);
    scene.add(light);

    const grid = new THREE.GridHelper(4, 8, 0x4f6378, 0x263445);
    scene.add(grid);

    const markerMaterial = new THREE.MeshStandardMaterial({ color: 0xffc400, emissive: 0x332200 });
    const markerGeometry = new THREE.SphereGeometry(0.045, 18, 18);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const loader = new GLTFLoader();
    let animationFrame;

    function placeMarker(point) {
      if (markerRef.current) scene.remove(markerRef.current);
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(point);
      scene.add(marker);
      markerRef.current = marker;
    }

    function loadModel(url, name) {
      setModelStatus('Loading scan model...');
      loader.load(
        url,
        (gltf) => {
          if (modelRef.current) {
            scene.remove(modelRef.current);
            disposeObject3D(modelRef.current);
          }
          if (markerRef.current) {
            scene.remove(markerRef.current);
            markerRef.current = null;
          }
          setSelectedPoint(null);
          setObservationText('');

          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxAxis = Math.max(size.x, size.y, size.z) || 1;
          const scale = 2.8 / maxAxis;

          model.position.sub(center);
          model.scale.setScalar(scale);
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          scene.add(model);
          modelRef.current = model;
          setModelName(name);
          setModelStatus('Loaded and recorded as scan evidence. Tap the model to mark an observation point.');
        },
        undefined,
        () => setModelStatus('Could not load this file. Export as GLB and try again.')
      );
    }

    function handlePointerDown(event) {
      if (!modelRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const hits = raycaster.intersectObject(modelRef.current, true);
      if (!hits.length) return;

      const point = hits[0].point.clone();
      placeMarker(point);
      setSelectedPoint({ x: point.x, y: point.y, z: point.z });
      setModelStatus('Point selected. Write an observation and save it to evidence.');
    }

    const handleResize = () => {
      const nextWidth = mount.clientWidth || width;
      const nextHeight = mount.clientHeight || height;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', handleResize);
    animate();

    mount.loadTradesightModel = loadModel;

    return () => {
      cancelAnimationFrame(animationFrame);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleResize);
      if (modelRef.current) disposeObject3D(modelRef.current);
      markerGeometry.dispose();
      markerMaterial.dispose();
      disposeObject3D(scene);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      delete mount.loadTradesightModel;
      if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
    };
  }, []);

  function handleModelFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.glb')) {
      setModelStatus('Rejected. TRADESIGHT currently accepts GLB exports only.');
      return;
    }

    if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    fileUrlRef.current = objectUrl;
    mountRef.current?.loadTradesightModel?.(objectUrl, file.name);
    onScanEvidence?.({
      fileName: file.name,
      mimeType: file.type || 'model/gltf-binary',
      sizeBytes: file.size || 0,
      observedAt: new Date().toISOString()
    });
  }

  function saveObservation() {
    if (!selectedPoint || !observationText.trim()) return;
    onScanObservation?.({
      modelName,
      point: selectedPoint,
      text: observationText.trim(),
      observedAt: new Date().toISOString()
    });
    setObservationText('');
    setModelStatus('Observation saved to evidence. Tap another point to continue inspection.');
  }

  return (
    <article className="wide-card scan-workflow">
      <div className="panel-heading">
        <div>
          <h2>Phone 3D Scan Workflow</h2>
          <p>Capture on the phone, reconstruct with a photogrammetry app, then load the GLB into TRADESIGHT for spatial evidence review.</p>
        </div>
        <span className="status-pill">3D intake</span>
      </div>

      <dl className="facts compact">
        <div><dt>Capture</dt><dd>{scanState.capture}</dd></div>
        <div><dt>Reconstruction</dt><dd>{scanState.reconstruction}</dd></div>
        <div><dt>Viewer</dt><dd>{scanState.viewer}</dd></div>
      </dl>

      <div className="scan-layout">
        <div>
          <label className="file-loader">
            Load GLB scan export
            <input type="file" accept=".glb,model/gltf-binary" onChange={handleModelFile} />
          </label>
          <p className="muted">{modelStatus}</p>
          {modelName && <p className="muted">Current model: {modelName}</p>}

          {selectedPoint && (
            <div className="scan-note-panel">
              <div className="muted">Selected point: {formatPoint(selectedPoint)}</div>
              <textarea
                value={observationText}
                onChange={(event) => setObservationText(event.target.value)}
                placeholder="Record defect, condition, measurement, or uncertainty at this point."
                rows={3}
              />
              <div className="actions">
                <button type="button" onClick={saveObservation} disabled={!observationText.trim()}>Save Scan Observation</button>
              </div>
            </div>
          )}

          <ol className="walkthrough-list">
            {captureSteps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </div>

        <div className="scan-viewer" ref={mountRef} aria-label="3D scan viewer" />
      </div>
    </article>
  );
}
