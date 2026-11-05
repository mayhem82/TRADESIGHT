import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {mat4} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/vendor/js/render/math/gl-matrix.js';
import {DRIVE_CIRCUIT,newWallControls,wallMechanisms,wallActor} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/enclosure.mjs';
import {transformPoint} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/grounding.mjs';
const folder=new URL('../../public/ar-experiments/mayhem-ar/wielded-derangement-001/assets/',import.meta.url),g=JSON.parse(fs.readFileSync(new URL('wall-drive.gltf',folder))),binary=fs.readFileSync(new URL('wall-drive.bin',folder));
const near=(a,b)=>a.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<3e-6,`${a} != ${b}`));
function vertices(mesh){const result=[];for(const p of mesh.primitives){const a=g.accessors[p.attributes.POSITION],v=g.bufferViews[a.bufferView];for(let i=0;i<a.count;i++){const k=v.byteOffset+i*12;result.push([binary.readFloatLE(k),binary.readFloatLE(k+4),binary.readFloatLE(k+8)]);}}return result;}
test('closed circular drive covers every section once and closes the final linkage',()=>{
 assert.equal(new Set(DRIVE_CIRCUIT).size,20);assert.deepEqual([...DRIVE_CIRCUIT].sort((a,b)=>a-b),Array.from({length:20},(_,i)=>i));
 const w=newWallControls();for(const diameter of [2,6,20])for(const t of [0,.33,76,269.32]){Object.assign(w,{diameter});const {frame,connections}=wallMechanisms(w,t,.7);assert.equal(frame.size,80);assert.equal(connections.length,20);
  for(let i=0;i<20;i++){const c=connections[i],next=connections[(i+1)%20];assert.equal(c.to,next.from);near(c.b,next.a);near(c.shaftB,next.shaftA);assert.ok(Math.hypot(...c.a.map((v,j)=>v-c.b[j]))>.08,'retain more than twice rod width at the smallest diameter');
   near(transformPoint(frame.get('wall-rod-'+i),[0,-.5,0]),c.a);near(transformPoint(frame.get('wall-rod-'+i),[0,.5,0]),c.b);near(transformPoint(frame.get('wall-shaft-'+i),[0,-.5,0]),c.shaftA);near(transformPoint(frame.get('wall-shaft-'+i),[0,.5,0]),c.shaftB);
   near(transformPoint(frame.get('wall-gear-'+i),[.64,0,.28]),c.a);near(transformPoint(frame.get('wall-pin-'+i),[0,0,0]),c.a);
  }
 }
});
test('gear and connecting rod motion is time-based and reversible while transfer rail remains continuous',()=>{
 const w=newWallControls(),a=wallMechanisms(w,10,.7),b=wallMechanisms(w,10.4,.7),again=wallMechanisms(w,10,.7);for(let i=0;i<20;i++){assert.notDeepEqual([...a.frame.get('wall-gear-'+i)],[...b.frame.get('wall-gear-'+i)]);assert.notDeepEqual(a.connections[i].a,b.connections[i].a);assert.deepEqual(a.connections[i].shaftA,b.connections[i].shaftA);assert.deepEqual([...a.frame.get('wall-rod-'+i)],[...again.frame.get('wall-rod-'+i)]);}
});
test('all actual moving vertices remain above selected sloping ground at minimum and maximum dimensions',()=>{
 const w=newWallControls(),anchor=mat4.create();mat4.translate(anchor,anchor,[1,-.8,-2]);mat4.rotateX(anchor,anchor,.18);w.pose=[2,0,1];w.yaw=.7;
 for(const diameter of [2,20])for(const height of [.8,5])for(const t of [0,.3,.7,70,155,269.32]){Object.assign(w,{diameter,height});const before=structuredClone(w),{frame}=wallMechanisms(w,t,1),root=wallActor(anchor,w);assert.deepEqual(w,before);
  for(const n of g.nodes){const m=mat4.multiply(mat4.create(),root,frame.get(n.name));for(const p of vertices(g.meshes[n.mesh])){const v=transformPoint(m,p),distance=(v[0]-anchor[12])*anchor[4]+(v[1]-anchor[13])*anchor[5]+(v[2]-anchor[14])*anchor[6];assert.ok(distance>=-2e-6,`${n.name} below floor at ${t}`);}}
 }
});
test('moving wall circuit uses shared geometry and bounded mobile-oriented draw/triangle budget',()=>{
 assert.equal(g.nodes.length,80);assert.equal(g.meshes.length,4);assert.equal(binary.length,20736);assert.equal(g.buffers[0].byteLength,binary.length);let tris=0;for(const n of g.nodes)for(const p of g.meshes[n.mesh].primitives)tris+=g.accessors[p.attributes.POSITION].count/3;assert.equal(tris,5760);assert.ok(tris+9200<16000);assert.equal(g.materials.length,3);
});
