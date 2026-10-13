import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const $ = id => document.getElementById(id);
let connected = false, busy = false, currentJob, selectedURL, depthURL, disposeViewer;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function updateButton() { $('process').disabled = !connected || busy || !$('photo').files[0]; }
async function request(path, options = {}) {
  const response = await fetch(path, {...options, headers: {...options.headers, Authorization: `Bearer ${$('key').value}`}, signal: AbortSignal.timeout(45000)});
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Service returned ${response.status}`);
  }
  return response;
}
$('key').addEventListener('input', () => { connected = false; updateButton(); });
$('connect').addEventListener('click', async () => {
  $('connection').textContent = 'Checking the PC service…';
  try {
    const health = await (await request('/api/health')).json();
    connected = health.service === 'reachable' && health.model === 'loaded';
    $('connection').textContent = `PC service reachable; Small model loaded on ${health.device}. ${health.lastSuccessfulInference ? 'This service has completed a model inference.' : 'Actual model processing has not yet completed in this session.'}`;
  } catch (error) { connected = false; $('connection').textContent = `Connection not verified: ${error.message}`; }
  updateButton();
});
$('photo').addEventListener('change', () => {
  if (selectedURL) URL.revokeObjectURL(selectedURL);
  $('results').hidden = true;
  disposeViewer?.(); disposeViewer = undefined; currentJob = undefined;
  const file = $('photo').files[0];
  if (file && file.size <= 12 * 1024 * 1024 && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    selectedURL = URL.createObjectURL(file); $('original').src = selectedURL; $('original').hidden = false;
    $('status').textContent = 'Photo selected. It has not been uploaded.';
  } else {
    $('photo').value = ''; $('original').hidden = true;
    $('status').textContent = 'Choose a JPEG, PNG or WebP photo under 12 MB.';
  }
  updateButton();
});
$('process').addEventListener('click', async () => {
  busy = true; updateButton(); $('photo').disabled = true; $('key').disabled = true; $('connect').disabled = true;
  $('results').hidden = true;
  try {
    $('status').textContent = 'Uploading photo to the PC…';
    const job = await (await request('/api/jobs', {method: 'POST', body: $('photo').files[0]})).json();
    currentJob = job.id;
    // Keep only the job ID for reload recovery; the access key stays in memory.
    sessionStorage.setItem('tradesight-photo-job', currentJob);
    await followJob(currentJob);
  } catch (error) { $('status').textContent = `Could not complete processing: ${error.message}. Reconnect and retry, or resume the saved job.`; }
  finally { busy = false; $('photo').disabled = false; $('key').disabled = false; $('connect').disabled = false; updateButton(); }
});
async function followJob(id) {
  const deadline = Date.now() + 20 * 60 * 1000;
  while (Date.now() < deadline) {
    const state = await (await request(`/api/jobs/${id}`)).json();
    $('status').textContent = state.status === 'queued' ? 'Waiting in the PC queue…' : state.status === 'processing' ? 'PC is estimating relative depth…' : state.status;
    if (state.status === 'failed') throw new Error(state.error);
    if (state.status === 'complete') {
      await showResult(id, state); return;
    }
    await delay(2000);
  }
  throw new Error('Still waiting after 20 minutes. Resume this job later');
}
async function showResult(id, state) {
  if (depthURL) URL.revokeObjectURL(depthURL);
  depthURL = URL.createObjectURL(await (await request(`/api/jobs/${id}/depth.png`)).blob());
  $('depth').src = depthURL;
  const grid = await (await request(`/api/jobs/${id}/relief.json`)).json();
  $('results').hidden = false;
  disposeViewer?.();
  try { disposeViewer = renderRelief(grid); }
  catch { $('viewer').textContent = '3D preview unavailable on this device. Depth and OBJ downloads remain available.'; }
  currentJob = id;
  $('status').textContent = 'Model processing completed. Results show inferred relative depth.';
  $('provenance').textContent = `${state.boundary} Model: ${state.provenance.model}; revision: ${state.provenance.revision}; ${state.provenance.implementation}.`;
}
function renderRelief(grid) {
  const mount = $('viewer'); mount.replaceChildren();
  const renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); mount.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#172831');
  const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 100); camera.position.set(0, 0, 2.5);
  const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true;
  const geometry = new THREE.PlaneGeometry(grid.aspect, 1, grid.width - 1, grid.height - 1);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) positions.setZ(i, grid.values[i] * 0.3);
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({color: '#8fe2cc', side: THREE.DoubleSide, roughness: 0.8});
  scene.add(new THREE.Mesh(geometry, material)); scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const light = new THREE.DirectionalLight(0xffffff, 3); light.position.set(-1, 2, 3); scene.add(light);
  const resize = new ResizeObserver(() => {
    camera.aspect = mount.clientWidth / mount.clientHeight; camera.updateProjectionMatrix();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
  }); resize.observe(mount);
  renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
  return () => { resize.disconnect(); renderer.setAnimationLoop(null); controls.dispose(); geometry.dispose(); material.dispose(); renderer.dispose(); mount.replaceChildren(); };
}
for (const [button, name] of [['obj', 'inferred-relief.obj'], ['raw', 'relative-depth.npy'], ['map', 'depth.png']]) {
  $(button).addEventListener('click', async () => {
    try {
      const blob = await (await request(`/api/jobs/${currentJob}/${name}`)).blob();
      const url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { $('status').textContent = `Download failed: ${error.message}`; }
  });
}
const saved = sessionStorage.getItem('tradesight-photo-job');
if (saved && /^[a-f0-9]{32}$/.test(saved)) {
  const resume = document.createElement('button'); resume.textContent = 'Resume last uploaded job';
  $('status').after(resume);
  resume.addEventListener('click', async () => {
    if (busy) return;
    busy = true; updateButton(); resume.disabled = true;
    $('photo').disabled = true; $('key').disabled = true; $('connect').disabled = true;
    try { await followJob(saved); } catch (error) { $('status').textContent = error.message; }
    finally { busy = false; resume.disabled = false; $('photo').disabled = false; $('key').disabled = false; $('connect').disabled = false; updateButton(); }
  });
}
