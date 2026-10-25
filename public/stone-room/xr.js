import * as THREE from './vendor/three.module.js';
import {ARButton} from './vendor/ARButton.js';
import {manualPlacement,manualPlaneTarget} from './manual-placement.js';

// Restored from Lighthouse 508c1e5 / shared viewer 62c6614: ARButton, full-window
// body overlay and a visible manually positioned model. No hit-test or ring.
export function setupAR({renderer,scene,camera,room,exterior,snapshot,restore,message,error,clearInput,ready,setContent=()=>{},createButton=ARButton.createButton}){
 const $=s=>document.querySelector(s),overlay=$('#ar-ui'),overlayRoot=$('#ar-overlay');
 const button=createButton(renderer,{optionalFeatures:['local-floor','dom-overlay'],domOverlay:{root:document.body}});
 button.id='ar';$('#ar').replaceWith(button);
 button.addEventListener('click',event=>{if(!ready()&&!active){event.preventDefault();event.stopImmediatePropagation();error('Wait for the room assets to finish loading.');}},true);
 const defaults={distance:3,height:-1.4,horizontal:0,scale:1,rotation:0};
 const inputs=Object.fromEntries(Object.keys(defaults).map(name=>[name,$('#ar-'+name)]));
 let active=false,session=null,saved=null,background=null,fog=null,bodyDisplay='',cameraState=null,rootState=null;
 let mode='companion',following=false,destination=null,current=null,poseReady=false,tracking='inactive';
 const viewer=new THREE.Vector3(),direction=new THREE.Vector3(),matrix=new THREE.Matrix4();
 let metrics={stage:'inactive',frames:0,pose:false,manual:true,rendered:0,draws:0,views:0,lastError:''};
 const status=text=>{if($('#ar-status').textContent!==text)$('#ar-status').textContent=text};
 function diagnostics(force=false){
  if(!force&&metrics.frames%30!==0)return;
  $('#ar-diagnostics').textContent='AR '+metrics.stage+' · frames '+metrics.frames+' · pose '+(metrics.pose?'yes':'no')+' · manual plane · draws '+metrics.draws+' · views '+metrics.views+(metrics.lastError?' · '+metrics.lastError:'');
  const graphics=metrics.graphics;
  $('#ar-graphics').textContent=graphics?metrics.graphicsMode+' · '+graphics.layer+' · AA '+graphics.samples+' · FBO '+graphics.fbo+' · errors '+(graphics.errors.join(',')||'none'):'Graphics diagnostics waiting for AR render';
 }
 function motionButtons(){
  $('#ar-motion').hidden=!active||mode!=='companion';$('#place').hidden=mode!=='companion';$('#place').textContent='Walk to aim point';$('#place').disabled=!current;
  $('#reposition').hidden=!active;$('#reposition').textContent='Reset placement';
  $('#ar-follow').setAttribute('aria-pressed',String(following));
 }
 function stop(){following=false;destination=null;motionButtons();}
 function values(){return Object.fromEntries(Object.entries(inputs).map(([name,input])=>[name,Number(input.value)]));}
 function applyPlacement(resetCompanion=true){
  const placement=manualPlacement(values());
  if(resetCompanion){stop();setContent(mode,saved);}
  room.position.set(...placement.position);room.rotation.set(0,placement.yaw,0);room.scale.setScalar(placement.scale);room.visible=true;
  for(const [name,input]of Object.entries(inputs))$('#ar-'+name+'-value').textContent=input.value+(name==='rotation'?'°':name==='scale'?'×':' m');
  current=null;motionButtons();if(active)status('Model visible. Manual placement; real ground is not detected.');
 }
 for(const input of Object.values(inputs))input.oninput=()=>{if(active)applyPlacement();};
 function start(){
  session=renderer.xr.getSession();
  if(!ready()){setTimeout(()=>{error('Wait for the room assets to finish loading.');session?.end();},0);return;}
  saved=snapshot();background=scene.background;fog=scene.fog;bodyDisplay=document.body.style.display;
  cameraState={fov:camera.fov,zoom:camera.zoom,near:camera.near,far:camera.far,aspect:camera.aspect,projection:camera.projectionMatrix.clone(),inverse:camera.projectionMatrixInverse.clone()};
  rootState={position:room.position.clone(),quaternion:room.quaternion.clone(),scale:room.scale.clone(),exteriorVisible:exterior.visible};
  mode=$('#ar-content').value||'companion';active=true;following=false;destination=null;current=null;poseReady=false;tracking='manual';
  metrics={stage:'manual',frames:0,pose:false,manual:true,rendered:0,draws:0,views:0,lastError:''};
  clearInput();$('#error').hidden=true;scene.background=null;scene.fog=null;exterior.visible=false;
  document.body.classList.add('in-ar');overlayRoot.hidden=false;overlay.hidden=false;$('#ar-options').open=true;
  applyPlacement();session.addEventListener('select',walk);diagnostics(true);
 }
 function end(){
  session?.removeEventListener('select',walk);
  // ARButton hides its overlay root on end; body is the Lighthouse overlay root.
  document.body.style.display=bodyDisplay||'';
  if(!active){session=null;return;}
  active=false;following=false;destination=null;current=null;poseReady=false;tracking='inactive';metrics.stage='inactive';
  setContent('virtual',saved);scene.background=background;scene.fog=fog;
  room.position.copy(rootState.position);room.quaternion.copy(rootState.quaternion);room.scale.copy(rootState.scale);room.visible=true;exterior.visible=rootState.exteriorVisible;
  if(saved)restore(saved);Object.assign(camera,{fov:cameraState.fov,zoom:cameraState.zoom,near:cameraState.near,far:cameraState.far,aspect:cameraState.aspect});camera.projectionMatrix.copy(cameraState.projection);camera.projectionMatrixInverse.copy(cameraState.inverse);camera.updateMatrixWorld(true);
  overlay.hidden=true;overlayRoot.hidden=true;document.body.classList.remove('in-ar');session=null;saved=null;clearInput();motionButtons();diagnostics(true);message('Virtual walkthrough restored');
 }
 renderer.xr.addEventListener('sessionstart',start);renderer.xr.addEventListener('sessionend',end);
 function walk(){
  if(!active||mode!=='companion'||!current)return;
  destination={...current};following=false;motionButtons();status('Walking on the manually positioned plane; this is not a detected floor.');
 }
 $('#place').onclick=walk;
 $('#reposition').onclick=()=>{if(!active)return;for(const [name,value]of Object.entries(defaults))inputs[name].value=String(value);applyPlacement();};
 $('#ar-content').onchange=()=>{if(active){mode=$('#ar-content').value;applyPlacement();}};
 $('#ar-follow').onclick=()=>{if(active&&mode==='companion'){following=true;destination=null;motionButtons();status('Following on the manual plane. Real ground and obstacles are not detected.');}};
 $('#ar-stop').onclick=()=>{stop();status('Companion stopped.');};
 $('#exit-ar').onclick=()=>session?.end();
 document.body.addEventListener('beforexrselect',event=>{if(event.target.closest?.('button,input,select,summary,aside,label'))event.preventDefault();});
 return {
  update(frame){
   if(!active||!frame)return;metrics.frames++;
   try{
    const pose=frame.getViewerPose(renderer.xr.getReferenceSpace());poseReady=!!pose;metrics.pose=poseReady;
    if(!pose){tracking='tracking-lost';current=null;motionButtons();status('Device pose paused. Manual placement is retained.');diagnostics();return;}
    matrix.fromArray(pose.transform.matrix);viewer.setFromMatrixPosition(matrix);direction.set(-matrix.elements[8],-matrix.elements[9],-matrix.elements[10]).normalize();
    current=manualPlaneTarget(viewer,direction,room.position.y);tracking='manual';metrics.lastError='';
    if(mode==='companion'&&!following&&!destination)status(current?'Aim point on the manual plane is ready. Use Walk to aim point.':'Model visible. Adjust placement, or aim down toward the manual plane to walk.');
    motionButtons();diagnostics();
   }catch(reason){poseReady=false;tracking='tracking-error';current=null;metrics.lastError=reason.message||String(reason);motionButtons();status('Device pose update failed: '+metrics.lastError);diagnostics(true);}
  },
  rendered(stats){Object.assign(metrics,stats);metrics.rendered++;diagnostics();},
  renderError(reason){metrics.lastError='Render: '+(reason.message||String(reason));status('AR graphics error: '+metrics.lastError);diagnostics(true);},
  get active(){return active;},get placed(){return active;},get state(){return tracking;},get companionOnly(){return mode==='companion';},
  get motion(){return active&&poseReady&&mode==='companion'?(following?{target:{x:viewer.x,y:room.position.y,z:viewer.z},follow:true}:destination?{target:{...destination},follow:false}:null):null;},
  arrived(){if(!following){destination=null;status('Companion stopped on the manual plane.');}},stop,
  get diagnostics(){return {...metrics,route:'Lighthouse ARButton/manual',manualPosition:room.position.toArray(),manualScale:room.scale.x};}
 };
}
