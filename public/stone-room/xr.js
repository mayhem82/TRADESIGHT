import * as THREE from './vendor/three.module.js';
import {placement,surfaceKind} from './core.mjs';
export function setupAR({renderer,scene,camera,room,exterior,snapshot,restore,message,error,clearInput,ready,setContent=()=>{}}){
 const $=s=>document.querySelector(s),button=$('#ar'),overlay=$('#ar-ui');
 let session=null,source=null,space=null,active=false,starting=false,placed=false,current=null,saved=null,background=null,fog=null,tracking='inactive',ended=false;
 let mode='companion',destination=null,following=false,floorY=0;
 const reticle=new THREE.Group();reticle.visible=false;scene.add(reticle);
 const material=new THREE.MeshBasicMaterial({color:0x35ff68,side:THREE.DoubleSide,depthTest:false,depthWrite:false});
 const ring=new THREE.Mesh(new THREE.RingGeometry(.09,.115,48),material);ring.rotation.x=-Math.PI/2;ring.renderOrder=1000;reticle.add(ring);
 const cross1=new THREE.Mesh(new THREE.PlaneGeometry(.12,.008),material);cross1.rotation.x=-Math.PI/2;cross1.renderOrder=1001;reticle.add(cross1);const cross2=cross1.clone();cross2.rotation.z=Math.PI/2;reticle.add(cross2);
 const mat=new THREE.Matrix4(),pos=new THREE.Vector3(),rot=new THREE.Quaternion(),scale=new THREE.Vector3(),normal=new THREE.Vector3(),viewer=new THREE.Vector3();
 const setStatus=t=>$('#ar-status').textContent=t;
 function motionButtons(){
  $('#ar-motion').hidden=!(placed&&mode==='companion');
  $('#place').textContent=mode==='room'?'Place room':placed?'Walk here':'Place companion';
  $('#ar-follow').setAttribute?.('aria-pressed',String(following));
 }
 function stop(){destination=null;following=false;motionButtons()}
 function cleanup(){
  if(ended)return;ended=true;source?.cancel();source=null;space=null;session=null;active=false;starting=false;placed=false;current=null;destination=null;following=false;tracking='inactive';reticle.visible=false;
  room.visible=true;room.position.set(0,0,0);room.quaternion.identity();room.scale.setScalar(1);exterior.visible=true;scene.background=background??scene.background;scene.fog=fog;
  setContent('virtual',saved);overlay.hidden=true;document.body.classList.remove('in-ar');button.disabled=false;button.textContent='Start AR';if(saved)restore(saved);saved=null;clearInput();message('Virtual walkthrough restored');
 }
 async function start(){
  if(starting||active)return;if(!ready()){error('Wait for the room assets to finish loading.');return}
  if(!isSecureContext){error('AR requires a secure HTTPS connection.');return}
  if(!navigator.xr){error('WebXR AR is unavailable in this browser. Use Chrome on an ARCore-supported Android device.');return}
  starting=true;ended=false;mode=$('#ar-content').value||'companion';button.disabled=true;button.textContent='Opening AR…';saved=snapshot();background=scene.background;fog=scene.fog;$('#error').hidden=true;
  try{
   // Request within the user gesture; the capability probe must not delay launch.
   session=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:['hit-test','dom-overlay'],optionalFeatures:['local-floor'],domOverlay:{root:document.body}});
   session.addEventListener('end',cleanup,{once:true});session.addEventListener('select',place);
   camera.position.set(0,0,0);camera.quaternion.identity();await renderer.xr.setSession(session);if(ended)return;
   space=renderer.xr.getReferenceSpace();const v=await session.requestReferenceSpace('viewer');source=await session.requestHitTestSource({space:v});
   if(ended){source?.cancel();source=null;return}if(!source)throw Error('The device did not provide a hit-test source');
   active=true;starting=false;tracking='scanning';clearInput();scene.background=null;scene.fog=null;setContent(mode,saved);room.visible=false;exterior.visible=false;
   document.body.classList.add('in-ar');overlay.hidden=false;$('#place').hidden=false;$('#place').disabled=true;$('#reposition').hidden=true;motionButtons();setStatus(mode==='companion'?'Scan a floor. Place the companion at the green target.':'Move slowly to scan a floor or wall. Find the green target.');
  }catch(e){const failed=session;try{await failed?.end()}catch{}cleanup();const reason=e.name==='NotAllowedError'?'Camera or AR permission was denied. Allow it in Chrome site settings.':e.name==='NotSupportedError'?'Required WebXR hit testing or AR controls are unavailable. Check ARCore and Chrome support.':e.message||String(e);error('AR could not start: '+reason)}
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
  if(!active||!frame||!source||!space)return;
  const viewPose=frame.getViewerPose(space);
  if(!viewPose){current=null;reticle.visible=false;$('#place').disabled=true;room.visible=false;tracking='tracking-lost';setStatus('Tracking paused. Move slowly back toward the scanned area.');return}
  viewer.set(viewPose.transform.position.x,viewPose.transform.position.y,viewPose.transform.position.z);
  if(placed){room.visible=true;if(tracking==='tracking-lost')setStatus('Tracking restored · session placement');tracking='placed';if(mode==='room')return}
  current=null;reticle.visible=false;$('#place').disabled=true;
  for(const hit of frame.getHitTestResults(source)){
   const pose=hit.getPose(space);if(!pose)continue;mat.fromArray(pose.transform.matrix);mat.decompose(pos,rot,scale);normal.set(0,1,0).applyQuaternion(rot);const kind=surfaceKind(normal);
   if(kind==='slope'||(mode==='companion'&&kind!=='floor'))continue;
   current=placement(normal,pos,viewer);if(!current)continue;
   if(placed&&Math.abs(current.y-floorY)>.12){current=null;continue}
   reticle.position.copy(pos);reticle.quaternion.copy(rot);reticle.visible=true;$('#place').disabled=false;
   if(!placed){tracking='surface';setStatus(kind==='floor'?'Floor detected · tap to place at full size':'Wall detected · tap to align the rear wall. Floor height will be estimated.')}
   break;
  }
  if(!current&&!placed){tracking='scanning';setStatus(mode==='companion'?'Scanning for a floor… move slowly until the green target appears.':'Scanning… move slowly until a green floor or wall target appears.')}
 }
 return {get active(){return active||starting},get state(){return tracking},get placed(){return placed},get companionOnly(){return mode==='companion'},get motion(){return active&&placed&&tracking!=='tracking-lost'&&mode==='companion'?(following?{target:{x:viewer.x,y:floorY,z:viewer.z},follow:true}:destination?{target:{...destination},follow:false}:null):null},arrived(){if(!following){destination=null;setStatus('Companion stopped at the floor target. Tap another point to walk.')}},stop,update};
}
