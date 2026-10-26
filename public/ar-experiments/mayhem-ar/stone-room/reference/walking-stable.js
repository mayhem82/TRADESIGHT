import {CompanionMotion,ModelExposure} from './companion-motion.js';
import {WalkingControls} from './walking-controls-stable.js';

      import {WebXRButton} from './js/util/webxr-button.js';
      import {Scene} from './js/render/scenes/scene.js';
      import {Renderer, RenderView, createWebGLContext} from './js/render/core/renderer.js';
      import {Node} from './js/render/core/node.js';
      import {Gltf2Node} from './js/render/nodes/gltf2.js';
      import {DropShadowNode} from './js/render/nodes/drop-shadow.js';
      import {vec3, mat4} from './js/render/math/gl-matrix.js';
      import {Ray} from './js/render/math/ray.js';

      // XR globals.
      let xrButton = null;
      let xrRefSpace = null;
      let xrViewerSpace = null;
      let xrHitTestSource = null;

      // WebGL scene globals.
      let gl = null;
      let renderer = null;
      let scene = new Scene();
      scene.enableStats(false);
      const walking = new WalkingControls();
      const exposure = new ModelExposure(); let motion = null;

      let arObject = new Node();
      arObject.visible = false;
      scene.addNode(arObject);

      const selection = new URLSearchParams(location.search).get('model') || 'companion';
      const companion = selection !== 'sunflower';
      let modelReady = false, xrSupported = false, xrActive = false;
      let flower = new Gltf2Node({url: companion ? 'media/gltf/companion-v2/companion.gltf' : 'media/gltf/sunflower/sunflower.gltf'});
      const modelStatus = document.querySelector('#model-status');
      document.querySelector('#model-choice').value = companion ? 'companion' : 'sunflower';
      document.querySelector('#model-choice').addEventListener('change', event => {
        const url = new URL(location.href); url.searchParams.set('model',event.target.value); location.href = url.href;
      });
      modelStatus.textContent = 'Loading ' + (companion ? 'companion' : 'sunflower') + ' preview before AR...';
      arObject.addNode(flower);

      let reticle = new Gltf2Node({url: 'media/gltf/reticle/reticle.gltf'});
      reticle.visible = false;
      scene.addNode(reticle);

      // Having a really simple drop shadow underneath an object helps ground
      // it in the world without adding much complexity.
      // Real surroundings only; no virtual ground or shadow.

      const MAX_FLOWERS = 1;
      let flowers = [];

      // Ensure the background is transparent for AR.
      scene.clear = false;


      async function prepareModel() {
        try {
          gl = createWebGLContext({xrCompatible: true});
          if (!gl) throw new Error('WebGL 2 is unavailable');
          gl.canvas.width = 420; gl.canvas.height = 320;
          gl.canvas.setAttribute('aria-label','Loaded model preview');
          document.querySelector('#preview').append(gl.canvas);
          renderer = new Renderer(gl); scene.setRenderer(renderer);
          await Promise.all([flower.waitForComplete(),reticle.waitForComplete()]);
          if(companion){modelStatus.textContent='Loading walk animation...';motion=await CompanionMotion.load(renderer,flower);exposure.bind(flower);}
          modelReady = true; arObject.visible = true;
          modelStatus.textContent = (companion ? 'Companion loaded. Idle and Walk animations ready.' : 'Sunflower loaded.') + ' Start AR when you can see it below.';
          xrButton.enabled = xrSupported;
          requestAnimationFrame(drawPreview);
        } catch(error) {
          modelReady = false; xrButton.enabled = false;
          modelStatus.textContent = 'Model load failed: ' + (error?.message || String(error));
          document.querySelector('#preview').textContent = 'No model loaded. AR is disabled.';
        }
      }
      function drawPreview(t) {
        requestAnimationFrame(drawPreview);
        if (xrActive || !modelReady) return;
        const projection=mat4.create(),view=mat4.create();
        mat4.perspective(projection,Math.PI/3,420/320,.05,100);
        mat4.lookAt(view,companion ? [0,1,2.5] : [0,.3,1.1],companion ? [0,.93,0] : [0,.25,0],[0,1,0]);
        motion?.update(t,false,1);
        scene.startFrame();gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,420,320);
        gl.clearColor(.12,.17,.2,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        scene.drawViewArray([new RenderView(projection,{inverse:{matrix:view},position:{x:0,y:1,z:2.5}})]);scene.endFrame();
      }

      function initXR() {
        xrButton = new WebXRButton({
          onRequestSession: onRequestSession,
          onEndSession: onEndSession,
          textEnterXRTitle: "START AR",
          textXRNotFoundTitle: "AR NOT FOUND",
          textExitXRTitle: "EXIT  AR",
        });
        document.querySelector('header').appendChild(xrButton.domElement);

        if (navigator.xr) {
          navigator.xr.isSessionSupported('immersive-ar')
                      .then((supported) => {
            xrSupported = supported; xrButton.enabled = supported && modelReady;
          });
        }
      }

      function onRequestSession() {
        if (!modelReady) return Promise.reject(new Error('Wait for the model preview before starting AR.'));
        xrActive = true; arObject.visible = false;
        return navigator.xr.requestSession('immersive-ar', companion ? {requiredFeatures: ['local', 'hit-test'], optionalFeatures: ['dom-overlay'], domOverlay: {root: document.querySelector('#walking-overlay')}} : {requiredFeatures: ['local', 'hit-test']})
                           .then((session) => {
          xrButton.setSession(session);
          onSessionStarted(session);
        }).catch(error => {xrActive=false;arObject.visible=true;modelStatus.textContent='AR could not start: '+(error?.message || String(error));throw error;});
      }

      function onSessionStarted(session) {
        session.addEventListener('end', onSessionEnded);
        if(companion)walking.begin(session);
        session.addEventListener('select', onSelect);

        if (!gl) {
          gl = createWebGLContext({
            xrCompatible: true
          });

          renderer = new Renderer(gl);

          scene.setRenderer(renderer);
        }

        session.updateRenderState({ baseLayer: new XRWebGLLayer(session, gl) });

        // In this sample we want to cast a ray straight out from the viewer's
        // position and render a reticle where it intersects with a real world
        // surface. To do this we first get the viewer space, then create a
        // hitTestSource that tracks it.
        session.requestReferenceSpace('viewer').then((refSpace) => {
          xrViewerSpace = refSpace;
          session.requestHitTestSource({ space: xrViewerSpace }).then((hitTestSource) => {
            xrHitTestSource = hitTestSource;
          });
        });

        session.requestReferenceSpace('local').then((refSpace) => {
          xrRefSpace = refSpace;

          session.requestAnimationFrame(onXRFrame);
        });
      }

      function onEndSession(session) {
        xrHitTestSource?.cancel();
        xrHitTestSource = null;
        session.end();
      }

      function onSessionEnded(event) {
        xrButton.setSession(null); walking.end();
        xrHitTestSource?.cancel(); xrHitTestSource = null;
        reticle.visible = false;
        for (const object of flowers) scene.removeNode(object);
        flowers = [];
        xrActive = false; arObject.visible = true;
      }

      // Adds a new object to the scene at the
      // specified transform.
      function addARObjectAt(matrix) {
        let newFlower = arObject.clone();
        newFlower.visible = true;
        newFlower.matrix = matrix;
        scene.addNode(newFlower);

        flowers.push(newFlower);
        if(companion)walking.attach(newFlower);

        // For performance reasons if we add too many objects start
        // removing the oldest ones to keep the scene complexity
        // from growing too much.
        if (flowers.length > MAX_FLOWERS) {
          let oldFlower = flowers.shift();
          scene.removeNode(oldFlower);
        }
      }

      let rayOrigin = vec3.create();
      let rayDirection = vec3.create();
      function onSelect(event) {
        if (reticle.visible && modelReady) {
          // The reticle should already be positioned at the latest hit point, 
          // so we can just use it's matrix to save an unnecessary call to 
          // event.frame.getHitTestResults.
          addARObjectAt(reticle.matrix);
        }
      }

      // Called every time a XRSession requests that a new frame be drawn.
      function onXRFrame(t, frame) {
        let session = frame.session;
        let pose = frame.getViewerPose(xrRefSpace);

        reticle.visible = false;

        // If we have a hit test source, get its results for the frame
        // and use the pose to display a reticle in the scene.
        if (xrHitTestSource && pose) {
          let hitTestResults = frame.getHitTestResults(xrHitTestSource);
          if (hitTestResults.length > 0) {
            let pose = hitTestResults[0].getPose(xrRefSpace);
            reticle.visible = true;
            reticle.matrix = pose.transform.matrix;
          }
        }

        walking.update(t, pose);
        if(pose)motion?.update(t,walking.moving,walking.motionRatio);
        if(companion && !walking.placing)reticle.visible=false;
        scene.startFrame();

        session.requestAnimationFrame(onXRFrame);

        scene.drawXRFrame(frame, pose);

        scene.endFrame();
      }

      // Start the XR application.
      initXR();
      prepareModel();
    