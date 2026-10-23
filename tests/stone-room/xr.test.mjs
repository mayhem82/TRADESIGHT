import test from 'node:test';import assert from 'node:assert/strict';
import * as THREE from '../../public/stone-room/vendor/three.module.js';import {setupAR} from '../../public/stone-room/xr.js';
class Element extends EventTarget{hidden=false;disabled=false;textContent='';dataset={};classList={add(){},remove(){}};closest(){return null}}
function fixture(denied=false){
 const elements=new Map();globalThis.document={querySelector(s){if(!elements.has(s))elements.set(s,new Element());return elements.get(s)},body:new Element()};globalThis.isSecureContext=true;
 const session=new EventTarget();let cancelled=false;session.end=async()=>session.dispatchEvent(new Event('end'));session.requestReferenceSpace=async()=>({});session.requestHitTestSource=async()=>({cancel(){cancelled=true}});
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{xr:{isSessionSupported:async()=>true,requestSession:async()=>{if(denied)throw Object.assign(new Error('denied'),{name:'NotAllowedError'});return session}}}});
 const camera=new THREE.PerspectiveCamera();camera.position.set(-2,1.65,2);const saved=camera.position.clone();const room=new THREE.Group(),exterior=new THREE.Group(),scene=new THREE.Scene();let lastError='',restored=false;
 const api=setupAR({renderer:{xr:{setSession:async()=>{},getReferenceSpace:()=>({})}},scene,camera,room,exterior,snapshot:()=>saved,restore:s=>{restored=true;camera.position.copy(s)},message(){},error:s=>lastError=s,clearInput(){},ready:()=>true});
 return {api,session,camera,room,exterior,e:s=>document.querySelector(s),get cancelled(){return cancelled},get restored(){return restored},get error(){return lastError}};
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
