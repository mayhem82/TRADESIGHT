import * as THREE from './vendor/three.module.js';
import {placement,surfaceKind} from './core.mjs';
import {createSurfaceReticle} from './surface-reticle.js';
export function setupAR({renderer,scene,camera,room,exterior,snapshot,restore,message,error,clearInput,ready,setContent=()=>{}}){
 const $=s=>document.querySelector(s),button=$('#ar'),overlay=$('#ar-ui'),overlayRoot=$('#ar-overlay');
 let session=null,source=null,space=null,active=false,starting=false,placed=false,current=null,saved=null,background=null,fog=null,tracking='inactive',ended=false;
 let mode='companion',destination=null,following=false,floorY=0,attempt=0;
 const reticle=createSurfaceReticle();scene.add(reticle);
 const projected=new THREE.Vector3();
 const mat=new THREE.Matrix4(),pos=new THREE.Vector3(),rot=new THREE.Quaternion(),scale=new THREE.Vector3(),normal=new THREE.Vector3(),viewer=new THREE.Vector3();
 let metrics={stage:'inactive',frames:0,pose:false,hits:0,rejected:'',target:false,lastError:'',draws:0,views:0,contextLost:false,xrTarget:false,rendered:0};
 function diagnostics(force=false){
  const element=$('#ar-diagnostics');if(!element||(!force&&metrics.frames%30!==0))return;
  element.textContent=`AR ${metrics.stage} · frames ${metrics.frames} · pose ${metrics.pose?'yes':'no'} · hits ${metrics.hits} · target ${metrics.target?'yes':'no'}${metrics.rejected?' · '+metrics.rejected:''} · draws ${metrics.draws} · views ${metrics.views} · XR ${metrics.xrTarget?'yes':'no'} · GL ${metrics.contextLost?'lost':'ok'}${metrics.lastError?' · '+metrics.lastError:''}`;
  const graphicsElement=$('#ar-graphics'),g=metrics.graphics;if(graphicsElement){
   const target=metrics.targetNDC?`${metrics.targetInView?'in':'out'} ${metrics.targetNDC.join('/')}`:'none';
   graphicsElement.textContent=g?`${metrics.graphicsMode} · ${g.layer} · AA ${g.samples} · FBO ${g.fbo.replace('FRAMEBUFFER_','')} · bound ${g.framebufferBound?'yes':'no'}${g.baseFramebufferMatches===null?'':'/XR-match '+(g.baseFramebufferMatches?'yes':'no')} · errors ${g.errors.join(',')||'none'} · viewport ${g.viewport.join('/')} · probe ${g.probeEnabled?g.probeFrameDraws+' draws, '+g.probeFbo.replace('FRAMEBUFFER_','')+', '+(g.probeErrors.join(',')||'no errors'):'off'} · target ${target}`:'Graphics diagnostics waiting for XR render';
  }
 }
 const setStatus=t=>{if($('#ar-status').textContent!==t)$('#ar-status').textContent=t};
 function motionButtons(){
  $('#ar-motion').hidden=!(placed&&mode==='companion');
  $('#place').textContent=mode==='room'?'Place room':placed?'Walk here':'Place companion';
  $('#ar-follow').setAttribute?.('aria-pressed',String(following));
 }
 function stop(){destination=null;following=false;motionButtons()}
 function cleanup(){
  if(ended)return;ended=true;metrics.stage='inactive';diagnostics(true);source?.cancel();source=null;space=null;session=null;active=false;starting=false;placed=false;current=null;destination=null;following=false;tracking='inactive';reticle.visible=false;
  room.visible=true;room.position.set(0,0,0);room.quaternion.identity();room.scale.setScalar(1);exterior.visible=true;scene.background=background??scene.background;scene.fog=fog;
  setContent('virtual',saved);overlay.hidden=true;overlayRoot.hidden=true;document.body.classList.remove('in-ar');button.disabled=false;button.textContent='Start AR';if(saved)restore(saved);saved=null;clearInput();message('Virtual walkthrough restored');
 }
 async function start(){
  if(starting||active)return;if(!ready()){error('Wait for the room assets to finish loading.');return}
  if(!isSecureContext){error('AR requires a secure HTTPS connection.');return}
  if(!navigator.xr){error('WebXR AR is unavailable in this browser. Use Chrome on an ARCore-supported Android device.');return}
  const token=++attempt;let openingSession=null;const stale=()=>token!==attempt||ended;
  metrics={stage:'opening',frames:0,pose:false,hits:0,rejected:'',target:false,lastError:'',draws:0,views:0,contextLost:false,xrTarget:false,rendered:0};diagnostics(true);
  starting=true;ended=false;mode=$('#ar-content').value||'companion';button.disabled=true;button.textContent='Opening AR…';saved=snapshot();background=scene.background;fog=scene.fog;$('#error').hidden=true;
  try{
   // Request within the user gesture; the capability probe must not delay launch.
   openingSession=await navigator.xr.requestSession('immersive-ar',{optionalFeatures:['hit-test','dom-overlay'],domOverlay:{root:overlayRoot}});
   if(stale()){await openingSession.end();return}session=openingSession;
   // Show real startup progress as soon as the camera opens, including slow setup.
   document.body.classList.add('in-ar');overlay.hidden=false;overlayRoot.hidden=false;$('#place').disabled=true;$('#place').hidden=false;$('#reposition').hidden=true;$('#ar-motion').hidden=true;
   metrics.stage='graphics';diagnostics(true);setStatus('Camera opened · starting AR graphics…');
   session.addEventListener('end',()=>{if(token===attempt)cleanup()},{once:true});session.addEventListener('select',()=>{if(!stale())place()});
   clearInput();scene.background=null;scene.fog=null;setContent(mode,saved);room.visible=false;exterior.visible=false;
   camera.position.set(0,0,0);camera.quaternion.identity();renderer.xr.setReferenceSpaceType('local');await renderer.xr.setSession(openingSession);if(stale())return;
   metrics.stage='viewer-space';diagnostics(true);setStatus('Starting device tracking…');
   const referenceSpace=renderer.xr.getReferenceSpace(),v=await openingSession.requestReferenceSpace('viewer');if(stale())return;
   // An ended session can resolve after a new session has already started. Never
   // let its late source (or rejection) overwrite or close the new session.
   metrics.stage='hit-test';diagnostics(true);setStatus('Starting floor detection…');
   const hitSource=await openingSession.requestHitTestSource({space:v});
   if(stale()){hitSource?.cancel();return}if(!hitSource)throw Error('The device did not provide a hit-test source');
   if(!referenceSpace)throw Error('The renderer did not provide an AR reference space');
   space=referenceSpace;source=hitSource;metrics.stage='ready';diagnostics(true);
   active=true;starting=false;tracking='scanning';clearInput();
   document.body.classList.add('in-ar');overlay.hidden=false;overlayRoot.hidden=false;$('#place').hidden=false;$('#place').disabled=true;$('#reposition').hidden=true;motionButtons();setStatus(mode==='companion'?'Scan a floor. Place the companion at the green target.':'Move slowly to scan a floor or wall. Find the green target.');
  }catch(e){if(stale())return;try{await openingSession?.end()}catch{}if(token!==attempt)return;cleanup();const reason=e.name==='NotAllowedError'?'Camera or AR permission was denied. Allow it in Chrome site settings.':e.name==='NotSupportedError'?'Required WebXR hit testing or AR controls are unavailable. Check ARCore and Chrome support.':e.message||String(e);error('AR could not start: '+reason)}
 }
 function place(){
  if(!active||!current)return;
  if(placed){
   if(mode!=='companion'||current.kind!=='floor')return;
   // One detected floor defines this walking plane; do not infer stairs or obstacles.
   if(Math.abs(current.y-floorY)>.12){setStatus('Different floor height. Reposition the companion on that surface.');return}
   destination={x:current.x,y:floorY,z:current.z};following=false;motionButtons();setStatus('Walking to the detected floor point.');return;
  }
  const p=current;room.position.set(p.x,p.y,p.z);room.rotation.set(0,p.yaw,0);room.scale.setScalar(1);room.visible=true;placed=true;floorY=p.y;tracking='placed';reticle.visible=false;current=null;stop();
  $('#place').hidden=mode==='room';$('#place').disabled=true;$('#reposition').hidden=false;motionButtons();
  setStatus(mode==='companion'?'Companion placed. Aim at another floor point and tap to walk.':p.estimatedFloor?'Placed against wall · floor height estimated from viewer eye level. Reposition on a floor for accurate floor contact.':'Room placed at 1:1 scale. Reposition to move it.');
 }
 function reposition(){if(!active)return;placed=false;current=null;stop();setContent(mode,saved);room.visible=false;reticle.visible=false;tracking='scanning';$('#place').hidden=false;$('#place').disabled=true;$('#reposition').hidden=true;motionButtons();setStatus(mode==='companion'?'Scan a floor. Tap the green target to place the companion.':'Scan another surface. Tap the green target to place.');}
 button.onclick=start;$('#place').onclick=place;$('#reposition').onclick=reposition;
 $('#ar-content').onchange=()=>{if(!active)return;mode=$('#ar-content').value;reposition()};
 $('#ar-follow').onclick=()=>{if(!active||!placed||mode!=='companion')return;following=true;destination=null;motionButtons();setStatus('Following you on the placed floor plane. Tap Stop to pause.')};
 $('#ar-stop').onclick=()=>{stop();setStatus('Companion stopped. Tap another floor point to walk.')};
 $('#exit-ar').onclick=async()=>{try{await session?.end()}catch(e){error('Could not close AR: '+e.message)}};
 document.body.addEventListener('beforexrselect',e=>{if(e.target.closest('button,input,select,summary,aside,label'))e.preventDefault()});
 if(!isSecureContext)button.title='AR requires HTTPS';else if(!navigator.xr)button.title='WebXR is unavailable in this browser';else navigator.xr.isSessionSupported('immersive-ar').then(ok=>{button.dataset.supported=String(ok);button.title=ok?'Start tracked AR placement':'This device reports immersive AR is unavailable';if(!ok)message('AR unavailable on this device · virtual walkthrough available')}).catch(e=>{button.title='AR capability check failed: '+e.message});
 function update(frame){
  if(frame){metrics.frames++;diagnostics()}
  if(!active||!frame||!source||!space)return;
  try{updateFrame(frame)}catch(e){
   metrics.lastError=e.name+': '+(e.message||String(e));metrics.target=false;current=null;reticle.visible=false;$('#place').disabled=true;room.visible=false;tracking='tracking-error';
   diagnostics(true);setStatus('AR tracking error. Exit AR and try again. '+metrics.lastError);
  }
 }
 function updateFrame(frame){
  metrics.lastError='';metrics.hits=0;metrics.rejected='';metrics.target=false;
  space=renderer.xr.getReferenceSpace();if(!space)throw Error('AR reference space unavailable');
  const viewPose=frame.getViewerPose(space);metrics.pose=!!viewPose;
  if(!viewPose){diagnostics(true);current=null;reticle.visible=false;$('#place').disabled=true;room.visible=false;tracking='tracking-lost';setStatus('Tracking paused. Move slowly back toward the scanned area.');return}
  viewer.set(viewPose.transform.position.x,viewPose.transform.position.y,viewPose.transform.position.z);
  if(placed){room.visible=true;if(tracking==='tracking-lost'||tracking==='tracking-error')setStatus('Tracking restored · session placement');tracking='placed';if(mode==='room')return}
  current=null;reticle.visible=false;$('#place').disabled=true;
  const hits=frame.getHitTestResults(source);metrics.hits=hits.length;
  for(const hit of hits){
   const pose=hit.getPose(space);if(!pose){metrics.rejected='no hit pose';continue;}reticle.matrix.fromArray(pose.transform.matrix);reticle.visible=true;metrics.target=true;
   mat.fromArray(pose.transform.matrix);mat.decompose(pos,rot,scale);normal.set(0,1,0).applyQuaternion(rot);const kind=surfaceKind(normal);
   if(kind==='slope'||(mode==='companion'&&kind!=='floor')){metrics.rejected=kind;continue;}
   current=placement(normal,pos,viewer);if(!current)continue;
   if(placed&&Math.abs(current.y-floorY)>.12){metrics.rejected='different floor height';current=null;continue}
   metrics.target=true;metrics.rejected='';$('#place').disabled=false;
   if(!placed){tracking='surface';setStatus(kind==='floor'?'Floor detected · tap to place at full size':'Wall detected · tap to align the rear wall. Floor height will be estimated.')}
   break;
  }
  if(!current&&!placed){tracking='scanning';setStatus(metrics.rejected==='wall'?'Wall detected · aim the phone down at the floor.':metrics.rejected==='slope'?'Surface is not level · aim at a flat floor.':mode==='companion'?'No floor hit yet · aim down and move slowly over a well-lit, textured floor.':'No surface hit yet · move slowly across a well-lit floor or wall.')}
  diagnostics();
 }
 return {rendered(stats,xrCamera){Object.assign(metrics,stats);metrics.rendered++;
   const view=xrCamera?.cameras?.[0];if(view&&reticle.visible){reticle.getWorldPosition(projected).project(view);metrics.targetNDC=projected.toArray().map(v=>Number.isFinite(v)?+v.toFixed(2):null);metrics.targetInView=metrics.targetNDC.every(v=>v!==null)&&Math.abs(projected.x)<=1&&Math.abs(projected.y)<=1&&Math.abs(projected.z)<=1}else{metrics.targetNDC=null;metrics.targetInView=null}diagnostics()},renderError(e){metrics.lastError='Render: '+(e.message||String(e));diagnostics(true);setStatus('AR graphics error: '+metrics.lastError)},get diagnostics(){return {...metrics}},get active(){return active||starting},get state(){return tracking},get placed(){return placed},get companionOnly(){return mode==='companion'},get motion(){return active&&placed&&tracking!=='tracking-lost'&&tracking!=='tracking-error'&&mode==='companion'?(following?{target:{x:viewer.x,y:floorY,z:viewer.z},follow:true}:destination?{target:{...destination},follow:false}:null):null},arrived(){if(!following){destination=null;setStatus('Companion stopped at the floor target. Tap another point to walk.')}},stop,update};
}
