import * as T from '../bottle-bloom-001/vendor/three.module.js';
import {Placement} from '../ar-colour-vision-001/placement.js';
import {Joystick,horizontalStep,elevationYawStep} from '../ar-colour-vision-001/joystick.js';
import {FontLoader} from './FontLoader.js';
import {TextGeometry} from './TextGeometry.js';
import {cameraImage} from '../ar-colour-vision-001/capabilities.js';
import {makeCameraReader,readCameraFrame} from './xr-camera.js?v=capture-1';
import {WritingEffects} from './writing-effects.js?v=text-colour-1';
import {InvisibleWalls} from './invisible-walls.js';
import {XRCaptureRenderer} from './capture-xr.js';
import {CompositeCapture} from './composite-capture.js';
import {createNarrationController} from './narration-controller.mjs';
import {mapRenderedLines,makeScrollMapping} from './narration-map.mjs';
import {createSitesVoiceTransport,VOICE_SITE_ORIGIN} from './sites-voice-transport.mjs';
const $=id=>document.getElementById(id), status=s=>$('status').textContent=s;
const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local');renderer.localClippingEnabled=true;renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.domElement.className='reader';renderer.domElement.hidden=true;document.body.prepend(renderer.domElement);
const scene=new T.Scene(),camera=new T.PerspectiveCamera(45,1,.01,100);
const root=new T.Group();root.visible=false;scene.add(root);
let W=1.45,H=1.8,textScale=1;const PX=1.8/1280;
const clipTop=new T.Plane(),clipBottom=new T.Plane(),clipPlanes=[clipTop,clipBottom];
const front=new T.MeshBasicMaterial({color:0xffffff,clippingPlanes:clipPlanes}),side=new T.MeshBasicMaterial({color:0x8bb8ad,clippingPlanes:clipPlanes});
const visibleLines=new Map(),letters=new T.Group();root.add(letters);
const track=new T.Mesh(new T.BoxGeometry(.17,H,.06),new T.MeshBasicMaterial({color:0x253e43}));track.position.set(W/2+.13,0,.015);root.add(track);
const knob=new T.Mesh(new T.BoxGeometry(.22,.28,.11),new T.MeshBasicMaterial({color:0xffd638}));knob.position.set(track.position.x,H/2-.14,.07);root.add(knob);
const ring=new T.Mesh(new T.RingGeometry(.045,.065,48),new T.MeshBasicMaterial({color:0x80ffb8,side:T.DoubleSide,depthTest:false}));ring.rotation.x=-Math.PI/2;ring.visible=false;scene.add(ring);
const raycaster=new T.Raycaster(), ray=new T.Ray(),plane=new T.Plane(),point=new T.Vector3(),v=new T.Vector3(),q=new T.Quaternion();
const placement=new Placement(),move=new Joystick($('ar-move')),turn=new Joystick($('ar-pose'));
let session=null,starting=false,ref=null,hitSource=null,hitPose=null,dragSource=null,placed=false,playing=false,scroll=0,maxScroll=0,lines=[],lastTime=null,preview=false,dirty=true,font=null,bold=null,arSupported=false,missingGlyphs=true;
function updateStartAvailability(){$('start').disabled=missingGlyphs||!arSupported||starting||!!session;}
const walls=new InvisibleWalls(scene,{onChange:({message,building,count})=>{status(message);$('wall-message').textContent=message;$('wall-message').hidden=!building;$('wall-cancel').hidden=!building;$('wall-count').textContent=String(count);}});
const envSource=document.createElement('canvas'),envOutput=document.createElement('canvas');envSource.width=envSource.height=envOutput.width=envOutput.height=512;
const envTexture=new T.CanvasTexture(envOutput);envTexture.colorSpace=T.SRGBColorSpace;
let binding=null,envReader=null,envEngine=null,envReady=false,envOn=false,envCurrent=false,lastEnv=0,cameraRequested=false;
let capture=null,captureRenderer=null,captureReader=null,captureCamera=null,captureAction=null,captureRecording=false,captureFinishing=false,captureAborting=false,captureTime=0,captureURL=null;
let captureMessageTimer=null;
function captureMessage(message){const notice=$('capture-status');notice.textContent=message;notice.hidden=false;clearTimeout(captureMessageTimer);captureMessageTimer=setTimeout(()=>{notice.hidden=true;},7000);}
function offerCapture(blob,prefix){
 if(captureURL)URL.revokeObjectURL(captureURL);captureURL=URL.createObjectURL(blob);
 const filename=prefix+'-'+new Date().toISOString().replace(/[:.]/g,'-')+(blob.type.includes('png')?'.png':blob.type.includes('mp4')?'.mp4':'.webm');
 for(const id of ['capture-download','capture-download-setup']){const link=$(id);link.href=captureURL;link.download=filename;link.textContent='Save capture';link.hidden=false;}
 captureMessage('Capture ready. Tap Save capture.');
}
function captureFailure(message){
 if(captureAborting)return;captureAborting=true;
 captureAction=null;captureRecording=false;$('capture-record').textContent='Record video';
 try{const pending=capture?.pending;if(pending){captureFinishing=true;pending.finally(()=>{captureFinishing=false;}).catch(()=>{});}if(capture?.recorder&&capture.recorder.state!=='inactive')try{capture.frame(null,null);}catch{}captureMessage(message);}
 finally{captureAborting=false;}
}
async function finishRecording(){
 if(!capture||!captureRecording)return;
 captureRecording=false;captureFinishing=true;$('capture-record').textContent='Record video';captureMessage('Finishing video…');
 try{offerCapture(await capture.stopRecording(),'mayhem-video');}catch(e){captureMessage(e.message||'Video could not be saved.');}
 finally{captureFinishing=false;}
}
function requestCapture(kind){
 if(!session||!placed){captureMessage('Start AR and place the writing first.');return;}
 if(!cameraRequested){captureMessage($('capture-opt').checked?'This AR session did not grant camera frames for capture.':'Exit AR, enable photo and video capture, then start AR again.');return;}
 if(captureFinishing){captureMessage('Please wait while the video finishes.');return;}
 if(captureRecording){if(kind==='record')finishRecording();else captureMessage('Stop the video before taking a photo.');return;}
 if(captureAction){captureMessage('Waiting for the current camera frame.');return;}
 if(captureURL)for(const id of ['capture-download','capture-download-setup'])$(id).textContent='Save previous capture';
 captureAction=kind;captureMessage('Waiting for the live camera frame…');
}
function captureFrame(view,time){
 if(!captureAction&&!captureRecording)return;
 if(captureRecording&&time-captureTime<66)return;
 if(!view){captureFailure('Camera tracking is unavailable. Capture stopped.');return;}
 try{
  const image=cameraImage(session,view,binding,renderer.getContext());
  if(!image.texture)throw new Error('This AR session did not provide camera frames for capture.');
  captureCamera??=document.createElement('canvas');captureReader??=makeCameraReader(renderer.getContext(),captureCamera,{maxWidth:720});
  readCameraFrame(renderer,captureReader,image);
  captureRenderer??=new XRCaptureRenderer({scene,renderer});
  capture??=new CompositeCapture({canvas:document.createElement('canvas'),cameraCanvas:document.createElement('canvas'),onEnded:()=>captureFailure('Video capture stopped because the camera frame was lost.')});
  capture.frame(captureCamera,captureRenderer.render(view,captureCamera.width,captureCamera.height));captureTime=time;
  const action=captureAction;captureAction=null;
  if(action==='photo')capture.snapshot().then(blob=>offerCapture(blob,'mayhem-photo')).catch(e=>captureMessage(e.message||'Photo capture failed.'));
  if(action==='record'){capture.startRecording({frameRate:15});captureRecording=true;$('capture-record').textContent='Stop recording';captureMessage('Recording video. Tap Stop recording when finished.');}
 }catch(e){captureFailure(e.message||'Camera capture is unavailable.');}
}
function endCapture(){
 captureAction=null;const oldCapture=capture,oldRenderer=captureRenderer,oldReader=captureReader;
 if(captureRecording)finishRecording().finally(()=>oldCapture?.dispose());else oldCapture?.dispose();
 oldRenderer?.dispose();oldReader?.dispose();capture=null;captureRenderer=null;captureReader=null;captureCamera=null;captureTime=0;captureRecording=false;$('capture-record').textContent='Record video';
}
let writingEffect=null,writingOn=false,lastWriting=0;
const sideShade=new T.Color(0x8bb8ad);
function applyTextColour(){
 const chosen=new T.Color($('text-colour').value);
 if(writingEffect?.enabled){front.color.set(0xffffff);side.color.set(0xffffff);}
 else{front.color.copy(chosen);side.color.copy(chosen).multiply(sideShade);}
 dirty=true;
}
// Voice credentials stay on the owner's authenticated backend, never here.
const voiceConfig=globalThis.MAYHEM_NARRATION_CONFIG||{endpoint:VOICE_SITE_ORIGIN+'/tts',authMode:'sites-popup'};
let voiceTransport=null,voicePreparing=false,voicePreparationGeneration=0,voicePreparationError='';
let narration=null,narrationMap=null,narrationText='',voiceMode=false,voiceIntent=0;
const voiceEnabled=()=>!!(narration&&voiceMode);
function rebuildNarrationMap(){
 narrationMap=null;
 if(!narration||!lines.length)return;
 try{narrationMap=makeScrollMapping(mapRenderedLines($('post').value,lines),maxScroll,90*textScale);}
 catch{narration.stop();$('narration-status').textContent='Voice cannot be synchronized with this writing.';}
}
function voiceStatus(state){
 if(state.phase==='ended'||state.phase==='error'||state.phase==='idle'){voiceMode=false;voiceIntent++;}
 const button=$('narration-prepare');button.disabled=voicePreparing||state.phase==='loading';
 const messages={idle:'Preparing voice sends this writing to ElevenLabs for narration.',loading:'Preparing Old Trucker Girl voice…',ready:'Voice ready: Old Trucker Girl has prepared your writing and checked its timing.',playing:'Voice is playing.',paused:'Voice is paused.',ended:'Voice has finished.',error:state.error||'Voice could not be prepared.'};
 $('narration-status').textContent=messages[state.phase]||'';
 if(state.phase==='error'&&(session||preview)){status(messages.error);captureMessage(messages.error);}
}
if(voiceConfig?.endpoint&&(voiceConfig.authMode==='sites-popup'||typeof voiceConfig.getAccessToken==='function')){
 narration=createNarrationController({endpoint:voiceConfig.endpoint,getAccessToken:voiceConfig.getAccessToken,authMode:voiceConfig.authMode||'bearer',
  fetchImpl:voiceConfig.authMode==='sites-popup'?(url,options)=>{if(!voiceTransport)throw new Error('Connect the voice service first.');return voiceTransport.request(url,options);}:globalThis.fetch,audio:new Audio(),
  scrollForCharacter:offset=>offset>=narrationText.length?maxScroll:(narrationMap?.scrollForCharacter(offset)??0),
  characterForScroll:position=>position>=maxScroll?narrationText.length:(narrationMap?.characterForScroll(position)??0),
  onScroll:setScroll,onState:voiceStatus});
 $('narration-setup').hidden=false;
 $('writing-privacy').textContent='Paste or replace your writing before starting AR. If you prepare narration, your writing is sent to ElevenLabs to generate the voice.';
 $('narration-prepare').onclick=async()=>{
  if(voicePreparing)return;
  if(!narrationMap){voicePreparationError='Writing is still loading or cannot be synchronized.';$('narration-status').textContent=voicePreparationError;return;}
  const text=$('post').value,preparation=++voicePreparationGeneration;playing=false;voicePreparationError='';voicePreparing=true;$('narration-prepare').disabled=true;let openedTransport=null;
  try{
   if(voiceConfig.authMode==='sites-popup'){
    openedTransport=createSitesVoiceTransport();voiceTransport=openedTransport;
    const connecting=openedTransport.connect(); // Open synchronously from this click.
    $('narration-status').textContent='Connect to your private voice service, then return here.';
    await connecting;
   }
   if(preparation!==voicePreparationGeneration)return;
   if(text!==$('post').value)throw new Error('The writing changed. Prepare the voice again.');
   narrationText=text;
   if(await narration.prepare(text)){narration.setSpeed(voiceSpeed());seekVoice();$('narration-status').textContent='Voice ready: Old Trucker Girl has prepared your writing and checked its timing.';}
  }catch(e){if(preparation===voicePreparationGeneration){voicePreparationError=e?.message||'The voice could not be prepared.';$('narration-status').textContent=voicePreparationError;}}
  finally{openedTransport?.close();if(voiceTransport===openedTransport)voiceTransport=null;voicePreparing=false;$('narration-prepare').disabled=false;}
 };
}
function stopVoice(){voiceMode=false;voiceIntent++;voicePreparationGeneration++;voicePreparationError='';voiceTransport?.close();voiceTransport=null;narration?.stop();narrationText='';}
function seekVoice(){voiceMode=false;voiceIntent++;if(narration?.getState().ready)narration.seekScroll(scroll);}
function voiceSpeed(){return [.6,.8,1,1.3,1.6,1.8,2,2][Number($('speed').value)-1]??.8;}
function updateWriting(time,changed){
 if(!writingOn||!writingEffect||(!session&&!preview))return;
 if(!changed&&time-lastWriting<100)return;
 try{const items=[];for(const [i,mesh] of visibleLines){const line=lines[i];items.push({text:line.text,font:line.heading?bold:font,size:(line.heading?76:64)*PX*textScale,x:mesh.position.x,y:mesh.position.y});}writingEffect.update(items,visibleLines.values(),W,H,$('text-colour').value);lastWriting=time;}
 catch(e){writingOn=false;writingEffect.setEnabled(false);applyTextColour();status('Writing effects failed; plain 3D writing restored.');}
}
function envMessage(s){if($('environment').textContent!==s)$('environment').textContent=s;}
function clearEnvironment(){scene.background=null;envCurrent=false;$('env-settings').disabled=true;$('env-off').disabled=!envOn;}
function updateEnvironment(time,view){
 if(!cameraRequested){clearEnvironment();envMessage('Environment effects are off. Enable optional camera access before starting AR to use them.');return;}
 const camera=cameraImage(session,view,binding,renderer.getContext());
 if(!camera.texture){clearEnvironment();envMessage(camera.status+'. Surroundings are unaltered.');return;}
 $('env-settings').disabled=false;
 if(!envOn){scene.background=null;envMessage('Live XR camera available. Environment effects are off.');return;}
 if(!envReady){scene.background=null;envMessage('Loading environment effects. Surroundings are unaltered.');return;}
 if(time-lastEnv<100&&envCurrent)return;
 try{envReader??=makeCameraReader(renderer.getContext(),envSource);readCameraFrame(renderer,envReader,camera);if(envOutput.width!==envSource.width||envOutput.height!==envSource.height){envOutput.width=envSource.width;envOutput.height=envSource.height;}envEngine.render();envEngine.composite(envOutput);envTexture.needsUpdate=true;scene.background=envTexture;envCurrent=true;lastEnv=time;envMessage('Environment effects use the current live XR camera frame. Alignment needs phone verification.');}
 catch(e){clearEnvironment();envMessage('XR camera processing failed ('+e.message+'). Surroundings are unaltered.');}
}
function layout(){
 if(!font||!bold)return;
 for(const mesh of visibleLines.values()){letters.remove(mesh);mesh.geometry.dispose();}visibleLines.clear();
 const blocks=$('post').value.replace(/\r\n?/g,'\n').split(/\n\s*\n/);lines=[];let y=90*textScale;
 const missing=[...new Set([...$('post').value].filter(c=>!/[\s]/u.test(c)&&(!font.data.glyphs[c]||!bold.data.glyphs[c])))];
 missingGlyphs=missing.length>0;$('preview').disabled=missingGlyphs;updateStartAvailability();
 if(missing.length)$('support').textContent='This 3D font does not contain: '+missing.join(' ')+' . Replace these characters before starting.';
 else $('support').textContent=arSupported?'Writing checked: all characters can be displayed in 3D. AR is available.':'Writing checked: all characters can be displayed in 3D. Immersive AR is unavailable on this device; 3D preview is available.';
 for(const block of blocks){const raw=block.trim();if(!raw){y+=42*textScale;continue;}let heading=/^\*\*[^\n]+\*\*$/.test(raw)||/^#{1,3}\s/.test(raw)||(!raw.includes('\n')&&raw.length<65&&!/[.!?]$/.test(raw));let text=raw.replace(/^\*\*|\*\*$/g,'').replace(/^#{1,3}\s/,'');const f=heading?bold:font,size=(heading?76:64)*PX*textScale;
 const width=s=>[...s].reduce((n,c)=>n+(f.data.glyphs[c]?.ha||0)*size/f.data.resolution,0);
 for(const paragraph of text.split('\n')){let current='';const emit=()=>{if(current){lines.push({text:current,y,heading});y+=(heading?100:90)*textScale;current='';}};for(const word of paragraph.split(/\s+/)){if(!word)continue;let candidate=current?current+' '+word:word;if(width(candidate)>W-.18){emit();for(const char of word){if(width(current+char)>W-.18)emit();current+=char;}}else current=candidate;}if(current)emit();else if(!paragraph.trim())y+=55*textScale;}y+=(heading?38:62)*textScale;
 }maxScroll=Math.max(0,y-H/PX+90*textScale);scroll=Math.max(0,Math.min(scroll,maxScroll));dirty=true;rebuildNarrationMap();
}
function draw(){
 root.updateMatrixWorld(true);clipTop.set(new T.Vector3(0,-1,0),H/2).applyMatrix4(root.matrixWorld);clipBottom.set(new T.Vector3(0,1,0),H/2).applyMatrix4(root.matrixWorld);
 const wanted=new Set();for(let i=0;i<lines.length;i++){const line=lines[i],y=line.y-scroll;if(y< -130*textScale||y>H/PX+130*textScale)continue;wanted.add(i);let mesh=visibleLines.get(i);if(!mesh){const geometry=new TextGeometry(line.text,{font:line.heading?bold:font,size:(line.heading?76:64)*PX*textScale,depth:.025,curveSegments:3,bevelEnabled:false});mesh=new T.Mesh(geometry,[front,side]);letters.add(mesh);visibleLines.set(i,mesh);}mesh.position.set(-W/2+.09,H/2-(y+70*textScale)*PX,0);}
 for(const [i,mesh] of visibleLines)if(!wanted.has(i)){letters.remove(mesh);mesh.geometry.dispose();visibleLines.delete(i);}
 knob.position.y=H/2-.14-(maxScroll?scroll/maxScroll:0)*(H-.28);
 dirty=false;
}
function setScroll(n){scroll=Math.max(0,Math.min(maxScroll,n));dirty=true;}
function resize(){if(session)return;const w=Math.min(innerWidth,900),h=Math.max(300,innerHeight*.6);renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
function rayFor(source,frame){let p;try{p=frame.getPose(source.targetRaySpace,ref);}catch{}if(!p)return false;const m=new T.Matrix4().fromArray(p.transform.matrix);ray.origin.setFromMatrixPosition(m);ray.direction.set(0,0,-1).transformDirection(m);return true;}
function dragAtRay(){root.updateMatrixWorld(true);v.set(0,0,1).transformDirection(root.matrixWorld);root.getWorldPosition(point);plane.setFromNormalAndCoplanarPoint(v,point);if(!ray.intersectPlane(plane,point))return;root.worldToLocal(point);setScroll(((H/2-.14-point.y)/(H-.28))*maxScroll);seekVoice();}
function rayHitsKnob(){if(!knob.visible)return false;raycaster.ray.copy(ray);return raycaster.intersectObject(knob,false).length>0;}
function place(){const m=placement.matrix,world=placement.worldMatrix;root.position.set(world[12],world[13]+1,world[14]);root.rotation.set(0,Math.atan2(m[8],m[10]),0);root.visible=true;placed=true;dirty=true;ring.visible=false;status('Placed. Grab the yellow handle to scroll.');}
function loop(time,frame){let dt=lastTime===null?0:Math.min((time-lastTime)/1000,.1);lastTime=time;let captureView=null;
 if(session&&frame){if(!ref)return;let pose=null;try{pose=frame.getViewerPose(ref);}catch{}captureView=pose?.views[0]||null;hitPose=null;if(pose&&(!placed||walls.building)&&hitSource){try{const h=frame.getHitTestResults(hitSource)[0];hitPose=h?.getPose(ref)||null;}catch{}ring.visible=!!hitPose;if(hitPose)ring.position.set(hitPose.transform.matrix[12],hitPose.transform.matrix[13],hitPose.transform.matrix[14]);}else if(walls.building)ring.visible=false;
 if(!placed&&pose&&placement.resolve(hitPose?.transform.matrix,pose.transform.position,true))place();
 if(dragSource&&rayFor(dragSource,frame))dragAtRay();
 if(placed&&pose&&(move.x||move.y||turn.x||turn.y)){const [x,z]=horizontalStep(pose.transform.matrix,move.x,move.y,dt),step=elevationYawStep(turn.x,turn.y,dt);root.position.x+=x;root.position.z+=z;root.position.y+=step.dy;root.rotation.y+=step.yaw;dirty=true;}
 }
 if(playing&&placed){setScroll(scroll+dt*scrollSpeed());if(scroll>=maxScroll)playing=false;}
 if(voiceEnabled()&&placed)narration.tick();
 const changed=dirty;if(dirty)draw();updateWriting(time,changed);if(session)captureFrame(captureView,time);renderer.render(scene,camera);
}
function startPreview(){if(session)return;preview=true;if(writingOn&&writingEffect)writingEffect.engine.begin(writingEffect.source);layout();renderer.domElement.hidden=false;resize();scene.background=new T.Color('#203333');root.position.set(0,.2,0);root.rotation.set(0,0,0);root.visible=true;placed=true;camera.position.set(0,.2,3.4);camera.lookAt(0,.2,0);$('controls').hidden=false;$('menu').hidden=false;$('ar-sticks').hidden=false;$('playback-bar').hidden=false;status('Virtual preview. Drag the yellow handle.');}
async function startAR(){if(session||starting)return;starting=true;$('start').disabled=true;let stage='requesting an AR session',s;layout();$('start').disabled=true;try{
 cameraRequested=$('capture-opt').checked;try{s=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:['local','hit-test','dom-overlay'],optionalFeatures:cameraRequested?['anchors','camera-access']:['anchors'],domOverlay:{root:$('overlay')}});}catch(e){if(!cameraRequested||!['NotSupportedError','NotAllowedError'].includes(e.name))throw e;cameraRequested=false;s=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:['local','hit-test','dom-overlay'],optionalFeatures:['anchors'],domOverlay:{root:$('overlay')}});}session=s;placement.reset();s.addEventListener('end',()=>{if(session!==s)return;const endedDuringStartup=starting;endAR();if(endedDuringStartup)$('support').textContent='AR session ended while '+stage+'. Try again and check camera/AR permissions.';},{once:true});s.addEventListener('selectstart',e=>{if(walls.building){let floor=hitPose;try{floor=e.frame.getHitTestResults(hitSource)[0]?.getPose(ref)||floor;}catch{}const m=floor?.transform.matrix;walls.select(m?{x:m[12],y:m[13],z:m[14]}:null,{height:Number($('wall-height').value),door:$('wall-door').checked?{width:Number($('door-width').value),height:Number($('door-height').value)}:null});if(!walls.building)ring.visible=false;return;}if(placed&&rayFor(e.inputSource,e.frame)&&rayHitsKnob()){playing=false;dragSource=e.inputSource;dragAtRay();}else if(!placed)placement.request();else closeEffects();});s.addEventListener('selectend',e=>{if(dragSource===e.inputSource)dragSource=null;});
 stage='initializing the AR renderer';await renderer.xr.setSession(s);if(session!==s)return;if(writingOn&&writingEffect)writingEffect.engine.begin(writingEffect.source);try{binding=new XRWebGLBinding(s,renderer.getContext());}catch{binding=null;}ref=renderer.xr.getReferenceSpace();stage='initializing surface tracking';const viewer=await s.requestReferenceSpace('viewer');if(session!==s)return;hitSource=await s.requestHitTestSource({space:viewer});if(session!==s){hitSource?.cancel();hitSource=null;return;}ref.addEventListener?.('reset',()=>{walls.end();if(voiceEnabled())narration.pause();voiceMode=false;voiceIntent++;placement.reset();placed=false;root.visible=false;status('Tracking origin reset. Place again.');});renderer.domElement.hidden=false;scene.background=null;renderer.setClearColor(0,0);root.visible=false;placed=false;preview=false;document.documentElement.classList.add('xr');$('menu').hidden=false;$('controls').hidden=false;$('ar-sticks').hidden=false;$('playback-bar').hidden=false;status('Move slowly, aim at the floor ring, then tap to place.');
 }catch(e){if(s&&session===s)await s.end().catch(()=>{});session=null;$('support').textContent='AR could not start while '+stage+' ('+(e.name||'Error')+'): '+(e.message||'unknown error')+'.';}finally{starting=false;updateStartAvailability();}}
function endAR(){endCapture();walls.end();seekVoice();try{hitSource?.cancel();}catch{}hitSource=null;ref=null;session=null;binding=null;envReader?.dispose();envReader=null;envOn=false;envEngine?.suspend();writingEffect?.engine.suspend();envEngine=null;envReady=false;$('effect-frame').removeAttribute('src');$('effect-panel').hidden=true;clearEnvironment();envMessage('No XR session. Surroundings are unaltered.');dragSource=null;playing=false;placed=false;move.stop();turn.stop();root.visible=false;ring.visible=false;document.documentElement.classList.remove('xr');$('menu').hidden=true;$('controls').hidden=true;$('ar-sticks').hidden=true;$('playback-bar').hidden=true;renderer.domElement.hidden=true;lastTime=null;updateStartAvailability();}
$('overlay').addEventListener('beforexrselect',e=>e.preventDefault());$('start').onclick=startAR;$('preview').onclick=startPreview;$('post').addEventListener('input',()=>{stopVoice();layout();});
$('paste-post').addEventListener('click',async()=>{
 const post=$('post'),message=$('paste-status');
 try{
  if(!navigator.clipboard?.readText)throw new Error('Clipboard unavailable');
  const value=await navigator.clipboard.readText();
  if(!value){message.textContent='The clipboard is empty. Copy your post first, then tap Paste.';return;}
  post.value=value;post.dispatchEvent(new Event('input',{bubbles:true}));message.textContent='Pasted. You can edit the writing before starting AR.';
 }catch{
  post.focus();post.select();message.textContent='Press and hold in the writing box, then choose Paste. The sample text is selected for replacement.';
 }
});
function closeEffects(){if($('effect-panel').hidden)return;$('effect-panel').hidden=true;$('controls').hidden=false;}
$('capture-photo').onclick=()=>requestCapture('photo');
$('capture-record').onclick=()=>requestCapture('record');
$('wall-add').onclick=()=>{if(!session||!placed){status('Place the writing in AR before adding a wall.');return;}dragSource=null;walls.start();};
$('wall-cancel').onclick=()=>{walls.cancel();ring.visible=false;};
$('wall-undo').onclick=()=>walls.undo();
$('wall-clear').onclick=()=>{walls.clear();ring.visible=false;};
$('wall-guides').onchange=()=>walls.setGuides($('wall-guides').checked);
$('menu').onclick=()=>{if(!$('effect-panel').hidden)closeEffects();else $('controls').hidden=!$('controls').hidden;};
$('play').onclick=()=>{voiceMode=false;voiceIntent++;narration?.pause();if(scroll>=maxScroll)setScroll(0);playing=true;};
$('play-voice').onclick=async()=>{
 if(!placed){captureMessage('Place the writing before playing voice.');return;}
 if(!narration?.getState().ready){const state=narration?.getState();captureMessage(voicePreparing||state?.phase==='loading'?$('narration-status').textContent:(state?.error||voicePreparationError||'Prepare Old Trucker Girl voice in the setup screen.'));return;}
 playing=false;if(scroll>=maxScroll){setScroll(0);narration.restart();}else narration.seekScroll(scroll);
 const intent=++voiceIntent;voiceMode=true;try{if(!await narration.play()&&intent===voiceIntent)voiceMode=false;}catch{if(intent===voiceIntent){voiceMode=false;captureMessage('Voice playback could not start.');}}
};
$('pause').onclick=()=>{playing=false;voiceMode=false;voiceIntent++;narration?.pause();};
$('restart').onclick=()=>{playing=false;voiceMode=false;voiceIntent++;setScroll(0);narration?.restart();};
const speedValues=[10,22,40,65,95,150,225,350],speedLabels=['Very slow','Slow','Medium','Fast','Very fast','Faster','Much faster','Fastest'];
function scrollSpeed(){return speedValues[Number($('speed').value)-1]??22;}
$('speed').addEventListener('input',()=>{$('speed-value').textContent=speedLabels[Number($('speed').value)-1]??'Slow';if(narration)narration.setSpeed(voiceSpeed());});
$('show-scrollbar').addEventListener('change',()=>{const visible=$('show-scrollbar').checked;track.visible=visible;knob.visible=visible;if(!visible){dragSource=null;if(pointer!==null){const id=pointer;pointer=null;if(renderer.domElement.hasPointerCapture(id))renderer.domElement.releasePointerCapture(id);}}});
$('letter-size').addEventListener('input',()=>{textScale=Number($('letter-size').value);$('letter-size-value').textContent=Math.round(textScale*100)+'%';layout();});
$('text-colour').addEventListener('input',applyTextColour);
function plainWriting(){writingOn=false;writingEffect?.setEnabled(false);applyTextColour();writingEffect?.engine.suspend();if(!$('writing-frame').hidden)closeEffects();status('Plain 3D writing is active.');}
$('plain').onclick=plainWriting;$('writing-plain').onclick=plainWriting;
$('writing').onclick=()=>{const resume=!writingOn;writingOn=true;$('controls').hidden=true;$('effect-target').textContent='Writing';$('effect-panel').hidden=false;$('effect-frame').hidden=true;$('writing-frame').hidden=false;if(!writingEffect)$('writing-frame').src='writing-effects.html?v=writing-align-1';else{if(resume)writingEffect.engine.begin(writingEffect.source);writingEffect.engine.showControls();writingEffect.setEnabled(true);applyTextColour();}};
$('writing-frame').onload=()=>{if(!writingOn||writingEffect)return;try{const engine=$('writing-frame').contentWindow.ARColourEngine;writingEffect=new WritingEffects(engine,root,front,side);writingEffect.setEnabled(true);applyTextColour();lastWriting=0;dirty=true;}catch(e){writingOn=false;writingEffect?.setEnabled(false);applyTextColour();status('Writing effects could not load; plain 3D writing is active.');}};
$('env-settings').onclick=()=>{const resume=!envOn;envOn=true;$('env-off').disabled=false;$('controls').hidden=true;$('effect-target').textContent='Environment';$('effect-panel').hidden=false;$('writing-frame').hidden=true;$('effect-frame').hidden=false;if(!envReady)$('effect-frame').src='effects.html?v=extreme-2';else{if(resume)envEngine.begin(envSource);envEngine.showControls();}};
$('env-off').onclick=()=>{envOn=false;envCurrent=false;envEngine?.suspend();scene.background=null;$('env-off').disabled=true;envMessage('Environment effects are off.');};
$('close-effects').onclick=closeEffects;
$('effect-frame').onload=()=>{if(!envOn)return;try{envEngine=$('effect-frame').contentWindow.ARColourEngine;envEngine.begin(envSource);envReady=true;}catch(e){envOn=false;clearEnvironment();envMessage('Environment effects could not load. Surroundings are unaltered.');}};
for(const id of ['width','height'])$(id).addEventListener('input',()=>{W=Number($('width').value);H=Number($('height').value);$('width-value').textContent=W.toFixed(2)+' m';$('height-value').textContent=H.toFixed(2)+' m';track.position.x=W/2+.13;track.scale.y=H/1.8;knob.position.x=track.position.x;layout();});
$('reset').onclick=()=>{if(walls.building)walls.cancel();ring.visible=false;playing=false;voiceMode=false;voiceIntent++;setScroll(0);narration?.restart();if(session){placement.reset();root.visible=false;placed=false;status('Aim at a floor surface and tap to place again.');}};
$('exit').onclick=()=>{if(session)session.end();else{stopVoice();preview=false;placed=false;playing=false;writingEffect?.engine.suspend();move.stop();turn.stop();root.visible=false;renderer.domElement.hidden=true;$('controls').hidden=true;$('menu').hidden=true;$('ar-sticks').hidden=true;$('playback-bar').hidden=true;}};
let pointer=null;renderer.domElement.addEventListener('pointerdown',e=>{if(!preview)return;const b=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new T.Vector2((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1),camera);ray.copy(raycaster.ray);if(rayHitsKnob()){playing=false;pointer=e.pointerId;renderer.domElement.setPointerCapture(pointer);dragAtRay();}});renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;const b=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new T.Vector2((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1),camera);ray.copy(raycaster.ray);dragAtRay();});for(const event of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(event,()=>pointer=null);
if(new URLSearchParams(location.search).has('qa'))window.__readerQA={tick:time=>loop(time),state(){root.updateMatrixWorld(true);camera.updateMatrixWorld(true);const p=knob.getWorldPosition(new T.Vector3()).project(camera),b=renderer.domElement.getBoundingClientRect();return {scroll,maxScroll,playing,speed:scrollSpeed(),writingOn,writingReady:!!writingEffect,envOn,letterMeshes:visibleLines.size,matrix:root.matrixWorld.toArray(),knob:{x:b.left+(p.x+1)*b.width/2,y:b.top+(1-p.y)*b.height/2},height:b.height,width:W,readingHeight:H};}};
window.addEventListener('resize',resize);Promise.all([new FontLoader().loadAsync('./font.json'),new FontLoader().loadAsync('./font-bold.json'),navigator.xr?.isSessionSupported('immersive-ar').catch(()=>false)??false]).then(([a,b,supported])=>{font=a;bold=b;arSupported=supported;layout();renderer.setAnimationLoop(loop);}).catch(e=>{$('support').textContent='3D lettering could not load: '+e.message;});
