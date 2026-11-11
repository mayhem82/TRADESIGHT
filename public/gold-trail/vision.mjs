import { CUE_TYPES, DETECTOR_VERSION, fitInside } from './vision-core.mjs';
import { canQueryContext, loadMappedContext, GEOLOGY_GUIDE, MINERAL_GUIDE } from './camera-geology.mjs';
import { readPhotoLocation, embedPhotoLocation, validPhotoLocation, locationLabel } from './photo-metadata.mjs';
import { photoStore } from './photo-store.mjs';

export function setupVision({ video, view, releaseCamera, openCamera, captureContext, selectCue, toast,
  pickPhotoLocation, cancelPhotoPin, assignPhotoGps, onPhotosChanged, showPhotoOnMap }) {
  const $ = id => document.getElementById(id);
  const canvas = $('scanCanvas'), ctx = canvas.getContext('2d');
  let worker = null, epoch = 0, sequence = 0, timer, watchdog;
  let pending = null, displayed = null, selected = null, running = false, cameraActive = false;
  let geology = null, geologyController = null;
  let photo = null, photoBusy = false;
  let scanMode = 'contrast';
  const cueReviews = new Map();
  const status = text => { $('scanStatus').textContent = text; $('scanPanelStatus').textContent = text; };
  const enabled = () => ['pale', 'dark'].filter(kind => $('scan-' + kind).checked);

  function cancelWork() {
    epoch++; worker?.terminate(); worker = null; pending = null;
    clearTimeout(timer); clearTimeout(watchdog);
  }
  function clearGeology() {
    geologyController?.abort(); geologyController = null; geology = null;
    $('scanGeology').replaceChildren();
  }
  function controls() {
    $('scanCamera').disabled = !cameraActive;
    $('scanStart').disabled = !cameraActive;
    $('freezeScan').disabled = (!displayed && !pending) || pending?.mode === 'scene';
    $('freezeScan').textContent = running ? 'Freeze frame' : 'Resume scan';
    $('freezeScan').hidden = displayed?.context.source === 'photo';
    $('scanReadout').hidden = !view.classList.contains('scan-active');
    $('scanSource').textContent = running ? 'CAMERA SCAN · UPDATING' :
      displayed?.context.source === 'photo' ? 'LOCAL PHOTO · STILL IMAGE' : 'CAMERA FRAME · FROZEN';
    if (displayed?.result.model) $('scanSource').textContent = 'AI SCENE · ' + $('scanSource').textContent;
    $('scanCamera').setAttribute('aria-pressed', String(running));
    $('scanGeoButton').disabled = !canQueryContext(displayed?.context) || !!geologyController;
    $('scanGeoButton').textContent = displayed?.context.source === 'photo' ? 'Load mapped geology at photo location' : 'Load mapped geology at camera position';
    $('scanGeoPrivacy').textContent = canQueryContext(displayed?.context)
      ? 'Optional lookup sends the attached coordinate and your IP to GSNSW. No image is sent. Map context does not identify the highlighted feature.'
      : displayed?.context.source === 'photo'
        ? validPhotoLocation(displayed.context.location) ? 'Photo location is outside supported mainland NSW geology coverage.' : 'Photo location is not set. Read embedded GPS, pinpoint on the map, or explicitly assign your current position.'
        : 'Enable GPS before scanning to attach a camera position. A map search centre is never used as the camera position.';
    $('photoLocationPanel').hidden = !photo;
    $('photoLocationName').textContent = photo?.name || '';
    $('photoLocationStatus').textContent = photo ? locationLabel(photo.location) : '';
    $('photoRestoreGps').hidden = !photo?.originalLocation;
    $('photoShowMap').disabled = !validPhotoLocation(photo?.location);
    for (const id of ['photoUseGps', 'photoPinMap', 'photoSave', 'photoDownload', 'photoRestoreGps']) $(id).disabled = !photo || photoBusy;
    $('photoSave').textContent = photo?.saved && !photo.dirty ? 'Photo saved locally' : 'Save photo + location locally';
    $('returnToPhoto').hidden = !photo || !view.hidden;
    $('scanObservation').disabled = !selected || photoBusy;
    $('analyseScene').disabled = (!displayed && !cameraActive) || photoBusy || pending?.mode === 'scene';
    $('cancelScene').hidden = pending?.mode !== 'scene';
    $('contrastView').hidden = !displayed?.result.model;
    $('sceneReview').hidden = !selected || !displayed?.result.model;
    $('sceneReviewStatus').textContent = selected && cueReviews.has(selected.id) ? 'Your visual review: ' + cueReviews.get(selected.id).verdict + '. Geological identification remains unconfirmed.' : 'Model suggestion awaiting visual review.';
    $('scanFilters').hidden = !!displayed?.result.model;
  }
  function reset() {
    cancelWork(); clearGeology(); cancelPhotoPin?.(); running = false; selected = null; displayed = null; photo = null; photoBusy = false; scanMode = 'contrast'; cueReviews.clear();
    canvas.width = canvas.height = 1; canvas.hidden = true;
    view.classList.remove('scan-active'); $('scanResults').replaceChildren();
    $('scanExplanation').textContent = ''; $('scanObservation').textContent = '';
    status('Scan off. Open the camera or choose a photo to inspect visible contrasts.'); controls();
  }
  function fail(message) {
    if (scanMode === 'scene' && displayed) {
      cancelWork(); running = false; scanMode = displayed.result.model ? 'scene' : 'contrast'; controls();
      status('AI scene analysis unavailable: ' + message + '. The photo, saved location and contrast view are still available.'); return;
    }
    // Never retain a result whose source frame could no longer be refreshed.
    reset(); if (!cameraActive) view.hidden = true;
    status('Scan unavailable: ' + message + '. You can still use the camera and written notes.');
    toast('Scan unavailable: ' + message);
  }
  function ensureWorker() {
    if (worker) return worker;
    const local = epoch;
    worker = scanMode === 'scene' ? new Worker(new URL('./scene-worker.js', import.meta.url))
      : new Worker(new URL('./vision-worker.mjs', import.meta.url), { type: 'module' });
    worker.onerror = () => { if (local === epoch) fail('the local image worker could not start'); };
    worker.onmessage = ({ data }) => {
      if (local !== epoch || !pending || data.id !== pending.id) return;
      if (data.progress) { status(data.progress + ' Cancel is available.'); return; }
      clearTimeout(watchdog);
      if (data.error) { fail(data.error); return; }
      clearGeology(); displayed = { ...pending, result: data.result }; pending = null; selected = null; cueReviews.clear();
      render(); controls();
      status(data.result.model ? `${data.result.cues.length} AI region suggestions · ${(data.result.elapsedMs / 1000).toFixed(1)} s model time. Tap a region to inspect it; uncoloured areas remain unresolved.` : data.result.cues.length
        ? `${data.result.cues.length} unconfirmed contrast cues. Select a numbered cue to inspect it.`
        : 'No matching linear contrasts in this frame. This says nothing about minerals or gold.');
      if (running) timer = setTimeout(capture, scanMode === 'scene' ? 1500 : 500);
    };
    return worker;
  }
  function submit(frame, context) {
    if (pending) return;
    const pixels = frame.getContext('2d').getImageData(0, 0, frame.width, frame.height);
    pending = { frame, context, id: ++sequence, mode: scanMode };
    try {
      ensureWorker().postMessage({ id: pending.id, enabled: enabled(),
        frame: { data: pixels.data, width: frame.width, height: frame.height } }, [pixels.data.buffer]);
      watchdog = setTimeout(() => fail('processing timed out'), scanMode === 'scene' ? 90000 : 8000);
    } catch (error) { fail(error.message); }
    controls();
  }
  function makeFrame(source, width, height) {
    if (!width || !height) throw new Error('No camera frame is ready yet');
    const scale = Math.min(1, 480 / Math.max(width, height));
    const frame = document.createElement('canvas');
    frame.width = Math.max(1, Math.round(width * scale));
    frame.height = Math.max(1, Math.round(height * scale));
    frame.getContext('2d').drawImage(source, 0, 0, frame.width, frame.height);
    return frame;
  }
  function capture() {
    if (!running || !cameraActive || pending || document.hidden) return;
    try {
      const frame = makeFrame(video, video.videoWidth, video.videoHeight);
      const context = { source: 'camera', capturedAt: new Date().toISOString(), ...captureContext() };
      if (scanMode === 'scene' && !displayed) {
        displayed = { frame, context, result: { version: 'image-preview', width: frame.width, height: frame.height,
          cues: [], mask: new Uint8ClampedArray(frame.width * frame.height * 4) } };
        render();
      }
      submit(frame, context);
    } catch (error) { fail(error.message); }
  }
  function render() {
    if (!displayed) return;
    const { frame, result } = displayed;
    canvas.width = frame.width; canvas.height = frame.height;
    ctx.drawImage(frame, 0, 0);
    const mask = document.createElement('canvas'); mask.width = frame.width; mask.height = frame.height;
    mask.getContext('2d').putImageData(new ImageData(result.mask, frame.width, frame.height), 0, 0);
    ctx.drawImage(mask, 0, 0);
    for (const cue of result.cues) {
      const { x, y, width, height } = cue.box;
      const px = x * canvas.width, py = y * canvas.height;
      const color = CUE_TYPES[cue.kind].color.join(',');
      ctx.strokeStyle = `rgb(${color})`; ctx.lineWidth = selected?.id === cue.id ? 3 : 1;
      ctx.setLineDash(selected?.id === cue.id ? [] : [4, 3]);
      ctx.strokeRect(px, py, width * canvas.width, height * canvas.height);
      ctx.setLineDash([]); ctx.fillStyle = '#0d1c18'; ctx.fillRect(px, py, 23, 22);
      ctx.font = 'bold 14px system-ui'; ctx.fillStyle = `rgb(${color})`;
      ctx.fillText(String(cue.id).padStart(2, '0'), px + 3, py + 16);
    }
    canvas.hidden = false; view.classList.add('scan-active');
    $('scanResults').replaceChildren(...result.cues.map(cue => {
      const button = document.createElement('button'); button.type = 'button';
      button.className = 'scan-cue ' + cue.kind;
      button.style.borderColor = 'rgb(' + CUE_TYPES[cue.kind].color.join(',') + ')';
      button.setAttribute('aria-pressed', String(selected?.id === cue.id));
      button.textContent = `${String(cue.id).padStart(2, '0')} · ${cue.label}`;
      button.onclick = () => choose(cue.id); return button;
    }));
    $('scanExplanation').textContent = selected ? CUE_TYPES[selected.kind].explanation :
      displayed.result.model ? 'Coloured masks show broad scene-model suggestions. Tap a region to review it. Uncoloured areas are other classes or unresolved; rock type and gold content remain unknown.' :
        'Tinted pixels show local contrast; boxes group those pixels. Select a cue to freeze and inspect. Appearance only; mineral and gold content remain unknown.';
    $('scanObservation').disabled = !selected;
    $('scanObservation').textContent = selected ? 'Use selected cue in field notes' : 'Select a cue to write a note';
    $('sceneModelDetails').hidden = !displayed.result.model;
    $('sceneModelSummary').textContent = displayed.result.model
      ? 'Experimental broad scene recognition. Rock type, mineral identity, placement and gold remain unconfirmed. Other labels can be errors. Raw class areas below describe model output, not confidence.' : '';
    $('sceneRawClasses').textContent = displayed.result.model ? JSON.stringify({ model: displayed.result.model, pixelsByRawLabel: displayed.result.rawClassCounts }, null, 2) : '';
  }
  function choose(id) {
    if (!displayed) return;
    running = false; cancelWork();
    selected = displayed.result.cues.find(cue => cue.id === id) || null;
    render(); controls(); status('Frame frozen for inspection. ' + (cameraActive ? 'Camera remains on; Close switches it off.' : 'Photo stays on this device.'));
    $('scanExplanation').focus({ preventScroll: true });
  }
  canvas.onclick = event => {
    if (!displayed) return;
    const rect = canvas.getBoundingClientRect();
    const fit = fitInside(canvas.width, canvas.height, rect.width, rect.height);
    if (!fit) return;
    const x = (event.clientX - rect.left - fit.x) / fit.width;
    const y = (event.clientY - rect.top - fit.y) / fit.height;
    const hit = displayed.result.cues.filter(({ box: b }) =>
      x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height)
      .sort((a, b) => a.box.width * a.box.height - b.box.width * b.box.height)[0];
    if (hit) choose(hit.id);
  };
  function observation() {
    if (!selected || !displayed) return null;
    return { detector: displayed.result.version || DETECTOR_VERSION, model: displayed.result.model || null,
      visualReview: cueReviews.get(selected.id) || null, ...displayed.context, kind: selected.kind,
      label: selected.label, box: { ...selected.box }, frameWidth: displayed.frame.width,
      frameHeight: displayed.frame.height, geologicalIdentification: 'unconfirmed',
      geologyContext: geology, geometryReference: 'analysed image; no world anchoring',
      status: 'unconfirmed visual cue; human review required' };
  }
  $('scanGeoButton').onclick = async () => {
    if (!canQueryContext(displayed?.context)) return;
    // Bind the lookup to this exact frozen frame, even if the phone moves later.
    running = false; cancelWork(); clearGeology();
    const frame = displayed, controller = new AbortController(); geologyController = controller;
    const timeout = setTimeout(() => controller.abort(), 20000);
    $('scanGeology').textContent = 'Loading official mapped context at the attached location…'; controls();
    try {
      const evidence = await loadMappedContext(frame.context, fetch, controller.signal);
      if (controller.signal.aborted || displayed !== frame || geologyController !== controller) return;
      geology = evidence;
      const heading = document.createElement('strong'); heading.textContent = 'Mapped context · field identity unconfirmed';
      const unit = document.createElement('p');
      unit.textContent = evidence.unit ? `${evidence.unit.name} · ${evidence.unit.lithology} · ${evidence.unit.age}. ${evidence.unit.description}`
        : 'No mapped unit returned at this point. This is missing data, not evidence of absence.';
      const detail = document.createElement('p');
      detail.textContent = `Position queried: ${evidence.queryPosition.lat}, ${evidence.queryPosition.lng} · ${evidence.locationBasis}. ${Number.isFinite(evidence.queryPosition.gpsAccuracyM) ? 'Reported accuracy ±' + Math.round(evidence.queryPosition.gpsAccuracyM) + ' m.' : 'Position accuracy unknown.'} Map positional accuracy is not supplied by this query. ${evidence.limit}`;
      const source = document.createElement('a'); source.href = evidence.queryUrl; source.target = '_blank'; source.rel = 'noopener'; source.textContent = 'Official map response ↗';
      const date = document.createElement('p'); date.textContent = `${evidence.publisher} · retrieved ${evidence.retrievedAt}.`;
      $('scanGeology').replaceChildren(heading, unit, detail, source, date);
      status('Frame frozen with mapped context. Mineral identity and gold content remain unconfirmed.');
    } catch (error) {
      if (displayed === frame && geologyController === controller)
        $('scanGeology').textContent = 'Mapped context unavailable (' + (error.name === 'AbortError' ? 'timed out' : error.message) + '). No geological identification can be drawn.';
    } finally {
      clearTimeout(timeout);
      if (geologyController === controller) { geologyController = null; controls(); }
    }
  };
  $('scanGeologyGuide').href = GEOLOGY_GUIDE;
  $('scanMineralGuide').href = MINERAL_GUIDE;
  $('scanObservation').onclick = async () => {
    const record = observation(); if (!record) return;
    const current = photo, selection = selected, explanation = CUE_TYPES[selected.kind].explanation;
    if (current && (!current.saved || current.dirty)) {
      photoBusy = true; controls(); $('photoSaveStatus').textContent = 'Saving this photo with its location for the field note…';
      try { const saved = await savePhotoRecord(current); record.fileName = saved.name; }
      catch (error) { if (photo === current) $('photoSaveStatus').textContent = 'Photo was not saved: ' + error.message + '. Download a copy before closing.'; return; }
      finally { if (photo === current) { photoBusy = false; controls(); } }
      if (photo !== current || selected !== selection) return;
    }
    if (current) record.photoSavedLocally = true;
    selectCue(record, explanation);
    toast('Cue copied to field notes. Add your own observations, then Save observation locally.');
  };
  $('scanCamera').onclick = () => {
    if (!cameraActive) return;
    reset(); running = true; view.classList.add('scan-active'); view.hidden = false;
    status('Scanning visible contrasts on this device…'); controls(); capture();
  };
  $('scanStart').onclick = () => $('scanCamera').click();
  $('analyseScene').onclick = () => {
    if (!displayed && !cameraActive) return;
    const previous = displayed;
    cancelWork(); clearGeology(); running = false; selected = null; scanMode = 'scene';
    if (previous) { status('Preparing AI scene analysis locally…'); submit(previous.frame, previous.context); }
    else {
      running = true; view.classList.add('scan-active'); capture(); running = false;
    }
    controls();
  };
  $('cancelScene').onclick = () => {
    cancelWork(); running = false; scanMode = displayed?.result.model ? 'scene' : 'contrast';
    if (!displayed) view.classList.remove('scan-active');
    status('AI scene analysis cancelled. Your camera/photo and location are unchanged.'); controls();
  };
  $('contrastView').onclick = () => {
    if (!displayed) return;
    const { frame, context } = displayed; cancelWork(); clearGeology(); scanMode = 'contrast'; running = false; submit(frame, context);
  };
  for (const [id, verdict] of [['sceneAccept', 'matches visible feature'], ['sceneReject', 'wrong or uncertain']]) $(id).onclick = () => {
    if (!selected || !displayed?.result.model) return;
    cueReviews.set(selected.id, { verdict, source: 'user visual review', reviewedAt: new Date().toISOString(), geologicalConfirmation: false }); controls();
  };
  $('freezeScan').onclick = () => {
    if (running) {
      running = false; cancelWork(); controls();
      status('Frame frozen. Camera remains on; Close switches it off.');
    } else if (cameraActive) {
      clearGeology(); selected = null; running = true; controls(); capture();
    }
  };
  $('returnCamera').onclick = () => { reset(); if (!cameraActive) openCamera(); };
  for (const kind of ['pale', 'dark']) $('scan-' + kind).onchange = () => {
    if (!displayed) return;
    const { frame, context } = displayed; cancelWork(); selected = null;
    submit(frame, context);
  };
  async function loadPhoto(file, saved = null) {
    releaseCamera(); reset(); const local = epoch;
    if (!/^image\//.test(file.type) || file.size > 25 * 1024 * 1024) {
      status('Choose an image file under 25 MB.'); return;
    }
    status('Opening photo locally…');
    let bitmap;
    try {
      const buffer = await file.arrayBuffer(), metadata = readPhotoLocation(buffer);
      bitmap = await createImageBitmap(file);
      if (local !== epoch || document.hidden) return;
      if (bitmap.width * bitmap.height > 48000000) throw new Error('Photo exceeds 48 megapixels; choose a smaller copy');
      const frame = makeFrame(bitmap, bitmap.width, bitmap.height);
      photo = saved ? { ...saved, dirty: false, saved: true } : {
        id: crypto.randomUUID(), name: file.name || 'field-photo', blob: file,
        location: metadata.location, originalLocation: metadata.location,
        metadataMessage: metadata.message, inspectedAt: new Date().toISOString(), saved: false, dirty: true
      };
      view.hidden = false; view.classList.add('scan-active');
      $('photoSaveStatus').textContent = saved ? 'Saved photo reopened from this browser.' : metadata.message;
      submit(frame, { source: 'photo', photoId: photo.id, fileName: photo.name,
        capturedAt: null, inspectedAt: photo.inspectedAt, location: photo.location, leadId: null });
    } catch (error) { if (local === epoch) fail('photo could not be decoded. ' + error.message); }
    finally { bitmap?.close(); }
  }
  $('scanPhoto').onchange = event => {
    const file = event.target.files?.[0]; event.target.value = ''; if (file) loadPhoto(file);
  };
  function setPhotoLocation(location) {
    if (!photo || !displayed) return;
    clearGeology(); photo.location = location; photo.dirty = true;
    displayed.context = { ...displayed.context, location };
    if (pending) pending.context = { ...pending.context, location };
    $('photoSaveStatus').textContent = 'Location changed. Save the photo or download a copy to keep this change.'; controls();
  }
  $('photoPinMap').onclick = async () => {
    const current = photo; if (!current) return;
    const location = await pickPhotoLocation(current.location);
    if (photo === current && location) setPhotoLocation(location);
  };
  $('photoUseGps').onclick = async () => {
    const current = photo; if (!current) return;
    photoBusy = true; controls(); $('photoSaveStatus').textContent = 'Requesting your current phone position…';
    try { const location = await assignPhotoGps(); if (photo === current) setPhotoLocation(location); }
    catch (error) { if (photo === current) $('photoSaveStatus').textContent = 'Current GPS unavailable: ' + error.message + '. You can use a map pin.'; }
    finally { if (photo === current) { photoBusy = false; controls(); } }
  };
  $('photoRestoreGps').onclick = () => { if (photo) setPhotoLocation(photo.originalLocation); };
  $('photoShowMap').onclick = () => {
    const location = photo?.location; if (!validPhotoLocation(location)) return;
    // Keep the inspected photo available; Close returns to the map without storing changes.
    view.hidden = true; controls(); showPhotoOnMap(location);
  };
  $('returnToPhoto').onclick = () => { if (photo) { view.hidden = false; controls(); } };
  async function taggedPhoto(current) {
    if (current.saved && !current.dirty) return { blob: current.blob, name: current.name };
    let blob = current.blob, name = current.name;
    if (!validPhotoLocation(current.location)) return { blob, name };
    let buffer = new Uint8Array(await blob.arrayBuffer());
    const jpeg = buffer[0] === 255 && buffer[1] === 216, png = buffer[0] === 137 && buffer[1] === 80;
    if (!jpeg && !png) {
      const bitmap = await createImageBitmap(blob);
      try {
        const full = document.createElement('canvas'); full.width = bitmap.width; full.height = bitmap.height;
        const context = full.getContext('2d'); context.fillStyle = '#fff'; context.fillRect(0, 0, full.width, full.height); context.drawImage(bitmap, 0, 0);
        blob = await new Promise(resolve => full.toBlob(resolve, 'image/jpeg', .95));
        if (!blob) throw new Error('JPEG conversion failed');
        buffer = new Uint8Array(await blob.arrayBuffer()); name = name.replace(/\.[^.]+$/, '') + '.jpg';
      } finally { bitmap.close(); }
    }
    const bytes = embedPhotoLocation(buffer, current.location);
    return { blob: new Blob([bytes], { type: png ? 'image/png' : 'image/jpeg' }), name };
  }
  function download(blob, name) {
    const link = document.createElement('a'), url = URL.createObjectURL(blob);
    link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function refreshPhotoLibrary() {
    try {
      const records = await photoStore.list();
      onPhotosChanged(records);
      $('savedPhotos').replaceChildren(...records.sort((a, b) => b.savedAt.localeCompare(a.savedAt)).map(record => {
        const article = document.createElement('article'), title = document.createElement('strong'), position = document.createElement('p');
        title.textContent = record.name; position.textContent = locationLabel(record.location);
        const open = document.createElement('button'); open.type = 'button'; open.textContent = 'Open photo'; open.onclick = () => openSavedPhoto(record.id);
        article.append(title, position, open);
        if (validPhotoLocation(record.location)) { const show = document.createElement('button'); show.type = 'button'; show.textContent = 'Show on map'; show.onclick = () => showPhotoOnMap(record.location); article.append(show); }
        return article;
      }));
      $('savedPhotoStatus').textContent = records.length ? `${records.length} photo${records.length === 1 ? '' : 's'} saved in this browser.` : 'No photos saved yet.';
    } catch { $('savedPhotoStatus').textContent = 'Local photo storage is unavailable. You can still download photos with location metadata.'; }
  }
  async function openSavedPhoto(id) {
    try { const record = await photoStore.get(id); if (!record) throw new Error('Saved photo was not found'); await loadPhoto(record.blob, record); }
    catch (error) { toast(error.message); }
  }
  async function savePhotoRecord(current) {
    const output = await taggedPhoto(current);
    const record = { ...current, ...output, saved: true, dirty: false, savedAt: new Date().toISOString() };
    await photoStore.put(record);
    if (photo === current) {
      Object.assign(photo, record); if (displayed) displayed.context.fileName = record.name;
      $('photoSaveStatus').textContent = 'Photo saved locally' + (photo.location ? ' with embedded location metadata.' : '. Location is not set.') + ' You can reopen it below or from its map marker.';
    }
    await refreshPhotoLibrary(); return record;
  }
  $('photoSave').onclick = async () => {
    const current = photo; if (!current) return;
    photoBusy = true; controls();
    try {
      await savePhotoRecord(current);
    } catch (error) { if (photo === current) $('photoSaveStatus').textContent = 'Photo was not saved: ' + error.message + '. Try Download photo instead.'; }
    finally { if (photo === current) { photoBusy = false; controls(); } }
  };
  $('photoDownload').onclick = async () => {
    const current = photo; if (!current) return;
    photoBusy = true; controls();
    try { const output = await taggedPhoto(current); download(output.blob, output.name); if (photo === current) $('photoSaveStatus').textContent = current.location ? 'Downloaded photo includes GPS coordinates in its metadata.' : 'Downloaded photo without an assigned location.'; }
    catch (error) { if (photo === current) $('photoSaveStatus').textContent = 'Download unavailable: ' + error.message; }
    finally { if (photo === current) { photoBusy = false; controls(); } }
  };
  document.addEventListener('gold-trail-photos-changed', refreshPhotoLibrary);
  refreshPhotoLibrary();
  reset();
  return { reset, observation, openSavedPhoto,
    setCameraActive(active) { cameraActive = active; controls(); }
  };
}
