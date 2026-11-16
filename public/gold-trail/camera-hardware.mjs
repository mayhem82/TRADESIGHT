// Capability-based controls for an existing video track. This module never
// starts, stops or replaces a camera stream.
export function createCameraHardware({ onChange = () => {} } = {}) {
  let track = null, generation = 0, tail = Promise.resolve(), endedHandler = null;
  let committed = {}, state = emptyState();

  function emptyState() {
    return { attached: false, busy: false, torchAvailable: false, torchOn: null, zoom: null, error: null };
  }
  function snapshot() { return { ...state, zoom: state.zoom ? { ...state.zoom } : null }; }
  function publish() { try { onChange(snapshot()); } catch { /* UI observers cannot break camera control. */ } }
  function settingsFor(current) {
    try { return current?.getSettings?.() || {}; } catch { return {}; }
  }
  function updateReportedSettings(current) {
    const settings = settingsFor(current);
    state.torchOn = state.torchAvailable && typeof settings.torch === 'boolean' ? settings.torch : null;
    if (state.zoom) {
      const value = settings.zoom;
      state.zoom.value = Number.isFinite(value) && value >= state.zoom.min && value <= state.zoom.max ? value : null;
    }
  }
  function detach() {
    const old = track;
    if (old && endedHandler) old.removeEventListener?.('ended', endedHandler);
    track = null; endedHandler = null; generation++; tail = Promise.resolve(); committed = {};
    state = emptyState(); publish();
  }
  function attach(next) {
    detach();
    if (!next || next.kind !== 'video' || next.readyState === 'ended') return snapshot();
    track = next; const local = generation;
    let capabilities = {};
    try { capabilities = next.getCapabilities?.() || {}; } catch { /* Older browsers may not expose capabilities. */ }
    const hasTorch = capabilities.torch === true || (Array.isArray(capabilities.torch) && capabilities.torch.includes(true));
    const range = capabilities.zoom;
    const hasZoom = range && Number.isFinite(range.min) && Number.isFinite(range.max) && range.min > 0 && range.max > range.min;
    state = { attached: true, busy: false, torchAvailable: hasTorch, torchOn: null,
      zoom: hasZoom ? { min: range.min, max: range.max, step: Number.isFinite(range.step) && range.step > 0 ? range.step : (range.max - range.min) / 100, value: null } : null,
      error: null };
    updateReportedSettings(next);
    if (state.torchOn !== null) committed.torch = state.torchOn;
    if (state.zoom?.value !== null && state.zoom?.value !== undefined) committed.zoom = state.zoom.value;
    endedHandler = () => { if (track === next && generation === local) detach(); };
    next.addEventListener?.('ended', endedHandler);
    publish(); return snapshot();
  }
  function constraintsFor(current, next) {
    let existing = {};
    try { existing = current.getConstraints?.() || {}; } catch { /* Use only requested controls. */ }
    const { advanced, ...base } = existing;
    for (const key of Object.keys(next)) delete base[key];
    const retained = Array.isArray(advanced) ? advanced.map(item => {
      const other = { ...item };
      for (const key of Object.keys(next)) delete other[key];
      return other;
    }).filter(item => Object.keys(item).length > 0) : [];
    return { ...base, advanced: [...retained, { ...next }] };
  }
  function request(change) {
    if (!track || track.readyState === 'ended') return Promise.resolve({ ok: false, reason: 'unavailable' });
    const localTrack = track, localGeneration = generation;
    const task = tail.then(async () => {
      if (track !== localTrack || generation !== localGeneration || localTrack.readyState === 'ended') return { ok: false, reason: 'stale' };
      if (typeof localTrack.applyConstraints !== 'function') return { ok: false, reason: 'unsupported' };
      const next = { ...committed, ...change };
      state.busy = true; state.error = null; publish();
      try {
        await localTrack.applyConstraints(constraintsFor(localTrack, next));
        if (track !== localTrack || generation !== localGeneration || localTrack.readyState === 'ended') return { ok: false, reason: 'stale' };
        committed = next; updateReportedSettings(localTrack);
        return { ok: true };
      } catch {
        if (track !== localTrack || generation !== localGeneration || localTrack.readyState === 'ended') return { ok: false, reason: 'stale' };
        updateReportedSettings(localTrack); state.error = 'Camera could not apply this control.';
        return { ok: false, reason: 'failed' };
      } finally {
        if (track === localTrack && generation === localGeneration) { state.busy = false; publish(); }
      }
    });
    tail = task.catch(() => {});
    return task;
  }
  function setTorch(enabled) {
    if (!track || !state.torchAvailable || typeof enabled !== 'boolean') return Promise.resolve({ ok: false, reason: 'unsupported' });
    return request({ torch: enabled });
  }
  function setZoom(value) {
    if (!track || !state.zoom || !Number.isFinite(value)) return Promise.resolve({ ok: false, reason: 'unsupported' });
    const { min, max, step } = state.zoom;
    const snapped = min + Math.round((Math.max(min, Math.min(max, value)) - min) / step) * step;
    return request({ zoom: Number(Math.max(min, Math.min(max, snapped)).toPrecision(12)) });
  }
  return { attach, detach, setTorch, setZoom, getState: snapshot };
}
