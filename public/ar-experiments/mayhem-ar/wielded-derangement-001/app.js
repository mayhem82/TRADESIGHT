import {Scene} from './vendor/js/render/scenes/scene.js';
import {RenderView,createWebGLContext} from './vendor/js/render/core/renderer.js';
import {Node} from './vendor/js/render/core/node.js';
import {Gltf2Node} from './vendor/js/render/nodes/gltf2.js';
import {mat4} from './vendor/js/render/math/gl-matrix.js';
import {Joystick,horizontalStep,elevationYawStep} from './vendor/joystick.js';
import {DURATION} from './timeline.mjs';
import {GROUND_BUILD,clamp,floorHit,freshFloorHit,manualGroundAt,floorStep,boundsFromGltf,groundedFrame,groundedActor} from './grounding.mjs';
import {TRACKING_BUILD,WorldTracking,acquireTrackedSession} from './world-tracking.mjs?v=screen-tracking-010';
import {WALL_BUILD,newWallControls,wallMotion,wallFrame,wallMechanisms} from './enclosure.mjs?v=screen-tracking-010';
import {PortraitRenderer} from './portrait.mjs?v=recovered-clips-011';
import {reactiveState,beatEmission} from './beat-response.mjs';
import {wallScoreAt,wallGlow} from './wall-score.mjs';
import {WallTilePanel} from './wall-tile-node.mjs';
import {WALL_TILE_BUILD,wallTilePlans,buildWallWalk,walkingWallActor,wallWalkAt} from './wall-tiles.mjs';
import {ClipPlayback} from './clip-playback.mjs?v=walking-wall-tiles-012';
import {ClipTexture} from './clip-texture.mjs';
import {renderNativeFrame} from './native-frame.mjs';
const $=id=>document.getElementById(id),song=$('song'),cameraVideo=$('camera');
const status=text=>{$('status').textContent=text;};
let ready=false,mode='preview',stream=null,session=null,ref=null,hit=null,hitMatrix=null,hitTime=-Infinity,placing=false,placed=true,starting=false,epoch=0,held=false,heldTime=0,last=0;
let formTime=0,size=.7,exposure=.5,pose=[0,0,0],yaw=0,orbit=.55,tilt=.3,energy={secondsPerSample:.05,rms:[]};
let heightScale=1,modelBounds=null,xrSupported=false,viewerY=NaN;
let pendingPlacement=false,lastTrackingReason='inactive';
let beatFeatures=null;const mechanicalLights=[];
let wallScore=null;const sectionLights=[];
const gl=createWebGLContext({xrCompatible:true,alpha:true,antialias:true});
if(!gl)throw Error('This browser could not create a WebGL renderer.');
gl.canvas.id='artwork';gl.canvas.setAttribute('aria-label','Interactive morphing machine sculpture');document.body.prepend(gl.canvas);
const renderer=new PortraitRenderer(gl),scene=new Scene();scene.enableStats(false);scene.clear=false;scene.setRenderer(renderer);
const actor=new Node();scene.addNode(actor);
const machine=new Gltf2Node({url:'assets/machine.gltf'});actor.addNode(machine);
const clipPlayers=Array.from({length:4},()=>new ClipPlayback(document.createElement('video'))),clipTextures=clipPlayers.map(p=>new ClipTexture(p));
let screensEnabled=true,clipsEnabled=true,wallWalkEnabled=true,currentScreens=[],lastScreenStatus='',wallWalk=null,wallWalkOffset=0,wallWalkFrozen=0;
const outer=new Node();scene.addNode(outer);const enclosure=new Gltf2Node({url:'assets/enclosure-wave.gltf'});outer.addNode(enclosure);
const drive=new Gltf2Node({url:'assets/wall-drive.gltf'});outer.addNode(drive);const driveNodes=new Map();
const animationScreens=Array.from({length:20},()=>{const node=new WallTilePanel(clipTextures);outer.addNode(node);return node;});
const walls=newWallControls(),wallNodes=[],wallAnchor=mat4.create(),wallTracking=new WorldTracking(wallAnchor);let selected='machine',wallPlaced=true;
const selectedTracking=()=>selected==='machine'?tracking:wallTracking;
const reticle=new Gltf2Node({url:'vendor/media/reticle/reticle.gltf'});reticle.visible=false;scene.addNode(reticle);
const move=new Joystick($('move')),turn=new Joystick($('turn'));
const stop=()=>{move.stop();turn.stop();};
const parts=new Map(),facePrimitives=new Map(),allPrimitives=[];
const anchor=mat4.create();
const tracking=new WorldTracking(anchor);
function startup(value){starting=value;$('camera-start').disabled=value||!xrSupported;$('manual-start').disabled=value;}
function collect(node){
 if(node.name)parts.set(node.name,node);
 for(const p of node.renderPrimitives||[])allPrimitives.push(p);
 for(const c of node.children||[])collect(c);
}
function primitives(node,result=[]){for(const p of node.renderPrimitives||[])result.push(p);for(const c of node.children||[])primitives(c,result);return result;}
function energyAt(t){return energy.rms[Math.min(energy.rms.length-1,Math.max(0,Math.floor(t/energy.secondsPerSample)))]||0;}
function animate(t){
 formTime=held?heldTime:t;const s=reactiveState(formTime,energyAt(formTime),beatFeatures);
 for(const [primitive,original] of mechanicalLights)primitive.uniforms.emissiveFactor.value=beatEmission(original,s.beat);
 for(const [name,p] of groundedFrame(s,modelBounds)){
  const node=parts.get(name);node.matrix=p.matrix;node.visible=p.opacity>.01;
  if(name.startsWith('face-'))for(const primitive of facePrimitives.get(Number(name.slice(5)))||[])if(primitive.uniforms.modelOpacity)primitive.uniforms.modelOpacity.value=p.opacity;
 }
 $('phase').textContent=s.phase;
 const actorMatrix=groundedActor(anchor,pose,yaw,size,heightScale,modelBounds.get('base').min[1]);
 currentScreens=wallTilePlans(walls,formTime,wallScore,beatFeatures);
 const wallVisible=walls.enabled&&(mode==='preview'||(mode==='xr'?wallTracking.visible:wallPlaced));
 for(let i=0;i<4;i++){const active=screensEnabled&&clipsEnabled&&wallVisible&&currentScreens.some(p=>p.gates[i]>.01);clipPlayers[i].update(i,formTime,0,active,!song.paused&&!held&&!document.hidden);}
 for(let i=0;i<animationScreens.length;i++)animationScreens[i].update(currentScreens[i],screensEnabled&&wallVisible);
 const media=clipPlayers.filter(p=>p.active),errors=media.map(p=>p.error).filter(Boolean),activeTiles=currentScreens.reduce((n,p)=>n+p.gates.filter(g=>g>.01).length,0);
 const mediaMessage=!screensEnabled?'Wall tiles hidden':!clipsEnabled?'Procedural wall tiles':errors.length?'Per-type procedural fallback: '+errors[0]:media.length?'Wall tiles: '+activeTiles+' active / '+media.filter(p=>p.ready).length+'/4 clips ready':'Wall clips ready when tiles activate';if(mediaMessage!==lastScreenStatus){$('screen-media-status').textContent=mediaMessage;lastScreenStatus=mediaMessage;}
 const wm=wallFrame(walls,formTime,energyAt(formTime),wallScore,beatFeatures);for(let i=0;i<wallNodes.length;i++){wallNodes[i].matrix=wm[i];const heat=wallScoreAt(wallScore,beatFeatures,formTime,i).heat;for(const [p,original] of sectionLights[i])p.uniforms.emissiveFactor.value=wallGlow(original,heat);}outer.matrix=walkingWallActor(wallAnchor,walls,formTime,wallWalk,wallWalkEnabled,wallWalkOffset,wallWalkFrozen);outer.visible=walls.enabled&&(mode==='xr'?wallTracking.visible:mode==='preview'||wallPlaced);
 for(const [name,matrix] of wallMechanisms(walls,formTime,energyAt(formTime),wallScore,beatFeatures).frame)driveNodes.get(name).matrix=matrix;
 actor.matrix=actorMatrix;actor.visible=mode==='xr'?tracking.visible:mode==='preview'||placed;
 return s;
}
function resize(){if(session)return;const ratio=Math.min(devicePixelRatio||1,1.5),w=Math.round(innerWidth*ratio),h=Math.round(innerHeight*ratio);if(gl.canvas.width!==w||gl.canvas.height!==h){gl.canvas.width=w;gl.canvas.height=h;}}
function projectionAndView(){
 const projection=mat4.create(),view=mat4.create();mat4.perspective(projection,Math.PI/3,gl.canvas.width/gl.canvas.height,.03,50);
 let eye,target;
 if(mode==='camera'){eye=[0,0,0];target=[0,0,-1];}
 else{eye=[Math.sin(orbit)*3.4,1.25+tilt*2.3,Math.cos(orbit)*3.4];target=[0,.85,0];}
 mat4.lookAt(view,eye,target,[0,1,0]);return {projection,view,eye};
}
function motion(dt,view){
 const world=mat4.invert(mat4.create(),view);const [dx,dz]=horizontalStep(world,move.x,move.y,dt,.65);const r=elevationYawStep(turn.x,turn.y,dt);
 if(selected==='walls'){wallMotion(walls,wallAnchor,dx,dz,r.yaw,turn.y,dt);$('wall-height').value=walls.height;$('wall-height-value').textContent=walls.height.toFixed(1)+' m';return;}
 const [fx,fz]=floorStep(anchor,dx,dz);pose[0]=clamp(pose[0]+fx,-4,4);pose[2]=clamp(pose[2]+fz,mode==='camera'?-7-anchor[14]:-4,mode==='camera'?-.6-anchor[14]:4);pose[1]=0;yaw+=r.yaw;
 if(mode==='camera'&&placing&&r.dy!==0)anchor[13]=clamp(anchor[13]+r.dy,-4,4);
 else heightScale=clamp(heightScale*Math.exp(-turn.y*Math.min(.05,dt)*.6),.5,2);
}
function paint(t){
 requestAnimationFrame(paint);if(session||!ready)return;resize();const {projection,view,eye}=projectionAndView(),dt=Math.max(0,Math.min(.05,(t-last)/1000));last=t;
 motion(dt,view);animate(song.currentTime);reticle.visible=mode==='camera'&&placing;if(reticle.visible)reticle.matrix=mat4.translate(mat4.create(),selected==='machine'?anchor:wallAnchor,selected==='machine'?[pose[0],0,pose[2]]:walls.pose);
 scene.startFrame();gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
 if(mode==='camera')gl.clearColor(0,0,0,0);else gl.clearColor(.043,.073,.08,1);
 gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);scene.drawViewArray([new RenderView(projection,{inverse:{matrix:view},position:{x:eye[0],y:eye[1],z:eye[2]}})]);scene.endFrame();
 updateTransport();
}
function updateTransport(){
 const clock=t=>`${Math.floor(t/60)}:${Math.floor(t%60).toString().padStart(2,'0')}`;
 $('time').textContent=`${clock(song.currentTime)} / ${clock(DURATION)}`;if(document.activeElement!==$('seek'))$('seek').value=String(song.currentTime);
 $('play').textContent=song.paused?'Play song':'Pause';
}
function stopCamera(){stream?.getTracks().forEach(t=>t.stop());stream=null;cameraVideo.srcObject=null;document.body.classList.remove('camera');}
function aimManualGround(x=innerWidth/2,y=clamp(Math.min(innerHeight*.68,$('transport').getBoundingClientRect().top-35),innerHeight*.54,innerHeight*.8)){
 const target=selected==='machine'?anchor:wallAnchor,offset=selected==='machine'?pose:walls.pose;
 const position=manualGroundAt(x,y,innerWidth,innerHeight,mode==='camera'&&target[14]<-.6?-target[14]-offset[2]:2.4);
 if(selected==='walls'){mat4.fromTranslation(wallAnchor,position);walls.pose=[0,0,0];}else{mat4.fromTranslation(anchor,position);pose=[0,0,0];}
}
function resetPose(){stop();if(selected==='walls'){Object.assign(walls,newWallControls());syncWallUI();if(mode==='preview'||(mode==='xr'&&!wallPlaced))mat4.identity(wallAnchor);else if(mode==='camera'&&placing)aimManualGround();return;}pose=[0,0,0];yaw=0;size=.7;heightScale=1;$('size').value='70';$('size-value').textContent='70%';if(mode==='preview'||(mode==='xr'&&!placed))mat4.identity(anchor);else if(mode==='camera'&&placing)aimManualGround();}
function placementUI(show,message){$('placement').hidden=!show;$('placement-hint').textContent=message;$('place').hidden=mode==='xr';}
function setMode(next){mode=next;document.body.classList.toggle('world-xr',next==='xr');$('state-label').textContent=next==='xr'?'AR: waiting for tracking':next==='camera'?'Camera overlay - UNTRACKED':'3D preview';$('exit').hidden=next==='preview';$('exit').textContent=next==='xr'?'Exit AR':'Exit overlay';}
function collapse(){document.body.classList.add('menu-hidden');$('menu').textContent='Show controls';$('menu').setAttribute('aria-expanded','false');}
async function cameraStart(){
 if(starting)return;const generation=++epoch;startup(true);stop();
 try{
  if(!isSecureContext||!navigator.mediaDevices?.getUserMedia)throw Error('Camera mode needs HTTPS (or localhost) and a browser with camera access.');
  if(session)await session.end();if(generation!==epoch)return;tracking.end();wallTracking.end();stopCamera();status('Requesting the rear camera for an untracked overlay…');
  const requested=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});
  if(generation!==epoch){requested.getTracks().forEach(t=>t.stop());return;}
  stream=requested;await attachVideoElement(cameraVideo,stream);if(generation!==epoch){requested.getTracks().forEach(t=>t.stop());if(stream===requested)stream=null;return;}wallPlaced=false;setMode('camera');document.body.classList.add('camera');placing=true;placed=false;resetPose();actor.visible=false;
  placementUI(true,'UNTRACKED overlay: tap the visible ground point, then align the base.');collapse();status('This camera overlay follows the screen. It is not world-tracked AR. Ground alignment is manual.');
 }catch(e){if(generation!==epoch)return;stopCamera();setMode('preview');placing=false;placed=true;resetPose();placementUI(false,'');status('Camera overlay could not start: '+e.message+' The 3D preview is available.');}
 finally{if(generation===epoch)startup(false);}
}
$('camera-start').onclick=xrStart;
$('manual-start').onclick=cameraStart;
$('place').onclick=()=>{if(mode!=='camera')return;stop();placing=false;if(selected==='machine')placed=true;else wallPlaced=true;reticle.visible=false;placementUI(false,'');status('Base aligned in the camera overlay. This remains screen-relative, untracked content.');};
$('preview').onclick=async()=>{const generation=++epoch;startup(false);stop();if(session)await session.end().catch(()=>{});if(generation!==epoch)return;tracking.end();wallTracking.end();stopCamera();setMode('preview');wallPlaced=true;placed=true;placing=false;resetPose();placementUI(false,'');status('3D preview. Drag the scene to look around; the sticks move and turn the machine.');};
$('exit').onclick=()=>$('preview').click();
$('reposition').onclick=()=>{stop();if(mode==='xr'){selectedTracking().reposition();pendingPlacement=false;if(selected==='machine')placed=false;else wallPlaced=false;placing=true;hitMatrix=null;placementUI(true,'Point at the floor. Find its circle and tap the clear centre to place the base.');}else if(mode==='camera'){placing=true;if(selected==='machine')placed=false;else wallPlaced=false;placementUI(true,'UNTRACKED overlay: choose a visible ground point and align the base.');}else resetPose();};
$('reset').onclick=resetPose;
$('wall-walk').onchange=e=>{const angle=wallWalkAt(wallWalk,formTime);if(e.target.checked)wallWalkOffset=wallWalkFrozen-angle;else wallWalkFrozen=angle+wallWalkOffset;wallWalkEnabled=e.target.checked;};
$('clips-enabled').onchange=e=>{clipsEnabled=e.target.checked;if(!clipsEnabled)clipPlayers.forEach(p=>p.stop());};
$('screens-enabled').onchange=e=>{screensEnabled=e.target.checked;for(let i=0;i<animationScreens.length;i++)animationScreens[i].update(currentScreens[i],screensEnabled);};
function syncWallUI(){for(const key of ['diameter','height']){$('wall-'+key).value=walls[key];$('wall-'+key+'-value').textContent=walls[key].toFixed(1)+' m';}$('wall-visible').checked=walls.enabled;}
for(const key of ['diameter','height'])$('wall-'+key).oninput=e=>{walls[key]=Number(e.target.value);syncWallUI();};
$('wall-visible').onchange=e=>walls.enabled=e.target.checked;
for(const choice of ['machine','walls'])$('select-'+choice).onclick=()=>{
 stop();pendingPlacement=false;selected=choice;hitMatrix=null;
 for(const c of ['machine','walls'])$('select-'+c).setAttribute('aria-pressed',String(c===selected));
 $('control-target').textContent=selected==='machine'?'Central machine':'Outer walls';
 if(mode!=='preview'){placing=!(selected==='machine'?placed:wallPlaced);placementUI(placing,mode==='xr'?'Aim at the floor and tap its circle to place '+$('control-target').textContent+'.':'UNTRACKED overlay: align the selected base manually.');}
 status('Controls target '+$('control-target').textContent+'. The other structure keeps its position and size.');
};
syncWallUI();
$('size').oninput=e=>{size=Number(e.target.value)/100;$('size-value').textContent=Math.round(size*100)+'%';};
$('light').oninput=e=>{exposure=Number(e.target.value);for(const p of allPrimitives)if(p.uniforms.modelExposure)p.uniforms.modelExposure.value=2**exposure;$('light-value').textContent=(exposure>0?'+':'')+exposure.toFixed(1)+' EV';};
$('menu').onclick=()=>{stop();const hidden=document.body.classList.toggle('menu-hidden');$('menu').textContent=hidden?'Show controls':'Hide controls';$('menu').setAttribute('aria-expanded',String(!hidden));};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{status('Full screen is unavailable in this browser. The same controls remain available.');}};
document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'Leave full screen':'Full screen';resize();});
$('play').onclick=async()=>{try{if(song.paused){await song.play();collapse();}else song.pause();updateTransport();}catch(e){status('Song could not start: '+e.message);}};
$('restart').onclick=()=>{stop();song.currentTime=0;held=false;$('hold').setAttribute('aria-pressed','false');$('hold').textContent='Hold form';updateTransport();};
$('seek').oninput=e=>{song.currentTime=Math.min(DURATION,Math.max(0,Number(e.target.value)));updateTransport();};
$('hold').onclick=()=>{held=!held;heldTime=song.currentTime;$('hold').setAttribute('aria-pressed',String(held));$('hold').textContent=held?'Resume form':'Hold form';status(held?'The form is held while the song continues. Resume form to catch up with the music.':'The machine follows the song again.');};
song.addEventListener('ended',()=>{song.pause();stop();updateTransport();status('The song has ended. Restart to experience the machine again.');});
song.addEventListener('error',()=>status('The original song could not load. Check that WIELDED-DERANGEMENT.wav is beside index.html.'));
song.addEventListener('pause',()=>{clipPlayers.forEach(p=>p.stop());updateTransport();});song.addEventListener('play',()=>{clipPlayers.forEach(p=>p.retry());updateTransport();});
let drag=null;
gl.canvas.addEventListener('pointerdown',e=>{if(mode==='camera'&&placing){e.preventDefault();aimManualGround(e.clientX,e.clientY);status('Ground point manually aligned. Confirm Place on ground, or tap another ground point.');return;}if(mode!=='preview')return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};gl.canvas.setPointerCapture(e.pointerId);});
gl.canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;orbit-=(e.clientX-drag.x)*.009;tilt=Math.max(-.25,Math.min(1.1,tilt+(e.clientY-drag.y)*.004));drag.x=e.clientX;drag.y=e.clientY;});
for(const event of ['pointerup','pointercancel','lostpointercapture'])gl.canvas.addEventListener(event,()=>drag=null);

// Optional tracked path retains the accepted reference renderer and local/hit-test
// sequence. DOM overlay controls cancel selection only over actual controls.
for(const el of [$('panel'),$('dock'),$('transport'),$('entity-controls'),...document.querySelectorAll('.top-actions')])el.addEventListener('beforexrselect',e=>e.preventDefault());
async function xrStart(){
 if(starting||session)return;if(!xrSupported){status('World-tracked AR is unavailable in this browser. The separate camera overlay is untracked and follows the screen.');return;}
 const generation=++epoch;startup(true);stop();stopCamera();let requested;
 try{
  requested=await acquireTrackedSession(navigator.xr,$('overlay'),()=>generation===epoch);if(!requested)return;
  session=requested;tracking.begin(requested);wallTracking.begin(requested);session.addEventListener('end',()=>xrEnded(requested),{once:true});
  const current=()=>generation===epoch&&session===requested;
  await gl.makeXRCompatible();if(!current()){await requested.end().catch(()=>{});return;}
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  requested.updateRenderState({baseLayer:new XRWebGLLayer(requested,gl)});
  const localRef=await requested.requestReferenceSpace('local');if(!current()){await requested.end().catch(()=>{});return;}
  const viewerSpace=await requested.requestReferenceSpace('viewer');if(!current()){await requested.end().catch(()=>{});return;}
  const localHit=await requested.requestHitTestSource({space:viewerSpace});if(!current()){localHit.cancel();await requested.end().catch(()=>{});return;}
  ref=localRef;hit=localHit;
  ref.addEventListener?.('reset',()=>{if(session!==requested)return;tracking.resetOrigin();wallTracking.resetOrigin();wallPlaced=false;stop();song.pause();pendingPlacement=false;placed=false;placing=true;hitMatrix=null;actor.visible=false;placementUI(true,'Tracking reset. Point at the floor and place the base again.');status('Tracking origin changed; choose the ground again before continuing.');});
  requested.addEventListener('select',()=>{if(session!==requested||!placing||!selectedTracking().tracked||!freshFloorHit(hitMatrix,viewerY,hitTime,performance.now()))return;pendingPlacement=true;});
  requested.addEventListener('visibilitychange',()=>{if(session===requested&&requested.visibilityState!=='visible'){tracking.suspend('visibility-suspended');wallTracking.suspend('visibility-suspended');pauseTracking();}});
  setMode('xr');wallPlaced=false;placed=false;placing=true;resetPose();collapse();placementUI(true,'Point at the floor. Find its circle and tap the clear centre to place the base.');
  status('Waiting for native positional tracking. Scan actual ground below you, not a tabletop.');lastTrackingReason='waiting-for-tracking';pendingPlacement=false;last=0;requested.requestAnimationFrame(xrFrame);
 }catch(e){if(requested)await requested.end().catch(()=>{});if(generation!==epoch)return;tracking.end();wallTracking.end();wallPlaced=true;setMode('preview');placed=true;placing=false;resetPose();placementUI(false,'');status('Tracked AR could not start: '+e.message+' No camera-overlay fallback was started.');}
 finally{if(generation===epoch)startup(false);}
}
function xrEnded(ended){if(session!==ended)return;stop();song.pause();hit?.cancel();hit=null;session=null;ref=null;hitMatrix=null;tracking.end();wallTracking.end();wallPlaced=true;pendingPlacement=false;reticle.visible=false;setMode('preview');placed=true;placing=false;resetPose();placementUI(false,'');last=0;status('Tracked AR ended. A new AR session requires new ground placement.');}
function pauseTracking(){stop();clipPlayers.forEach(p=>p.stop());song.pause();pendingPlacement=false;hitMatrix=null;reticle.visible=false;actor.visible=false;outer.visible=false;last=0;}
function xrFrame(t,frame){
 if(!session||frame.session!==session)return;session.requestAnimationFrame(xrFrame);const viewer=frame.getViewerPose(ref);reticle.visible=false;hitMatrix=null;
 let usable=tracking.observe(viewer,document.hidden?'hidden':session.visibilityState||'visible',session).usable;
 wallTracking.observe(viewer,document.hidden?'hidden':session.visibilityState||'visible',session);
 if(usable&&placed)tracking.refreshAnchor(frame,ref);if(wallTracking.tracked&&wallPlaced)wallTracking.refreshAnchor(frame,ref);
 if(usable){
  viewerY=viewer.transform.matrix[13];
  if(placing)for(const result of frame.getHitTestResults(hit)){const p=result.getPose(ref);if(p&&p.emulatedPosition===false&&floorHit(p.transform.matrix,viewerY)){hitMatrix=new Float32Array(p.transform.matrix);hitTime=performance.now();reticle.matrix=hitMatrix;reticle.visible=true;
    if(pendingPlacement&&selectedTracking().place(hitMatrix,hitTime,performance.now())){stop();pendingPlacement=false;if(selected==='machine'){pose=[0,0,0];yaw=0;placed=true;}else{walls.pose=[0,0,0];walls.yaw=0;wallPlaced=true;}placing=false;reticle.visible=false;placementUI(false,'');selectedTracking().attachNative(result);status('Placed in world-tracked AR. Move the phone to look around the machine.');}break;}}
  $('state-label').textContent='World-tracked AR';
  if(lastTrackingReason!=='tracking'){status(placed?'Positional tracking restored. The world placement is retained; press Play to continue.':'Positional tracking active. Aim at the ground circle and tap to place.');lastTrackingReason='tracking';}
  const dt=last?Math.max(0,Math.min(.05,(t-last)/1000)):0;last=t;if(selectedTracking().tracked)motion(dt,viewer.views[0].transform.inverse.matrix);else stop();animate(song.currentTime);
 }else{pauseTracking();$('state-label').textContent='AR: tracking paused';if(lastTrackingReason!==tracking.reason){status(tracking.reason==='position-emulated'||tracking.reason==='position-unverified'?'Native positional tracking is unavailable or unverified. The machine is hidden; a camera overlay would not be true AR.':'Tracking paused. The machine is hidden until positional tracking returns.');lastTrackingReason=tracking.reason;}}
 renderNativeFrame(scene,frame,viewer,usable,gl);updateTransport();
}
window.addEventListener('resize',resize);window.addEventListener('blur',stop);
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(session){tracking.suspend('visibility-suspended');wallTracking.suspend('visibility-suspended');pauseTracking();}stop();song.pause();held=false;$('hold').setAttribute('aria-pressed','false');$('hold').textContent='Hold form';}});
window.addEventListener('pagehide',()=>{clipPlayers.forEach(p=>p.stop());++epoch;stop();song.pause();stopCamera();session?.end().catch(()=>{});});
// Read-only diagnostics for verification. No synthetic camera or tracking is claimed.
Object.defineProperty(window,'WieldedExperience',{value:{get state(){return {build:WALL_TILE_BUILD,wallWalkEnabled,wallWalkRadians:wallWalkEnabled?wallWalkAt(wallWalk,formTime)+wallWalkOffset:wallWalkFrozen,screensEnabled,clipsEnabled,clipPlayback:clipPlayers.map(p=>p.state),screenPanels:currentScreens.map(p=>({section:p.section,gates:[...p.gates]})),wallBuild:WALL_BUILD,trackingBuild:TRACKING_BUILD,selected,walls:{...walls,pose:[...walls.pose],placed:wallPlaced,tracking:wallTracking.state},groundBuild:GROUND_BUILD,tracking:tracking.state,ready,mode,placed,placing,playing:!song.paused,time:song.currentTime,formTime,held,beat:reactiveState(formTime,energyAt(formTime),beatFeatures).beat,size,heightScale,groundPoint:[anchor[12],anchor[13],anchor[14]],baseBottom:modelBounds?.get('base').min[1],pose:[...pose],yaw,parts:parts.size,faces:facePrimitives.size,cameraTracks:stream?.getVideoTracks().filter(t=>t.readyState==='live').length||0,xr:!!session,glError:gl.getError()};}}});
try{
 const response=await fetch('assets/energy.json');if(!response.ok)throw Error('Audio energy data missing');energy=await response.json();
 const beats=await fetch('assets/beats.json');if(!beats.ok)throw Error('Beat response data missing');beatFeatures=await beats.json();
 const scoreResponse=await fetch('assets/wall-score.json');if(!scoreResponse.ok)throw Error('Wall music score missing');wallScore=await scoreResponse.json();wallWalk=buildWallWalk(wallScore,beatFeatures);if(wallScore.duration!==DURATION||wallScore.sourceSha256!==beatFeatures.sourceSha256)throw Error('Wall score does not match the original song');
 const geometry=await fetch('assets/machine.gltf');if(!geometry.ok)throw Error('Machine bounds could not load');modelBounds=boundsFromGltf(await geometry.json());
 await Promise.all([machine.waitForComplete(),reticle.waitForComplete(),enclosure.waitForComplete(),drive.waitForComplete(),...animationScreens.map(n=>n.waitForComplete())]);collect(machine);for(const node of animationScreens)allPrimitives.push(...primitives(node));
 function gatherDrive(n){if(/^wall-(gear|rod|shaft|pin)-/.test(n.name||''))driveNodes.set(n.name,n);for(const c of n.children||[])gatherDrive(c);}gatherDrive(drive);if(driveNodes.size!==80)throw Error('Outer drive mechanism missing');for(const p of primitives(drive))allPrimitives.push(p);
 function gatherWall(n){if(n.name?.startsWith('wall-module-'))wallNodes[Number(n.name.slice(12))]=n;for(const c of n.children||[])gatherWall(c);}gatherWall(enclosure);if(wallNodes.length!==20)throw Error('Outer wall geometry missing');for(const p of primitives(enclosure))allPrimitives.push(p);
 for(let i=0;i<20;i++)sectionLights[i]=primitives(wallNodes[i]).filter(p=>p.uniforms.emissiveFactor).map(p=>[p,p.originalEmission]);
 for(let i=0;i<12;i++){const node=parts.get('face-'+i);if(!node)throw Error('Face geometry missing');facePrimitives.set(i,primitives(node));}
 for(const [name,node] of parts)if(/^(cell-|strut-|core$)/.test(name))for(const p of primitives(node))if(p.uniforms.emissiveFactor)mechanicalLights.push([p,p.originalEmission]);
 for(const p of allPrimitives)if(p.uniforms.modelExposure)p.uniforms.modelExposure.value=2**exposure;
 try{xrSupported=!!navigator.xr&&await navigator.xr.isSessionSupported('immersive-ar');}catch{xrSupported=false;}
 ready=true;for(const id of ['manual-start','preview','play','restart','seek'])$(id).disabled=false;startup(false);
 $('camera-start').textContent=xrSupported?'Start world-tracked AR':'Tracked AR unavailable';
 status(xrSupported?'Request world-tracked AR, then wait for positional tracking and a ground circle.':'This browser cannot start world-tracked AR. Camera overlay is a separate untracked option and will follow the screen.');
 requestAnimationFrame(paint);
}catch(e){status('The machine could not load: '+e.message);$('fatal').hidden=false;$('fatal').textContent='Machine load failed. Keep all files together and serve this folder over HTTP or HTTPS.';}

