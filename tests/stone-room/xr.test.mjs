import test from 'node:test';import assert from 'node:assert/strict';
import * as THREE from '../../public/stone-room/vendor/three.module.js';import {setupAR} from '../../public/stone-room/xr.js';
class Element extends EventTarget{hidden=false;disabled=false;textContent='';dataset={};classList={add(){},remove(){}};closest(){return null}}
function fixture(denied=false,mode='room'){
 const elements=new Map();globalThis.document={querySelector(s){if(!elements.has(s))elements.set(s,new Element());return elements.get(s)},body:new Element()};globalThis.isSecureContext=true;
 const session=new EventTarget();let cancelled=false,requestedOptions;session.end=async()=>session.dispatchEvent(new Event('end'));session.requestReferenceSpace=async()=>({});session.requestHitTestSource=async()=>({cancel(){cancelled=true}});
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{xr:{isSessionSupported:async()=>true,requestSession:async(type,options)=>{requestedOptions=options;if(denied)throw Object.assign(new Error('denied'),{name:'NotAllowedError'});return session}}}});
 const camera=new THREE.PerspectiveCamera();camera.position.set(-2,1.65,2);const saved=camera.position.clone();const room=new THREE.Group(),exterior=new THREE.Group(),scene=new THREE.Scene();let lastError='',restored=false;
 document.querySelector('#ar-content').value=mode;const contentModes=[];
 const api=setupAR({renderer:{xr:{setReferenceSpaceType(type){assert.equal(type,'local')},setSession:async()=>{},getReferenceSpace:()=>({})}},scene,camera,room,exterior,snapshot:()=>saved,restore:s=>{restored=true;camera.position.copy(s)},message(){},error:s=>lastError=s,clearInput(){},ready:()=>true,setContent:m=>contentModes.push(m)});
 return {scene,get requestedOptions(){return requestedOptions},api,contentModes,session,camera,room,exterior,e:s=>document.querySelector(s),get cancelled(){return cancelled},get restored(){return restored},get error(){return lastError}};
}
const pose=(x,y,z,q=new THREE.Quaternion())=>{const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(1,1,1));return {transform:{matrix:m.toArray()}}};
function frame(p,viewer={x:0,y:1.65,z:5}){return {getViewerPose:()=>({transform:{position:viewer}}),getHitTestResults:()=>p?[{getPose:()=>p}]:[]}}
test('session scanning, floor placement, reposition, tracking loss and exit restore state',async()=>{
 const f=fixture();await f.e('#ar').onclick();assert.equal(f.api.active,true);assert.deepEqual(f.camera.position.toArray(),[0,0,0]);assert.equal(f.room.visible,false);
 f.api.update(frame(pose(1,.2,2)));assert.equal(f.e('#place').disabled,false);f.session.dispatchEvent(new Event('select'));assert.deepEqual(f.room.position.toArray(),[1,.2,2]);assert.equal(f.api.state,'placed');assert.deepEqual(f.room.scale.toArray(),[1,1,1]);
 f.e('#reposition').onclick();f.api.update(frame(null));f.e('#place').onclick();assert.equal(f.room.visible,false,'a stale hit must not place');
 f.api.update(frame(pose(0,1,0,new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),-Math.PI/2)),{x:4,y:1.65,z:0}));f.e('#place').onclick();assert.ok(Math.abs(f.room.position.x-3.15)<1e-8);assert.ok(Math.abs(f.room.rotation.y-Math.PI/2)<1e-8);assert.match(f.e('#ar-status').textContent,/estimated/);
 f.api.update({getViewerPose:()=>null});assert.equal(f.room.visible,false);assert.equal(f.api.state,'tracking-lost');f.api.update(frame(null));assert.equal(f.room.visible,true);
 await f.e('#exit-ar').onclick();assert.equal(f.api.active,false);assert.equal(f.cancelled,true);assert.equal(f.restored,true);assert.deepEqual(f.camera.position.toArray(),[-2,1.65,2]);assert.equal(f.exterior.visible,true);assert.equal(f.room.visible,true);
});
test('permission failure cleans up and provides a useful error',async()=>{const f=fixture(true);await f.e('#ar').onclick();assert.equal(f.api.active,false);assert.match(f.error,/permission was denied/);assert.equal(f.restored,true)});

test('NPC-only AR rejects walls, supports floor walking and live following, and restores environment',async()=>{
 const f=fixture(false,'companion');await f.e('#ar').onclick();assert.equal(f.api.companionOnly,true);assert.deepEqual(f.contentModes,['companion']);
 const wall=pose(0,1,0,new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),-Math.PI/2));f.api.update(frame(wall));assert.equal(f.e('#place').disabled,true);
 f.api.update(frame(pose(2,.3,1)));f.e('#place').onclick();assert.equal(f.api.placed,true);assert.deepEqual(f.room.position.toArray(),[2,.3,1]);assert.equal(f.e('#ar-motion').hidden,false);
 f.api.update(frame(pose(4,.3,2)));f.session.dispatchEvent(new Event('select'));assert.deepEqual(f.api.motion,{target:{x:4,y:.3,z:2},follow:false});
 f.api.arrived();assert.equal(f.api.motion,null);f.api.update(frame(pose(4,.8,2)));assert.equal(f.e('#place').disabled,true,'do not walk onto an unconnected elevated surface');
 f.e('#ar-follow').onclick();f.api.update(frame(null,{x:7,y:1.9,z:6}));assert.deepEqual(f.api.motion,{target:{x:7,y:.3,z:6},follow:true});
 f.api.update({getViewerPose:()=>null});assert.equal(f.api.motion,null,'tracking loss pauses movement');f.api.update(frame(null));assert.equal(f.api.motion.follow,true);f.e('#ar-stop').onclick();assert.equal(f.api.motion,null);
 f.e('#ar-content').value='room';f.e('#ar-content').onchange();assert.equal(f.api.placed,false);assert.equal(f.api.companionOnly,false);assert.equal(f.e('#ar-motion').hidden,true);assert.deepEqual(f.contentModes,['companion','room']);
 await f.e('#exit-ar').onclick();assert.equal(f.contentModes.at(-1),'virtual');assert.equal(f.restored,true);
});

function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}}
function replacementSession(hitSource){const s=new EventTarget();s.end=async()=>s.dispatchEvent(new Event('end'));s.requestReferenceSpace=async()=>({});s.requestHitTestSource=async()=>hitSource;return s}
test('ending during hit-test startup cannot replace the next session source',async()=>{
 const f=fixture(),pending=deferred(),requested=deferred();let oldCancelled=false,newCancelled=false;
 f.session.requestHitTestSource=()=>{requested.resolve();return pending.promise};
 const oldStart=f.e('#ar').onclick();await requested.promise;await f.session.end();
 const newSource={cancel(){newCancelled=true}},next=replacementSession(newSource);navigator.xr.requestSession=async()=>next;
 await f.e('#ar').onclick();pending.resolve({cancel(){oldCancelled=true}});await oldStart;
 assert.equal(oldCancelled,true,'late source must be cancelled');assert.equal(newCancelled,false);assert.equal(f.api.active,true);
 f.api.update({...frame(pose(1,.2,2)),getHitTestResults(source){assert.equal(source,newSource);return []}});
 await f.e('#exit-ar').onclick();assert.equal(newCancelled,true);
});
test('late startup rejection must not end a replacement session',async()=>{
 const f=fixture(),pending=deferred(),requested=deferred();f.session.requestReferenceSpace=()=>{requested.resolve();return pending.promise};
 const oldStart=f.e('#ar').onclick();await requested.promise;await f.session.end();
 const next=replacementSession({cancel(){}});let nextEnded=false;next.addEventListener('end',()=>nextEnded=true);navigator.xr.requestSession=async()=>next;
 await f.e('#ar').onclick();pending.reject(new Error('old session ended'));await oldStart;
 assert.equal(nextEnded,false);assert.equal(f.api.active,true);assert.equal(f.error,'');await f.e('#exit-ar').onclick();
});

test('AR diagnostics distinguish missing hits, rejected walls and a real floor target',async()=>{
 const f=fixture(false,'companion');await f.e('#ar').onclick();
 assert.equal(f.api.diagnostics.stage,'ready');assert.equal(f.api.diagnostics.frames,0);
 f.api.update(frame(null));assert.equal(f.api.diagnostics.frames,1);assert.equal(f.api.diagnostics.pose,true);assert.equal(f.api.diagnostics.hits,0);assert.equal(f.api.diagnostics.target,false);assert.match(f.e('#ar-status').textContent,/No floor hit yet/);
 const wall=pose(0,1,0,new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),-Math.PI/2));f.api.update(frame(wall));
 assert.equal(f.api.diagnostics.hits,1);assert.equal(f.api.diagnostics.rejected,'wall');assert.equal(f.e('#place').disabled,true);assert.match(f.e('#ar-status').textContent,/Wall detected/);
 f.api.update(frame(pose(0,0,-2)));assert.equal(f.api.diagnostics.target,true);assert.equal(f.e('#place').disabled,false);assert.equal(f.api.placed,false,'diagnostics must not invent placement');
 await f.e('#exit-ar').onclick();
});
test('XR frame errors are visible, stop motion and recover only with a fresh valid frame',async()=>{
 const f=fixture(false,'companion');await f.e('#ar').onclick();f.api.update(frame(pose(0,0,-2)));f.e('#place').onclick();f.e('#ar-follow').onclick();
 f.api.update({getViewerPose(){throw Error('test pose failure')}});assert.equal(f.api.state,'tracking-error');assert.equal(f.api.motion,null);assert.equal(f.room.visible,false);assert.equal(f.api.diagnostics.target,false);assert.match(f.e('#ar-status').textContent,/test pose failure/);
 f.api.update(frame(null));assert.equal(f.api.state,'placed');assert.equal(f.room.visible,true);assert.equal(f.api.diagnostics.lastError,'');await f.e('#exit-ar').onclick();
});

test('XR uses the dedicated controls overlay and exposes actual render submission diagnostics',async()=>{
 const f=fixture(false,'companion');await f.e('#ar').onclick();
 assert.equal(f.requestedOptions.domOverlay.root,f.e('#ar-overlay'));
 assert.notEqual(f.requestedOptions.domOverlay.root,document.body);
 assert.equal(f.e('#ar-overlay').hidden,false);
 f.api.rendered({draws:14,views:1,contextLost:false,xrTarget:true});assert.equal(f.api.diagnostics.draws,14);assert.equal(f.api.diagnostics.rendered,1);assert.equal(f.api.diagnostics.xrTarget,true);
 f.api.renderError(Error('test framebuffer failure'));assert.match(f.e('#ar-status').textContent,/test framebuffer failure/);
 await f.e('#exit-ar').onclick();assert.equal(f.e('#ar-overlay').hidden,true);
});

test('real floor target diagnostics project against the current XR view camera',async()=>{
 const f=fixture(false,'companion');await f.e('#ar').onclick();f.api.update(frame(pose(0,0,-2)));
 const view=new THREE.PerspectiveCamera(60,1,.035,120);view.position.set(0,1.65,0);view.lookAt(0,0,-2);view.updateMatrixWorld(true);
 f.api.rendered({}, {cameras:[view]});assert.equal(f.api.diagnostics.targetInView,true);assert.ok(Math.abs(f.api.diagnostics.targetNDC[0])<.01);assert.ok(Math.abs(f.api.diagnostics.targetNDC[1])<.01);
 view.lookAt(0,1.65,2);view.updateMatrixWorld(true);f.api.rendered({}, {cameras:[view]});assert.equal(f.api.diagnostics.targetInView,false);
 f.api.update(frame(null));f.api.rendered({}, {cameras:[view]});assert.equal(f.api.diagnostics.targetNDC,null);await f.e('#exit-ar').onclick();
});

test('Soundwall ring uses raw floor and wall hit matrices; wall cannot place a walking NPC',async()=>{
 const f=fixture(false,'companion');await f.e('#ar').onclick();
 assert.deepEqual(f.requestedOptions.optionalFeatures,['hit-test','dom-overlay']);
 const ring=f.scene.getObjectByName('WebXR surface ring');assert.equal(ring.matrixAutoUpdate,false);
 const wall=pose(1,1,-2,new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2));
 f.api.update(frame(wall));assert.equal(ring.visible,true);assert.deepEqual(ring.matrix.toArray(),wall.transform.matrix);assert.equal(f.e('#place').disabled,true);f.e('#place').onclick();assert.equal(f.api.placed,false);
 const floor=pose(2,.3,-3);f.api.update(frame(floor));assert.deepEqual(ring.matrix.toArray(),floor.transform.matrix);assert.equal(f.e('#place').disabled,false);f.e('#place').onclick();assert.deepEqual(f.room.position.toArray(),[2,.3,-3]);
 f.api.update(frame(null));assert.equal(ring.visible,false);await f.e('#exit-ar').onclick();
});
