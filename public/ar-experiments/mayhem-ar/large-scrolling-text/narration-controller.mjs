// Optional narration controller. No request is made until prepare(text) is called.
// Scroll callbacks operate on UTF-16 text offsets; they must move writing only.
export function validateAlignment(alignment, text) {
  const chars = alignment?.characters;
  const starts = alignment?.character_start_times_seconds ?? alignment?.char_start_times_seconds;
  const ends = alignment?.character_end_times_seconds ?? alignment?.char_end_times_seconds;
  if (!Array.isArray(chars) || !Array.isArray(starts) || !Array.isArray(ends) ||
      !chars.length || chars.length !== starts.length || chars.length !== ends.length ||
      chars.some(c => typeof c !== 'string') || chars.join('') !== text) {
    throw new Error('Narration timing does not match the supplied text.');
  }
  const offsets = [];
  let offset = 0;
  for (let i = 0; i < chars.length; i++) {
    if (!chars[i].length || !Number.isFinite(starts[i]) || !Number.isFinite(ends[i]) ||
        starts[i] < 0 || ends[i] < starts[i] || (i && starts[i] < starts[i - 1])) {
      throw new Error('Narration timing is invalid.');
    }
    offsets.push(offset);
    offset += chars[i].length;
  }
  return { starts: starts.slice(), ends: ends.slice(), offsets, textLength: offset };
}
export function offsetAtTime(alignment, time) {
  if (!alignment || !Number.isFinite(time)) return 0;
  const {starts, ends, offsets, textLength} = alignment;
  if (time >= ends[ends.length - 1]) return textLength;
  let lo = 0, hi = starts.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (starts[mid] <= time) lo = mid + 1;
    else hi = mid;
  }
  return offsets[Math.max(0, lo - 1)];
}
export function timeAtOffset(alignment, offset) {
  if (!alignment || !Number.isFinite(offset)) return 0;
  const {starts, ends, offsets, textLength} = alignment;
  if (offset >= textLength) return ends[ends.length - 1];
  let lo = 0, hi = offsets.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (offsets[mid] <= Math.max(0, offset)) lo = mid + 1;
    else hi = mid;
  }
  return starts[Math.max(0, lo - 1)];
}
function endpointUrl(value) {
  if (!value) throw new Error('Narration is not configured.');
  let url;
  try { url = new URL(value, globalThis.location?.href); }
  catch { throw new Error('The narration bridge address is invalid.'); }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(url.hostname))) {
    throw new Error('The narration bridge requires HTTPS.');
  }
  if (url.username || url.password || url.hash) throw new Error('The narration bridge address is invalid.');
  return url.href;
}
function decodeBase64(value) {
  if (typeof value !== 'string' || !value.length) throw new Error('Narration audio is missing.');
  let binary;
  try { binary = atob(value); } catch { throw new Error('Narration audio is invalid.'); }
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}
// Preserve the exact source and UTF-16 boundaries while limiting each request
// to the bridge's Unicode code-point limit. Prefer a nearby word boundary.
export function splitNarrationText(text, limit = 5000) {
  if (typeof text !== 'string' || !Number.isInteger(limit) || limit < 1) throw new Error('Invalid narration text or chunk size.');
  const points = [...text], chunks = [];
  for (let start = 0; start < points.length;) {
    let end = Math.min(start + limit, points.length);
    if (end < points.length) {
      let boundary = end;
      while (boundary > start + Math.floor(limit * .7) && !/\s/u.test(points[boundary - 1])) boundary--;
      if (boundary > start + Math.floor(limit * .7)) end = boundary;
    }
    chunks.push(points.slice(start, end).join(''));
    start = end;
  }
  return chunks;
}
export function createNarrationController({
  endpoint, audio, fetchImpl = globalThis.fetch, urlApi = globalThis.URL,
  getAccessToken, authMode = 'bearer',
  scrollForCharacter, characterForScroll, onScroll, onState = () => {},
  requestFrame = globalThis.requestAnimationFrame?.bind(globalThis),
  cancelFrame = globalThis.cancelAnimationFrame?.bind(globalThis)
}) {
  if (!audio || typeof fetchImpl !== 'function' || typeof scrollForCharacter !== 'function' ||
      typeof characterForScroll !== 'function' || typeof onScroll !== 'function') {
    throw new Error('Narration requires an audio element and writing-scroll mapping.');
  }
  let alignment = null, chunks = [], currentChunk = 0, totalLength = 0, abort = null, generation = 0, playSequence = 0, frame = null, disposed = false;
  let phase = 'idle', error = '', pendingSeek = null;
  const emit = () => onState({ phase, error, ready: !!alignment, playing: phase === 'playing', speed: audio.playbackRate || 1 });
  const stopFrame = () => { if (frame !== null && cancelFrame) cancelFrame(frame); frame = null; };
  const updateScroll = () => {
    if (!alignment) return;
    const target = scrollForCharacter(chunks[currentChunk].offset + offsetAtTime(alignment, Number(audio.currentTime) || 0));
    if (Number.isFinite(target)) onScroll(target);
  };
  const tick = () => { frame = null; if (disposed || phase !== 'playing') return; updateScroll(); if (requestFrame) frame = requestFrame(tick); };
  const clearAudio = () => {
    ++playSequence; audio.pause(); stopFrame(); alignment = null; pendingSeek = null;
    audio.removeAttribute('src');
    if (typeof audio.load === 'function') audio.load();
    for (const chunk of chunks) urlApi.revokeObjectURL(chunk.url);
    chunks = []; currentChunk = 0; totalLength = 0;
  };
  const fail = message => { stopFrame(); audio.pause(); phase = 'error'; error = message; emit(); };
  const seek = seconds => {
    const t = Math.max(0, Number(seconds) || 0);
    try { audio.currentTime = t; pendingSeek = null; } catch { pendingSeek = t; }
  };
  const onMetadata = () => { if (pendingSeek !== null) seek(pendingSeek); };
  const onTimeUpdate = () => { if (phase === 'playing') updateScroll(); };
  const selectChunk = index => {
    currentChunk = index; alignment = chunks[index].alignment;
    audio.src = chunks[index].url; pendingSeek = 0;
    if (typeof audio.load === 'function') audio.load();
  };
  const onEnded = async () => {
    if (!alignment || disposed || phase !== 'playing') return;
    if (currentChunk + 1 < chunks.length) {
      const token = generation, attempt = ++playSequence;
      selectChunk(currentChunk + 1);
      try {
        await audio.play();
        if (disposed || token !== generation || attempt !== playSequence) return;
        updateScroll();
      } catch {
        if (!disposed && token === generation && attempt === playSequence) fail('Narration playback could not continue.');
      }
      return;
    }
    stopFrame(); phase = 'ended'; error = ''; const target = scrollForCharacter(totalLength); if (Number.isFinite(target)) onScroll(target); emit();
  };
  const onAudioError = () => { if (alignment && !disposed) fail('Narration audio could not be played.'); };
  audio.addEventListener('loadedmetadata', onMetadata);
  audio.addEventListener('timeupdate', onTimeUpdate);
  audio.addEventListener('ended', onEnded);
  audio.addEventListener('error', onAudioError);
  return {
    async prepare(text) {
      if (disposed) throw new Error('Narration is closed.');
      if (typeof text !== 'string' || !text.trim()) throw new Error('Add writing before creating narration.');
      const bridge = endpointUrl(endpoint);
      if (authMode === 'tailscale-owner') {
        const url = new URL(bridge);
        // This only constrains the opt-in destination. The server must still
        // enforce the authenticated owner identity supplied by Tailscale Serve.
        if (url.protocol !== 'https:' || !url.hostname.endsWith('.ts.net'))
          throw new Error('Owner-identity narration requires a trusted HTTPS Tailscale service.');
      } else if (authMode === 'sites-popup') {
        const url = new URL(bridge);
        if (url.origin !== 'https://mayhem-reader-voice-backend.mayhem82.chatgpt.site' || url.pathname !== '/tts' || url.search)
          throw new Error('The voice service address is invalid.');
      } else if (authMode !== 'bearer' || typeof getAccessToken !== 'function') {
        throw new Error('Narration authorization is unavailable.');
      }
      const token = ++generation;
      abort?.abort(); abort = new AbortController(); clearAudio(); phase = 'loading'; error = ''; emit();
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (authMode === 'bearer') {
          let accessToken;
          try { accessToken = await getAccessToken(); }
          catch { throw new Error('Narration authorization is unavailable.'); }
          if (token !== generation || disposed) return false;
          if (typeof accessToken !== 'string' || !accessToken.trim() || /[\r\n]/.test(accessToken)) {
            throw new Error('Narration authorization is unavailable.');
          }
          headers.Authorization = 'Bearer ' + accessToken.trim();
        }
        const parts = splitNarrationText(text);
        const spoken = parts.filter(part => part.trim());
        const preflightUrl = new URL('preflight', bridge);
        const quota = await fetchImpl(preflightUrl.href, {
          method: 'POST', headers, body: JSON.stringify({
            characters: spoken.reduce((sum, part) => sum + [...part].length, 0),
            requests: spoken.length
          }), signal: abort.signal, credentials: 'omit', cache: 'no-store', redirect: 'error'
        });
        if (token !== generation || disposed) return false;
        if (!quota.ok) {
          if (quota.status === 413) throw new Error('This post exceeds the configured daily voice limit.');
          if (quota.status === 429) throw new Error('Not enough voice quota remains for this post today.');
          if (quota.status === 503 && authMode === 'sites-popup') throw new Error('The private voice service needs its ElevenLabs key.');
          if (quota.status === 401 || quota.status === 403) throw new Error('Voice sign-in was not authorized.');
          throw new Error('Voice quota is unavailable.');
        }
        const quotaResult = await quota.json();
        if (token !== generation || disposed) return false;
        if (quotaResult?.available !== true) throw new Error('Voice quota is unavailable.');
        const prepared = []; let offset = 0;
        for (const part of parts) {
          // A long run of whitespace may fill an entire chunk. It has no
          // speech and the bridge rejects empty chunks. Skip it while keeping
          // its UTF-16 length in the original-source offsets used for scroll.
          if (!part.trim()) { offset += part.length; continue; }
          const response = await fetchImpl(bridge, {
            method: 'POST', headers,
            body: JSON.stringify({ text: part }), signal: abort.signal, credentials: 'omit', cache: 'no-store', redirect: 'error'
          });
          if (!response.ok) throw new Error('Narration bridge returned HTTP ' + response.status + '.');
          const result = await response.json();
          const timing = validateAlignment(result.alignment, part);
          const bytes = decodeBase64(result.audio_base64);
          if (token !== generation || disposed) return false;
          prepared.push({offset, alignment: timing, bytes}); offset += part.length;
        }
        // Create object URLs only once all requests have succeeded. Revoke all
        // partially created URLs if allocation itself fails.
        const nextChunks = [];
        try {
          for (const part of prepared) nextChunks.push({offset:part.offset, alignment:part.alignment,
            url:urlApi.createObjectURL(new Blob([part.bytes], {type:'audio/mpeg'}))});
        } catch (err) { for (const part of nextChunks) urlApi.revokeObjectURL(part.url); throw err; }
        if (token !== generation || disposed) { for (const part of nextChunks) urlApi.revokeObjectURL(part.url); return false; }
        chunks = nextChunks; totalLength = text.length; selectChunk(0); phase = 'ready'; error = ''; emit(); return true;
      } catch (err) {
        if (token !== generation || disposed || err?.name === 'AbortError') return false;
        fail(err?.message || 'Narration could not be created.'); throw err;
      } finally { if (token === generation) abort = null; }
    },
    async play() {
      if (disposed || !alignment) throw new Error('Create narration first.');
      const token = generation, attempt = ++playSequence;
      try {
        await audio.play();
        if (disposed || token !== generation || attempt !== playSequence) return false;
        phase = 'playing'; error = ''; emit(); stopFrame(); if (requestFrame) frame = requestFrame(tick); return true;
      } catch (err) { if (disposed || token !== generation || attempt !== playSequence) return false; fail('Narration playback could not start.'); throw err; }
    },
    pause() { if (disposed) return; ++playSequence; audio.pause(); stopFrame(); if (alignment) phase = 'paused'; emit(); },
    restart() { if (disposed || !alignment) return; ++playSequence; audio.pause(); stopFrame(); if(currentChunk !== 0) selectChunk(0); else seek(0); phase = 'paused'; error = ''; const target=scrollForCharacter(0); if(Number.isFinite(target))onScroll(target); emit(); },
    seekScroll(position) {
      if (disposed || !alignment) return;
      ++playSequence; audio.pause(); stopFrame(); phase = 'paused';
      const offset = Math.max(0, Math.min(totalLength, Number(characterForScroll(position)) || 0));
      let index = chunks.length - 1;
      while (index > 0 && chunks[index].offset > offset) index--;
      if (currentChunk !== index) { selectChunk(index); pendingSeek = timeAtOffset(alignment, offset - chunks[index].offset); }
      else seek(timeAtOffset(alignment, offset - chunks[index].offset));
      error = ''; emit();
    },
    setSpeed(speed) {
      if (!Number.isFinite(speed) || speed < .5 || speed > 2) throw new Error('Narration speed must be between 0.5 and 2.');
      audio.playbackRate = speed; emit();
    },
    // Call from the app's XR animation loop: window.requestAnimationFrame may
    // be suspended while immersive AR is active.
    tick() { if (!disposed && phase === 'playing') updateScroll(); },
    stop() { if (disposed) return; ++generation; abort?.abort(); abort = null; clearAudio(); phase = 'idle'; error = ''; emit(); },
    dispose() {
      if (disposed) return; ++generation; abort?.abort(); abort = null; clearAudio(); disposed = true;
      audio.removeEventListener('loadedmetadata', onMetadata); audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded); audio.removeEventListener('error', onAudioError);
    },
    getState() { return { phase, error, ready: !!alignment, playing: phase === 'playing', speed: audio.playbackRate || 1 }; }
  };
}
