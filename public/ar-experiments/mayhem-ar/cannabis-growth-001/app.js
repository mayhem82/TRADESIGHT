import * as T from 'three';
import {CannabisPlant,loadBotanicalTextures} from './plant.js?v=cannabis-1';
import {CULTIVARS,sampleCultivar} from './cultivars.js?v=cannabis-1';
import {readSettings,writeSettings} from './settings.js?v=cannabis-1';
import {ViewControls} from './view-controls.js?v=cannabis-1';
import {GrowthClock,clamp} from './growth.js';
const $=id=>document.getElementById(id),clock=new GrowthClock(32),prefs=readSettings();
const state={ready:false,supported:false,starting:false,session:null,reference:null,hitSource:null,candidate:null,placed:false,tracking:false,anchor:null,anchorPending:false,anchorBusy:false,epoch:0};
let renderer,scene,camera,plant,overlay,floor,reticle,cutoffGuide,viewControls,lastTime=null,lastCamera=null,lastView=null,lastProjection=null;
let cultivar=prefs.cultivar,plantSize=prefs.plantSize,plantTransparency=prefs.plantTransparency,exposureEV=prefs.exposureEV,travelExponent=prefs.travelExponent,startHeight=prefs.startHeight;
let groundMethod=prefs.groundMethod,groundDistance=prefs.groundDistance,cutoffEnabled=prefs.cutoffEnabled,cutoffOffset=0,showCutoffGuide=false;
let leafMotion=prefs.leafMotion,leafMotionStrength=prefs.leafMotionStrength,leafCycleSpeed=prefs.leafCycleSpeed;
let position=new T.Vector3(),plantOffset=new T.Vector3(),yaw=0,plantYaw=0,stickTarget='flower',stickMove=[0,0],stickTurn=[0,0],groupMoved=false;
let surfaceRay=null,surfaceTap=null,drag=null,previewYaw=.34,lastSyncKey='';
const pads=[],UP=new T.Vector3(0,1,0),cutoffPlane=new T.Plane(UP.clone(),0),savedSize=new T.Vector2();
const note=text=>{if($('status').textContent!==text)$('status').textContent=text;};
const track=text=>{if($('tracking').textContent!==text)$('tracking').textContent=text;};
const factor=()=>2**travelExponent,pretty=v=>Number(v.toFixed(2))+'×';
clock.setSpeed(prefs.growthSpeed);
function savePreferences(){
 const saved=writeSettings({version:1,cultivar,plantSize,plantTransparency,exposureEV,travelExponent,growthSpeed:clock.speed,startHeight,groundMethod,groundDistance,cutoffEnabled,leafMotion,leafMotionStrength,leafCycleSpeed});
 $('settings-status').textContent=saved?'Settings saved on this device. Choose a new ground spot each AR session.':'Settings apply now, but this browser could not save them.';
}
function canGrow(){return state.ready&&!state.starting&&(!state.session||(state.placed&&state.tracking&&overlay.visible));}
function sync(){
 viewControls?.sync();const active=!!state.session,allowed=canGrow();
 document.documentElement.classList.toggle('tracking-lost',active&&!state.tracking);document.documentElement.classList.toggle('ar-placed',active&&state.placed);
 const key=[active,allowed,state.ready,state.supported,state.starting,state.placed,state.tracking,!!state.candidate,groundMethod,stickTarget,clock.playing,clock.progress>=1,$('panel').hidden,viewControls?.clean].join('|');
 if(key===lastSyncKey)return;lastSyncKey=key;
 $('start').disabled=!state.ready||!state.supported||active||state.starting;
 for(const id of ['grow','pause','restart','progress'])$(id).disabled=!allowed;
 $('cultivar').disabled=!state.ready||state.starting;
 $('grow').innerHTML=(clock.progress>=1?'Grow again':'Grow plant')+' <span>↗</span>';
 $('pause').textContent=clock.playing?'Pause':'Resume';$('pause').setAttribute('aria-label',clock.playing?'Pause growth':'Resume growth');
 $('placement').hidden=!active;$('placed-controls').hidden=!active||!state.placed;
 $('toggle-panel').hidden=!active;$('exit').hidden=!active;$('aim').hidden=!active||state.placed;
 $('ground-method').value=groundMethod;$('ground-method').disabled=state.placed;
 $('ground-method').querySelector('[value=detected]').disabled=active&&!state.hitSource;
 $('ground-distance-wrap').hidden=groundMethod!=='manual';
 $('place').disabled=!state.tracking||(!state.placed&&!state.candidate);
 $('place').textContent=state.placed?'Choose ground spot again':groundMethod==='detected'?'Plant at ground marker':'Plant at centre of view';
 $('quick-place').hidden=!active||state.placed||!$('panel').hidden;$('quick-place').disabled=!state.tracking||!state.candidate;$('quick-place').textContent=$('place').textContent;
 const sticks=active&&state.placed&&state.tracking&&!viewControls?.clean;$('joystick-controls').hidden=!sticks;
 for(const pad of pads)pad.element.setAttribute('aria-disabled',String(!sticks));
 $('target-flower').setAttribute('aria-pressed',String(stickTarget==='flower'));$('target-all').setAttribute('aria-pressed',String(stickTarget==='all'));
 $('move-label').textContent=stickTarget==='flower'?'Move plant':'Move plant + level';
 if(plant)plant.guide.visible=!viewControls?.clean&&active&&state.tracking&&!state.placed&&!!state.candidate;
}
function grow(){if(!canGrow())return;if(clock.progress>=1)clock.seek(0);clock.playing=true;note('Growing '+CULTIVARS[cultivar].name+' · unfolding leaves, branches and flower clusters.');sync();}
function toggleGrowth(){if(!canGrow())return;if(clock.playing)clock.playing=false;else grow();sync();}
function playback(){
 const sample=sampleCultivar(cultivar,clock.progress);$('stage').textContent=sample.stage;
 $('progress').value=clock.progress*100;$('progress-value').textContent=Math.round(clock.progress*100)+'%';
 $('reference-stage').textContent='Reference sequence · '+sample.referenceLabel;
 $('leaf-phase').textContent=!leafMotion?'Motion off':(plant?.state.leafCycle??0)>0?'Day · leaves lifting':'Night · leaves relaxing';
 $('pause').textContent=clock.playing?'Pause':'Resume';
}
function appearanceUI(){
 $('model-exposure').value=exposureEV;$('model-exposure-value').textContent=(exposureEV>0?'+':'')+exposureEV.toFixed(1)+' EV';
 $('plant-size').value=plantSize*100;$('plant-size-value').textContent=Math.round(plantSize*100)+'%';
 $('plant-transparency').value=plantTransparency;$('plant-transparency-value').textContent=Math.round(plantTransparency)+'%';
 if(renderer)renderer.toneMappingExposure=.9*2**exposureEV;
 if(plant){plant.visual.scale.setScalar(plantSize);plant.setOpacity(1-plantTransparency/100);}
}
function movementUI(){const f=factor();$('travel-speed').value=travelExponent;$('travel-speed-value').textContent=pretty(f);$('travel-speed-metric').textContent=Number((.025*f).toPrecision(3))+' m/s';}
function heightUI(){$('start-height').value=startHeight*100;$('start-height-value').textContent=Number((startHeight*100).toFixed(1))+' cm';applyPlantAlignment();}
function distanceUI(){$('ground-distance').value=groundDistance*100;$('ground-distance-value').textContent=Math.round(groundDistance*100)+' cm';}
function leafMotionUI(){$('leaf-motion').checked=leafMotion;$('leaf-motion-strength').value=leafMotionStrength*100;$('leaf-motion-strength-value').textContent=Math.round(leafMotionStrength*100)+'%';$('leaf-cycle-speed').value=leafCycleSpeed;$('leaf-cycle-speed-value').textContent=pretty(leafCycleSpeed);plant?.setLeafMotion(leafMotion,leafMotionStrength,leafCycleSpeed);}
function applyPlantAlignment(){if(plant){plant.root.position.copy(plantOffset);plant.root.position.y+=startHeight;plant.root.rotation.y=plantYaw;}}
function centrePlant(){zeroSticks();plantOffset.set(0,0,0);plantYaw=0;applyPlantAlignment();}
function applyCutoff(){
 if(!overlay)return;cutoffPlane.constant=-(overlay.position.y+cutoffOffset);cutoffGuide.position.y=cutoffOffset;cutoffGuide.visible=showCutoffGuide&&cutoffEnabled&&!viewControls?.clean;
}
function cutoffUI(){
 $('cutoff-height').value=cutoffOffset*100;$('cutoff-height-value').textContent=Number((cutoffOffset*100).toFixed(1))+' cm';$('cutoff-enabled').checked=cutoffEnabled;$('cutoff-guide').checked=showCutoffGuide;
 plant?.setClipping(cutoffEnabled?[cutoffPlane]:[]);applyCutoff();
}
function buildPlant(){
 if(plant){overlay.remove(plant.root);plant.dispose();}
 plant=new CannabisPlant(cultivar);overlay.add(plant.root);applyPlantAlignment();leafMotionUI();plant.update(clock.progress);appearanceUI();cutoffUI();lastSyncKey='';
}
function chooseCultivar(value){
 if(!CULTIVARS[value])return;zeroSticks();clock.playing=false;cultivar=value;buildPlant();
 $('cultivar').value=value;$('cultivar-description').textContent=CULTIVARS[value].description;
 playback();sync();savePreferences();note(CULTIVARS[value].name+' selected. Placement and growth progress are preserved.');
}
function discardAnchor(){try{state.anchor?.delete();}catch{}state.anchor=null;state.anchorPending=false;}
function zeroSticks(){
 stickMove=[0,0];stickTurn=[0,0];
 for(const pad of pads){pad.pointer=null;pad.knob.style.transform='';pad.element.setAttribute('aria-valuetext','Centred');}
 if(groupMoved&&state.session&&state.placed){state.anchorPending=true;if(surfaceRay){const d=position.clone().sub(surfaceRay.origin);groundDistance=clamp(d.length(),.2,5);surfaceRay.direction.copy(d.normalize());distanceUI();savePreferences();}}
 groupMoved=false;
}
function beginStick(){clock.playing=false;if(stickTarget==='all'&&!groupMoved){position.copy(overlay.position);discardAnchor();state.epoch++;groupMoved=true;}sync();}
function moveWithSticks(dt){
 if(!state.session||!state.placed||!state.tracking||!lastCamera)return;
 if(!stickMove.some(Boolean)&&!stickTurn.some(Boolean))return;
 const right=new T.Vector3(lastCamera[0],0,lastCamera[2]).normalize(),near=new T.Vector3(lastCamera[8],0,lastCamera[10]).normalize();if(near.lengthSq()<.001)near.set(0,0,1);
 const delta=right.multiplyScalar(stickMove[0]).addScaledVector(near,stickMove[1]).multiplyScalar(.025*dt*factor());delta.y=-stickTurn[1]*.025*dt*factor();
 if(stickTarget==='flower'){delta.applyAxisAngle(UP,-yaw);plantOffset.add(delta);plantOffset.clampScalar(-2,2);plantYaw-=stickTurn[0]*.45*dt;applyPlantAlignment();}
 else{position.add(delta);yaw-=stickTurn[0]*.45*dt;overlay.position.copy(position);overlay.rotation.y=yaw;}
}
function bindStick(id,assign){
 const element=$(id+'-stick'),knob=$(id+'-knob'),pad={element,knob,pointer:null};pads.push(pad);
 const input=e=>{const b=element.getBoundingClientRect();let x=(e.clientX-b.x-b.width/2)/(b.width*.34),y=(e.clientY-b.y-b.height/2)/(b.height*.34),n=Math.max(1,Math.hypot(x,y));x/=n;y/=n;if(Math.hypot(x,y)<.12)x=y=0;assign([x,y]);knob.style.transform=`translate(${x*28}px,${y*28}px)`;element.setAttribute('aria-valuetext',`${Math.round(x*100)}, ${Math.round(y*100)}`);};
 element.onpointerdown=e=>{if(element.getAttribute('aria-disabled')==='true'||pad.pointer!==null)return;e.preventDefault();beginStick();pad.pointer=e.pointerId;element.setPointerCapture(e.pointerId);input(e);};
 element.onpointermove=e=>{if(e.pointerId===pad.pointer){e.preventDefault();input(e);}};
 for(const type of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(type,e=>{if(e.pointerId===pad.pointer){pad.pointer=null;assign([0,0]);knob.style.transform='';element.setAttribute('aria-valuetext','Centred');if(pads.every(p=>p.pointer===null))zeroSticks();}});
 element.onkeydown=e=>{if(element.getAttribute('aria-disabled')==='true'||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();beginStick();assign([e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0,e.key==='ArrowUp'?-1:e.key==='ArrowDown'?1:0]);moveWithSticks(.08);zeroSticks();};
}
function viewRay(x=0,y=0){
 if(!lastView||!lastProjection)return null;const world=new T.Matrix4().fromArray(lastView),inverse=new T.Matrix4().fromArray(lastProjection).invert();
 return{origin:new T.Vector3().setFromMatrixPosition(world),direction:new T.Vector3(x,y,.5).applyMatrix4(inverse).normalize().transformDirection(world)};
}
const rayPoint=ray=>ray.origin.clone().addScaledVector(ray.direction,groundDistance);
function tapGround(e){
 if(!state.session||state.placed||!state.tracking)return;if(groundMethod==='detected'){place();return;}
 const r=renderer.domElement.getBoundingClientRect(),ray=viewRay((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);if(!ray)return;surfaceRay=ray;state.candidate=rayPoint(ray).toArray();place();
}
function placementPrompt(){
 const manual=groundMethod==='manual';$('ground-hint').textContent=manual?'Set the distance, aim or tap the ground spot, then refine with the joysticks.':'Move slowly and aim at the ground. Use Manual point if no marker appears.';
 track(manual?'Manual ground placement · aim or tap the ground spot.':'Aim at the ground and move slowly to find a surface.');note(manual?'Set the distance, then tap the ground or Plant at centre of view.':'Aim the marker at the ground, then tap Plant at ground marker.');
}
function resetGround(){
 zeroSticks();discardAnchor();state.epoch++;state.candidate=null;state.placed=false;clock.playing=false;clock.seek(0);centrePlant();surfaceRay=surfaceTap=null;reticle.visible=false;cutoffOffset=0;cutoffUI();overlay.visible=false;placementPrompt();sync();playback();
}
function place(){
 if(state.placed){resetGround();return;}if(!state.candidate||!state.tracking)return;
 if(groundMethod==='manual'&&!surfaceRay)surfaceRay=viewRay();cutoffOffset=0;centrePlant();position.fromArray(state.candidate);overlay.position.copy(position);overlay.visible=true;plant.root.visible=true;
 state.placed=true;state.anchorPending=true;state.candidate=null;reticle.visible=false;clock.seek(0);clock.playing=false;cutoffUI();playback();note('Ground selected. Tap Grow plant, or refine with the joysticks.');track('Plant rooted at this ground spot.');sync();
}
function loseTracking(){zeroSticks();state.tracking=false;state.candidate=null;clock.playing=false;overlay.visible=false;reticle.visible=false;track('Tracking paused. Move slowly to recover.');note('Growth paused. Check alignment when tracking returns, then Resume.');sync();}
function processXR(frame){
 if(frame.session!==state.session)return false;let pose;try{if(state.session.visibilityState==='visible')pose=frame.getViewerPose(state.reference);}catch{}
 if(!pose){loseTracking();lastTime=null;return false;}const returning=!state.tracking;state.tracking=true;
 const m=pose.transform.matrix;lastCamera=Array.from(m);lastView=Array.from(pose.views[0]?.transform.matrix||m);lastProjection=pose.views[0]?.projectionMatrix?Array.from(pose.views[0].projectionMatrix):null;
 if(!state.placed){
  state.candidate=null;
  if(groundMethod==='manual'){const ray=viewRay();if(ray)state.candidate=rayPoint(ray).toArray();}
  else{try{for(const hit of frame.getHitTestResults(state.hitSource)){const h=hit.getPose(state.reference)?.transform.matrix;if(h&&h[5]>.7){state.candidate=[h[12],h[13],h[14]];break;}}}catch{}}
  reticle.visible=!!state.candidate;overlay.visible=!!state.candidate;if(state.candidate){reticle.position.fromArray(state.candidate);overlay.position.fromArray(state.candidate);}
 }else{
  overlay.visible=true;
  if(state.anchor){const a=frame.getPose(state.anchor.anchorSpace,state.reference);if(a)overlay.position.set(a.transform.matrix[12],a.transform.matrix[13],a.transform.matrix[14]);else{overlay.visible=false;clock.playing=false;track('Anchor tracking paused. Move slowly or choose the ground again.');}}
  else overlay.position.copy(position);
  if(returning)track('Tracking restored. Check the plant, then Resume growth.');
 }
 if(state.anchorPending&&!state.anchorBusy&&typeof frame.createAnchor==='function'){
  state.anchorPending=false;state.anchorBusy=true;const token=state.epoch,s=state.session;
  frame.createAnchor(new XRRigidTransform({x:position.x,y:position.y,z:position.z}),state.reference).then(a=>{if(state.session===s&&token===state.epoch&&state.placed)state.anchor=a;else a.delete();}).catch(()=>{if(state.session===s)note('Placed with world tracking. Choose the ground again if it drifts.');}).finally(()=>{if(state.session===s)state.anchorBusy=false;});
 }
 sync();return overlay.visible||!state.placed;
}
async function startAR(){
 if(state.starting||state.session||!state.ready)return;state.starting=true;sync();let s;const token=++state.epoch;
 try{
  s=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:['local','dom-overlay'],optionalFeatures:['anchors','hit-test'],domOverlay:{root:$('overlay')}});
  if(token!==state.epoch){await s.end();return;}state.session=s;
  s.addEventListener('end',()=>finishAR(s),{once:true});s.addEventListener('visibilitychange',()=>{if(s.visibilityState!=='visible'){loseTracking();lastTime=null;}});
  renderer.getSize(savedSize);camera.position.set(0,0,0);camera.quaternion.identity();await renderer.xr.setSession(s);if(state.session!==s)return;
  state.reference=renderer.xr.getReferenceSpace();state.reference.addEventListener?.('reset',()=>{if(state.session===s)resetGround();});
  state.hitSource=null;try{const viewer=await s.requestReferenceSpace('viewer');state.hitSource=await s.requestHitTestSource({space:viewer});}catch{groundMethod='manual';}
  if(state.session!==s){state.hitSource?.cancel();return;}
  Object.assign(state,{placed:false,candidate:null,tracking:false});zeroSticks();centrePlant();surfaceRay=surfaceTap=null;lastView=lastProjection=null;clock.playing=false;clock.seek(0);lastTime=null;cutoffOffset=0;cutoffUI();
  floor.visible=false;overlay.visible=false;scene.background=null;renderer.setClearColor(0,0);document.documentElement.classList.add('xr');$('panel').hidden=false;$('mode').textContent='LIVE GROUND AR';placementPrompt();
 }catch(e){if(s&&state.session===s)await s.end().catch(()=>{});note(e.name==='NotAllowedError'?'Camera / AR permission was not granted. You can retry Start AR.':'AR could not start ('+e.name+'). Use supported Android Chrome.');}
 finally{state.starting=false;sync();}
}
function finishAR(s){
 if(state.session!==s)return;zeroSticks();state.epoch++;try{state.hitSource?.cancel();}catch{}discardAnchor();
 Object.assign(state,{session:null,reference:null,hitSource:null,candidate:null,placed:false,tracking:false,anchorBusy:false});viewControls?.reset();centrePlant();clock.playing=false;lastTime=null;reticle.visible=false;
 document.documentElement.classList.remove('xr');$('panel').hidden=false;$('mode').textContent='3D PREVIEW';floor.visible=true;overlay.visible=true;overlay.position.set(0,0,0);surfaceRay=surfaceTap=null;lastView=lastProjection=null;
 scene.background=new T.Color(0x132820);renderer.setClearColor(0x132820,1);camera.fov=39;queueMicrotask(resize);track('Drag to look around · inspect each growth stage.');note('AR ended. Choose a new ground spot next time.');sync();
}
function resize(){if(!renderer||state.session)return;const r=$('viewport').getBoundingClientRect();renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
function render(time,frame){
 const dt=lastTime===null?0:Math.min(.06,(time-lastTime)/1000);lastTime=time;let advance=true;
 if(state.session)advance=frame?processXR(frame):false;
 else{
  const h=CULTIVARS[cultivar].height*plantSize,target=startHeight+h*.47,distance=Math.max(.6,h*2.08)*Math.max(1,.85/camera.aspect);
  camera.position.set(Math.sin(previewYaw)*distance,target+h*.72,Math.cos(previewYaw)*distance);camera.lookAt(0,target,0);
 }
 if(advance)moveWithSticks(dt);const playing=clock.playing;if(advance&&(!state.session||state.tracking))clock.tick(dt);if(playing!==clock.playing)sync();
 plant.update(clock.progress,time/1000);applyCutoff();playback();renderer.render(scene,camera);
}
async function init(){
 renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setClearColor(0x132820,1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;renderer.localClippingEnabled=true;renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local');$('viewport').append(renderer.domElement);
 scene=new T.Scene();scene.background=new T.Color(0x132820);camera=new T.PerspectiveCamera(39,1,.01,30);
 scene.add(new T.HemisphereLight(0xe6efdd,0x47513b,1.9));const key=new T.DirectionalLight(0xfff3dd,2.6);key.position.set(-1.5,2.3,2);scene.add(key);const rim=new T.DirectionalLight(0xc3d5c0,1.4);rim.position.set(1,1,-1.5);scene.add(rim);
 floor=new T.Group();const disk=new T.Mesh(new T.CylinderGeometry(.48,.49,.015,64),new T.MeshStandardMaterial({color:0x263b2a,roughness:.98}));disk.position.y=-.01;floor.add(disk);const ring=new T.Mesh(new T.RingGeometry(.49,.491,96),new T.MeshBasicMaterial({color:0x6c835b,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=-.009;floor.add(ring);scene.add(floor);
 reticle=new T.Mesh(new T.RingGeometry(.04,.045,48),new T.MeshBasicMaterial({color:0xe1edb3,side:T.DoubleSide,depthTest:false}));reticle.rotation.x=-Math.PI/2;reticle.visible=false;reticle.renderOrder=100;scene.add(reticle);
 overlay=new T.Group();overlay.name='Ground-rooted cannabis';scene.add(overlay);
 cutoffGuide=new T.Mesh(new T.TorusGeometry(.12,.0007,4,72),new T.MeshBasicMaterial({color:0xe4c38d,transparent:true,opacity:.7,depthTest:false}));cutoffGuide.rotation.x=Math.PI/2;overlay.add(cutoffGuide);
 await loadBotanicalTextures(renderer);buildPlant();
 const canvas=renderer.domElement;
 canvas.addEventListener('pointerdown',e=>{if(viewControls?.clean){viewControls.reveal();return;}if(state.session){if(!state.placed)surfaceTap={id:e.pointerId,x:e.clientX,y:e.clientY};return;}drag={id:e.pointerId,x:e.clientX};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(drag?.id===e.pointerId&&!state.session){previewYaw-=(e.clientX-drag.x)*.008;drag.x=e.clientX;}});
 canvas.addEventListener('pointerup',e=>{if(surfaceTap?.id===e.pointerId&&Math.hypot(e.clientX-surfaceTap.x,e.clientY-surfaceTap.y)<12)tapGround(e);surfaceTap=null;});for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>{drag=null;surfaceTap=null;});
 $('grow').onclick=grow;$('pause').onclick=toggleGrowth;$('restart').onclick=()=>{if(canGrow()){clock.restart();sync();}};
 $('speed').value=clock.speed;$('speed-value').textContent=pretty(clock.speed);$('speed').oninput=e=>{clock.setSpeed(Number(e.target.value));$('speed-value').textContent=pretty(clock.speed);savePreferences();};
 $('progress').oninput=e=>{clock.playing=false;clock.seek(Number(e.target.value)/100);playback();sync();};
 for(const b of document.querySelectorAll('[data-stage]'))b.onclick=()=>{clock.playing=false;clock.seek(Number(b.dataset.stage)/100);playback();sync();};
 $('cultivar').value=cultivar;$('cultivar-description').textContent=CULTIVARS[cultivar].description;$('cultivar').onchange=e=>chooseCultivar(e.target.value);
 $('leaf-motion').onchange=e=>{leafMotion=e.target.checked;leafMotionUI();};$('leaf-motion-strength').oninput=e=>{leafMotionStrength=Number(e.target.value)/100;leafMotionUI();};$('leaf-cycle-speed').oninput=e=>{leafCycleSpeed=Number(e.target.value);leafMotionUI();};
 $('start-height').oninput=e=>{startHeight=Number(e.target.value)/100;zeroSticks();clock.playing=false;heightUI();sync();};
 $('start').onclick=startAR;$('place').onclick=place;$('quick-place').onclick=place;$('exit').onclick=()=>state.session?.end();$('retable').onclick=resetGround;
 $('ground-method').onchange=e=>{groundMethod=e.target.value;surfaceRay=null;state.candidate=null;overlay.visible=false;placementPrompt();sync();};
 $('ground-distance').oninput=e=>{groundDistance=Number(e.target.value)/100;distanceUI();if(groundMethod==='manual'&&state.placed&&surfaceRay){zeroSticks();discardAnchor();state.epoch++;clock.playing=false;position.copy(rayPoint(surfaceRay));overlay.position.copy(position);sync();}};
 $('ground-distance').onchange=()=>{if(state.placed)state.anchorPending=true;};
 $('cutoff-height').oninput=e=>{cutoffOffset=Number(e.target.value)/100;cutoffUI();};$('cutoff-enabled').onchange=e=>{cutoffEnabled=e.target.checked;cutoffUI();};$('cutoff-guide').onchange=e=>{showCutoffGuide=e.target.checked;applyCutoff();};
 $('cutoff-at-base').onclick=()=>{scene.updateMatrixWorld(true);cutoffOffset=clamp(plant.root.getWorldPosition(new T.Vector3()).y-overlay.position.y,-1,1);cutoffEnabled=true;cutoffUI();savePreferences();};$('cutoff-reset').onclick=()=>{cutoffOffset=0;cutoffUI();};
 $('model-exposure').oninput=e=>{exposureEV=Number(e.target.value);appearanceUI();};$('exposure-reset').onclick=()=>{exposureEV=0;appearanceUI();savePreferences();};
 $('plant-size').oninput=e=>{zeroSticks();plantSize=Number(e.target.value)/100;clock.playing=false;appearanceUI();sync();};$('plant-transparency').oninput=e=>{plantTransparency=Number(e.target.value);appearanceUI();};
 $('appearance-reset').onclick=()=>{zeroSticks();plantSize=1;plantTransparency=0;appearanceUI();savePreferences();};
 $('travel-speed').oninput=e=>{travelExponent=Number(e.target.value);movementUI();savePreferences();};$('travel-normal').onclick=()=>{travelExponent=0;movementUI();savePreferences();};$('stop-motion').onclick=zeroSticks;
 for(const [id,axis]of [['quick-nearer',1],['quick-farther',-1]])$(id).onclick=()=>{if(!state.placed||!state.tracking)return;zeroSticks();beginStick();stickMove=[0,axis];moveWithSticks(.2/factor());zeroSticks();};
 $('face-me').onclick=()=>{if(!state.placed||!lastCamera)return;zeroSticks();const angle=Math.atan2(lastCamera[12]-overlay.position.x,lastCamera[14]-overlay.position.z);if(stickTarget==='flower'){plantYaw=angle-yaw;applyPlantAlignment();}else{yaw=angle;overlay.rotation.y=yaw;}};
 $('toggle-panel').onclick=()=>viewControls.showPanel($('panel').hidden);$('joystick-align').onclick=()=>{zeroSticks();clock.playing=false;viewControls.showPanel(false);};$('centre-flower').onclick=centrePlant;
 for(const target of ['flower','all'])$('target-'+target).onclick=()=>{zeroSticks();stickTarget=target;sync();};bindStick('move',v=>stickMove=v);bindStick('turn',v=>stickTurn=v);
 viewControls=new ViewControls({isImmersive:()=>!!state.session,canGrow,isPlaying:()=>clock.playing,progress:()=>clock.progress,target:()=>stickTarget,targetDescription:()=>stickTarget==='flower'?'plant only':'plant and ground level',targetLabel:()=>stickTarget==='flower'?'Plant':'Plant + level',onPlayback:toggleGrowth,onGrow:grow,onRestart:()=>{if(canGrow())clock.restart();sync();},onStop:zeroSticks,onToggleTarget:()=>{zeroSticks();stickTarget=stickTarget==='flower'?'all':'flower';sync();},onExitAR:()=>state.session?.end(),onNotice:note,onEnter:zeroSticks,onViewChange:()=>{lastSyncKey='';sync();applyCutoff();resize();}});
 for(const event of ['input','change'])$('panel').addEventListener(event,savePreferences);
 for(const link of document.querySelectorAll('#collection-nav a'))link.onclick=async e=>{e.preventDefault();zeroSticks();clock.playing=false;savePreferences();try{await state.session?.end();}catch{}location.href=link.href;};
 const observer=new ResizeObserver(()=>{const h=Math.max(...[...document.querySelectorAll('.stick-wrap,#move-speed-control')].map(e=>e.getBoundingClientRect().height));document.documentElement.style.setProperty('--bloom-motion-height',h+'px');});for(const e of document.querySelectorAll('.stick-wrap,#move-speed-control'))observer.observe(e);
 $('overlay').addEventListener('beforexrselect',e=>e.preventDefault());
 document.addEventListener('visibilitychange',()=>{if(document.hidden){zeroSticks();clock.playing=false;lastTime=null;sync();}});window.addEventListener('blur',zeroSticks);window.addEventListener('pagehide',()=>{zeroSticks();state.session?.end().catch(()=>{});});window.addEventListener('resize',resize);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();state.ready=false;clock.playing=false;state.session?.end();note('Graphics paused. Reload to restore the plant.');sync();});
 try{state.supported=!!navigator.xr&&await navigator.xr.isSessionSupported('immersive-ar');}catch{}
 state.ready=true;heightUI();distanceUI();appearanceUI();movementUI();$('support').textContent=state.supported?'AR ready · choose a ground spot.':'Preview works here. Live AR needs a compatible phone with WebXR, such as supported Android Chrome.';
 track('Drag to look around · inspect each growth stage.');note('Ready · choose a variety, or Start AR on the ground.');sync();resize();renderer.setAnimationLoop(render);
 if(new URL(location.href).searchParams.has('test'))window.__CANNABIS={state,clock,renderer,scene,camera,get plant(){return plant;},get overlay(){return overlay;},get cultivar(){return cultivar;},get levels(){return{startHeight,cutoffOffset,cutoffEnabled,clipY:-cutoffPlane.constant};},get ground(){return{method:groundMethod,distance:groundDistance};},get sticks(){return{move:[...stickMove],turn:[...stickTurn],target:stickTarget,offset:plantOffset.toArray(),yaw:plantYaw};},get view(){return{clean:viewControls.clean,revealed:viewControls.revealed};},processXR,place,resetGround,chooseCultivar};
}
init().catch(e=>{note('Could not load Cannabis Growth: '+e.message);$('support').textContent='Reload to try again.';console.error(e);});
