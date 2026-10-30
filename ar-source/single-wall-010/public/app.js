import {WallSet,MAX_WALLS} from './wall-set.js';
import {Joystick,horizontalStep,elevationYawStep} from './joystick.js';
import {anchoredWallModel} from './wall-model.js';
import {OverlayControls} from './overlay-controls.js';
import {MAX_VIEWS,MAX_BYTES,SECTORS} from './multi-view.js';
import {maskStatus} from './mask-status.js';
import {Scene} from './vendor/js/render/scenes/scene.js';
import {Renderer,createWebGLContext} from './vendor/js/render/core/renderer.js';
import {Gltf2Node} from './vendor/js/render/nodes/gltf2.js';
import {mat4} from './vendor/js/render/math/gl-matrix.js';
import {Placement} from './placement.js';import {response} from './viewpoint.js';
import {cameraImage,depthSample,sessionOptions} from './capabilities.js';import {viewPolicy as alignment} from './capture-wall.js';
const $=s=>document.querySelector(s),placement=new Placement();
let overlayControls=null,trackingNow=false,joystick=null,poseJoystick=null,lastMotionTime=null,selectionKey='',interactionMessage='';
function stopMotion(){joystick?.stop();poseJoystick?.stop();lastMotionTime=null;}
function selectionUI(){const select=$('#wall-select'),items=wall?.items||[],key=items.map(w=>w.id).join(',');if(key!==selectionKey){select.replaceChildren(...items.map(w=>{const option=document.createElement('option');option.value=w.id;option.textContent='Wall '+w.id;return option;}));selectionKey=key;}select.value=wall?.activeId||'';$('#move-label').textContent=wall?.active?'Move Wall '+wall.activeId:'Place wall to move';$('#copy-count').textContent=items.length+'/'+MAX_WALLS+' walls';$('#movement-status').textContent=interactionMessage|| (wall?.needsRecapture?'Moved snapshot: background alignment changed. Clear photos, then Add photo to recapture here.':'Ground: up = away, right = camera-right. Height / turn: up = raise, right = turn right.');}
const settings={effect:true,radius:1.2,height:2,debug:true};
let gl,scene,renderer,wall,reticle,session=null,ref=null,hitSource=null,binding=null,ready=false,supported=false,starting=false,previewYaw=.25,lastUI=-Infinity,epoch=0;
let captureRequested=false,captureMessage='No views stored — Add view retains each photo',captureRequestCount=0,captureModuleError='';
function showMask(data){const value=maskStatus(data);const node=$('#mask-status');node.textContent=value.text;node.dataset.state=value.kind;diagnostics.mask=value.text;}
let diagnostics={build:'single-wall-010',tracking:'Desktop preview',camera:'No XR session; preview is virtual-only',depth:'No sample; real-depth occlusion not implemented'};
const status=s=>$('#status').textContent=s;
function report(){ $('#diagnostics').textContent=Object.entries(diagnostics).map(([k,v])=>`${k}: ${v}`).join('\n'); }
function buttons(){ $('#start').disabled=$('#basic').disabled=!ready||!supported||starting||!!session; }
function placementUI(){$('#scan').textContent=placement.repositioning?'Cancel reposition':placement.worldMatrix?'Reposition':placement.scanning?'Finish scan':'Scan surface';$('#scan').classList.toggle('can-reposition',!!placement.worldMatrix);$('#scan').setAttribute('aria-pressed',String(placement.repositioning));}
function captureUI(){placementUI();selectionUI(); $('#capture-status').textContent=captureMessage;const count=wall?.views.length||0;$('#view-count').textContent=count+'/'+MAX_VIEWS+' views · '+((wall?.bytes||0)/1048576).toFixed(1)+'/16 MiB';const rows=wall?.plan?.coverage||Array.from({length:SECTORS},(_,sector)=>({sector,covered:false,currentUsable:false}));$('#coverage').replaceChildren(...rows.map(row=>{const span=document.createElement('span');span.textContent='Wall';span.className=row.currentUsable?'usable':row.covered?'recorded':'missing';span.title='Selected wall'+(row.currentUsable?' usable from stored views':row.covered?' recorded; current view not compatible':' needs more capture coverage');return span;}));$('#coverage-label').textContent=(wall?.plan?.recordedSectors||0)+'/1 sampled wall recorded · '+(wall?.plan?.usableSectors||0)+'/1 currently usable';$('#wall-coverage').textContent='Selected wall: '+(rows[0]?.covered?'captured':rows[0]?.recorded?'partial':'not captured');for(const id of ['capture','recapture']){$('#'+id).disabled=false;$('#'+id).setAttribute('aria-busy',String(captureRequested));}diagnostics.captureTaps=captureRequestCount; }
function clearCapture(message='No capture stored'){wall?.clear();captureRequested=false;captureMessage=message;captureUI();}
function reset(){interactionMessage='';stopMotion();wall?.resetAll();trackingNow=false;$('#session-state').textContent=session?'Waiting for tracking — aim at the floor circle.':'Enter AR, then tap the floor circle to place.';showMask({active:!!session,tracking:true,placed:false});placement.reset();if(reticle)reticle.visible=false;$('#scan').textContent='Scan surface';clearCapture();status(session?'Move slowly over a surface, then tap its circle.':'Desktop outline only. Enter AR to place and capture.');}
function setMenu(visible){overlayControls?.show(visible);}
function bindControls(){
  overlayControls=new OverlayControls({onHide:stopMotion});joystick=new Joystick($('#move-stick'));poseJoystick=new Joystick($('#pose-stick'));
  $('#controls-toggle').onclick=()=>{const compact=$('#panel').classList.toggle('compact');$('#controls-toggle').textContent=compact?'More settings':'Less settings';$('#controls-toggle').setAttribute('aria-expanded',String(!compact));};
  $('#wall-select').onchange=e=>{interactionMessage='';stopMotion();captureRequested=false;if(wall?.select(e.target.value)){wall.syncPlacement(placement);settings.radius=wall.active.radius;settings.height=wall.active.height;for(const id of ['radius','height']){$('#'+id).value=settings[id];$('#'+id+'-value').textContent=settings[id].toFixed(1)+' m';}captureUI();status('Selected Wall '+wall.activeId+'; photos kept.');}};
  $('#clone').onclick=()=>{interactionMessage='';stopMotion();captureRequested=false;try{wall.clone();wall.syncPlacement(placement);captureUI();status('Cloned Wall '+wall.activeId+'; photos retained as an image plane. Recapture for background concealment at its new position.');}catch(e){interactionMessage=e.message;status(e.message);selectionUI();}};
  $('#effect').onclick=()=>{settings.effect=!settings.effect;$('#effect').textContent=settings.effect?'Wall on':'Wall off';$('#effect').setAttribute('aria-pressed',String(settings.effect));};
  for(const id of ['radius','height'])$('#'+id).oninput=e=>{settings[id]=Number(e.target.value);$('#'+id+'-value').textContent=settings[id].toFixed(1)+' m';stopMotion();wall?.resize(settings.radius,settings.height);captureRequested=false;captureMessage='Selected wall resized. Add empty-background photos again; other walls kept.';captureUI();};
  $('#debug').onchange=e=>settings.debug=e.target.checked;$('#reset').onclick=reset;
  const request=()=>{interactionMessage='';stopMotion();
    const tap=++captureRequestCount;captureRequested=false;
    if(!session)captureMessage='Capture tap '+tap+' received — enter AR first.';
    else if(!placement.matrix)captureMessage='Capture tap '+tap+' received — tap the surface circle to place the wall first.';
    else if(placement.repositioning)captureMessage='Finish or cancel reposition before Add photo. Existing wall and photos kept.';
    else if(!wall)captureMessage='Capture tap '+tap+' received — capture renderer unavailable: '+captureModuleError;
    else {captureRequested=true;captureMessage='Capture tap '+tap+' received — checking the next current raw camera frame…';}
    status(captureMessage);captureUI();const banner=$('#mask-status');banner.textContent=captureMessage;banner.dataset.state=captureRequested?'requested':'unavailable';
    if(captureRequested)setTimeout(()=>{if(captureRequested&&captureRequestCount===tap){captureRequested=false;captureMessage='Capture tap '+tap+' timed out — no current XR camera frame reached the handler.';captureUI();status(captureMessage);banner.textContent=captureMessage;banner.dataset.state='error';}},2500);
  };
  $('#capture').onclick=request;$('#recapture').onclick=()=>{stopMotion();clearCapture('Selected wall photos cleared; other walls kept. Add photo to recapture here.');status(captureMessage);};
  $('#scan').onclick=()=>{stopMotion();if(!session){status('Reposition requires AR.');return;}captureRequested=false;if(placement.repositioning){placement.cancelReposition();reticle.visible=false;status('Reposition cancelled. Wall and photos kept.');}else if(placement.worldMatrix){placement.beginReposition();status('Aim at a new surface circle and tap to move. Current wall and photos stay until confirmed.');}else{placement.scanning=!placement.scanning;status('Aim at the floor circle, then tap to place.');}placementUI();};
  $('#start').onclick=()=>start(false);$('#basic').onclick=()=>start(true);$('#exit').onclick=()=>session?.end().catch(e=>status('Exit failed: '+e.message));$('#panel').addEventListener('beforexrselect',e=>e.preventDefault());
}
async function init(){
  bindControls();
  // Exact accepted renderer and XR-compatible context; no framework replacement.
  gl=createWebGLContext({xrCompatible:true,alpha:true});if(!gl)throw Error('WebGL unavailable');
  gl.canvas.width=720;gl.canvas.height=360;gl.canvas.setAttribute('aria-label','Generated virtual perspective preview');$('#preview').append(gl.canvas);
  renderer=new Renderer(gl);scene=new Scene();scene.enableStats(false);scene.clear=false;scene.setRenderer(renderer);try{wall=new WallSet(gl);}catch(e){wall=null;captureModuleError=e.message;diagnostics.capture='Capture renderer unavailable: '+e.message;}
  reticle=new Gltf2Node({url:'media/gltf/reticle/reticle.gltf'});reticle.visible=false;scene.addNode(reticle);await reticle.waitForComplete();
  gl.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;buttons();status('Graphics context lost. Reload the experiment after exiting AR.');session?.end().catch(()=>{});});
  gl.canvas.addEventListener('pointermove',e=>{if(e.buttons)previewYaw=(e.offsetX/gl.canvas.clientWidth-.5)*2.8;});
  ready=true;try{supported=!!navigator.xr&&await navigator.xr.isSessionSupported('immersive-ar');}catch(e){diagnostics.xr=e.name;}
  $('#support').textContent=supported?'Immersive AR can be requested. Camera, depth and physical tracking remain unverified.':'Immersive AR unavailable in this browser. The virtual-only preview remains usable.';
  $('#startup').textContent=(wall?'Ready':'Wall renderer unavailable: '+captureModuleError)+' — single-wall-010 — phone verification pending';buttons();reset();report();
  if(/Android/i.test(navigator.userAgent)){const u=new URL(location.href);$('#chrome').href=`intent://${u.host}${u.pathname}${u.search}#Intent;scheme=${u.protocol.slice(0,-1)};package=com.android.chrome;end`;$('#chrome').hidden=false;}
  requestAnimationFrame(preview);
}
function wallMatrix(){return wall?.active?.model||null;}
function preview(){requestAnimationFrame(preview);if(session||starting||!ready)return;const p=mat4.create(),v=mat4.create();mat4.perspective(p,Math.PI/3,2,.05,30);mat4.lookAt(v,[0,.3,3],[0,0,0],[0,1,0]);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,720,360);gl.clearColor(.04,.09,.12,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);wall?.draw({projection:p,view:v,model:mat4.create(),...settings,aligned:false,viewport:{x:0,y:0,width:720,height:360}});}

async function start(basic){
  if(starting||session||!ready)return;starting=true;buttons();const token=++epoch;let requested=null;status('Requesting AR…');
  try{
    requested=await navigator.xr.requestSession('immersive-ar',sessionOptions(!basic&&$('#camera-request').checked,!basic&&$('#depth-request').checked,$('#overlay')));
    if(token!==epoch){await requested.end();return;}session=requested;session.addEventListener('end',()=>ended(requested),{once:true});
    session.addEventListener('visibilitychange',()=>{stopMotion();placement.cancelPending();if(captureRequested)captureMessage='Capture cancelled: session visibility changed';captureRequested=false;reticle.visible=false;diagnostics.tracking=requested.visibilityState;captureUI();report();});
    session.updateRenderState({baseLayer:new XRWebGLLayer(session,gl)});diagnostics.compositor=session.environmentBlendMode||'not reported';const attrs=gl.getContextAttributes();diagnostics.context='alpha='+attrs.alpha+' / premultipliedAlpha='+attrs.premultipliedAlpha;
    const local=await session.requestReferenceSpace('local');if(session!==requested)return;ref=local;
    ref.addEventListener?.('reset',()=>{reset();status('Reference space reset. Place the window again.');});
    const viewer=await session.requestReferenceSpace('viewer');if(session!==requested)return;
    const source=await session.requestHitTestSource({space:viewer});if(session!==requested){source.cancel();return;}hitSource=source;
    try{binding=typeof XRWebGLBinding==='function'?new XRWebGLBinding(session,gl):null;}catch(e){binding=null;diagnostics.binding=e.name;}
    // Accepted select/reticle boundary with current animation-frame hit safeguard.
    session.addEventListener('select',()=>placement.request());reset();document.body.classList.add('xr');setMenu(true);$('#panel').classList.add('compact');$('#controls-toggle').textContent='More settings';$('#controls-toggle').setAttribute('aria-expanded','false');
    diagnostics.features=Array.from(session.enabledFeatures||[]).join(', ')||'No enabledFeatures list: camera gate closed';
    diagnostics.overlay=session.domOverlayState?.type||'Unavailable; use browser/system exit gesture';diagnostics.entry=basic?'Basic AR without camera/depth request':'Optional features requested; availability checked each frame';
    session.requestAnimationFrame(onFrame);
  }catch(e){if(requested&&session===requested)await requested.end().catch(()=>{});status(`AR could not start (${e.name}): ${e.message}. Use AR without camera/depth for an explicit basic entry.`);diagnostics.start=e.name;report();}
  finally{starting=false;buttons();}
}
function ended(s){
  if(s!==session)return;stopMotion();wall?.resetAll();clearCapture();++epoch;try{hitSource?.cancel();}catch{}hitSource=null;session=null;ref=null;binding=null;placement.reset();reticle.visible=false;document.body.classList.remove('xr');setMenu(true);$('#scan').textContent='Scan surface';
  diagnostics={build:'single-wall-010',tracking:'Session ended; fresh placement required on re-entry',camera:'No current camera frame',depth:'No sample; real-depth occlusion not implemented'};status('AR ended. START AR to enter again.');showMask({active:false});buttons();report();captureUI();
}
function onFrame(t,frame){
  const s=frame.session;if(s!==session)return;s.requestAnimationFrame(onFrame);
  const layer=s.renderState.baseLayer;gl.bindFramebuffer(gl.FRAMEBUFFER,layer.framebuffer);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);reticle.visible=false;
  let pose=null;try{if(s.visibilityState==='visible')pose=frame.getViewerPose(ref);}catch(e){diagnostics.pose=e.name;}
  if(!pose){stopMotion();trackingNow=false;$('#session-state').textContent='Tracking paused — hold still; captures kept. Wait for tracking before capture.';showMask({active:true,tracking:false});if(captureRequested){captureMessage='Capture cancelled: no current tracked camera frame';captureUI();}captureRequested=false;placement.cancelPending();diagnostics.tracking='Pose unavailable/paused; effect hidden';diagnostics.camera='No current view; no stale texture reused';diagnostics.depth='No current depth sample';if(t-lastUI>250){report();lastUI=t;}return;}
  trackingNow=true;const motionWorld=mat4.create();mat4.invert(motionWorld,pose.views[0].transform.inverse.matrix);const seconds=lastMotionTime===null?0:(t-lastMotionTime)/1000;lastMotionTime=t;if(wall?.active&&!placement.repositioning){if(joystick.x||joystick.y){const [dx,dz]=horizontalStep(motionWorld,joystick.x,joystick.y,seconds);wall.move(dx,dz);}if(poseJoystick.x||poseJoystick.y){const {dy,yaw}=elevationYawStep(poseJoystick.x,poseJoystick.y,seconds);wall.elevateRotate(dy,yaw);}if(joystick.x||joystick.y||poseJoystick.x||poseJoystick.y)wall.syncPlacement(placement);}$('#session-state').textContent=placement.matrix?'Tracking available — add a clean-background view.':'Aim at the floor circle, then tap to place.';diagnostics.placement=placement.matrix?'Selected single wall anchored in the world':'Not placed — tap a current surface circle';diagnostics.tracking=pose.emulatedPosition?'Emulated viewer position; phone unverified':'Viewer pose available; phone stability unverified';
  let hit=null;
  if(hitSource&&(!placement.worldMatrix||placement.scanning))try{const p=frame.getHitTestResults(hitSource)[0]?.getPose(ref);if(p){hit=new Float32Array(p.transform.matrix);reticle.matrix=hit;reticle.visible=true;}}catch(e){diagnostics.hit=e.name;}
  const replacing=placement.repositioning,previous=placement.matrix?new Float32Array(placement.matrix):null;
  if(placement.resolve(hit,pose.transform.position)){stopMotion();reticle.visible=false;wall?.place(anchoredWallModel(placement.matrix,placement.worldMatrix,settings.radius,settings.height),placement.matrix,placement.worldMatrix,settings.radius,settings.height);status(replacing?'Wall moved; photos retained as an image plane. Clear photos and Add photo for concealment here.':'Single wall placed. Add photo, move the selected wall or Clone.');placementUI();captureUI();}

  // Keep the accepted scene/reticle submission path intact.
  scene.startFrame();scene.drawXRFrame(frame,pose);scene.endFrame();
  let alignmentInfo=null;
  for(const [index,view] of pose.views.entries()){
    const camera=cameraImage(s,view,binding,gl);diagnostics.camera=camera.status;diagnostics.depth=depthSample(s,frame,view);
    if(index===0&&captureRequested){
      captureRequested=false;
      try{if(!wall)throw Error('Capture renderer unavailable');if(pose.views.length!==1)throw Error('Capture supports single-view phone AR only');if(!camera.texture)throw Error(camera.status);if(!placement.matrix)throw Error('Place wall first');
        const shot=wall.capture({texture:camera.texture,width:camera.width,height:camera.height,projection:view.projectionMatrix,viewInverse:view.transform.inverse.matrix,cameraGranted:camera.granted,model:wallMatrix(),radius:settings.radius,wallHeight:settings.height});captureMessage='Added view '+wall.views.length+'/'+MAX_VIEWS+' · '+shot.width+' × '+shot.pixelHeight+' · memory only';
      }catch(e){captureMessage='View not added: '+e.message+' · '+(wall?.views.length||0)+' existing views kept';}status(captureMessage);captureUI();
    }
    const current=mat4.create();mat4.invert(current,view.transform.inverse.matrix);wall?.choose(current,wallMatrix()||mat4.create(),settings.radius,settings.height);alignmentInfo=alignment(wall?.snapshot?.world,current);
    diagnostics.alignment=wall?.snapshot?(alignmentInfo.usable?'Projection enabled':'Invalid pose')+' · moved '+(alignmentInfo.distance*100).toFixed(1)+' cm / rotated '+alignmentInfo.degrees.toFixed(1)+'° (rotation is not a cutoff)'+(alignmentInfo.warning?' · '+alignmentInfo.warning:''):'No capture pose';
    diagnostics.capture=wall?.views.length?wall.views.length+' retained views · primary '+(wall.plan?.primary?.id||'none')+' · '+(wall.bytes/1048576).toFixed(1)+' MiB; nearest compatible capture per pixel':'No stored views';
    try{const draw=wall?.draw({projection:view.projectionMatrix,view:view.transform.inverse.matrix,model:wallMatrix(),...settings,aligned:alignmentInfo.usable,viewport:layer.getViewport(view),currentWorld:current,guideExteriorOnly:true});const code=gl.getError();diagnostics.draw='submitted='+!!draw?.imageSubmitted+' / GL error='+code;showMask({active:true,tracking:true,moduleReady:!!wall,moduleError:captureModuleError,placed:!!placement.matrix,captured:!!wall?.snapshot,effect:settings.effect,camera:!!camera.texture,aligned:alignmentInfo.usable,submitted:!!draw?.imageSubmitted,error:code,warning:alignmentInfo.warning,reason:wall?.views.length&&!draw?.imageSubmitted?'No compatible captured coverage here — add a clean-background view':wall?.snapshot?((alignmentInfo.distance*100).toFixed(1)+' cm / '+alignmentInfo.degrees.toFixed(1)+'°; translation can cause parallax'):camera.status});}catch(e){settings.effect=false;diagnostics.effect='Wall disabled: '+e.message;showMask({active:true,tracking:true,placed:true,captured:true,effect:true,camera:true,aligned:true,error:e.message});}
  }
  diagnostics.visual=!settings.effect?'Wall off: normal camera view':wall?.snapshot?(alignmentInfo?.usable?'Captured image projects onto flat panels; invalid capture UVs stay transparent. '+(alignmentInfo.warning||'Rotation allowed; no new-view reconstruction.'):'Current pose invalid; mask hidden'):'Outline only — no capture image';
  if(t-lastUI>250){report();lastUI=t;captureUI();}
}

window.addEventListener('pagehide',()=>{stopMotion();wall?.resetAll();clearCapture();placement.cancelPending();session?.end().catch(()=>{});});
if(new URLSearchParams(location.search).has('test'))window.__WALL={get state(){return {ready,supported,starting,active:!!session,matrix:placement.matrix?Array.from(placement.matrix):null,world:placement.worldMatrix?Array.from(placement.worldMatrix):null,settings:{...settings},diagnostics:{...diagnostics},captured:!!wall?.views.length,viewCount:wall?.views.length||0,memoryBytes:wall?.bytes||0,wallVersion:wall?.wallVersion||0,wallModel:wallMatrix()?Array.from(wallMatrix()):null,selectedView:wall?.plan?.primary?.id||null,coverage:wall?.plan?.coverage||[],captureRequested,captureMessage,captureRequestCount,captureModuleError,trackingNow,walls:wall?.items.map(w=>({id:w.id,model:Array.from(w.model),photos:w.views.length,radius:w.radius,height:w.height}))||[],activeId:wall?.activeId,poolImages:wall?.pool.size||0,needsRecapture:wall?.needsRecapture,joystick:{x:joystick?.x||0,y:joystick?.y||0},poseJoystick:{x:poseJoystick?.x||0,y:poseJoystick?.y||0},repositioning:placement.repositioning,scanning:placement.scanning,pending:placement.pending,glError:gl?.getError()};},get gl(){return gl;},get wall(){return wall;},reset};
init().catch(e=>{status('Startup failed: '+e.message);$('#startup').textContent='AR code could not initialize: '+e.message;buttons();});
