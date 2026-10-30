import test from 'node:test';
import assert from 'node:assert/strict';
import {Placement} from '../../public/ar-experiments/mayhem-ar/ar-colour-vision-001/placement.js';
import {architecture} from '../../public/ar-experiments/mayhem-ar/ar-colour-vision-001/model.js';
const identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const facing=(matrix,hit,viewer)=>(matrix[8]*(viewer.x-hit[12])+matrix[10]*(viewer.z-hit[14]))/Math.hypot(viewer.x-hit[12],viewer.z-hit[14]);
test('geometry opening is +Z and legacy placement points it away from the camera',()=>{
 const mesh=architecture('cube');const normals=new Set();for(let i=0;i<mesh.length;i+=8)normals.add(Array.from(mesh.slice(i+5,i+8)).join(','));
 assert.ok(!normals.has('0,0,1'));assert.ok(normals.has('0,0,-1'));
 const p=new Placement(),hit=identity(),viewer={x:0,y:1.6,z:3};p.request();assert.ok(p.resolve(hit,viewer));close(facing(p.matrix,hit,viewer),-1);
});
test('cube opening faces the placement camera from cardinal and oblique directions',()=>{
 const hit=identity();hit[12]=1.25;hit[13]=.4;hit[14]=-2;
 for(const [dx,dz] of [[0,3],[3,0],[0,-3],[-3,0],[3,4],[-4,3],[-3,-4],[4,-3]]){
  const viewer={x:hit[12]+dx,y:1.6,z:hit[14]+dz},p=new Placement();p.request();assert.ok(p.resolve(hit,viewer,true));close(facing(p.matrix,hit,viewer),1);
  assert.deepEqual(Array.from(p.worldMatrix),Array.from(hit));close(p.matrix[12],hit[12]);close(p.matrix[14],hit[14]);close(p.matrix[13],hit[13]+.7);
  const placed=Array.from(p.matrix);hit[0]=2;assert.equal(p.worldMatrix[0],1);hit[0]=1;
  p.request();assert.equal(p.resolve(identity(),viewer,true),false);assert.deepEqual(Array.from(p.matrix),placed);
 }
});
test('reposition keeps its fresh-hit gate, cancellation and world anchor semantics',()=>{
 const p=new Placement(),hit=identity(),viewer={x:0,y:1.6,z:3};p.request();p.resolve(hit,viewer,true);const placed=Array.from(p.matrix);
 assert.ok(p.beginReposition());p.cancelReposition();p.request();assert.equal(p.resolve(hit,viewer,true),false);assert.deepEqual(Array.from(p.matrix),placed);
 p.beginReposition();p.request();assert.equal(p.resolve(null,viewer,true),false);assert.deepEqual(Array.from(p.matrix),placed);
 p.request();hit[12]=4;assert.ok(p.resolve(hit,viewer,true));close(facing(p.matrix,hit,viewer),1);close(p.worldMatrix[12],4);
});
