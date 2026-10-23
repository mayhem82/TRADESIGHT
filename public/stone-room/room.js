import * as THREE from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {ROOM,clamp,constrain,separate} from './core.mjs';
import {setupAR} from './xr.js';
const $=s=>document.querySelector(s),scene=new THREE.Scene();scene.background=new THREE.Color('#bdcbd0');scene.fog=new THREE.Fog('#bdcbd0',24,75);
const camera=new THREE.PerspectiveCamera(64,innerWidth/innerHeight,.035,120);
const renderer=new THREE.WebGLRenderer({canvas:$('#view'),antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local');
scene.add(new THREE.HemisphereLight(0xdfefff,0x8b7550,.85));
const sunlight=new THREE.DirectionalLight(0xffedcd,3.3);sunlight.position.set(-3,6,-8);sunlight.target.position.set(1,0,1);sunlight.castShadow=true;sunlight.shadow.mapSize.set(2048,2048);Object.assign(sunlight.shadow.camera,{left:-7,right:7,top:6,bottom:-6,near:.5,far:24});sunlight.shadow.bias=-.0002;sunlight.shadow.normalBias=.015;scene.add(sunlight,sunlight.target);
const fill=new THREE.PointLight(0xffe4bb,5,10,2);fill.position.set(0,2.7,0);scene.add(fill);
const room=new THREE.Group();room.name='StoneRoom';scene.add(room);
const exterior=new THREE.Group();exterior.name='Exterior';scene.add(exterior);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(150,150),new THREE.MeshStandardMaterial({color:0x788761,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.15;exterior.add(ground);
// Instanced outdoor planting is a light background seen through true apertures.
const leaves=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,2),new THREE.MeshStandardMaterial({color:0x536940,roughness:1}),90);
const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.12,.21,1,6),new THREE.MeshStandardMaterial({color:0x544735}),30);const matrix=new THREE.Matrix4(),q=new THREE.Quaternion();
for(let i=0;i<30;i++){const a=i*2.4,r=13+(i%7)*3,x=Math.sin(a)*r,z=Math.cos(a)*r,h=3+i%5;matrix.compose(new THREE.Vector3(x,h/2-.15,z),q,new THREE.Vector3(1,h,1));trunks.setMatrixAt(i,matrix);for(let j=0;j<3;j++){matrix.compose(new THREE.Vector3(x+Math.sin(j*2)*1.1,h+j*.6,z+Math.cos(j*2)),q,new THREE.Vector3(1.8+j*.1,2,1.8));leaves.setMatrixAt(i*3+j,matrix)}}exterior.add(leaves,trunks);
let architecture,ceiling,npcModel,mixer,actions={},activeAction,loaded=false,top=false,yaw=0,pitch=0,savedWalk=null,behaviour='idle',elapsed=0,waveUntil=0,wanderTarget=new THREE.Vector3(0,0,-1),wanderTime=0;const npc=new THREE.Group();npc.position.set(.8,0,-.9);room.add(npc);
const keys=new Set(),joystick={x:0,y:0},loader=new GLTFLoader();
function message(text){$('#status').textContent=text}
function error(text){$('#error').hidden=false;$('#error').textContent=text}
function clearError(){$('#error').hidden=true;$('#error').textContent=''}
function look(){camera.rotation.set(pitch,yaw,0,'YXZ')}
function reset(){if(ar.active)return;top=false;$('#plan').setAttribute('aria-pressed','false');if(ceiling)ceiling.visible=true;camera.position.set(-2.05,ROOM.eye,2.05);yaw=-.40;pitch=-.05;look();clearInput()}
function state(){return {position:camera.position.clone(),quaternion:camera.quaternion.clone(),yaw,pitch,top}}
function restore(s){camera.position.copy(s.position);camera.quaternion.copy(s.quaternion);yaw=s.yaw;pitch=s.pitch;top=s.top;if(ceiling)ceiling.visible=!top;$('#plan').setAttribute('aria-pressed',String(top))}
const ar=setupAR({renderer,scene,camera,room,exterior,snapshot:state,restore,message,error,clearInput,ready:()=>loaded});
function play(name,once=false){const action=actions[name];if(!action||activeAction===action)return;activeAction?.fadeOut(.22);activeAction=action;action.reset().setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,once?1:Infinity);action.clampWhenFinished=once;action.fadeIn(.22).play()}
function dispose(object){object?.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of [].concat(o.material)){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose()}})}
function installNPC(gltf,normalize=false){
 const model=gltf.scene;const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3());if(!Number.isFinite(size.y)||size.y<=0)throw Error('NPC has no measurable geometry');
 if(normalize)model.scale.setScalar(1.83/size.y);const b=new THREE.Box3().setFromObject(model);model.position.y-=b.min.y;model.position.x-=(b.min.x+b.max.x)/2;model.position.z-=(b.min.z+b.max.z)/2;
 model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false}});
 if(npcModel){mixer?.stopAllAction();mixer?.uncacheRoot(npcModel);npc.remove(npcModel);dispose(npcModel)}npcModel=model;npc.add(model);mixer=new THREE.AnimationMixer(model);actions={};activeAction=null;
 for(const clip of gltf.animations){const n=clip.name.toLowerCase(),key=n.includes('walk')?'Walk':n.includes('wave')?'Wave':n.includes('look')?'LookAround':n.includes('idle')?'Idle':clip.name;actions[key]=mixer.clipAction(clip)}play('Idle');
}
async function load(){
 $('#loading').hidden=false;$('#retry').hidden=true;clearError();
 try{const [building,person]=await Promise.all([loader.loadAsync('./assets/stone-room.glb'),loader.loadAsync('./assets/photo-guided-npc.glb')]);
 architecture=building.scene;architecture.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}if(o.name==='Ceiling')ceiling=o});room.add(architecture);installNPC(person);loaded=true;reset();$('#loading').hidden=true;message('Drag to look · WASD or joystick to walk');
 }catch(e){error('Asset loading failed: '+e.message);$('#load-progress').textContent='The room could not load. Check your connection, then retry.';$('#retry').hidden=false}
}
$('#retry').onclick=load;load();
$('#npcfile').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;const url=URL.createObjectURL(f);try{clearError();const g=await loader.loadAsync(url);installNPC(g,true);message('Imported companion · '+g.animations.length+' supplied animation clips')}catch(e){error('GLB import failed: '+e.message)}finally{URL.revokeObjectURL(url)}};
function setBehaviour(v){behaviour=v;$('#behaviour').value=v}
$('#behaviour').onchange=e=>setBehaviour(e.target.value);$('#follow').onclick=()=>setBehaviour('follow');$('#stop').onclick=()=>{setBehaviour('stop');waveUntil=0;play('Idle')};$('#wave').onclick=()=>{if(!actions.Wave){message('This imported model has no Wave animation');return}waveUntil=elapsed+(actions.Wave.getClip().duration||2.3);play('Wave',true)};$('#talk').onclick=()=>{message('Welcome to the Stone Room. Use Follow and I’ll walk with you.');if('speechSynthesis'in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance('Welcome to the Stone Room. Use follow and I will walk with you.'))}};
$('#speed').oninput=e=>$('#sv').textContent=Number(e.target.value).toFixed(1)+' m/s';$('#nspeed').oninput=e=>$('#nsv').textContent=Number(e.target.value).toFixed(1)+' m/s';
function panel(open){$('#npcpanel').hidden=!open;$('#npc-toggle').setAttribute('aria-expanded',String(open))}$('#npc-toggle').onclick=()=>panel($('#npcpanel').hidden);$('#npc-close').onclick=()=>panel(false);
$('#reset').onclick=reset;$('#plan').onclick=()=>{if(ar.active||!loaded)return;if(!top){savedWalk=state();top=true;camera.position.set(0,10,0);camera.rotation.set(-Math.PI/2,0,0);if(ceiling)ceiling.visible=false}else restore(savedWalk);$('#plan').setAttribute('aria-pressed',String(top));clearInput()};
function clearInput(){keys.clear();joystick.x=joystick.y=0;$('#stick').style.transform='';drag=null}
let drag=null;
renderer.domElement.addEventListener('pointerdown',e=>{if(ar.active)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId||top||ar.active)return;yaw-=(e.clientX-drag.x)*.004;pitch=clamp(pitch-(e.clientY-drag.y)*.004,-1.4,1.4);drag.x=e.clientX;drag.y=e.clientY;look()});
for(const name of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(name,()=>drag=null);
const stick=$('#joystick');let joyId=null;
function joy(e){const r=stick.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/(r.width*.36),y=(e.clientY-r.top-r.height/2)/(r.height*.36),l=Math.max(1,Math.hypot(x,y));joystick.x=x/l;joystick.y=y/l;$('#stick').style.transform=`translate(${joystick.x*r.width*.3}px,${joystick.y*r.height*.3}px)`}
stick.onpointerdown=e=>{if(ar.active)return;joyId=e.pointerId;stick.setPointerCapture(e.pointerId);joy(e)};stick.onpointermove=e=>{if(e.pointerId===joyId)joy(e)};for(const name of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(name,()=>{joyId=null;joystick.x=joystick.y=0;$('#stick').style.transform=''})
for(const b of document.querySelectorAll('[data-move]')){b.onpointerdown=e=>{b.setPointerCapture(e.pointerId);keys.add(b.dataset.move)};for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,()=>keys.delete(b.dataset.move))}
const movementKeys=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'];window.onkeydown=e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const k=e.key.toLowerCase();if(movementKeys.includes(k)){e.preventDefault();keys.add(k)}};window.onkeyup=e=>keys.delete(e.key.toLowerCase());window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInput()});
function move(dt){if(!loaded||top||ar.active)return;let f=Number(keys.has('w')||keys.has('arrowup')||keys.has('forward'))-Number(keys.has('s')||keys.has('arrowdown')||keys.has('back'))-joystick.y,r=Number(keys.has('d')||keys.has('arrowright')||keys.has('right'))-Number(keys.has('a')||keys.has('arrowleft')||keys.has('left'))+joystick.x;const n=Math.max(1,Math.hypot(f,r)),v=+$('#speed').value*dt/n;
 let p=constrain(camera.position.x+(r*Math.cos(yaw)-f*Math.sin(yaw))*v,camera.position.z+(-r*Math.sin(yaw)-f*Math.cos(yaw))*v);if($('#collision').checked)p=constrain(...Object.values(separate(p.x,p.z,npc.position,.57)));camera.position.x=p.x;camera.position.z=p.z;
}
function animateNPC(dt){if(!loaded||ar.active)return;elapsed+=dt;if(waveUntil>elapsed){mixer?.update(dt);return}let target=null;const speed=+$('#nspeed').value;
 if(behaviour==='follow'&&!top&&npc.position.distanceTo(new THREE.Vector3(camera.position.x,0,camera.position.z))>1.45)target=camera.position;
 if(behaviour==='wander'){wanderTime-=dt;if(wanderTime<0||Math.hypot(wanderTarget.x-npc.position.x,wanderTarget.z-npc.position.z)<.2){wanderTarget.set((Math.random()-.5)*6.4,0,(Math.random()-.5)*4.4);wanderTime=6}target=wanderTarget}
 let walking=false;
 if(target){const dx=target.x-npc.position.x,dz=target.z-npc.position.z,d=Math.hypot(dx,dz);if(d>.05){let p=constrain(npc.position.x+dx/d*Math.min(speed*dt,d),npc.position.z+dz/d*Math.min(speed*dt,d),.38);if($('#collision').checked&&!top)p=constrain(...Object.values(separate(p.x,p.z,camera.position,.65)),.38);walking=Math.hypot(p.x-npc.position.x,p.z-npc.position.z)>.001;npc.position.set(p.x,0,p.z);const heading=Math.atan2(dx,dz),delta=Math.atan2(Math.sin(heading-npc.rotation.y),Math.cos(heading-npc.rotation.y));npc.rotation.y+=delta*Math.min(1,dt*6)}}
 const clip=walking?'Walk':behaviour!=='stop'&&$('#lookaround').checked?'LookAround':'Idle';play(clip);if(actions.Walk)actions.Walk.timeScale=speed/1.15;mixer?.update(dt);
}
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);const box=$('#toolbar').getBoundingClientRect();$('#npcpanel').style.top=box.bottom+10+'px'});
const clock=new THREE.Clock();renderer.setAnimationLoop((time,frame)=>{const dt=Math.min(clock.getDelta(),.05);move(dt);animateNPC(dt);ar.update(frame);renderer.render(scene,camera)});
// Read-only diagnostics for browser verification; no mutation hooks in production.
window.stoneRoom={get diagnostics(){const meshes=[];room.traverse(o=>{if(o.isMesh)meshes.push(o)});return {loaded,ar:ar.active,top,camera:camera.position.toArray(),npc:npc.position.toArray(),npcHeight:npcModel?new THREE.Box3().setFromObject(npcModel).getSize(new THREE.Vector3()).y:0,animations:Object.keys(actions),activeAnimation:activeAction?.getClip().name,meshes:meshes.length,triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls,uvMissing:meshes.filter(o=>!o.geometry.attributes.uv).map(o=>o.name),ceilingVisible:ceiling?.visible,roomVisible:room.visible,roomScale:room.scale.toArray(),xrState:ar.state}}};
window.addEventListener('unhandledrejection',e=>error('An operation failed: '+(e.reason?.message||e.reason)));window.addEventListener('webglcontextlost',e=>{e.preventDefault();error('Graphics context lost. Reload the page to restore the room.')});
