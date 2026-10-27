const $ = id=>document.getElementById(id), video=$('video'), stage=$('stage');
let epoch=0, active=null, frameID=0;
const status=text=>$('status').textContent=text;
document.querySelector('details').addEventListener('toggle',event=>{document.querySelector('summary').textContent=event.target.open?'Hide marker, controls & help':'Show marker, controls & help';});
function dispose(session) {
  if(!session || session.disposed)return; session.disposed=true;
  session.stream?.getTracks().forEach(track=>track.stop());
  session.controller?.removeEventListener('getMarker',session.onMarker);
  // ARToolkit's pattern fetch is asynchronous; disposing its native state
  // before that fetch completes causes an upstream null.load exception.
  if(!session.initializing && !session.loadingMarker)session.context?.arController?.dispose();
  session.geometry?.dispose(); session.material?.dispose();
  session.renderer?.dispose(); session.renderer?.domElement.remove();
}
function stop(message='Stopped. Camera released.') {
  epoch++;cancelAnimationFrame(frameID);dispose(active);active=null;
  video.pause();video.srcObject=null;video.hidden=true;$('preview').hidden=false;
  $('start').disabled=false;$('stop').disabled=true;status(message);
}
function resize() {
  if(!active?.renderer || !video.videoWidth)return;
  // Crop the video and transparent render canvas identically to preserve alignment.
  const ratio=Math.max(innerWidth/video.videoWidth,innerHeight/video.videoHeight);
  const width=Math.ceil(video.videoWidth*ratio),height=Math.ceil(video.videoHeight*ratio);
  for(const element of [video,active.renderer.domElement])Object.assign(element.style,{width:`${width}px`,height:`${height}px`,left:`${(innerWidth-width)/2}px`,top:`${(innerHeight-height)/2}px`});
}
$('start').onclick=async()=>{
  stop('Loading marker tracker…');const run=epoch,session={};active=session;
  $('start').disabled=true;$('stop').disabled=false;
  try {
    if(!isSecureContext || !navigator.mediaDevices?.getUserMedia)throw new Error('Camera requires HTTPS or localhost.');
    const [THREE,AR]=await Promise.all([import('three'),import('./vendor/ar-threex-3.4.8.mjs')]);
    if(run!==epoch)return;
    session.renderer=new THREE.WebGLRenderer({alpha:true,antialias:false});
    session.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    const scene=new THREE.Scene(),camera=new THREE.Camera();scene.add(camera);
    const root=new THREE.Group();root.visible=false;scene.add(root);
    session.geometry=new THREE.BoxGeometry(1,1,1);
    // A lit appearance with no lights, textures or external models.
    session.material=new THREE.MeshBasicMaterial({color:$('colour').value,wireframe:false});
    const cube=new THREE.Mesh(session.geometry,session.material);root.add(cube);
    const applySize=()=>{const size=Number($('size').value);cube.scale.setScalar(size);cube.position.y=size/2;};applySize();
    session.applySize=applySize;
    session.context=new AR.ArToolkitContext({cameraParametersUrl:'./assets/camera_para.dat',detectionMode:'mono',maxDetectionRate:20,canvasWidth:640,canvasHeight:480});
    session.initializing=true;
    await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>reject(new Error('Tracker initialization timed out. Stop and retry.')),20000);
      session.context.init(()=>{session.initializing=false;clearTimeout(timeout);if(run!==epoch || session.disposed){session.context.arController?.dispose();}resolve();});
    });
    if(run!==epoch)return;
    camera.projectionMatrix.copy(session.context.getProjectionMatrix());
    session.controller=session.context.arController;session.loadingMarker=true;
    let markerID;
    try{markerID=await session.controller.loadMarker('./assets/patt.hiro');}
    finally{session.loadingMarker=false;if(session.disposed)session.controller.dispose();}
    if(run!==epoch)return;
    session.controller.trackPatternMarkerId(markerID,1);
    root.matrixAutoUpdate=false;
    // Same coordinate conversion used by the pinned AR.js marker controls.
    // Own the async load and listener so Stop can safely cancel either stage.
    const axes=new THREE.Matrix4().makeRotationY(Math.PI).multiply(new THREE.Matrix4().makeRotationZ(Math.PI));
    const markerPlane=new THREE.Matrix4().makeRotationX(Math.PI/2);
    let lastSeen=-Infinity;
    session.onMarker=event=>{
      const marker=event.data.marker;
      if(marker?.idPatt!==markerID || marker.cfPatt<0.6)return;
      root.matrix.fromArray(event.data.matrix).premultiply(axes).multiply(markerPlane);
      root.matrixWorldNeedsUpdate=true;lastSeen=performance.now();
    };
    session.controller.addEventListener('getMarker',session.onMarker);
    status('Waiting for camera permission…');
    const incoming=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:640},height:{ideal:480}}});
    if(run!==epoch){incoming.getTracks().forEach(t=>t.stop());return;}
    session.stream=incoming;video.srcObject=incoming;video.hidden=false;await video.play();if(run!==epoch)return;
    session.renderer.setSize(video.videoWidth,video.videoHeight,false);stage.append(session.renderer.domElement);resize();$('preview').hidden=true;
    let seen=null;
    const frame=()=>{
      if(run!==epoch)return;
      try{if(video.readyState>=2)session.context.update(video);
        root.visible=performance.now()-lastSeen<200;
        if(root.visible!==seen){seen=root.visible;status(seen?'Marker found. Object follows Hiro.':'Looking for Hiro. Keep the full marker in view.');}
        cube.rotation.y=performance.now()/1400;
        session.renderer.render(scene,camera);frameID=requestAnimationFrame(frame);
      }catch(error){stop(error.message);}
    };frame();
  }catch(error){if(run===epoch)stop(`${error.name || 'Error'}: ${error.message}`);}
};
$('stop').onclick=()=>stop();
$('size').oninput=()=>active?.applySize?.();
$('colour').onchange=()=>active?.material?.color.set($('colour').value);
window.addEventListener('resize',resize);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop('Paused when hidden. Press Start to resume.');});
window.addEventListener('pagehide',()=>stop());
