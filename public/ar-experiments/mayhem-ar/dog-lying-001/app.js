import {Scene} from '../ar-colour-vision-001/vendor/js/render/scenes/scene.js';
import {Renderer,createWebGLContext} from '../ar-colour-vision-001/vendor/js/render/core/renderer.js';
import {Gltf2Node} from '../ar-colour-vision-001/vendor/js/render/nodes/gltf2.js';
import {mat4} from '../ar-colour-vision-001/vendor/js/render/math/gl-matrix.js';
import {TablePlacement,makeHandTarget} from './placement.js?v=controls2';
import {DogAppearance} from './appearance.js';
import {ModelExposure} from './exposure.js';
import {GroundFollower,groundSample} from './ground.js';
import {InvisibleWalls} from './walls.js';
import {PointRoute} from './routes.js?v=controls3';
import {Node} from '../ar-colour-vision-001/vendor/js/render/core/node.js';
// Enable walking only when the animated walking model is bound to these controls.
const walkingReady=false;
const $=s=>document.querySelector(s),placement=new TablePlacement();let gl,scene,renderer,dog,dogRoot,reticle,session=null,ref=null,source=null,ready=false,supported=false,starting=false,epoch=0,previewYaw=.24;
const status=s=>$('#status').textContent=s;let lift=0,handYaw=0;let turn=0,turnPointer=null,move={x:0,y:0},movePointer=null,lastFrame=null;let selectionPending=false,handPreview=null,appearance,exposure,ground,walls,navigation,routeWalking;
function stopSpin(){turn=0;lift=0;turnPointer=null;$('#turn-knob').style.transform='';$('#turn-stick').setAttribute('aria-valuenow','0');}
function stopMove(){move={x:0,y:0};movePointer=null;$('#move-knob').style.transform='';}
function stopTurn(){stopSpin();stopMove();}
const handMode=()=>$('#placement-mode').value==='hand';
function cancelSelection(){selectionPending=false;placement.cancelPending();}
function setHeight(cm){cm=Math.max(-50,Math.min(150,Number(cm)||0));$('#hand-height').value=cm;$('#hand-height-value').textContent=(cm>0?'+':'')+Number(cm.toFixed(1))+' cm';placement.setHeightOffset(cm/100);}
function controls(){
 const hand=handMode(),placing=!placement.point||placement.repositioning,placed=!!session&&!!placement.point;
 $('#start').disabled=!ready||!supported||starting||!!session;$('#exit').disabled=!session;$('#walk-stop').disabled=!session;
 for(const id of ['reposition','left','right'])$('#'+id).disabled=!placed||placement.repositioning;
 $('#move-stick').setAttribute('aria-disabled',String(!walkingReady||!placed||placement.repositioning));
 $('#turn-stick').setAttribute('aria-disabled',String(!session||(!placed&&!hand)||(placement.repositioning&&!hand)));
 $('#cancel').hidden=!placement.repositioning;$('#place-hand').hidden=!hand||!session||!placing;$('#place-hand').disabled=!handPreview;
 $('#hand-distance-wrap').hidden=!hand;$('#hand-distance').disabled=hand&&!placing;$('#hand-height').disabled=!session;$('#lower-dog').disabled=!session;$('#raise-dog').disabled=!session;$('#ground-mode-hint').hidden=!hand;
 for(const id of ['ground-scan','route-add','wall-add'])$('#'+id).disabled=!session||hand;
 for(const input of document.querySelectorAll('[data-follow-slopes]'))input.disabled=hand;
 $('#move-label').textContent=walkingReady?(hand?'1 · Walk':'1 · Walk on surface'):'1 · Walk · model pending';
}
function reset(){stopTurn();cancelSelection();lastFrame=null;handPreview=null;handYaw=0;navigation?.end();walls?.end();ground?.end();placement.reset();setHeight(0);if(session&&ref&&!handMode())ground?.start(session,ref);if(reticle)reticle.visible=false;if(dogRoot)dogRoot.visible=false;controls();}
function ended(s){if(s!==session)return;++epoch;source?.cancel();source=null;session=null;ref=null;reset();document.body.classList.remove('xr');status('AR ended. Start again for a fresh surface placement.');}
async function start(){if(starting||session||!ready)return;starting=true;controls();const token=++epoch;let requested;try{
 requested=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:['local','hit-test'],optionalFeatures:['dom-overlay'],domOverlay:{root:$('#overlay')}});if(token!==epoch){await requested.end();return;}session=requested;requested.addEventListener('end',()=>ended(requested),{once:true});requested.addEventListener('visibilitychange',()=>{stopTurn();lastFrame=null;cancelSelection();reticle.visible=false;});
 requested.updateRenderState({baseLayer:new XRWebGLLayer(requested,gl)});ref=await requested.requestReferenceSpace('local');if(session!==requested)return;ref.addEventListener?.('reset',()=>{reset();status('Tracking origin changed. Select the surface again.');});const viewer=await requested.requestReferenceSpace('viewer');if(session!==requested)return;const hitSource=await requested.requestHitTestSource({space:viewer});if(session!==requested){hitSource.cancel();return;}source=hitSource;
 requested.addEventListener('select',()=>{selectionPending=true;});reset();document.body.classList.add('xr');status('Move slowly over the surface. Tap its green circle to place your dog.');requested.requestAnimationFrame(frame);
 }catch(e){if(requested&&session===requested)await requested.end().catch(()=>{});status('AR could not start ('+e.name+'). Check browser support and camera permission, then retry.');}finally{starting=false;controls();}}
function cameraMatrix(pose){if(pose.transform?.matrix)return pose.transform.matrix;const v=pose.views[0]?.transform?.inverse?.matrix;return v?mat4.invert(mat4.create(),v):null;}
function surfaceHit(f){if(!source)return null;try{for(const r of f.getHitTestResults(source)){const m=r.getPose(ref)?.transform.matrix;if(groundSample(m))return new Float32Array(m);}}catch{}return null;}
function frame(time,f){
 const active=f.session;if(active!==session)return;active.requestAnimationFrame(frame);const dt=lastFrame===null?0:Math.min(.05,Math.max(0,(time-lastFrame)/1000));lastFrame=time;
 const layer=active.renderState.baseLayer;gl.bindFramebuffer(gl.FRAMEBUFFER,layer.framebuffer);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);reticle.visible=false;
 let pose=null;try{if(active.visibilityState==='visible')pose=f.getViewerPose(ref);}catch{}
 if(!pose){stopTurn();cancelSelection();navigation.pause();handPreview=null;dogRoot.visible=false;lastFrame=null;status('Tracking paused. Move slowly to recover; placement is retained.');controls();return;}
 const hand=handMode(),placing=!placement.point||placement.repositioning,camera=cameraMatrix(pose),floor=hand?null:surfaceHit(f),hit=hand&&placing?makeHandTarget(camera,Number($('#hand-distance').value)/100):floor;
 if(lift&&(placement.point||hand))setHeight((placement.heightOffset+lift*.15*dt)*100);
 if(hand&&placing&&hit){handYaw-=turn*Math.PI/5*dt;mat4.rotateY(hit,hit,handYaw);}
 const targeting=placing||(!hand&&(navigation.scanning||navigation.marking||walls.building));
 if(hit&&targeting){const ring=new Float32Array(hit);if(hand){ring[13]+=placement.heightOffset;mat4.scale(ring,ring,[.45,.45,.45]);}reticle.matrix=ring;reticle.visible=true;}
 if(!hand){ground.update(f,time,floor,true);navigation.observe(time,pose,floor);}
 if(selectionPending){selectionPending=false;if(hit&&walls.building&&!hand)walls.select(hit);else if(hit&&navigation.marking&&!hand)navigation.addStop(hit);else if(hit&&navigation.scanning&&!placing&&!hand){ground.recordScan(hit);navigation.sync();}else placement.request();}
 if(placement.resolve(hit,pose.transform.position)){if(hand){placement.yaw+=handYaw;placement.update();handYaw=0;}reticle.visible=false;dogRoot.matrix=placement.matrix;navigation.attach(dogRoot);if(!hand)ground.place(dogRoot,hit);}
 if(placement.point&&!placement.repositioning){
  if(walkingReady)navigation.input(pose);const route=walkingReady&&navigation.active,input=walkingReady?(route?{x:routeWalking.joystick.x,y:-routeWalking.joystick.y}:move):{x:0,y:0};
  if(turn&&!route)placement.rotate(-turn*Math.PI/5*dt);
  if(input.x||input.y){const v=pose.views[0]?.transform?.inverse?.matrix,n=v?Math.hypot(v[0],v[8]):0;if(n>.001){
   const rx=v[0]/n,rz=v[8]/n,speed=route?routeWalking.speed:.25*(globalThis.ARTravelSpeed?.multiplier??1),dx=(rx*input.x-rz*input.y)*speed*dt,dz=(rz*input.x+rx*input.y)*speed*dt,oldY=placement.point[1];
   placement.move(dx,dz);if(route){placement.yaw=Math.atan2(dx,dz);placement.update();}
   if(!hand){ground.want={x:placement.point[0],y:oldY,z:placement.point[2]};const next=ground.resolve(placement.point[0],placement.point[2],oldY,Math.hypot(dx,dz));if(next.ok){placement.point[1]=next.y;placement.update();}}
  }}
 }
 const stillPlacing=!placement.point||placement.repositioning;handPreview=hand&&stillPlacing?hit:null;dogRoot.visible=!!(placement.matrix||handPreview);
 if(handPreview){const m=new Float32Array(handPreview);m[13]+=placement.heightOffset;dogRoot.matrix=m;}else if(placement.matrix)dogRoot.matrix=placement.matrix;
 if(walls.building)status($('#wall-status').textContent);else if(navigation.scanning||navigation.marking||navigation.active)status($('#route-status').textContent);
 else if(stillPlacing)status(hand?'Hand preview · align with your palm using Distance / right joystick, then Place here.':hit?'Surface found · tap the circle to place.':'Scan a level floor or table for the green circle.');
 else status(hand?'Position fixed at your palm · hold your hand still.':'Dog placed · right joystick turns / adjusts height. Walking model pending.');
 controls();scene.startFrame();scene.drawXRFrame(f,pose);scene.endFrame();
}
function setLength(mm){mm=Math.max(15,Math.min(1500,Number(mm)||150));$('#length').value=mm;$('#length-value').textContent=mm+' mm';if(appearance)appearance.setSize(mm/150);else if(dog)dog.scale=[mm/150,mm/150,mm/150];}
function preview(){requestAnimationFrame(preview);if(session||starting||!ready)return;const canvas=gl.canvas,w=canvas.width,h=canvas.height,p=mat4.create(),v=mat4.create(),size=Number($('#length').value)/1000,r=size*1.0;const eye={x:Math.sin(previewYaw)*r,y:size*.65,z:Math.cos(previewYaw)*r};mat4.perspective(p,Math.PI/4,w/h,.001,30);mat4.lookAt(v,[eye.x,eye.y,eye.z],[0,size*.23,0],[0,1,0]);dogRoot.visible=true;dogRoot.matrix=mat4.create();reticle.visible=false;gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);gl.clearColor(.035,.075,.10,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);scene.startFrame();scene.draw(p,{position:eye,inverse:{matrix:v}});scene.endFrame();}
async function init(){
 $('#placement-mode').value=new URL(location.href).searchParams.get('mode')==='hand'?'hand':'surface';$('#placement-mode').onchange=reset;
 $('#hand-height').oninput=e=>setHeight(e.target.value);$('#lower-dog').onclick=()=>setHeight(Number($('#hand-height').value)-1);$('#raise-dog').onclick=()=>setHeight(Number($('#hand-height').value)+1);
 $('#hand-distance').oninput=e=>$('#hand-distance-value').textContent=e.target.value+' cm';$('#place-hand').onclick=()=>{selectionPending=true;};
 $('#walk-stop').onclick=()=>{stopTurn();cancelSelection();navigation?.pause();};
 $('#route-speed').oninput=e=>{if(routeWalking)routeWalking.speed=Number(e.target.value);$('#route-speed-value').textContent=Number(e.target.value).toFixed(2)+' m/s';};

 $('#length').oninput=e=>setLength(e.target.value);$('#small-size').onclick=()=>setLength(150);$('#large-size').onclick=()=>setLength(750);$('#start').onclick=start;$('#exit').onclick=()=>session?.end().catch(e=>status('Exit failed: '+e.message));$('#reposition').onclick=()=>{stopTurn();cancelSelection();navigation?.pause();if(navigation){navigation.marking=false;navigation.scanning=false;navigation.sync();}walls?.cancelBuild();placement.reposition();controls();};$('#cancel').onclick=()=>{placement.cancel();controls();};$('#left').onclick=()=>placement.rotate(Math.PI/36);$('#right').onclick=()=>placement.rotate(-Math.PI/36);
 const stick=$('#turn-stick'),setTurn=e=>{const r=stick.getBoundingClientRect(),x=(e.clientX-r.x-r.width/2)/(r.width*.32),y=(r.y+r.height/2-e.clientY)/(r.height*.32),n=Math.max(1,Math.hypot(x,y));turn=x/n;lift=y/n;if(Math.abs(turn)<.12)turn=0;if(Math.abs(lift)<.12)lift=0;$('#turn-knob').style.transform=`translate(${turn*35}px,${-lift*24}px)`;stick.setAttribute('aria-valuetext',`Turn ${Math.round(turn*100)}; height ${Math.round(lift*100)}`);};stick.onpointerdown=e=>{if(stick.getAttribute('aria-disabled')==='true'||turnPointer!==null)return;e.preventDefault();navigation?.pause();turnPointer=e.pointerId;stick.setPointerCapture(e.pointerId);setTurn(e);};stick.onpointermove=e=>{if(e.pointerId===turnPointer)setTurn(e);};for(const type of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(type,e=>{if(e.pointerId===turnPointer)stopSpin();});stick.onkeydown=e=>{if(stick.getAttribute('aria-disabled')==='true')return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='ArrowUp'||e.key==='ArrowDown')setHeight((placement.heightOffset+(e.key==='ArrowUp'?.01:-.01))*100);else placement.rotate((e.key==='ArrowLeft'?1:-1)*Math.PI/36);}};
 const movePad=$('#move-stick'),setMove=e=>{const r=movePad.getBoundingClientRect();let x=(e.clientX-r.x-r.width/2)/(r.width*.32),y=(e.clientY-r.y-r.height/2)/(r.height*.32),n=Math.max(1,Math.hypot(x,y));move={x:x/n,y:y/n};if(Math.hypot(move.x,move.y)<.08)move={x:0,y:0};$('#move-knob').style.transform=`translate(${move.x*35}px,${move.y*19}px)`;};movePad.onpointerdown=e=>{if(movePad.getAttribute('aria-disabled')==='true'||movePointer!==null)return;e.preventDefault();navigation?.pause();movePointer=e.pointerId;movePad.setPointerCapture(e.pointerId);setMove(e);};movePad.onpointermove=e=>{if(e.pointerId===movePointer)setMove(e);};for(const type of ['pointerup','pointercancel','lostpointercapture'])movePad.addEventListener(type,e=>{if(e.pointerId===movePointer)stopMove();});
 $('#menu-toggle').onclick=()=>{stopTurn();cancelSelection();$('#panel').hidden=!$('#panel').hidden;$('#menu-toggle').textContent=$('#panel').hidden?'Show controls':'Hide controls';$('#menu-toggle').setAttribute('aria-expanded',String(!$('#panel').hidden));};// Native DOM overlay fills the display. Block controls only, never its transparent background.
 $('#overlay').addEventListener('beforexrselect',e=>{if(e.target.closest?.('#panel, #menu-toggle, #joystick-dock'))e.preventDefault();});window.addEventListener('blur',()=>{stopTurn();cancelSelection();});window.addEventListener('pagehide',()=>{stopTurn();cancelSelection();session?.end().catch(()=>{});});
 gl=createWebGLContext({xrCompatible:true,alpha:true});if(!gl||!gl.createVertexArray)throw Error('WebGL2 unavailable');gl.canvas.width=900;gl.canvas.height=480;gl.canvas.setAttribute('aria-label','Your black dog lying down, interactive 3D preview');$('#preview').append(gl.canvas);renderer=new Renderer(gl);scene=new Scene();scene.enableStats(false);scene.clear=false;scene.setRenderer(renderer);dogRoot=new Node();scene.addNode(dogRoot);dog=new Gltf2Node({url:'assets/dog-lying.glb'});dogRoot.addNode(dog);setLength(150);reticle=new Gltf2Node({url:'../ar-colour-vision-001/media/gltf/reticle/reticle.gltf'});reticle.visible=false;scene.addNode(reticle);ground=new GroundFollower();walls=new InvisibleWalls(scene);routeWalking={joystick:{x:0,y:0,stop(){this.x=0;this.y=0;stopMove();}},forward:[0,-1],speed:.25,moving:false,motionRatio:0};navigation=new PointRoute(scene,reticle,ground,routeWalking,walls,{canMove:()=>walkingReady});$('#route-play').addEventListener('click',stopSpin);
 await Promise.all([dog.waitForComplete(),reticle.waitForComplete()]);appearance=new DogAppearance();appearance.onSize=size=>{$('#length').value=Math.round(size*150);$('#length-value').textContent=Math.round(size*150)+' mm';};appearance.bind(renderer,dog);appearance.onSize(appearance.size);exposure=new ModelExposure('tradesight-dog-exposure',0);exposure.bind(dog);
 gl.canvas.addEventListener('pointermove',e=>{if(e.buttons)previewYaw=(e.offsetX/gl.canvas.clientWidth-.5)*Math.PI;});gl.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;controls();session?.end().catch(()=>{});status('Graphics context lost. Reload to restore the preview.');});ready=true;try{supported=!!navigator.xr&&await navigator.xr.isSessionSupported('immersive-ar');}catch{}$('#support').textContent=supported?'Ready for AR. Choose Floor / table or Still hand.':'AR unavailable here. For AR use a compatible WebXR phone/browser, such as supported Android Chrome. This is a virtual preview.';status(supported?'Ready · choose placement, then Start dog AR.':'Virtual preview · real-world AR unavailable in this browser.');controls();requestAnimationFrame(preview);
 if(new URL(location.href).searchParams.has('test'))window.__DOG={placement,gl,dog,dogRoot,appearance,exposure,ground,walls,navigation, get state(){return {ready,walkingReady,active:!!session,starting,turn,lift,move:{...move},mode:handMode()?'hand':'surface',heightOffset:placement.heightOffset,candidate:handPreview?Array.from(handPreview):null,lengthMm:Number($('#length').value),matrix:placement.matrix?Array.from(placement.matrix):null};}};
}
init().catch(e=>{status('Preview failed to load: '+e.message+'. Reload to retry.');});
