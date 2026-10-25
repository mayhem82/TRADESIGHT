import test from 'node:test';import assert from 'node:assert/strict';
import * as THREE from '../../public/stone-room/vendor/three.module.js';
import {setupAR} from '../../public/stone-room/xr.js';
import {manualPlacement,manualPlaneTarget} from '../../public/stone-room/manual-placement.js';
class Element extends EventTarget{hidden=false;disabled=false;textContent='';value='';style={display:''};classList={add(){},remove(){}};setAttribute(){}replaceWith(){}closest(){return null}}
function fixture(mode='companion'){
 const elements=new Map();globalThis.document={querySelector(s){if(!elements.has(s))elements.set(s,new Element());return elements.get(s)},body:new Element()};
 const e=s=>document.querySelector(s);for(const [name,value]of Object.entries({distance:3,height:-1.4,horizontal:0,scale:1,rotation:0}))e('#ar-'+name).value=String(value);e('#ar-content').value=mode;
 const xr=new THREE.EventDispatcher(),session=new EventTarget();session.end=async()=>{session.dispatchEvent(new Event('end'));xr.dispatchEvent({type:'sessionend'})};xr.getSession=()=>session;xr.getReferenceSpace=()=>({});
 const camera=new THREE.PerspectiveCamera(),room=new THREE.Group(),scene=new THREE.Scene(),exterior=new THREE.Group(),modes=[];camera.position.set(-2,1.65,2);const saved=camera.position.clone(),bg=new THREE.Color('blue');scene.background=bg;
 let options,restored=false;const api=setupAR({renderer:{xr},scene,camera,room,exterior,snapshot:()=>saved,restore:s=>{camera.position.copy(s);restored=true},message(){},error(){},clearInput(){},ready:()=>true,setContent:m=>modes.push(m),createButton(renderer,o){options=o;return e('#ar')}});
 return {api,xr,session,room,scene,camera,exterior,e,modes,bg,options,get restored(){return restored},start:()=>xr.dispatchEvent({type:'sessionstart'})};
}
const frame=(x=0,y=0,z=0,angle=0)=>({getViewerPose:()=>({transform:{matrix:new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),angle),new THREE.Vector3(1,1,1)).toArray()}})});
test('Lighthouse body overlay and immediate visibility require no hit testing',()=>{
 const f=fixture();assert.deepEqual(f.options.optionalFeatures,['local-floor','dom-overlay']);assert.equal(f.options.domOverlay.root,document.body);f.start();assert(f.api.active&&f.api.placed);assert(f.room.visible);assert.deepEqual(f.room.position.toArray(),[0,-1.4,-3]);assert.equal(f.scene.background,null);assert.equal(f.exterior.visible,false);assert.match(f.e('#ar-status').textContent,/real ground is not detected/);
});
test('five manual inputs transform original model immediately; reset restores defaults',()=>{
 const f=fixture();f.start();for(const [name,value]of Object.entries({distance:5,height:.4,horizontal:2,scale:.5,rotation:90})){f.e('#ar-'+name).value=String(value);f.e('#ar-'+name).oninput()}
 assert.deepEqual(f.room.position.toArray(),[2,.4,-5]);assert.deepEqual(f.room.scale.toArray(),[.5,.5,.5]);assert(Math.abs(f.room.rotation.y-Math.PI/2)<1e-10);assert(f.room.visible);f.e('#reposition').onclick();assert.deepEqual(f.room.position.toArray(),[0,-1.4,-3]);assert.equal(f.room.scale.x,1);
});
test('walk intersects labelled manual plane and follow/stop retain controls',()=>{
 const f=fixture();f.start();f.api.update(frame(0,0,0,-Math.PI/4));assert(!f.e('#place').disabled);f.e('#place').onclick();assert(Math.abs(f.api.motion.target.y+1.4)<1e-10);assert(Math.abs(f.api.motion.target.z+1.4)<1e-10);assert.match(f.e('#ar-status').textContent,/not a detected floor/);f.api.arrived();assert.equal(f.api.motion,null);f.e('#ar-follow').onclick();f.api.update(frame(2,1,4));assert.deepEqual(f.api.motion,{target:{x:2,y:-1.4,z:4},follow:true});f.e('#ar-stop').onclick();assert.equal(f.api.motion,null);
});
test('pose loss/errors pause motion but retain visible model and recover',()=>{
 const f=fixture();f.start();f.api.update(frame());f.e('#ar-follow').onclick();f.api.update({getViewerPose:()=>null});assert(f.room.visible);assert.equal(f.api.state,'tracking-lost');assert.equal(f.api.motion,null);f.api.update({getViewerPose(){throw Error('pose fault')}});assert(f.room.visible);assert.match(f.e('#ar-status').textContent,/pose fault/);f.api.update(frame());assert.equal(f.api.state,'manual');assert(f.api.motion.follow);
});
test('room mode, native overlay exit and reentry restore walkthrough and projection',async()=>{
 const f=fixture();const projection=f.camera.projectionMatrix.clone();f.start();f.e('#ar-content').value='room';f.e('#ar-content').onchange();assert(!f.api.companionOnly);assert(f.e('#ar-motion').hidden);f.camera.projectionMatrix.identity();document.body.style.display='none';await f.e('#exit-ar').onclick();assert(f.restored);assert.equal(document.body.style.display,'');assert.deepEqual(f.camera.position.toArray(),[-2,1.65,2]);assert.deepEqual(f.camera.projectionMatrix.toArray(),projection.toArray());assert.equal(f.scene.background,f.bg);assert(f.exterior.visible);assert.deepEqual(f.room.position.toArray(),[0,0,0]);assert.deepEqual(f.modes,['companion','room','virtual']);f.start();assert(f.room.visible);assert.equal(f.api.diagnostics.frames,0);await f.session.end();assert(!f.api.active);
});
test('manual math rejects invalid values and invents no detected surface',()=>{
 assert.throws(()=>manualPlacement({distance:0,height:0,horizontal:0,scale:1,rotation:0}));assert.equal(manualPlaneTarget({x:0,y:0,z:0},{x:0,y:0,z:-1},-1),null);assert.equal(manualPlaneTarget({x:0,y:0,z:0},{x:0,y:1,z:0},-1),null);assert.deepEqual(manualPlaneTarget({x:1,y:2,z:3},{x:0,y:-1,z:0},0),{x:1,y:0,z:3});
});
test('render errors remain visible without claiming measured-floor hits',()=>{
 const f=fixture();f.start();f.api.rendered({draws:14,views:1});assert.equal(f.api.diagnostics.rendered,1);assert.equal(f.api.diagnostics.draws,14);assert.equal(f.api.diagnostics.manual,true);assert.equal(f.api.diagnostics.hits,undefined);f.api.renderError(Error('framebuffer fault'));assert.match(f.e('#ar-status').textContent,/framebuffer fault/);
});
