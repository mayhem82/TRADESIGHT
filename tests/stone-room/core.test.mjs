import test from 'node:test';
import assert from 'node:assert/strict';
import {constrain,separate,surfaceKind,placement,advanceCompanion} from '../../public/stone-room/core.mjs';
test('wall collision clamps centres with body clearance',()=>{assert.deepEqual(constrain(10,-10),{x:3.75,z:-2.75});assert.deepEqual(constrain(0,0),{x:0,z:0})});
test('avatar collision separates including coincident centres',()=>{const p=separate(0,0,{x:0,z:0});assert.equal(Math.hypot(p.x,p.z),.55);assert.deepEqual(separate(2,2,{x:0,z:0}),{x:2,z:2})});
test('surface classification rejects ceilings and slopes',()=>{assert.equal(surfaceKind({x:0,y:1,z:0}),'floor');assert.equal(surfaceKind({x:0,y:-1,z:0}),'slope');assert.equal(surfaceKind({x:1,y:0,z:0}),'wall');assert.equal(surfaceKind({x:.7,y:.7,z:0}),'slope')});
test('floor placement retains measured hit elevation and one metre units',()=>{const p=placement({x:0,y:1,z:0},{x:2,y:.4,z:3},{x:2,y:1.7,z:5});assert.deepEqual(p,{kind:'floor',x:2,y:.4,z:3,yaw:0})});
test('wall alignment offsets rear boundary towards viewer and declares estimated floor',()=>{const p=placement({x:0,y:0,z:-1},{x:0,y:1,z:0},{x:0,y:1.65,z:4});assert.equal(p.z,3.15);assert.equal(p.y,0);assert.equal(Math.abs(p.yaw),0);assert.equal(p.estimatedFloor,true)});

test('AR companion moves in metre units beyond virtual room bounds and stops at target',()=>{
 const p=advanceCompanion({x:5,z:0},{x:10,z:0},1.4,.5);assert.equal(p.x,5.7);assert.equal(p.z,0);assert.equal(p.walking,true);
 const stop=advanceCompanion({x:9.96,z:0},{x:10,z:0},2,.1);assert.equal(stop.x,9.96);assert.equal(stop.arrived,true);assert.equal(stop.walking,false);
 const follow=advanceCompanion({x:0,z:0},{x:1,z:0},1,.1,1.25);assert.equal(follow.walking,false);
});

import * as THREE from '../../public/stone-room/vendor/three.module.js';
import {createFloorContact} from '../../public/stone-room/floor-contact.js';
test('animated boot samples stay on translated real-world floor plane',()=>{
 const parent=new THREE.Group(),model=new THREE.Group();parent.position.y=.35;parent.add(model);const bones=[];
 for(const x of [-.1,.1]){const geometry=new THREE.BoxGeometry(.1,.04,.2);geometry.translate(x,.02,0);const n=geometry.attributes.position.count;geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(new Uint16Array(n*4),4));const weights=new Float32Array(n*4);for(let i=0;i<n;i++)weights[i*4]=1;geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));const mesh=new THREE.SkinnedMesh(geometry,new THREE.MeshBasicMaterial()),bone=new THREE.Bone();mesh.add(bone);model.add(mesh);mesh.bind(new THREE.Skeleton([bone]));bones.push(bone)}
 const contact=createFloorContact(model);assert.ok(contact.samples>0);bones[0].position.y=.08;bones[1].position.y=.12;assert.ok(contact.clearance(.35)>.07);contact.settle(.35);assert.ok(Math.abs(contact.clearance(.35))<1e-6);
 bones[0].position.y=-.03;contact.settle(.35);assert.ok(Math.abs(contact.clearance(.35))<1e-6);
});
