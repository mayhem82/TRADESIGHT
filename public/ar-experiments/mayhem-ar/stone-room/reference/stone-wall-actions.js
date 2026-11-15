(() => {
  const labels = {
    HatTip: 'Touch fedora',
    Reach: 'Idol swap gesture',
    Satchel: 'Check satchel',
    HeadTurn: 'Turn head',
    Run: 'Run in place (Meshy)',
  };
  const panels = [...document.querySelectorAll('[data-indy-actions]')];
  const selectors = panels.map(panel => panel.querySelector('select'));
  const buttons = panels.map(panel => panel.querySelector('button'));
  const speed = document.getElementById('walk-speed');
  const runOption = speed.querySelector('option[value="2.4"]');
  const fadeSeconds = 0.18;
  let clipRequest;
  let active;

  function feedback(message) {
    for (const panel of panels) panel.querySelector('[data-action-status]').textContent = message;
  }

  function cancel() {
    if (active) active.action = null;
    feedback('');
  }

  async function loadClips() {
    const base = 'media/gltf/indy/actions-1.';
    const [indexResponse, binaryResponse] = await Promise.all([fetch(base + 'json'), fetch(base + 'bin')]);
    if (!indexResponse.ok || !binaryResponse.ok) throw Error('Action download failed');
    const [index, bytes] = await Promise.all([indexResponse.json(), binaryResponse.arrayBuffer()]);
    if (index.fps !== 30 || index.jointCount !== 24) throw Error('Action rig mismatch');
    const clips = {};
    for (const [key, spec] of Object.entries(index.clips)) {
      if (!Object.hasOwn(labels, key)) continue;
      const data = new Float32Array(bytes, spec.offset, spec.frames * index.jointCount * 16);
      clips[key] = {...spec, data};
    }
    if (!clips.Run || !clips.HeadTurn) throw Error('Action download incomplete');
    return clips;
  }

  async function prepare(target) {
    for (const control of [...buttons, ...selectors]) control.disabled = true;
    feedback('Loading actions…');
    try {
      clipRequest ??= loadClips().catch(error => {
        clipRequest = null;
        throw error;
      });
      const clips = await clipRequest;
      if (active !== target) return;
      target.clips = clips;
      const keys = Object.keys(labels).filter(key => clips[key]);
      for (const select of selectors) {
        select.replaceChildren(...keys.map(key => new Option(labels[key], key)));
        select.disabled = false;
      }
      for (const button of buttons) {
        button.disabled = false;
        button.textContent = 'Play';
      }
      runOption.hidden = runOption.disabled = false;
      feedback('');
    } catch {
      if (active !== target) return;
      for (const button of buttons) {
        button.disabled = false;
        button.textContent = 'Retry';
      }
      feedback('Actions couldn’t load.');
    }
  }

  function start(panel) {
    if (!active) return;
    if (!active.clips) return prepare(active);
    if (panel.dataset.indyActions === 'ar' && !active.placed()) {
      feedback('Place Indy first.');
      return;
    }
    const key = panel.querySelector('select').value;
    const clip = active.clips[key];
    active.action = {
      clip,
      elapsed: 0,
      startPose: active.motion.palette.slice(),
      duration: clip.duration * (clip.loop ? 3 : 1),
    };
    feedback(labels[key]);
  }

  function sample(clip, seconds, frameRate, output) {
    const position = seconds * frameRate;
    const frame = clip.loop ? position % clip.frames : Math.min(clip.frames - 1, position);
    const first = Math.floor(frame);
    const second = clip.loop ? (first + 1) % clip.frames : Math.min(first + 1, clip.frames - 1);
    const t = frame - first;
    const a = first * output.length, b = second * output.length;
    for (let i = 0; i < output.length; i++) output[i] = clip.data[a + i] * (1 - t) + clip.data[b + i] * t;
  }

  function advanceAction(target, dt) {
    const {action, motion, pose} = target;
    action.elapsed += dt;
    const end = fadeSeconds + action.duration;
    const seconds = Math.max(0, Math.min(action.duration, action.elapsed - fadeSeconds));
    sample(action.clip, seconds, motion.metadata.fps, pose);
    const entering = action.elapsed < fadeSeconds;
    if (entering || action.elapsed > end) {
      const other = entering ? action.startPose : motion.clips.Idle.data;
      const amount = entering ? 1 - action.elapsed / fadeSeconds : Math.min(1, (action.elapsed - end) / fadeSeconds);
      for (let i = 0; i < pose.length; i++) pose[i] += (other[i] - pose[i]) * amount;
    }
    if (action.elapsed >= end + fadeSeconds) {
      cancel();
      motion.clip = 'Idle';
      motion.phase = 0;
    }
  }

  function drawAt(target, time, moving, ratio, travel) {
    const {motion} = target;
    const dt = Math.max(0, Math.min(0.1, (time - (target.lastTime ?? time)) / 1000));
    target.lastTime = time;
    if (moving && target.action) cancel();
    const running = moving && target.clips && speed.value === runOption.value;
    if (!target.action && !running) {
      target.runTime = 0;
      motion.update(time, moving, ratio, travel);
      return;
    }
    if (target.action) {
      advanceAction(target, dt);
    } else {
      // The walking controller reports joystick travel as a fraction of normal speed (0.75 m/s).
      target.runTime += dt * Math.min(1, ratio * 0.75 / Number(runOption.value));
      sample(target.clips.Run, target.runTime, motion.metadata.fps, target.pose);
    }
    motion.lastTime = time;
    if (time - target.lastDraw >= 1000 / motion.metadata.fps || time < target.lastDraw) {
      motion.applyPose('ActionSample', 0);
      target.lastDraw = time;
    }
  }

  for (const panel of panels) {
    panel.querySelector('button').addEventListener('click', () => start(panel));
    panel.querySelector('select').addEventListener('change', event => {
      for (const select of selectors) select.value = event.target.value;
    });
    panel.addEventListener('beforexrselect', event => event.preventDefault());
  }
  for (const id of ['walk-stop', 'walk-reposition', 'walk-exit']) {
    document.getElementById(id).addEventListener('click', cancel);
  }

  window.stoneWallActions = {
    bind(key, motion, placed) {
      cancel();
      active = null;
      for (const panel of panels) panel.hidden = key !== 'indy';
      runOption.hidden = runOption.disabled = true;
      if (speed.value === runOption.value) {
        speed.value = '0.75';
        speed.dispatchEvent(new Event('change'));
      }
      if (key !== 'indy') return motion;
      const pose = new Float32Array(motion.palette.length);
      // Feed the existing CPU skinner one sampled pose. Placed actors share its vertex buffers.
      motion.clips.ActionSample = {data: pose, frames: 1, duration: 1};
      const target = {motion, placed, pose, action: null, clips: null, runTime: 0, lastTime: null, lastDraw: -Infinity};
      active = target;
      prepare(target);
      return {update: (...args) => drawAt(target, ...args)};
    },
  };
})();
