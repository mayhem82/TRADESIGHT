import * as T from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {DrinkGlass,edgeGlass} from './drink-glass.js?v=clear-view-6';
import {GrowingPlant,loadBotanicalTextures} from './flowers.js?v=clear-view-6';
import {readSettings,writeSettings} from './settings.js?v=clear-view-6';
import {ViewControls} from './view-controls.js?v=clear-view-6';
import {GrowthClock,clamp,intersectHeight,sampleGrowth} from './growth.js';
const $=id=>document.getElementById(id),clock=new GrowthClock(32);
const state={ready:false,supported:false,starting:false,session:null,reference:null,hitSource:null,table:null,candidate:null,placed:false,tracking:false,anchor:null,anchorPending:false,anchorBusy:false,epoch:0,editing:false};
let renderer,scene,camera,bottle,plant,overlay,floor,reticle,coverageRing,lastTime=null,previewYaw=.26,drag=null,lastCamera=null,height=.309,bottleWidth=1,bottleYaw=0,startHeight=.012,coveredHeight=0;
const glassMaterials=[];
let position=new T.Vector3(),savedSize=new T.Vector2(),lastSyncKey='';
let stickMove=[0,0],stickTurn=[0,0],stickTarget='flower',flowerYaw=0,groupMoved=false;
const flowerOffset=new T.Vector3(),stickPads=[],UP=new T.Vector3(0,1,0);
const coveragePlane=new T.Plane(new T.Vector3(0,1,0),0);
let drinkMode=new URL(location.href).searchParams.get('mode')==='drink',surfaceDistance=.45,lastView=null,lastProjection=null,surfaceRay=null,surfaceTap=null;
let drinkGlass,glassHeight=.14,glassWidth=.08,liquidHeight=.095;
let showGlass=true,glassOpacity=.35;
let plantSize=1,plantTransparency=0,exposureEV=0,travelExponent=0;
let viewControls,cutoffOffset=0,cutoffEnabled=true,showCutoffGuide=false;
const travelFactor=()=>2**travelExponent;
const note=text=>{if($('status').textContent!==text)$('status').textContent=text;};
const track=text=>{if($('tracking').textContent!==text)$('tracking').textContent=text;};
const pretty=v=>Number(v.toFixed(2))+'×';
function sync(){
 const active=!!state.session,canGrow=state.ready&&!state.starting&&(!active||(state.placed&&state.tracking));
 viewControls?.sync();
 document.documentElement.classList.toggle('tracking-lost',active&&!state.tracking);
 document.documentElement.classList.toggle('ar-placed',active&&state.placed);
 const key=[drinkMode,active,canGrow,state.ready,state.supported,state.starting,state.placed,state.tracking,!!state.candidate,state.table===null,state.editing,clock.playing,clock.progress>=1,$('panel').hidden,stickTarget,viewControls?.clean].join('|');
 if(key===lastSyncKey)return;lastSyncKey=key;
 $('start').disabled=!state.ready||!state.supported||active||state.starting;
 for(const id of ['grow','pause','restart','progress'])$(id).disabled=!canGrow;
 $('grow').innerHTML=(clock.progress>=1?'Grow again':'Grow plant')+' <span>↗</span>';
 $('pause').textContent=clock.playing?'Pause':'Resume';$('pause').setAttribute('aria-label',clock.playing?'Pause growth':'Resume growth');
 $('placement').hidden=!active;$('placed-controls').hidden=!active||!state.placed;
 $('toggle-panel').hidden=!active;$('exit').hidden=!active;$('aim').hidden=!active||state.placed;
 $('place').disabled=!state.tracking||(!state.placed&&!state.candidate);
 $('place').textContent=drinkMode?(state.placed?'Choose liquid surface again':'Place at centre of view'):state.placed?'Re-align bottle mouth':state.table===null?'Set tabletop':'Place at bottle opening';
 $('drink-placement').hidden=!active||!drinkMode;
 $('quick-place').hidden=!active||!drinkMode||state.placed||!$('panel').hidden;
 $('quick-place').disabled=!state.tracking||!state.candidate;
 for(const mode of ['bottle','drink']){$('source-'+mode).disabled=active||state.starting;$('source-'+mode).setAttribute('aria-pressed',String((mode==='drink')===drinkMode));}
 $('height').disabled=state.placed;$('nudges').hidden=!state.editing;
 $('adjust').textContent=state.editing?'Finish alignment':'Fine alignment';
 const sticksVisible=active&&state.placed&&state.tracking&&!viewControls?.clean;
 $('joystick-controls').hidden=!sticksVisible;
 const toolbar=$('alignment-toolbar'),home=$('panel-alignment-home');
 if(toolbar.parentElement!==home)home.append(toolbar);
 toolbar.classList.add('in-panel');toolbar.hidden=!sticksVisible;
 for(const pad of stickPads)pad.element.setAttribute('aria-disabled',String(!sticksVisible));
 $('target-flower').setAttribute('aria-pressed',String(stickTarget==='flower'));$('target-all').setAttribute('aria-pressed',String(stickTarget==='all'));
 $('move-label').textContent=stickTarget==='flower'?'Move flower':'Move both';$('turn-label').textContent='Height / turn';
 $('retable').textContent=drinkMode?'Place on another drink':'Reset table alignment';
 if(plant)plant.guide.visible=!viewControls?.clean&&active&&state.tracking&&((state.placed&&state.editing)||(!state.placed&&(drinkMode||state.table!==null)&&!!state.candidate));
}
function growPlant(){if(clock.progress>=1)clock.seek(0);clock.playing=true;note(drinkMode?'Growing from the liquid · leaves, then buds, then flowers.':'Growing from inside the glass · leaves, then buds, then flowers.');sync();}
function toggleGrowth(){clock.playing=!clock.playing;if(clock.playing&&clock.progress>=1)clock.seek(0);sync();}
function selectTarget(target){zeroSticks();stickTarget=target;sync();}
function previewPosition(){return new T.Vector3(0,drinkMode?0:height,0);}
function savePreferences(){
 const saved=writeSettings({version:1,mode:drinkMode?'drink':'bottle',height,bottleWidth,startHeight,coveredHeight,glassHeight,glassWidth,liquidHeight,surfaceDistance,showGlass,glassOpacity,plantSize,plantTransparency,exposureEV,travelExponent,growthSpeed:clock.speed,cutoffEnabled});
 $('settings-status').textContent=saved?'Settings saved on this device. Select your real glass again each time you start AR.':'Settings apply now, but this browser could not save them.';
}
function appearanceUI(){
 $('model-exposure').value=exposureEV;$('model-exposure-value').textContent=(exposureEV>0?'+':'')+exposureEV.toFixed(1)+' EV';
 $('plant-size').value=plantSize*100;$('plant-size-value').textContent=Math.round(plantSize*100)+'%';
 $('plant-transparency').value=plantTransparency;$('plant-transparency-value').textContent=Math.round(plantTransparency)+'%';
 if(renderer)renderer.toneMappingExposure=1.15*2**exposureEV;
 const opacity=1-plantTransparency/100,materials=new Set();
 plant?.visual.traverse(o=>{for(const material of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])materials.add(material);});
 for(const material of materials){const transparent=opacity<1;if(material.transparent!==transparent){material.transparent=transparent;material.needsUpdate=true;}material.opacity=opacity;material.depthWrite=!transparent;}
}
function movementUI(){
 const factor=travelFactor(),label=Number(factor.toPrecision(3))+'×';$('travel-speed').value=travelExponent;$('travel-speed-value').textContent=label;$('travel-speed-metric').textContent=Number((.025*factor).toPrecision(3))+' m/s';$('travel-speed').setAttribute('aria-valuetext',label+'; '+Number((.025*factor).toPrecision(3))+' metres per second');
}
function restorePreferences(){
 const s=readSettings();({height,bottleWidth,startHeight,coveredHeight,glassHeight,glassWidth,liquidHeight,surfaceDistance,showGlass,glassOpacity,plantSize,plantTransparency,exposureEV,travelExponent,cutoffEnabled}=s);
 const mode=new URL(location.href).searchParams.get('mode');drinkMode=(mode==='drink'||mode==='bottle'?mode:s.mode)==='drink';
 clock.setSpeed(s.growthSpeed);$('speed').value=clock.speed;$('speed-value').textContent=pretty(clock.speed);
 $('height').value=(height*100).toFixed(1);$('bottle-width').value=bottleWidth*100;$('bottle-width-value').textContent=Math.round(bottleWidth*100)+'%';
 $('show-glass').checked=showGlass;$('glass-opacity').value=glassOpacity*100;
}
function glassUI(){
 liquidHeight=clamp(liquidHeight,.01,glassHeight-.005);
 for(const [id,value]of [['glass-height',glassHeight],['glass-width',glassWidth],['liquid-height',liquidHeight]]){$(id).value=(value*100).toFixed(1);$(id+'-value').textContent=Number((value*100).toFixed(1))+' cm';}
 $('liquid-height').max=(glassHeight*100-.5).toFixed(1);
 drinkGlass?.setDimensions(glassHeight,glassWidth,liquidHeight);
 if(floor)floor.position.y=drinkMode?-liquidHeight:0;
}
function modeUI(){
 document.documentElement.classList.toggle('drink-mode',drinkMode);
 $('start').innerHTML='<span>◉</span> Start AR on my '+(drinkMode?'drink':'bottle');
 $('instruction').textContent=drinkMode?'Tap the liquid in your real drink. A shoot grows from its surface, unfolds leaves, forms a bud and flowers.':'The shoot begins inside the glass. Leaves unfold, buds form, then the flower opens.';
 glassVisibility();
 $('target-all').textContent=drinkMode?'Glass + flower':'Bottle + flower';
 document.querySelector('.eyebrow').textContent=drinkMode?'ONE GLASS · ONE PLANT':'ONE BOTTLE · ONE PLANT';
 if(floor)floor.position.y=drinkMode?-liquidHeight:0;
}
function glassVisibility(){
 if(bottle)bottle.visible=!drinkMode&&(!state.session||showGlass);
 if(drinkGlass)drinkGlass.root.visible=drinkMode&&(!state.session||showGlass);
 for(const {ar}of glassMaterials)ar.opacity=glassOpacity;
 if(drinkGlass)drinkGlass.ar.opacity=glassOpacity;
 $('glass-opacity-value').textContent=Math.round(glassOpacity*100)+'%';
}
function chooseMode(value){
 if(state.session||state.starting)return;
 zeroSticks();centreFlower();drinkMode=value;stickTarget=drinkMode?'all':'flower';surfaceRay=null;clock.playing=false;clock.seek(0);modeUI();buildPlant();sync();
 const url=new URL(location.href);url.searchParams.set('mode',drinkMode?'drink':'bottle');history.replaceState(null,'',url);savePreferences();
 note(drinkMode?'Drink mode ready. Start AR, then tap the liquid surface.':'Bottle mode ready. Start AR to align the real bottle.');
}
function viewRay(x=0,y=0){
 if(!lastView||!lastProjection)return null;
 const world=new T.Matrix4().fromArray(lastView),inverse=new T.Matrix4().fromArray(lastProjection).invert();
 const direction=new T.Vector3(x,y,.5).applyMatrix4(inverse).normalize().transformDirection(world);
 return{origin:new T.Vector3().setFromMatrixPosition(world),direction};
}
function rayPoint(ray){return ray.origin.clone().addScaledVector(ray.direction,surfaceDistance);}
function distanceUI(){const cm=Math.round(surfaceDistance*100);$('surface-distance').value=cm;$('surface-distance-value').textContent=cm+' cm';}
function movedDrink(){
 if(!drinkMode||!surfaceRay)return;
 const direction=position.clone().sub(surfaceRay.origin);surfaceDistance=clamp(direction.length(),.1,2);surfaceRay.direction.copy(direction.normalize());distanceUI();
 if(state.ready)savePreferences();
}
function tapDrink(e){
 if(!drinkMode||!state.session||state.placed||!state.tracking)return;
 const rect=renderer.domElement.getBoundingClientRect(),ray=viewRay((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);
 if(!ray)return;
 surfaceRay=ray;state.candidate=rayPoint(ray).toArray();place();
}
function discardAnchor(){try{state.anchor?.delete();}catch{}state.anchor=null;state.anchorPending=false;}
function fitBottle(){
 const scale=height/.309;
 bottle.position.set(0,-height,0);bottle.scale.set(scale*bottleWidth,scale,scale*bottleWidth);
 overlay.rotation.y=bottleYaw;
}
function useARGlass(active){
 for(const {mesh,preview,ar}of glassMaterials)mesh.material=active?ar:preview;
 drinkGlass?.setAR(active);
 glassVisibility();
}
function applyFlowerAlignment(){if(plant){plant.root.position.copy(flowerOffset);plant.root.rotation.y=flowerYaw;}}
function centreFlower(){flowerOffset.set(0,0,0);flowerYaw=0;applyFlowerAlignment();}
function levelsUI(){
 startHeight=clamp(startHeight,0,height-.03);coveredHeight=clamp(coveredHeight,0,height-.01);
 for(const [id,value,max]of [['start-height',startHeight,height-.03],['covered-height',coveredHeight,height-.01]]){
  $(id).max=(max*100).toFixed(1);$(id).value=(value*100).toFixed(1);$(id+'-value').textContent=Number((value*100).toFixed(1))+' cm';
 }
}
function applyCoverage(){
 if(!overlay)return;
 coveragePlane.constant=-(overlay.position.y+(drinkMode?cutoffOffset:-height+coveredHeight));
 if(coverageRing){coverageRing.position.y=drinkMode?cutoffOffset:-height+coveredHeight;coverageRing.scale.setScalar(drinkMode?glassWidth/.088:height/.309*bottleWidth);coverageRing.visible=!viewControls?.clean&&(drinkMode?showCutoffGuide&&cutoffEnabled:coveredHeight>0&&(!state.session||state.editing));}
}
function cutoffUI(){
 $('cutoff-height').value=(cutoffOffset*100).toFixed(1);$('cutoff-height-value').textContent=Number((cutoffOffset*100).toFixed(1))+' cm';$('cutoff-enabled').checked=cutoffEnabled;$('cutoff-guide').checked=showCutoffGuide;
 plant?.visual.traverse(o=>{for(const material of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){material.clippingPlanes=drinkMode&&!cutoffEnabled?[]:[coveragePlane];material.needsUpdate=true;}});
 applyCoverage();
}
function zeroSticks(){
 stickMove=[0,0];stickTurn=[0,0];
 for(const pad of stickPads){pad.pointer=null;pad.knob.style.transform='';pad.element.setAttribute('aria-valuetext','Centred');}
 if(groupMoved&&state.session&&state.placed&&!state.editing)state.anchorPending=true;
 if(groupMoved)movedDrink();
 groupMoved=false;
}
function beginStick(){
 clock.playing=false;
 if(stickTarget==='all'&&!groupMoved){position.copy(overlay.position);discardAnchor();state.epoch++;groupMoved=true;}
 sync();
}
function moveWithSticks(dt){
 if(!state.session||!state.placed||!state.tracking||!lastCamera)return;
 if(!stickMove.some(Boolean)&&!stickTurn.some(Boolean))return;
 const right=new T.Vector3(lastCamera[0],0,lastCamera[2]).normalize(),near=new T.Vector3(lastCamera[8],0,lastCamera[10]).normalize();
 if(near.lengthSq()<.001)near.set(0,0,1);
 const delta=right.multiplyScalar(stickMove[0]).addScaledVector(near,stickMove[1]).multiplyScalar(.025*dt*travelFactor());
 if(stickTarget==='flower'){
  delta.applyAxisAngle(UP,-bottleYaw);flowerOffset.add(delta);flowerOffset.y-=stickTurn[1]*.025*dt*travelFactor();
  flowerOffset.x=clamp(flowerOffset.x,-.15,.15);flowerOffset.z=clamp(flowerOffset.z,-.15,.15);flowerOffset.y=clamp(flowerOffset.y,-.25,.25);
  flowerYaw-=stickTurn[0]*.45*dt;applyFlowerAlignment();
 }else{
  position.add(delta);position.y-=stickTurn[1]*.025*dt*travelFactor();bottleYaw-=stickTurn[0]*.45*dt;overlay.position.copy(position);fitBottle();
 }
}
function bindStick(id,assign){
 const element=$(id+'-stick'),knob=$(id+'-knob'),pad={element,knob,pointer:null};stickPads.push(pad);
 const input=e=>{const b=element.getBoundingClientRect();let x=(e.clientX-b.x-b.width/2)/(b.width*.34),y=(e.clientY-b.y-b.height/2)/(b.height*.34),n=Math.max(1,Math.hypot(x,y));x/=n;y/=n;if(Math.hypot(x,y)<.12)x=y=0;assign([x,y]);knob.style.transform=`translate(${x*28}px,${y*28}px)`;element.setAttribute('aria-valuetext',`${Math.round(x*100)}, ${Math.round(y*100)}`);};
 element.onpointerdown=e=>{if(element.getAttribute('aria-disabled')==='true'||pad.pointer!==null)return;e.preventDefault();beginStick();pad.pointer=e.pointerId;element.setPointerCapture(e.pointerId);input(e);};
 element.onpointermove=e=>{if(e.pointerId===pad.pointer){e.preventDefault();input(e);}};
 for(const name of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(name,e=>{if(e.pointerId===pad.pointer){pad.pointer=null;assign([0,0]);knob.style.transform='';element.setAttribute('aria-valuetext','Centred');if(stickPads.every(p=>p.pointer===null))zeroSticks();}});
 element.onkeydown=e=>{if(element.getAttribute('aria-disabled')==='true'||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();beginStick();const v=[e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0,e.key==='ArrowUp'?-1:e.key==='ArrowDown'?1:0];assign(v);moveWithSticks(.08);zeroSticks();};
}
function buildPlant(){
 if(plant){overlay.remove(plant.root);plant.dispose();}
 plant=new GrowingPlant({height,index:3,above:.34,startHeight,surface:drinkMode,size:plantSize});overlay.add(plant.root);
 plant.root.traverse(o=>{for(const material of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){material.clippingPlanes=[coveragePlane];material.needsUpdate=true;}});
 applyFlowerAlignment();overlay.position.copy(state.placed?position:previewPosition());
 overlay.visible=!state.session||state.placed;plant.root.visible=true;plant.update(clock.progress,0);fitBottle();cutoffUI();appearanceUI();lastSyncKey='';
}
function playback(){
 const v=sampleGrowth(clock.progress);$('stage').textContent=drinkMode&&clock.progress>=.1&&clock.progress<.4?'Growing from your drink':v.stage;
 $('progress').value=clock.progress*100;$('progress-value').textContent=Math.round(clock.progress*100)+'%';
 $('pause').textContent=clock.playing?'Pause':'Resume';
}
function resetTable(){
 zeroSticks();centreFlower();
 discardAnchor();state.epoch++;state.table=null;state.candidate=null;state.placed=false;state.editing=false;clock.playing=false;clock.seek(0);
 surfaceRay=null;surfaceTap=null;reticle.visible=false;cutoffOffset=0;cutoffUI();
 overlay.visible=false;plant.root.visible=false;track(drinkMode?'Tap the liquid surface in the camera view.':'Move the phone slowly and aim at the tabletop beside the bottle.');note(drinkMode?'Set the distance to your drink, then tap the liquid. No tabletop scan needed.':'1 · Scan the table, then tap Set tabletop.');sync();playback();
}
async function startAR(){
 if(state.starting||state.session||!state.ready)return;
 state.starting=true;sync();let s;const token=++state.epoch;
 try{
  s=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:drinkMode?['local','dom-overlay']:['local','hit-test','dom-overlay'],optionalFeatures:['anchors'],domOverlay:{root:$('overlay')}});
  if(token!==state.epoch){await s.end();return;}
  state.session=s;
  s.addEventListener('end',()=>finishAR(s),{once:true});
  s.addEventListener('visibilitychange',()=>{if(s.visibilityState!=='visible'){loseTracking();lastTime=null;}});
  renderer.getSize(savedSize);camera.position.set(0,0,0);camera.quaternion.identity();
  await renderer.xr.setSession(s);
  if(state.session!==s)return;
  state.reference=renderer.xr.getReferenceSpace();
  state.reference.addEventListener?.('reset',()=>{if(state.session===s)resetTable();});
  state.hitSource=null;
  if(!drinkMode){const viewer=await s.requestReferenceSpace('viewer');state.hitSource=await s.requestHitTestSource({space:viewer});}
  if(state.session!==s){state.hitSource?.cancel();return;}
  state.table=null;state.placed=false;state.candidate=null;state.tracking=false;state.editing=false;
  zeroSticks();centreFlower();surfaceRay=null;surfaceTap=null;lastView=lastProjection=null;clock.playing=false;clock.seek(0);lastTime=null;cutoffOffset=0;cutoffUI();
  useARGlass(true);floor.visible=false;overlay.visible=false;plant.root.visible=false;scene.background=null;renderer.setClearColor(0,0);
  document.documentElement.classList.add('xr');$('panel').hidden=false;$('toggle-panel').textContent='Hide controls';$('toggle-panel').setAttribute('aria-expanded','true');$('mode').textContent=drinkMode?'LIVE DRINK AR':'LIVE BOTTLE AR';
  track(drinkMode?'Tap the liquid surface. Adjust Distance if needed.':'Scan the tabletop beside your bottle.');note(drinkMode?'Tap the liquid, or aim the centre marker and tap Place. Distance is adjustable.':'1 · Aim at the table and tap Set tabletop.');
 }catch(e){
  if(s&&state.session===s)await s.end().catch(()=>{});
  note(e.name==='NotAllowedError'?'Camera / AR permission was not granted. You can retry Start AR.':'AR could not start ('+e.name+'). Open this page in supported Android Chrome.');
 }finally{state.starting=false;sync();}
}
function finishAR(s){
 if(state.session!==s)return;
 zeroSticks();centreFlower();state.epoch++;try{state.hitSource?.cancel();}catch{}discardAnchor();
 Object.assign(state,{session:null,reference:null,hitSource:null,table:null,candidate:null,placed:false,tracking:false,editing:false,anchorBusy:false});
 viewControls?.reset();
 clock.playing=false;lastTime=null;reticle.visible=false;
 document.documentElement.classList.remove('xr');$('panel').hidden=false;$('mode').textContent='3D PREVIEW';
 useARGlass(false);bottle.visible=!drinkMode;floor.visible=true;overlay.visible=true;plant.root.visible=true;overlay.position.copy(previewPosition());plant.root.position.set(0,0,0);plant.guide.visible=false;surfaceRay=null;surfaceTap=null;lastView=lastProjection=null;
 scene.background=new T.Color(0x132820);renderer.setClearColor(0x132820,1);camera.fov=39;queueMicrotask(resize);track('Drag to look around · stages and speed are adjustable.');note('AR ended. Alignment resets each time you start.');sync();
}
function loseTracking(){
 zeroSticks();
 state.tracking=false;state.candidate=null;clock.playing=false;overlay.visible=false;plant.root.visible=false;reticle.visible=false;
 track('Tracking paused. Move slowly to recover.');note('Growth is paused. Check alignment when tracking returns, then Resume.');sync();
}
function place(){
 if(state.placed){zeroSticks();discardAnchor();state.epoch++;state.placed=false;state.candidate=null;state.editing=false;surfaceRay=null;clock.playing=false;overlay.visible=false;plant.root.visible=false;note(drinkMode?'Tap the liquid surface again.':'Aim at the bottle opening again, then place.');sync();return;}
 if(!state.candidate||!state.tracking)return;
 if(!drinkMode&&state.table===null){state.table=state.candidate[1];state.candidate=null;note('2 · Align the transparent bottle over the real one, then Place.');track('Aim at the opening. The glass bottle and plant will align together.');}
 else{
  if(drinkMode){if(!surfaceRay)surfaceRay=viewRay();cutoffOffset=0;centreFlower();cutoffUI();}
  position.fromArray(state.candidate);overlay.position.copy(position);overlay.visible=true;plant.root.visible=true;state.placed=true;state.anchorPending=true;state.candidate=null;
  reticle.visible=false;clock.seek(0);clock.playing=false;playback();note(drinkMode?'Liquid selected. Tap Grow plant, or refine its position with joysticks.':'Aligned · tap Grow plant. The first shoot starts inside the bottle.');track(drinkMode?'Growth point fixed. Keep your drink still.':'Bottle aligned for this session. Keep it still.');
 }
 sync();
}
function processXR(frame){
 if(frame.session!==state.session)return false;
 let pose;try{if(state.session.visibilityState==='visible')pose=frame.getViewerPose(state.reference);}catch{}
 if(!pose){loseTracking();lastTime=null;return false;}
 const returning=!state.tracking;state.tracking=true;
 const m=pose.transform.matrix;lastCamera=Array.from(m);
 lastView=Array.from(pose.views[0]?.transform.matrix||m);lastProjection=pose.views[0]?.projectionMatrix?Array.from(pose.views[0].projectionMatrix):null;
 if(!state.placed){
  if(drinkMode){const ray=viewRay();state.candidate=ray?rayPoint(ray).toArray():null;}
  else if(state.table===null){
   state.candidate=null;
   try{for(const hit of frame.getHitTestResults(state.hitSource)){
    const h=hit.getPose(state.reference)?.transform.matrix;
    if(h&&h[5]>.7){state.candidate=[h[12],h[13],h[14]];break;}
   }}catch{}
  }else state.candidate=intersectHeight([m[12],m[13],m[14]],[-m[8],-m[9],-m[10]],state.table+height);
  reticle.visible=!!state.candidate;if(state.candidate)reticle.position.fromArray(state.candidate);
  overlay.visible=(drinkMode||state.table!==null)&&!!state.candidate;plant.root.visible=overlay.visible;
  if(overlay.visible)overlay.position.fromArray(state.candidate);
  if(state.table!==null&&!state.candidate)track('Aim slightly downward at the opening, from within arm’s reach.');
 }else{
  overlay.visible=true;plant.root.visible=true;
  if(state.anchor){
   const ap=frame.getPose(state.anchor.anchorSpace,state.reference);
   if(ap){overlay.position.set(ap.transform.position?.x??ap.transform.matrix[12],ap.transform.position?.y??ap.transform.matrix[13],ap.transform.position?.z??ap.transform.matrix[14]);}
   else{overlay.visible=false;plant.root.visible=false;clock.playing=false;track('Anchor tracking paused. Move slowly, or re-align the mouth.');}
  }else overlay.position.copy(position);
  if(returning)track('Tracking restored. Check the opening, then Resume growth.');
 }
 if(state.anchorPending&&!state.anchorBusy&&typeof frame.createAnchor==='function'){
  state.anchorPending=false;state.anchorBusy=true;const token=state.epoch,s=state.session;
  frame.createAnchor(new XRRigidTransform({x:position.x,y:position.y,z:position.z}),state.reference).then(a=>{
   if(state.session===s&&token===state.epoch&&state.placed&&!state.editing)state.anchor=a;else a.delete();
  }).catch(()=>{if(state.session===s)note('Aligned with world tracking for this session. Re-align if it drifts.');}).finally(()=>{if(state.session===s)state.anchorBusy=false;});
 }
 sync();return overlay.visible||!state.placed;
}
function nudge(id){
 if(!state.placed||!lastCamera)return;discardAnchor();state.epoch++;
 const m=lastCamera,flat=new T.Vector3(m[8],0,m[10]).normalize(),right=new T.Vector3(m[0],0,m[2]).normalize(),d=.005;
 if(id==='left')position.addScaledVector(right,-d);if(id==='right')position.addScaledVector(right,d);
 if(id==='near')position.addScaledVector(flat,d);if(id==='far')position.addScaledVector(flat,-d);
 if(id==='up')position.y+=d;if(id==='down')position.y-=d;overlay.position.copy(position);
 if(id==='turn-left')bottleYaw+=Math.PI/36;if(id==='turn-right')bottleYaw-=Math.PI/36;fitBottle();
 movedDrink();
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
  const distance=drinkMode?.82:1.15;camera.position.set(Math.sin(previewYaw)*distance,drinkMode?.20:.43,Math.cos(previewYaw)*distance);camera.lookAt(0,drinkMode?.13:.325,0);
 }
 if(advance)moveWithSticks(dt);
 const wasPlaying=clock.playing;if(advance&&(!state.session||state.tracking))clock.tick(dt);if(wasPlaying!==clock.playing)sync();
 plant?.update(clock.progress,time/1000);applyCoverage();playback();
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
 renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local');renderer.localClippingEnabled=true;$('viewport').append(renderer.domElement);
 scene=new T.Scene();scene.background=new T.Color(0x132820);camera=new T.PerspectiveCamera(39,1,.01,15);
 scene.add(new T.HemisphereLight(0xeaf5db,0x365c3c,2.4));
 const key=new T.DirectionalLight(0xfff2d5,3.2);key.position.set(-1,2,2);scene.add(key);const rim=new T.DirectionalLight(0xc4dfb7,2.4);rim.position.set(1,1,-1);scene.add(rim);
 environment();
 floor=new T.Group();const base=new T.Mesh(new T.CylinderGeometry(.24,.25,.014,96),new T.MeshStandardMaterial({color:0x8a9c73,roughness:.95}));base.position.y=-.009;floor.add(base);
 // A light backdrop and reflected studio panels make transmission visible in the preview.
 const backdrop=new T.Mesh(new T.PlaneGeometry(.84,1.05),new T.MeshBasicMaterial({color:0x6e8b6c}));backdrop.position.set(0,.40,-.27);floor.add(backdrop);scene.add(floor);
 reticle=new T.Mesh(new T.RingGeometry(.012,.015,48),new T.MeshBasicMaterial({color:0xe1edb3,side:T.DoubleSide,depthTest:false}));reticle.rotation.x=-Math.PI/2;reticle.visible=false;reticle.renderOrder=100;scene.add(reticle);
 const [model]=await Promise.all([new GLTFLoader().loadAsync('assets/green-bottle.glb'),loadBotanicalTextures()]);
 overlay=new T.Group();overlay.name='Bottle and plant overlay';scene.add(overlay);
 drinkGlass=new DrinkGlass({height:glassHeight,width:glassWidth,liquid:liquidHeight});overlay.add(drinkGlass.root);drinkGlass.root.visible=drinkMode;
 coverageRing=new T.Mesh(new T.TorusGeometry(.044,.0005,5,72),new T.MeshBasicMaterial({color:0xd9bc87,transparent:true,opacity:.7,depthTest:false}));coverageRing.rotation.x=Math.PI/2;overlay.add(coverageRing);
 bottle=model.scene;const root=bottle.children[0];root.position.set(0,0,0);bottle.traverse(o=>{if(o.material?.transmission){
  o.material.color.setRGB(.57,.86,.58);o.material.roughness=.065;o.material.envMapIntensity=.65;o.material.side=T.FrontSide;
  // A transparent tint remains visible over the live camera, which is not part of
  // Three.js's transmission buffer. Both meshes keep the plant visible inside.
  const ar=new T.MeshPhysicalMaterial({color:0x65b977,transparent:true,opacity:.18,roughness:.065,metalness:0,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:.75,depthWrite:false,side:T.FrontSide,clippingPlanes:[coveragePlane]});
  edgeGlass(ar);glassMaterials.push({mesh:o,preview:o.material,ar});
 }});overlay.add(bottle);buildPlant();
 const canvas=renderer.domElement;canvas.addEventListener('pointerdown',e=>{if(viewControls?.clean){viewControls.reveal();return;}if(state.session){if(drinkMode&&!state.placed)surfaceTap={id:e.pointerId,x:e.clientX,y:e.clientY};return;}drag={id:e.pointerId,x:e.clientX};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(drag?.id!==e.pointerId||state.session)return;previewYaw-=(e.clientX-drag.x)*.008;drag.x=e.clientX;});canvas.addEventListener('pointerup',e=>{if(surfaceTap?.id===e.pointerId&&Math.hypot(e.clientX-surfaceTap.x,e.clientY-surfaceTap.y)<12)tapDrink(e);surfaceTap=null;});for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>{drag=null;surfaceTap=null;});
 $('grow').onclick=growPlant;
 $('pause').onclick=toggleGrowth;
 $('restart').onclick=()=>{clock.restart();sync();};
 $('speed').oninput=e=>{clock.setSpeed(Number(e.target.value));$('speed-value').textContent=pretty(clock.speed);};
 $('progress').oninput=e=>{clock.playing=false;clock.seek(Number(e.target.value)/100);playback();sync();};
 for(const b of document.querySelectorAll('[data-stage]'))b.onclick=()=>{clock.playing=false;clock.seek(Number(b.dataset.stage)/100);playback();sync();};
 $('height').onchange=e=>{height=clamp(Number(e.target.value)||30.9,15,50)/100;e.target.value=(height*100).toFixed(1);levelsUI();buildPlant();};
 $('start-height').oninput=e=>$('start-height-value').textContent=Number(e.target.value).toFixed(1)+' cm';
 $('start-height').onchange=e=>{zeroSticks();startHeight=Number(e.target.value)/100;clock.seek(0);clock.playing=false;levelsUI();buildPlant();sync();note('Plant starts '+Number((startHeight*100).toFixed(1))+' cm above the bottle base. Tap Grow plant.');};
 $('covered-height').oninput=e=>{coveredHeight=Number(e.target.value)/100;$('covered-height-value').textContent=Number(e.target.value).toFixed(1)+' cm';applyCoverage();};
 $('start').onclick=startAR;$('place').onclick=place;$('quick-place').onclick=place;$('exit').onclick=()=>state.session?.end();$('retable').onclick=resetTable;
 for(const mode of ['bottle','drink'])$('source-'+mode).onclick=()=>chooseMode(mode==='drink');
 $('surface-distance').oninput=e=>{surfaceDistance=Number(e.target.value)/100;distanceUI();if(drinkMode&&state.placed&&surfaceRay){zeroSticks();discardAnchor();state.epoch++;clock.playing=false;position.copy(rayPoint(surfaceRay));overlay.position.copy(position);applyCoverage();sync();}};
 $('surface-distance').onchange=()=>{if(drinkMode&&state.placed){state.anchorPending=true;note('Distance set. Refine with joysticks, then Grow plant.');}};
 for(const id of ['glass-height','glass-width','liquid-height'])$(id).oninput=e=>{const value=Number(e.target.value)/100;if(id==='glass-height')glassHeight=value;if(id==='glass-width')glassWidth=value;if(id==='liquid-height')liquidHeight=value;glassUI();};
 $('cutoff-height').oninput=e=>{cutoffOffset=Number(e.target.value)/100;$('cutoff-height-value').textContent=Number(e.target.value)+' cm';applyCoverage();};
 $('cutoff-enabled').onchange=e=>{cutoffEnabled=e.target.checked;cutoffUI();};
 $('cutoff-guide').onchange=e=>{showCutoffGuide=e.target.checked;applyCoverage();};
 $('cutoff-at-base').onclick=()=>{cutoffOffset=clamp(plant.root.getWorldPosition(new T.Vector3()).y-overlay.position.y,-.25,.25);cutoffEnabled=true;cutoffUI();savePreferences();note('Cut-off set at the plant base. Plant and glass stay in place.');};
 $('cutoff-reset').onclick=()=>{cutoffOffset=0;cutoffUI();note('Cut-off restored to the tapped liquid level.');};
 $('show-glass').onchange=e=>{showGlass=e.target.checked;glassVisibility();};
 $('glass-opacity').oninput=e=>{glassOpacity=Number(e.target.value)/100;glassVisibility();};
 $('model-exposure').oninput=e=>{exposureEV=Number(e.target.value);appearanceUI();};
 $('exposure-reset').onclick=()=>{exposureEV=0;appearanceUI();savePreferences();};
 $('plant-size').oninput=e=>{zeroSticks();plantSize=Number(e.target.value)/100;clock.playing=false;buildPlant();sync();};
 $('plant-transparency').oninput=e=>{plantTransparency=Number(e.target.value);appearanceUI();};
 $('appearance-reset').onclick=()=>{zeroSticks();plantSize=1;plantTransparency=0;clock.playing=false;buildPlant();sync();savePreferences();};
 $('travel-speed').oninput=e=>{travelExponent=Number(e.target.value);movementUI();savePreferences();};
 $('travel-normal').onclick=()=>{travelExponent=0;movementUI();savePreferences();};
 $('stop-motion').onclick=zeroSticks;
 for(const [id,axis]of [['quick-nearer',1],['quick-farther',-1]])$(id).onclick=()=>{if(!state.placed||!state.tracking)return;zeroSticks();beginStick();stickMove=[0,axis];moveWithSticks(.2/travelFactor());zeroSticks();};
 $('face-me').onclick=()=>{if(!state.placed||!state.tracking||!lastCamera)return;zeroSticks();const yaw=Math.atan2(lastCamera[12]-overlay.position.x,lastCamera[14]-overlay.position.z);if(stickTarget==='flower'){flowerYaw=yaw-bottleYaw;applyFlowerAlignment();}else{position.copy(overlay.position);discardAnchor();state.epoch++;bottleYaw=yaw;fitBottle();state.anchorPending=true;}};
 $('adjust').onclick=()=>{state.editing=!state.editing;clock.playing=false;if(state.editing){position.copy(overlay.position);discardAnchor();state.epoch++;}else state.anchorPending=true;sync();};
 $('bottle-width').oninput=e=>{bottleWidth=Number(e.target.value)/100;$('bottle-width-value').textContent=e.target.value+'%';fitBottle();};
 for(const b of document.querySelectorAll('[data-nudge]'))b.onclick=()=>nudge(b.dataset.nudge);
 $('toggle-panel').onclick=()=>viewControls.showPanel($('panel').hidden);
 $('joystick-align').onclick=()=>{zeroSticks();clock.playing=false;if(state.editing){state.editing=false;state.anchorPending=true;}viewControls.showPanel(false);note('Left joystick: move. Right joystick: height and turn. Release to stop.');};
 $('sticks-done').onclick=()=>viewControls.showPanel(true);
 $('centre-flower').onclick=()=>{zeroSticks();centreFlower();};
 for(const target of ['flower','all'])$('target-'+target).onclick=()=>selectTarget(target);
 bindStick('move',v=>stickMove=v);bindStick('turn',v=>stickTurn=v);
 viewControls=new ViewControls({isImmersive:()=>!!state.session,canGrow:()=>state.ready&&!state.starting&&(!state.session||(state.placed&&state.tracking)),isPlaying:()=>clock.playing,progress:()=>clock.progress,target:()=>stickTarget,onPlayback:toggleGrowth,onGrow:growPlant,onRestart:()=>{clock.restart();sync();},onStop:zeroSticks,onToggleTarget:()=>selectTarget(stickTarget==='flower'?'all':'flower'),onExitAR:()=>state.session?.end(),onNotice:note,onEnter:()=>{zeroSticks();if(state.editing){state.editing=false;state.anchorPending=true;}},onViewChange:()=>{lastSyncKey='';sync();applyCoverage();resize();}});
 for(const event of ['input','change'])$('panel').addEventListener(event,savePreferences);
 for(const link of document.querySelectorAll('#collection-nav a'))link.onclick=async e=>{e.preventDefault();zeroSticks();clock.playing=false;savePreferences();try{await state.session?.end();}catch{}location.href=link.href;};
 const measureMotion=()=>{const size=Math.max(...[...document.querySelectorAll('.stick-wrap,#move-speed-control')].map(e=>e.getBoundingClientRect().height));document.documentElement.style.setProperty('--bloom-motion-height',size+'px');};
 const motionObserver=new ResizeObserver(measureMotion);for(const e of document.querySelectorAll('.stick-wrap,#move-speed-control'))motionObserver.observe(e);
 $('overlay').addEventListener('beforexrselect',e=>{if(e.target.closest?.('#panel,#toggle-panel,#joystick-controls,#quick-place,#exit,#view-actions')||drinkMode||viewControls?.clean)e.preventDefault();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){zeroSticks();clock.playing=false;lastTime=null;sync();}});window.addEventListener('blur',zeroSticks);window.addEventListener('pagehide',()=>{zeroSticks();state.session?.end().catch(()=>{});});window.addEventListener('resize',resize);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();state.ready=false;clock.playing=false;state.session?.end();note('Graphics paused. Reload this page to restore the plant.');sync();});
 try{state.supported=!!navigator.xr&&await navigator.xr.isSessionSupported('immersive-ar');}catch{}
 state.ready=true;levelsUI();distanceUI();glassUI();modeUI();appearanceUI();movementUI();stickTarget=drinkMode?'all':'flower';$('support').textContent=state.supported?'AR ready · choose a bottle or drink above.':'Preview works here. Live AR needs a compatible phone with WebXR, such as supported Android Chrome.';
 track('Drag to look around · stages and speed are adjustable.');note(drinkMode?'Ready · Start AR, then tap the liquid surface.':'Ready · grow your plant, or start AR over the real bottle.');sync();resize();renderer.setAnimationLoop(render);
 if(new URL(location.href).searchParams.has('test'))window.__BLOOM={state,clock,renderer,scene,camera,get plant(){return plant;},get bottle(){return bottle;},get glass(){return drinkGlass;},get overlay(){return overlay;},get levels(){return{startHeight,coveredHeight,clipY:-coveragePlane.constant,cutoffOffset,cutoffEnabled};},get view(){return{clean:viewControls.clean,revealed:viewControls.revealed,ownsFullscreen:viewControls.ownsFullscreen};},get drink(){return{active:drinkMode,distance:surfaceDistance,ray:surfaceRay?{origin:surfaceRay.origin.toArray(),direction:surfaceRay.direction.toArray()}:null};},get sticks(){return{move:[...stickMove],turn:[...stickTurn],target:stickTarget,offset:flowerOffset.toArray(),yaw:flowerYaw};},processXR,resetTable,finishAR,place,intersectHeight,sampleGrowth};
}
restorePreferences();
init().catch(e=>{note('Could not load Bottle Bloom: '+e.message);$('support').textContent='Reload to try again.';console.error(e);});
