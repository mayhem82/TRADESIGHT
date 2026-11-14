(() => {
  const models = {
    companion: { name: 'Bellbrook Yowie', scene: 'media/gltf/yowie-v1/yowie.gltf', motion: 'media/gltf/yowie-motion-v1/', exposureKey:'tradesight-yowie-exposure', defaultEV:1.5 },
    indy: { name: 'Indiana Jones', scene: 'media/gltf/indy/indy.gltf', motion: 'media/gltf/indy/', exposureKey:'tradesight-indy-exposure', defaultEV:0 },
    sunflower: { name: 'Sunflower', scene: 'media/gltf/sunflower/sunflower.gltf' }
  };
  const requested = new URL(location.href).searchParams.get('model');
  const initial = Object.hasOwn(models, requested) ? requested : 'companion';
  const controls = [document.querySelector('#model-choice'), document.querySelector('#ar-character-choice')];
  const status = document.querySelector('#model-status');
  const arStatus = document.querySelector('#character-status');
  const cache = new Map();
  let current = initial;
  let revision = 0;
  let stage;

  function show(key) {
    for (const control of controls) control.value = key;
    document.querySelector('#current-character').textContent = models[key].name;
  }
  function report(text) {
    status.textContent = text;
    arStatus.textContent = text;
  }
  function remember(key, reload) {
    const url = new URL(location.href);
    url.searchParams.set('model', key);
    if (reload) location.assign(url.href);
    else history.replaceState(history.state, '', url);
  }
  async function select(key) {
    if (!Object.hasOwn(models, key)) return;
    const ticket = ++revision;
    if (!stage || key === 'sunflower' || current === 'sunflower') {
      remember(key, true);
      return;
    }
    if (key === current) {
      show(current);
      report(models[key].name + ' ready.');
      return;
    }
    for (const control of controls) control.value = key;
    report('Loading ' + models[key].name + '…');
    if (!cache.has(key)) {
      cache.set(key, stage.load(models[key]).catch(error => { cache.delete(key); throw error; }));
    }
    try {
      const next = await cache.get(key);
      if (ticket !== revision) return;
      stage.replace(next, models[key]);
      current = key;
      show(key);
      remember(key, false);
      report(models[key].name + ' ready.');
    } catch (error) {
      if (ticket !== revision) return;
      show(current);
      report('Could not load ' + models[key].name + '. ' + models[current].name + ' is still selected. Try again.');
      console.error(error);
    }
  }
  for (const control of controls) {
    control.addEventListener('change', () => select(control.value));
    control.addEventListener('beforexrselect', event => event.preventDefault());
  }
  show(initial);
  window.stoneWallCharacters = {
    initial: models[initial],
    connect({renderer, modelNode, motionPlayer, template, actors, appearance, exposure, currentVisual, currentMotion, setActive}) {
      let active = {visual:currentVisual, motion:currentMotion, appearance:appearance.records};
      cache.set(initial, Promise.resolve(active));
      stage = {
        async load(model) {
          const visual = new modelNode({url:model.scene});
          visual._setRenderer(renderer);
          await visual.waitForComplete();
          const motion = await motionPlayer.load(renderer, visual, model.motion, false);
          return {visual, motion};
        },
        replace(next, model) {
          template.removeNode(active.visual);
          template.addNode(next.visual);
          appearance.clear();
          if (next.appearance) {
            appearance.template = next.visual;
            appearance.records = next.appearance;
            appearance.apply();
          } else {
            appearance.records = [];
            appearance.bind(renderer, next.visual);
            next.appearance = appearance.records;
          }
          let light = model.defaultEV;
          try {
            const saved = localStorage.getItem(model.exposureKey);
            if (saved !== null && Number.isFinite(Number(saved))) light = Number(saved);
          } catch {}
          exposure.storageKey = model.exposureKey;
          exposure.ev = light;
          exposure.bind(next.visual);
          for (const actor of actors()) {
            const oldVisual = actor.children.find(child => child.name === 'yowie-visual');
            if (oldVisual) actor.removeNode(oldVisual);
            actor.addNode(next.visual.clone());
            appearance.attach(actor);
          }
          setActive(next.visual, next.motion);
          active = next;
        }
      };
      show(initial);
    }
  };
})();
