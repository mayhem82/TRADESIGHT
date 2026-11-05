import {Scene} from './vendor/js/render/scenes/scene.js';
import {Renderer,RenderView,createWebGLContext} from './vendor/js/render/core/renderer.js';
import {Node} from './vendor/js/render/core/node.js';
import {Gltf2Node} from './vendor/js/render/nodes/gltf2.js';
import {mat4} from './vendor/js/render/math/gl-matrix.js';
import {Joystick,horizontalStep,elevationYawStep} from './vendor/joystick.js';
import {stateAt,DURATION} from './timeline.mjs';
import {GROUND_BUILD,clamp,floorHit,freshFloorHit,manualGroundAt,floorStep,boundsFromGltf,groundedFrame,groundedActor} from './grounding.mjs';
const $=id=>document.getElementById(id),song=$('song'),cameraVideo=$('camera');
const status=text=>{$('status').textContent=text;};
let ready=false,mode='preview',stream=null,session=null,ref=null,hit=null,hitMatrix=null,hitTime=-Infinity,placing=false,placed=true,starting=false,epoch=0,held=false,heldTime=0,last=0;
let formTime=0,size=.7,exposure=.5,pose=[0,0,0],yaw=0,orbit=.55,tilt=.3,energy={secondsPerSample:.05,rms:[]};
let heightScale=1,modelBounds=null,xrSupported=false,viewerY=NaN;
const gl=createWebGLContext({xrCompatible:true,alpha:true,antialias:true});
if(!gl)throw Error('This browser could not create a WebGL renderer.');
gl.canvas.id='artwork';gl.canvas.setAttribute('aria-label','Interactive morphing machine sculpture');document.body.prepend(gl.canvas);
const renderer=new Renderer(gl),scene=new Scene();scene.enableStats(false);scene.clear=false;scene.setRenderer(renderer);
const actor=new Node();scene.addNode(actor);
const machine=new Gltf2Node({url:'assets/machine.gltf'});actor.addNode(machine);
const reticle=new Gltf2Node({url:'vendor/media/reticle/reticle.gltf'});reticle.visible=false;scene.addNode(reticle);
const move=new Joystick($('move')),turn=new Joystick($('turn'));
const stop=()=>{move.stop();turn.stop();};
const parts=new Map(),facePrimitives=new Map(),allPrimitives=[];
const anchor=mat4.create();
function collect(node){
 if(node.name)parts.set(node.name,node);
 for(const p of node.renderPrimitives||[])allPrimitives.push(p);
 for(const c of node.children||[])collect(c);
}
function primitives(node,result=[]){for(const p of node.renderPrimitives||[])result.push(p);for(const c of node.children||[])primitives(c,result);return result;}
function energyAt(t){return energy.rms[Math.min(energy.rms.length-1,Math.max(0,Math.floor(t/energy.secondsPerSample)))]||0;}
function animate(t){
 formTime=held?heldTime:t;const s=stateAt(formTime,energyAt(formTime));
 for(const [name,p] of groundedFrame(s,modelBounds)){
  const node=parts.get(name);node.matrix=p.matrix;node.visible=p.opacity>.01;
  if(name.startsWith('face-'))for(const primitive of facePrimitives.get(Number(name.slice(5)))||[])if(primitive.uniforms.modelOpacity)primitive.uniforms.modelOpacity.value=p.opacity;
 }
 $('phase').textContent=s.phase;
 actor.matrix=groundedActor(anchor,pose,yaw,size,heightScale,modelBounds.get('base').min[1]);actor.visible=mode==='preview'||placed;
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
 const [fx,fz]=floorStep(anchor,dx,dz);pose[0]=clamp(pose[0]+fx,-4,4);pose[2]=clamp(pose[2]+fz,mode==='camera'?-7-anchor[14]:-4,mode==='camera'?-.6-anchor[14]:4);pose[1]=0;yaw+=r.yaw;
 if(mode==='camera'&&placing&&r.dy!==0)anchor[13]=clamp(anchor[13]+r.dy,-4,4);
 else heightScale=clamp(heightScale*Math.exp(-turn.y*Math.min(.05,dt)*.6),.5,2);
}
function paint(t){
 requestAnimationFrame(paint);if(session||!ready)return;resize();const {projection,view,eye}=projectionAndView(),dt=Math.max(0,Math.min(.05,(t-last)/1000));last=t;
 motion(dt,view);animate(song.currentTime);reticle.visible=mode==='camera'&&placing;if(reticle.visible)reticle.matrix=mat4.translate(mat4.create(),anchor,[pose[0],0,pose[2]]);
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
 const position=manualGroundAt(x,y,innerWidth,innerHeight,mode==='camera'&&anchor[14]<-.6?-anchor[14]-pose[2]:2.4);
 mat4.fromTranslation(anchor,position);pose=[0,0,0];
}
function resetPose(){stop();pose=[0,0,0];yaw=0;size=.7;heightScale=1;$('size').value='70';$('size-value').textContent='70%';if(mode==='preview'||(mode==='xr'&&!placed))mat4.identity(anchor);else if(mode==='camera'&&placing)aimManualGround();}
function placementUI(show,message){$('placement').hidden=!show;$('placement-hint').textContent=message;$('place').hidden=mode==='xr';}
function setMode(next){mode=next;$('state-label').textContent=next==='xr'?'Tracked ground AR':next==='camera'?'Manually aligned ground':'3D preview';$('exit').hidden=next==='preview';$('exit').textContent=next==='xr'?'Exit AR':'Exit camera';}
function collapse(){document.body.classList.add('menu-hidden');$('menu').textContent='Show controls';$('menu').setAttribute('aria-expanded','false');}
async function cameraStart(){
 if(starting)return;starting=true;const generation=++epoch;stop();
 try{
  if(!isSecureContext||!navigator.mediaDevices?.getUserMedia)throw Error('Camera mode needs HTTPS (or localhost) and a browser with camera access.');
  if(session)await session.end();stopCamera();status('Requesting the rear camera…');
  const requested=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});
  if(generation!==epoch){requested.getTracks().forEach(t=>t.stop());return;}
  stream=requested;await attachVideoElement(cameraVideo,stream);setMode('camera');document.body.classList.add('camera');placing=true;placed=false;resetPose();actor.visible=false;
  placementUI(true,'Point at the ground. Tap the spot for the base, then confirm Place on ground.');collapse();status('Manually align the circle with visible ground. This mode does not detect or track real-world ground. After placing, the height stick grows the machine upward from its base.');
 }catch(e){stopCamera();setMode('preview');placing=false;placed=true;resetPose();placementUI(false,'');status('Camera could not start: '+e.message+' The 3D preview is available.');}
 finally{starting=false;}
}
$('camera-start').onclick=()=>xrSupported?xrStart():cameraStart();
$('manual-start').onclick=cameraStart;
$('place').onclick=()=>{if(mode!=='camera')return;stop();placing=false;placed=true;reticle.visible=false;placementUI(false,'');status('Base aligned with your chosen ground point. Move along the ground; turn or change height from the base. Ground is manually aligned, not tracked.');};
$('preview').onclick=async()=>{++epoch;stop();if(session)await session.end();stopCamera();setMode('preview');placed=true;placing=false;resetPose();placementUI(false,'');status('3D preview. Drag the scene to look around; the sticks move and turn the machine.');};
$('exit').onclick=()=>$('preview').click();
$('reposition').onclick=()=>{stop();if(mode==='xr'){placed=false;placing=true;hitMatrix=null;actor.visible=false;placementUI(true,'Point at the floor. Find its circle and tap the clear centre to place the base.');}else if(mode==='camera'){placing=true;placed=false;actor.visible=false;placementUI(true,'Tap a visible ground point, then confirm Place on ground.');}else resetPose();};
$('reset').onclick=resetPose;
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
song.addEventListener('pause',updateTransport);song.addEventListener('play',updateTransport);
let drag=null;
gl.canvas.addEventListener('pointerdown',e=>{if(mode==='camera'&&placing){e.preventDefault();aimManualGround(e.clientX,e.clientY);status('Ground point manually aligned. Confirm Place on ground, or tap another ground point.');return;}if(mode!=='preview')return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};gl.canvas.setPointerCapture(e.pointerId);});
gl.canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;orbit-=(e.clientX-drag.x)*.009;tilt=Math.max(-.25,Math.min(1.1,tilt+(e.clientY-drag.y)*.004));drag.x=e.clientX;drag.y=e.clientY;});
for(const event of ['pointerup','pointercancel','lostpointercapture'])gl.canvas.addEventListener(event,()=>drag=null);

// Optional tracked path retains the accepted reference renderer and local/hit-test
// sequence. DOM overlay controls cancel selection only over actual controls.
for(const el of [$('panel'),$('dock'),$('transport'),...document.querySelectorAll('.top-actions')])el.addEventListener('beforexrselect',e=>e.preventDefault());
async function xrStart(){
 if(starting||session)return;starting=true;++epoch;stop();stopCamera();let requested;
 try{
  requested=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:['local','hit-test','dom-overlay'],domOverlay:{root:$('overlay')}});
  session=requested;session.addEventListener('end',()=>xrEnded(requested),{once:true});await gl.makeXRCompatible();
  session.updateRenderState({baseLayer:new XRWebGLLayer(session,gl)});
  ref=await session.requestReferenceSpace('local');const viewer=await session.requestReferenceSpace('viewer');hit=await session.requestHitTestSource({space:viewer});
  ref.addEventListener?.('reset',()=>{stop();song.pause();placed=false;placing=true;hitMatrix=null;actor.visible=false;placementUI(true,'Tracking reset. Point at the floor and place the base again.');status('Tracking origin changed; choose the ground again before continuing.');});
  session.addEventListener('select',()=>{if(!placing||!freshFloorHit(hitMatrix,viewerY,hitTime,performance.now()))return;stop();mat4.copy(anchor,hitMatrix);pose=[0,0,0];yaw=0;placed=true;placing=false;reticle.visible=false;placementUI(false,'');status('Base placed on the selected ground surface. Walk around it, move along the ground, or change its height upward from the base.');});
  session.addEventListener('visibilitychange',()=>{if(session.visibilityState!=='visible'){song.pause();stop();hitMatrix=null;}});
  setMode('xr');placed=false;placing=true;resetPose();collapse();placementUI(true,'Point at the floor. Find its circle and tap the clear centre to place the base.');
  status('Ground AR: scan the floor below you. Wall hits are excluded. Aim at actual ground, not a tabletop.');last=0;session.requestAnimationFrame(xrFrame);
 }catch(e){if(requested)await requested.end().catch(()=>{});setMode('preview');placed=true;placing=false;resetPose();placementUI(false,'');status('Ground AR could not start: '+e.message+'. Align ground manually is available.');}
 finally{starting=false;}
}
function xrEnded(ended){if(session!==ended)return;stop();song.pause();hit?.cancel();hit=null;session=null;ref=null;hitMatrix=null;reticle.visible=false;setMode('preview');placed=true;placing=false;resetPose();placementUI(false,'');last=0;status('Surface AR ended. Preview and manual camera placement remain available.');}
function xrFrame(t,frame){
 if(!session||frame.session!==session)return;session.requestAnimationFrame(xrFrame);const viewer=frame.getViewerPose(ref);reticle.visible=false;hitMatrix=null;
 if(viewer){
  viewerY=viewer.transform?.position?.y??viewer.views[0].transform.position.y;
  if(placing)for(const result of frame.getHitTestResults(hit)){const p=result.getPose(ref);if(p&&floorHit(p.transform.matrix,viewerY)){hitMatrix=new Float32Array(p.transform.matrix);hitTime=performance.now();reticle.matrix=hitMatrix;reticle.visible=true;break;}}
  const dt=last?Math.max(0,Math.min(.05,(t-last)/1000)):0;last=t;motion(dt,viewer.views[0].transform.inverse.matrix);animate(song.currentTime);
 }else{stop();actor.visible=false;}
 scene.startFrame();scene.drawXRFrame(frame,viewer);scene.endFrame();updateTransport();
}
window.addEventListener('resize',resize);window.addEventListener('blur',stop);
document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();song.pause();held=false;$('hold').setAttribute('aria-pressed','false');$('hold').textContent='Hold form';}});
window.addEventListener('pagehide',()=>{++epoch;stop();song.pause();stopCamera();session?.end().catch(()=>{});});
// Read-only diagnostics for verification. No synthetic camera or tracking is claimed.
Object.defineProperty(window,'WieldedExperience',{value:{get state(){return {build:GROUND_BUILD,ready,mode,placed,placing,playing:!song.paused,time:song.currentTime,formTime,held,size,heightScale,groundPoint:[anchor[12],anchor[13],anchor[14]],baseBottom:modelBounds?.get('base').min[1],pose:[...pose],yaw,parts:parts.size,faces:facePrimitives.size,cameraTracks:stream?.getVideoTracks().filter(t=>t.readyState==='live').length||0,xr:!!session,glError:gl.getError()};}}});
try{
 const response=await fetch('assets/energy.json');if(!response.ok)throw Error('Audio energy data missing');energy=await response.json();
 const geometry=await fetch('assets/machine.gltf');if(!geometry.ok)throw Error('Machine bounds could not load');modelBounds=boundsFromGltf(await geometry.json());
 await Promise.all([machine.waitForComplete(),reticle.waitForComplete()]);collect(machine);
 for(let i=0;i<12;i++){const node=parts.get('face-'+i);if(!node)throw Error('Face geometry missing');facePrimitives.set(i,primitives(node));}
 for(const p of allPrimitives)if(p.uniforms.modelExposure)p.uniforms.modelExposure.value=2**exposure;
 try{xrSupported=!!navigator.xr&&await navigator.xr.isSessionSupported('immersive-ar');}catch{xrSupported=false;}
 ready=true;for(const id of ['camera-start','manual-start','preview','play','restart','seek'])$(id).disabled=false;
 status(xrSupported?'Ready. Place on ground scans for a floor circle. Align ground manually is also available.':'Ready. Ground tracking is unavailable here; Place on ground uses manual alignment with the visible ground.');
 requestAnimationFrame(paint);
}catch(e){status('The machine could not load: '+e.message);$('fatal').hidden=false;$('fatal').textContent='Machine load failed. Keep all files together and serve this folder over HTTP or HTTPS.';}
