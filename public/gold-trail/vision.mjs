import { CUE_TYPES, DETECTOR_VERSION, fitInside } from './vision-core.mjs';
import { sceneCueAt } from './scene-core.mjs';
import { isolateColour } from './colour-isolation.mjs';
import { photoFocusAt } from './photo-focus.mjs';
import { assessGoldChecks } from './gold-field-check.mjs';
import { canQueryContext, loadMappedContext, GEOLOGY_GUIDE, MINERAL_GUIDE } from './camera-geology.mjs';
import { readPhotoLocation, embedPhotoLocation, validPhotoLocation, locationLabel } from './photo-metadata.mjs';
import { photoStore } from './photo-store.mjs';

export function setupVision({ video, view, releaseCamera, openCamera, captureContext, selectCue, toast,
  pickPhotoLocation, cancelPhotoPin, assignPhotoGps, onPhotosChanged, showPhotoOnMap }) {
  const $ = id => document.getElementById(id);
  const canvas = $('scanCanvas'), ctx = canvas.getContext('2d');
  let worker = null, epoch = 0, sequence = 0, timer, watchdog;
  let pending = null, displayed = null, selected = null, running = false, cameraActive = false, capturePending = false;
  let geology = null, geologyController = null;
  let photo = null, photoBusy = false, focusMode = false, focusGeneration = 0;
  let scanMode = 'contrast', goldCheckFrame = null;
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
    $('scanStart').disabled = !cameraActive || capturePending;
    $('freezeScan').disabled = (!displayed && !pending) || pending?.mode === 'scene';
    $('freezeScan').textContent = running ? 'Freeze frame' : 'Resume scan';
    $('freezeScan').hidden = displayed?.context.source === 'photo';
    $('scanReadout').hidden = !view.classList.contains('scan-active');
    $('scanSource').textContent = running ? 'CAMERA SCAN · UPDATING' :
      displayed?.context.source === 'photo' ? (displayed.context.photoCrop ? 'LOCAL PHOTO · CLOSE-UP' : 'LOCAL PHOTO · STILL IMAGE') : 'CAMERA FRAME · FROZEN';
    if (displayed?.result.model) $('scanSource').textContent = 'AI SCENE · ' + $('scanSource').textContent;
    $('scanCamera').setAttribute('aria-pressed', String(running));
    $('scanGeoButton').disabled = !canQueryContext(displayed?.context) || !!geologyController;
    $('scanGeoButton').textContent = displayed?.context.source === 'photo' ? 'Load mapped geology at photo location' : 'Load mapped geology at camera position';
    $('scanGeoPrivacy').textContent = canQueryContext(displayed?.context)
      ? 'Optional lookup sends the attached coordinate and your IP to GSNSW. No image is sent. Map context does not identify the highlighted feature.'
      : displayed?.context.source === 'photo'
        ? validPhotoLocation(displayed.context.location) ? 'Photo location is outside supported mainland NSW geology coverage.' : 'Photo location is not set. Read embedded GPS, pinpoint on the map, or explicitly assign your current position.'
        : 'Enable GPS before scanning to attach a camera position. A map search centre is never used as the camera position.';
    $('photoFocus').hidden = !photo;
    $('photoFocus').disabled = !photo || photoBusy || !!pending || !displayed || displayed.context.source !== 'photo';
    $('photoFocus').textContent = focusMode ? 'Cancel focus' : 'Focus an area';
    $('photoFocus').setAttribute('aria-pressed', String(focusMode));
    $('photoFull').hidden = !photo || !displayed?.context.photoCrop;
    $('photoFull').disabled = photoBusy || !!pending;
    $('photoLocationPanel').hidden = !photo;
    $('photoLocationSummary').textContent = photo ? 'Photo · ' + (validPhotoLocation(photo.location) ? 'location set' : 'no location') + ' · ' + (photo.saved && !photo.dirty ? 'saved' : 'not saved') : 'Photo location and saving';
    $('photoLocationName').textContent = photo?.name || '';
    $('photoLocationStatus').textContent = photo ? locationLabel(photo.location) : '';
    $('photoRestoreGps').hidden = !photo?.originalLocation;
    $('photoShowMap').disabled = !validPhotoLocation(photo?.location);
    for (const id of ['photoUseGps', 'photoPinMap', 'photoSave', 'photoDownload', 'photoOriginal', 'photoRestoreGps']) $(id).disabled = !photo || photoBusy;
    $('photoSave').textContent = photo?.saved && !photo.dirty ? 'Photo saved locally' : 'Save photo + location locally';
    $('returnToPhoto').hidden = !photo || !view.hidden;
    $('scanObservation').disabled = !selected || photoBusy;
    $('analyseScene').disabled = (!displayed && !cameraActive) || photoBusy || capturePending || pending?.mode === 'scene';
    $('cancelScene').hidden = pending?.mode !== 'scene';
    $('contrastView').hidden = !displayed?.result.model;
    $('contrastView').disabled = photoBusy || !!pending;
    $('sceneReview').hidden = !selected || !displayed?.result.model;
    $('sceneReviewStatus').textContent = selected && cueReviews.has(selected.id) ? 'Your visual review: ' + cueReviews.get(selected.id).verdict + '. Geological identification remains unconfirmed.' : 'Model suggestion awaiting visual review.';
    $('scanFilters').hidden = !!displayed?.result.model;
    updateGoldChecks();
  }
  function reset() {
    focusGeneration++; capturePending = false; cancelWork(); clearGeology(); cancelPhotoPin?.(); running = false; selected = null; displayed = null; photo = null; photoBusy = false; focusMode = false; scanMode = 'contrast'; cueReviews.clear();
    clearGoldChecks(); $('photoCaptureStatus').hidden = true; $('photoCaptureStatus').textContent = '';
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
    // Keep an imported or captured photo available even if its optional scan fails.
    if (photo && (pending?.context.source === 'photo' || displayed?.context.source === 'photo')) {
      const previous = pending?.context.source === 'photo' ? pending : displayed;
      cancelWork(); clearGeology(); running = false; selected = null; scanMode = 'contrast';
      const frame = previous.frame;
      displayed = { frame, context: previous.context, result: { version: 'image-preview', width: frame.width, height: frame.height,
        cues: [], mask: new Uint8ClampedArray(frame.width * frame.height * 4) } };
      render(); controls(); status('Scan unavailable: ' + message + '. The photo remains available to save or download.'); return;
    }
    // Never retain a camera result whose source frame could no longer be refreshed.
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
      if (goldCheckFrame && pending.frame !== goldCheckFrame) clearGoldChecks();
      clearGeology(); displayed = { ...pending, result: data.result }; pending = null; selected = null; cueReviews.clear();
      render(); controls();
      status(data.result.model ? `${data.result.cues.length} AI region suggestions · ${(data.result.elapsedMs / 1000).toFixed(1)} s model time. Tap coloured pixels to inspect them; uncoloured areas remain unresolved.` : data.result.glareWarning
        ? 'Strong glare detected. Shade the pan or rock, or change the angle. Indicators may be obscured.'
        : data.result.cues.length
          ? `${data.result.cues.length} visual indicator regions. Tap one for details.`
          : 'No indicator regions detected in this frame.');
      if (running) timer = setTimeout(capture, scanMode === 'scene' ? 1500 : 500);
    };
    return worker;
  }
  function submit(frame, context) {
    if (pending) return;
    try {
      const pixels = frame.getContext('2d').getImageData(0, 0, frame.width, frame.height);
      pending = { frame, context, id: ++sequence, mode: scanMode };
      ensureWorker().postMessage({ id: pending.id, enabled: enabled(),
        frame: { data: pixels.data, width: frame.width, height: frame.height } }, [pixels.data.buffer]);
      watchdog = setTimeout(() => fail('processing timed out'), scanMode === 'scene' ? 90000 : 8000);
    } catch (error) {
      // Retain the photo frame even if reading pixels fails before the worker starts.
      if (!pending && context.source === 'photo') pending = { frame, context, id: ++sequence, mode: scanMode };
      fail(error.message);
    }
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
    if ($('isolateColour').value !== 'off') {
      const pixels = ctx.getImageData(0, 0, frame.width, frame.height);
      ctx.putImageData(isolateColour(pixels, $('isolateColour').value), 0, 0);
    } else {
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
    const summaryLabels = [...new Set(result.cues.map(cue => cue.label))];
    $('scanExplanation').textContent = selected ? CUE_TYPES[selected.kind].explanation :
      displayed.result.model ? (summaryLabels.length ? 'Scene suggestions: ' + summaryLabels.join('; ') + '. ' : 'No supported scene regions were suggested. ') + 'These are broad visual suggestions, not mineral identification. Tap a region for detail.' :
        (summaryLabels.length ? 'Visible contrasts: ' + summaryLabels.join('; ') + '. ' : 'No supported contrast cues were found. ') + 'These are appearance cues, not mineral identification. Tap a region for detail.';
    $('scanObservation').disabled = !selected;
    $('scanObservation').textContent = selected ? 'Save selected cue as a field note' : 'Select a cue to save a field note';
    $('sceneModelDetails').hidden = !displayed.result.model;
    $('sceneModelSummary').textContent = displayed.result.model
      ? 'Experimental broad scene recognition. Rock type, mineral identity, placement and gold remain unconfirmed. Other labels can be errors. Raw class areas below describe model output, not confidence.' : '';
    $('sceneRawClasses').textContent = displayed.result.model ? JSON.stringify({ model: displayed.result.model, pixelsByRawLabel: displayed.result.rawClassCounts, omittedRegions: displayed.result.suppressed }, null, 2) : '';
  }
  function choose(id) {
    if (!displayed || photoBusy) return;
    running = false; focusMode = false; cancelWork();
    selected = displayed.result.cues.find(cue => cue.id === id) || null;
    render(); controls(); status('Frame frozen for inspection. ' + (cameraActive ? 'Camera remains on; Close switches it off.' : 'Photo stays on this device.'));
    $('scanExplanation').focus({ preventScroll: true });
  }
  $('isolateColour').onchange = () => { if (displayed) render(); };
  canvas.onclick = event => {
    if (!displayed || $('isolateColour').value !== 'off') return;
    const rect = canvas.getBoundingClientRect();
    const fit = fitInside(canvas.width, canvas.height, rect.width, rect.height);
    if (!fit) return;
    const x = (event.clientX - rect.left - fit.x) / fit.width;
    const y = (event.clientY - rect.top - fit.y) / fit.height;
    if (focusMode && photo && displayed.context.source === 'photo') {
      const crop = photoFocusAt(displayed.context.photoCrop, x, y);
      if (!crop) { status('Tap inside the photo, or return to the full photo to choose another area.'); return; }
      focusMode = false; redrawPhoto(crop); return;
    }
    const hit = displayed.result.model ? sceneCueAt(displayed.result, x, y) :
      displayed.result.cues.filter(({ box: b }) =>
        x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height)
        .sort((a, b) => a.box.width * a.box.height - b.box.width * b.box.height)[0];
    if (hit) choose(hit.id);
  };
  $('photoFocus').onclick = () => {
    if (!photo || !displayed || pending || photoBusy) return;
    focusMode = !focusMode; controls();
    status(focusMode ? 'Tap the photo to focus on that area. The original photo and GPS stay unchanged.' : 'Focus cancelled.');
  };
  $('photoFull').onclick = () => { if (photo && displayed && !pending && !photoBusy) { focusMode = false; redrawPhoto(null); } };
  async function redrawPhoto(crop) {
    const current = photo, previous = displayed; if (!current || !previous || previous.context.source !== 'photo') return;
    scanMode = previous.result.model ? 'scene' : 'contrast';
    clearGoldChecks(); cancelWork(); clearGeology(); running = false; selected = null; cueReviews.clear();
    const local = epoch, focusToken = ++focusGeneration; photoBusy = true; controls(); status(crop ? 'Preparing a close-up from the original photo…' : 'Restoring the full photo…');
    let bitmap;
    try {
      bitmap = await createImageBitmap(current.blob);
      if (local !== epoch || photo !== current || displayed !== previous || document.hidden) return;
      const b = crop || {x:0,y:0,width:1,height:1};
      const sourceWidth = bitmap.width * b.width, sourceHeight = bitmap.height * b.height;
      const scale = Math.min(1, 480 / Math.max(sourceWidth, sourceHeight));
      const frame = document.createElement('canvas'); frame.width = Math.max(1, Math.round(sourceWidth * scale)); frame.height = Math.max(1, Math.round(sourceHeight * scale));
      frame.getContext('2d').drawImage(bitmap, bitmap.width*b.x, bitmap.height*b.y, sourceWidth, sourceHeight, 0, 0, frame.width, frame.height);
      photoBusy = false; submit(frame, { ...previous.context, photoCrop: crop });
      status(crop ? 'Scanning close-up locally. Image coordinates refer to the close-up; its bounds are retained with field notes.' : 'Scanning the full photo locally.');
    } catch (error) { if (local === epoch && photo === current) status('Could not prepare the photo: ' + error.message + '. The previous view remains available.'); }
    finally { bitmap?.close(); if (focusToken === focusGeneration && photo === current) { photoBusy = false; controls(); } }
  }
  function clearGoldChecks() {
    goldCheckFrame = null; $('goldStreak').value = 'untested'; $('goldResponse').value = 'untested';
  }
  function goldCheckResult() {
    return assessGoldChecks({ streak: $('goldStreak').value, response: $('goldResponse').value });
  }
  function updateGoldChecks() {
    const result = goldCheckResult(), container = $('goldCheckResults');
    container.replaceChildren();
    const values = result.observations.length ? [...result.observations, ...result.possibilities, ...result.cautions, ...result.next]
      : ['No physical tests recorded. Gold, pyrite, chalcopyrite, mica and other materials remain possible.', ...result.next];
    for (const text of values) { const paragraph = document.createElement('p'); paragraph.textContent = text; container.append(paragraph); }
    $('goldStreak').disabled = !displayed || photoBusy; $('goldResponse').disabled = !displayed || photoBusy;
    $('goldCheckSave').disabled = !displayed || photoBusy || result.observations.length === 0 || displayed.frame !== goldCheckFrame;
  }
  function onGoldCheckChange() {
    const result = goldCheckResult();
    if (!displayed || !result.observations.length) { goldCheckFrame = null; updateGoldChecks(); return; }
    if (running || pending) { running = false; cancelWork(); }
    focusMode = false; goldCheckFrame = displayed.frame; controls();
    status('Frame frozen for your physical checks. The results describe your observations, not a camera identification.');
  }
  $('goldStreak').onchange = onGoldCheckChange;
  $('goldResponse').onchange = onGoldCheckChange;
  $('goldCheckSave').onclick = async () => {
    const frame = displayed, current = photo, result = goldCheckResult();
    if (!frame || frame.frame !== goldCheckFrame || photoBusy || !result.observations.length) return;
    running = false; cancelWork();
    const record = { detector: result.version, model: null, ...frame.context,
      kind: 'field-property-check', label: 'Gold and lookalike field checks',
      fieldChecks: result, geologicalIdentification: 'unconfirmed',
      geometryReference: 'user-reported specimen properties; attached photo or frame location when available',
      status: result.status };
    if (current && (!current.saved || current.dirty)) {
      photoBusy = true; controls(); $('photoSaveStatus').textContent = 'Saving this photo with its location for the field note…';
      try { const saved = await savePhotoRecord(current); record.fileName = saved.name; }
      catch (error) { if (photo === current) $('photoSaveStatus').textContent = 'Photo was not saved: ' + error.message + '. Download a copy before closing.'; return; }
      finally { if (photo === current) { photoBusy = false; controls(); } }
      if (photo !== current || displayed !== frame) return;
    }
    if (current) record.photoSavedLocally = true;
    const explanation = [...result.observations, ...result.possibilities, ...result.cautions, ...result.next].join(' ');
    selectCue(record, explanation);
    toast('Field checks copied to notes. Add observations, then save locally.');
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
    focusMode = false; cancelWork(); clearGeology(); running = false; selected = null; scanMode = 'scene';
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
    const { frame, context } = displayed; focusMode = false; cancelWork(); clearGeology(); scanMode = 'contrast'; running = false; submit(frame, context);
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
      clearGoldChecks(); clearGeology(); selected = null; running = true; controls(); capture();
    }
  };
  $('returnCamera').onclick = () => { reset(); if (!cameraActive) openCamera(); };
  for (const kind of ['pale', 'dark']) $('scan-' + kind).onchange = () => {
    if (!displayed) return;
    const { frame, context } = displayed; cancelWork(); selected = null;
    submit(frame, context);
  };
  async function loadPhoto(file, saved = null, captured = null) {
    releaseCamera(); reset(); const local = epoch;
    if (!/^image\//.test(file.type) || file.size > 25 * 1024 * 1024) {
      captured?.bitmap?.close?.(); status('Choose an image file under 25 MB.'); return;
    }
    status('Opening photo locally…');
    let bitmap = captured?.bitmap || null;
    const capturedLocation = validPhotoLocation(captured?.location) ? captured.location : null;
    const current = saved ? { ...saved, dirty: false, saved: true } : {
      id: crypto.randomUUID(), name: file.name || 'field-photo', blob: file,
      location: capturedLocation, originalLocation: null,
      metadataMessage: 'Photo metadata has not been read.',
      capturedAt: captured?.capturedAt || null, captureMethod: captured?.method || null,
      captureWidth: captured?.width || null, captureHeight: captured?.height || null,
      inspectedAt: new Date().toISOString(), saved: false, dirty: true
    };
    photo = current;
    view.hidden = false; view.classList.add('scan-active'); controls();
    try {
      const buffer = await file.arrayBuffer(), metadata = readPhotoLocation(buffer);
      if (local !== epoch || photo !== current || document.hidden) return;
      if (!saved) {
        current.location = capturedLocation || metadata.location;
        current.originalLocation = metadata.location;
        current.metadataMessage = capturedLocation ? 'Camera GPS attached at capture. Save or download the photo to embed its location.' : metadata.message;
      }
      bitmap ||= await createImageBitmap(file);
      if (local !== epoch || photo !== current || document.hidden) return;
      if (bitmap.width * bitmap.height > 48000000) throw new Error('Photo exceeds 48 megapixels; choose a smaller copy');
      $('photoSaveStatus').textContent = saved ? 'Saved photo reopened from this browser.' : current.metadataMessage;
      if (captured) {
        photoBusy = true; controls();
        $('photoCaptureStatus').hidden = false; $('photoCaptureStatus').textContent = 'Saving the captured photo on this device…';
        try {
          await savePhotoRecord(current);
          if (photo === current) $('photoCaptureStatus').textContent = validPhotoLocation(current.location)
            ? 'Photo saved on this device with its location.' : 'Photo saved on this device. No location was attached.';
        } catch (error) {
          if (photo === current) { $('photoCaptureStatus').textContent = 'Photo was not saved. Open Photo location and saving to download it.'; $('photoLocationPanel').open = true; }
        } finally { if (photo === current) { photoBusy = false; controls(); } }
      }
      if (local !== epoch || photo !== current || document.hidden) return;
      const frame = makeFrame(bitmap, bitmap.width, bitmap.height);
      submit(frame, { source: 'photo', photoId: photo.id, fileName: photo.name,
        capturedAt: photo.capturedAt || null, captureMethod: photo.captureMethod || null, inspectedAt: photo.inspectedAt, location: photo.location, leadId: null });
    } catch (error) {
      if (local === epoch && photo === current) {
        $('photoLocationPanel').open = true;
        if (captured) {
          $('photoCaptureStatus').hidden = false;
          $('photoCaptureStatus').textContent = current.saved ? 'Photo saved on this device; preview unavailable.' : 'Photo was not saved. Download the current photo file.';
        }
        controls(); status('Photo preview unavailable: ' + error.message + '. The photo remains available to save or download.');
      }
    }
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
    if (!$('photoCaptureStatus').hidden) $('photoCaptureStatus').textContent = 'Location changed. Save the photo or download a copy to keep it.';
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
      if (!$('photoCaptureStatus').hidden) $('photoCaptureStatus').textContent = validPhotoLocation(photo.location)
        ? 'Photo saved on this device with its location.' : 'Photo saved on this device. No location was attached.';
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
  $('photoOriginal').onclick = () => { if (photo && !photoBusy) download(photo.blob, photo.name); };
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
  return { reset, observation, openSavedPhoto, openCapturedPhoto: (file, context) => loadPhoto(file, null, context),
    setCameraActive(active) { cameraActive = active; controls(); },
    setCapturePending(active) { capturePending = active; controls(); }
  };
}
