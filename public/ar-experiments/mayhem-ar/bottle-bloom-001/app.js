import * as T from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {GrowingPlant} from './flowers.js';
import {GrowthClock,clamp,intersectHeight,sampleGrowth} from './growth.js';
const $=id=>document.getElementById(id),clock=new GrowthClock(32);
const state={ready:false,supported:false,starting:false,session:null,reference:null,hitSource:null,table:null,candidate:null,placed:false,tracking:false,anchor:null,anchorPending:false,anchorBusy:false,epoch:0,editing:false};
let renderer,scene,camera,bottle,plant,floor,reticle,lastTime=null,previewYaw=.26,drag=null,lastCamera=null,height=.309;
let position=new T.Vector3(),savedSize=new T.Vector2(),lastSyncKey='';
const note=text=>{if($('status').textContent!==text)$('status').textContent=text;};
const track=text=>{if($('tracking').textContent!==text)$('tracking').textContent=text;};
const pretty=v=>Number(v.toFixed(2))+'×';
function sync(){
 const active=!!state.session,canGrow=state.ready&&(!active||(state.placed&&state.tracking));
 const key=[active,canGrow,state.ready,state.supported,state.starting,state.placed,state.tracking,!!state.candidate,state.table===null,state.editing,clock.playing,clock.progress>=1].join('|');
 if(key===lastSyncKey)return;lastSyncKey=key;
 $('start').disabled=!state.ready||!state.supported||active||state.starting;
 for(const id of ['grow','pause','restart','progress'])$(id).disabled=!canGrow;
 $('grow').innerHTML=(clock.progress>=1?'Grow again':'Grow plant')+' <span>↗</span>';
 $('pause').textContent=clock.playing?'Pause':'Resume';$('pause').setAttribute('aria-label',clock.playing?'Pause growth':'Resume growth');
 $('placement').hidden=!active;$('placed-controls').hidden=!active||!state.placed;
 $('toggle-panel').hidden=!active;$('exit').hidden=!active;$('aim').hidden=!active||state.placed;
 $('place').disabled=!state.tracking||(!state.placed&&!state.candidate);
 $('place').textContent=state.placed?'Re-align bottle mouth':state.table===null?'Set tabletop':'Place at bottle opening';
 $('height').disabled=state.placed;$('nudges').hidden=!state.editing;
 $('adjust').textContent=state.editing?'Finish alignment':'Fine alignment';
 if(plant)plant.guide.visible=active&&state.placed&&state.editing&&state.tracking;
}
function discardAnchor(){try{state.anchor?.delete();}catch{}state.anchor=null;state.anchorPending=false;}
function buildPlant(){
 if(plant){scene.remove(plant.root);plant.dispose();}
 plant=new GrowingPlant({height,index:3,above:.34});scene.add(plant.root);
 plant.root.position.copy(state.placed?position:new T.Vector3(0,height,0));
 plant.root.visible=!state.session||state.placed;plant.update(clock.progress,0);
 if(bottle)bottle.scale.setScalar(height/.309);
}
function playback(){
 const v=sampleGrowth(clock.progress);$('stage').textContent=v.stage;
 $('progress').value=clock.progress*100;$('progress-value').textContent=Math.round(clock.progress*100)+'%';
 $('pause').textContent=clock.playing?'Pause':'Resume';
}
function resetTable(){
 discardAnchor();state.epoch++;state.table=null;state.candidate=null;state.placed=false;state.editing=false;clock.playing=false;clock.seek(0);
 plant.root.visible=false;track('Move the phone slowly and aim at the tabletop beside the bottle.');note('1 · Scan the table, then tap Set tabletop.');sync();playback();
}
async function startAR(){
 if(state.starting||state.session||!state.ready)return;
 state.starting=true;sync();let s;const token=++state.epoch;
 try{
  s=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:['local','hit-test','dom-overlay'],optionalFeatures:['anchors'],domOverlay:{root:$('overlay')}});
  if(token!==state.epoch){await s.end();return;}
  state.session=s;
  s.addEventListener('end',()=>finishAR(s),{once:true});
  s.addEventListener('visibilitychange',()=>{if(s.visibilityState!=='visible'){loseTracking();lastTime=null;}});
  renderer.getSize(savedSize);camera.position.set(0,0,0);camera.quaternion.identity();
  await renderer.xr.setSession(s);
  if(state.session!==s)return;
  state.reference=renderer.xr.getReferenceSpace();
  state.reference.addEventListener?.('reset',()=>{if(state.session===s)resetTable();});
  const viewer=await s.requestReferenceSpace('viewer');
  state.hitSource=await s.requestHitTestSource({space:viewer});
  if(state.session!==s){state.hitSource?.cancel();return;}
  state.table=null;state.placed=false;state.candidate=null;state.tracking=false;state.editing=false;
  clock.playing=false;clock.seek(0);lastTime=null;
  bottle.visible=false;floor.visible=false;plant.root.visible=false;scene.background=null;renderer.setClearColor(0,0);
  document.documentElement.classList.add('xr');$('panel').hidden=false;$('toggle-panel').textContent='Hide controls';$('toggle-panel').setAttribute('aria-expanded','true');$('mode').textContent='LIVE BOTTLE AR';
  track('Scan the tabletop beside your bottle.');note('1 · Aim at the table and tap Set tabletop.');
 }catch(e){
  if(s&&state.session===s)await s.end().catch(()=>{});
  note(e.name==='NotAllowedError'?'Camera / AR permission was not granted. You can retry Start AR.':'AR could not start ('+e.name+'). Open this page in supported Android Chrome.');
 }finally{state.starting=false;sync();}
}
function finishAR(s){
 if(state.session!==s)return;
 state.epoch++;try{state.hitSource?.cancel();}catch{}discardAnchor();
 Object.assign(state,{session:null,reference:null,hitSource:null,table:null,candidate:null,placed:false,tracking:false,editing:false,anchorBusy:false});
 clock.playing=false;lastTime=null;reticle.visible=false;
 document.documentElement.classList.remove('xr');$('panel').hidden=false;$('mode').textContent='3D PREVIEW';
 bottle.visible=true;floor.visible=true;plant.root.visible=true;plant.root.position.set(0,height,0);plant.guide.visible=false;
 scene.background=new T.Color(0x132820);renderer.setClearColor(0x132820,1);camera.fov=39;queueMicrotask(resize);track('Drag to look around · stages and speed are adjustable.');note('AR ended. Alignment resets each time you start.');sync();
}
function loseTracking(){
 state.tracking=false;state.candidate=null;clock.playing=false;plant.root.visible=false;reticle.visible=false;
 track('Tracking paused. Move slowly to recover.');note('Growth is paused. Check alignment when tracking returns, then Resume.');sync();
}
function place(){
 if(state.placed){discardAnchor();state.epoch++;state.placed=false;state.editing=false;clock.playing=false;plant.root.visible=false;note('Aim at the bottle opening again, then place.');sync();return;}
 if(!state.candidate||!state.tracking)return;
 if(state.table===null){state.table=state.candidate[1];state.candidate=null;note('2 · Aim the centre dot at the open bottle mouth, then Place.');track('Aim slightly down at the bottle opening. Adjust bottle height if needed.');}
 else{
  position.fromArray(state.candidate);plant.root.position.copy(position);plant.root.visible=true;state.placed=true;state.anchorPending=true;state.candidate=null;
  reticle.visible=false;clock.seek(0);clock.playing=false;playback();note('Aligned · tap Grow plant. The first shoot starts inside the bottle.');track('Bottle aligned for this session. Keep it still.');
 }
 sync();
}
function processXR(frame){
 if(frame.session!==state.session)return false;
 let pose;try{if(state.session.visibilityState==='visible')pose=frame.getViewerPose(state.reference);}catch{}
 if(!pose){loseTracking();lastTime=null;return false;}
 const returning=!state.tracking;state.tracking=true;
 const m=pose.transform.matrix;lastCamera=Array.from(m);
 if(!state.placed){
  if(state.table===null){
   state.candidate=null;
   try{for(const hit of frame.getHitTestResults(state.hitSource)){
    const h=hit.getPose(state.reference)?.transform.matrix;
    if(h&&h[5]>.7){state.candidate=[h[12],h[13],h[14]];break;}
   }}catch{}
  }else state.candidate=intersectHeight([m[12],m[13],m[14]],[-m[8],-m[9],-m[10]],state.table+height);
  reticle.visible=!!state.candidate;if(state.candidate)reticle.position.fromArray(state.candidate);
  plant.root.visible=false;
  if(state.table!==null&&!state.candidate)track('Aim slightly downward at the opening, from within arm’s reach.');
 }else{
  plant.root.visible=true;
  if(state.anchor){
   const ap=frame.getPose(state.anchor.anchorSpace,state.reference);
   if(ap){plant.root.position.set(ap.transform.position?.x??ap.transform.matrix[12],ap.transform.position?.y??ap.transform.matrix[13],ap.transform.position?.z??ap.transform.matrix[14]);}
   else{plant.root.visible=false;clock.playing=false;track('Anchor tracking paused. Move slowly, or re-align the mouth.');}
  }else plant.root.position.copy(position);
  if(returning)track('Tracking restored. Check the opening, then Resume growth.');
 }
 if(state.anchorPending&&!state.anchorBusy&&typeof frame.createAnchor==='function'){
  state.anchorPending=false;state.anchorBusy=true;const token=state.epoch,s=state.session;
  frame.createAnchor(new XRRigidTransform({x:position.x,y:position.y,z:position.z}),state.reference).then(a=>{
   if(state.session===s&&token===state.epoch&&state.placed&&!state.editing)state.anchor=a;else a.delete();
  }).catch(()=>{if(state.session===s)note('Aligned with world tracking for this session. Re-align if it drifts.');}).finally(()=>{if(state.session===s)state.anchorBusy=false;});
 }
 sync();return plant.root.visible||!state.placed;
}
function nudge(id){
 if(!state.placed||!lastCamera)return;discardAnchor();state.epoch++;
 const m=lastCamera,flat=new T.Vector3(m[8],0,m[10]).normalize(),right=new T.Vector3(m[0],0,m[2]).normalize(),d=.005;
 if(id==='left')position.addScaledVector(right,-d);if(id==='right')position.addScaledVector(right,d);
 if(id==='near')position.addScaledVector(flat,d);if(id==='far')position.addScaledVector(flat,-d);
 if(id==='up')position.y+=d;if(id==='down')position.y-=d;plant.root.position.copy(position);
}
function resize(){
 if(!renderer||state.session)return;
 const r=$('viewport').getBoundingClientRect();renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();
}
function render(time,frame){
 const dt=lastTime===null?0:Math.min(.06,(time-lastTime)/1000);lastTime=time;
 let advance=true;
 if(state.session){if(frame)advance=processXR(frame);else advance=false;}
 else{
  camera.position.set(Math.sin(previewYaw)*1.15,.43,Math.cos(previewYaw)*1.15);camera.lookAt(0,.325,0);
 }
 const wasPlaying=clock.playing;if(advance&&(!state.session||state.tracking))clock.tick(dt);if(wasPlaying!==clock.playing)sync();
 plant?.update(clock.progress,time/1000);playback();
 renderer.render(scene,camera);
}
function environment(){
 const env=new T.Scene();env.background=new T.Color(0xc9d5c4);
 const white=new T.MeshBasicMaterial({color:0xffffff});
 for(const p of [[-2,1.5,1],[2,1.5,.5],[0,3,-1]]){const box=new T.Mesh(new T.BoxGeometry(1,2,1),white);box.position.set(...p);env.add(box);}
 const generator=new T.PMREMGenerator(renderer),map=generator.fromScene(env,.04);scene.environment=map.texture;generator.dispose();
}
async function init(){
 renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setClearColor(0x132820,1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local');$('viewport').append(renderer.domElement);
 scene=new T.Scene();scene.background=new T.Color(0x132820);camera=new T.PerspectiveCamera(39,1,.01,15);
 scene.add(new T.HemisphereLight(0xeaf5db,0x365c3c,2.4));
 const key=new T.DirectionalLight(0xfff2d5,3.2);key.position.set(-1,2,2);scene.add(key);const rim=new T.DirectionalLight(0xc4dfb7,2.4);rim.position.set(1,1,-1);scene.add(rim);
 environment();
 floor=new T.Group();const base=new T.Mesh(new T.CylinderGeometry(.24,.25,.014,96),new T.MeshStandardMaterial({color:0x8a9c73,roughness:.95}));base.position.y=-.009;floor.add(base);
 // A light backdrop and reflected studio panels make transmission visible in the preview.
 const backdrop=new T.Mesh(new T.PlaneGeometry(.84,1.05),new T.MeshBasicMaterial({color:0x6e8b6c}));backdrop.position.set(0,.40,-.27);floor.add(backdrop);scene.add(floor);
 reticle=new T.Mesh(new T.RingGeometry(.012,.015,48),new T.MeshBasicMaterial({color:0xe1edb3,side:T.DoubleSide,depthTest:false}));reticle.rotation.x=-Math.PI/2;reticle.visible=false;reticle.renderOrder=100;scene.add(reticle);
 const model=await new GLTFLoader().loadAsync('assets/green-bottle.glb');
 bottle=model.scene;const root=bottle.children[0];root.position.set(0,0,0);bottle.traverse(o=>{if(o.material?.transmission){o.material.color.setRGB(.57,.86,.58);o.material.roughness=.065;o.material.envMapIntensity=.65;o.material.side=T.FrontSide;}});scene.add(bottle);buildPlant();
 const canvas=renderer.domElement;canvas.addEventListener('pointerdown',e=>{if(state.session)return;drag={id:e.pointerId,x:e.clientX};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(drag?.id!==e.pointerId||state.session)return;previewYaw-=(e.clientX-drag.x)*.008;drag.x=e.clientX;});for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>drag=null);
 $('grow').onclick=()=>{if(clock.progress>=1)clock.seek(0);clock.playing=true;note('Growing from inside the glass · leaves, then buds, then flowers.');sync();};
 $('pause').onclick=()=>{clock.playing=!clock.playing;if(clock.playing&&clock.progress>=1)clock.seek(0);sync();};
 $('restart').onclick=()=>{clock.restart();sync();};
 $('speed').oninput=e=>{clock.setSpeed(Number(e.target.value));$('speed-value').textContent=pretty(clock.speed);};
 $('progress').oninput=e=>{clock.playing=false;clock.seek(Number(e.target.value)/100);playback();sync();};
 for(const b of document.querySelectorAll('[data-stage]'))b.onclick=()=>{clock.playing=false;clock.seek(Number(b.dataset.stage)/100);playback();sync();};
 $('height').onchange=e=>{height=clamp(Number(e.target.value)||30.9,15,50)/100;e.target.value=(height*100).toFixed(1);buildPlant();};
 $('start').onclick=startAR;$('place').onclick=place;$('exit').onclick=()=>state.session?.end();$('retable').onclick=resetTable;
 $('adjust').onclick=()=>{state.editing=!state.editing;clock.playing=false;if(state.editing){position.copy(plant.root.position);discardAnchor();state.epoch++;}else state.anchorPending=true;sync();};
 for(const b of document.querySelectorAll('[data-nudge]'))b.onclick=()=>nudge(b.dataset.nudge);
 $('toggle-panel').onclick=()=>{$('panel').hidden=!$('panel').hidden;$('toggle-panel').textContent=$('panel').hidden?'Show controls':'Hide controls';$('toggle-panel').setAttribute('aria-expanded',String(!$('panel').hidden));};
 $('overlay').addEventListener('beforexrselect',e=>{if(e.target.closest?.('#panel,#toggle-panel'))e.preventDefault();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clock.playing=false;lastTime=null;sync();}});window.addEventListener('pagehide',()=>state.session?.end().catch(()=>{}));window.addEventListener('resize',resize);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();state.ready=false;clock.playing=false;state.session?.end();note('Graphics paused. Reload this page to restore the plant.');sync();});
 try{state.supported=!!navigator.xr&&await navigator.xr.isSessionSupported('immersive-ar');}catch{}
 state.ready=true;$('support').textContent=state.supported?'AR ready · use the green bottle, upright on a table.':'Preview works here. Live AR needs a compatible phone with WebXR, such as supported Android Chrome.';
 track('Drag to look around · stages and speed are adjustable.');note('Ready · grow your plant, or start AR over the real bottle.');sync();resize();renderer.setAnimationLoop(render);
 if(new URL(location.href).searchParams.has('test'))window.__BLOOM={state,clock,renderer,scene,camera,get plant(){return plant;},get bottle(){return bottle;},processXR,resetTable,finishAR,place,intersectHeight,sampleGrowth};
}
init().catch(e=>{note('Could not load Bottle Bloom: '+e.message);$('support').textContent='Reload to try again.';console.error(e);});
