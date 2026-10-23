import test from 'node:test';
import assert from 'node:assert/strict';
import {constrain,separate,surfaceKind,placement} from '../../public/stone-room/core.mjs';
test('wall collision clamps centres with body clearance',()=>{assert.deepEqual(constrain(10,-10),{x:3.75,z:-2.75});assert.deepEqual(constrain(0,0),{x:0,z:0})});
test('avatar collision separates including coincident centres',()=>{const p=separate(0,0,{x:0,z:0});assert.equal(Math.hypot(p.x,p.z),.55);assert.deepEqual(separate(2,2,{x:0,z:0}),{x:2,z:2})});
test('surface classification rejects ceilings and slopes',()=>{assert.equal(surfaceKind({x:0,y:1,z:0}),'floor');assert.equal(surfaceKind({x:0,y:-1,z:0}),'slope');assert.equal(surfaceKind({x:1,y:0,z:0}),'wall');assert.equal(surfaceKind({x:.7,y:.7,z:0}),'slope')});
test('floor placement retains measured hit elevation and one metre units',()=>{const p=placement({x:0,y:1,z:0},{x:2,y:.4,z:3},{x:2,y:1.7,z:5});assert.deepEqual(p,{kind:'floor',x:2,y:.4,z:3,yaw:0})});
test('wall alignment offsets rear boundary towards viewer and declares estimated floor',()=>{const p=placement({x:0,y:0,z:-1},{x:0,y:1,z:0},{x:0,y:1.65,z:4});assert.equal(p.z,3.15);assert.equal(p.y,0);assert.equal(Math.abs(p.yaw),0);assert.equal(p.estimatedFloor,true)});
