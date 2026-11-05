import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {mat4} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/vendor/js/render/math/gl-matrix.js';
import {newWallControls,wallMotion,wallActor,wallFrame} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/enclosure.mjs';
import {WorldTracking} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/world-tracking.mjs';
import {groundedActor,transformPoint} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/grounding.mjs';
const app=new URL('../../public/ar-experiments/mayhem-ar/wielded-derangement-001/',import.meta.url);
const model=JSON.parse(fs.readFileSync(new URL('assets/enclosure.gltf',app))),binary=fs.readFileSync(new URL('assets/enclosure.bin',app));
const nativePose=()=>({emulatedPosition:false,transform:{matrix:mat4.fromTranslation(mat4.create(),[0,1.7,0])},views:[{projectionMatrix:mat4.create(),transform:{inverse:{matrix:mat4.create()}}}]});
function points(){const result=[];for(const p of model.meshes[0].primitives){const a=model.accessors[p.attributes.POSITION],v=model.bufferViews[a.bufferView];for(let i=0;i<a.count;i++){const j=v.byteOffset+i*12;result.push([binary.readFloatLE(j),binary.readFloatLE(j+4),binary.readFloatLE(j+8)]);}}return result;}
test('wall footprint expands independently in width/depth without moving its centre or central machine',()=>{
 const w=newWallControls(),anchor=mat4.create(),centralAnchor=mat4.fromTranslation(mat4.create(),[1,0,-2]);
 const machine=Array.from(groundedActor(centralAnchor,[.2,0,.3],.4,.7,1,-.0375));
 for(const width of [2,6,20])for(const depth of [2,8,20]){w.width=width;w.depth=depth;const f=wallFrame(w,13,1);assert.equal(f.length,20);assert.equal(f[0][14],-depth/2);assert.equal(f[5][12],width/2);assert.equal(f[10][14],depth/2);assert.equal(f[15][12],-width/2);assert.deepEqual(Array.from(wallActor(anchor,w)).slice(12,15),[0,0,0]);assert.deepEqual(Array.from(groundedActor(centralAnchor,[.2,0,.3],.4,.7,1,-.0375)),machine);}
});
test('wall controls never mutate machine anchor, pose or scale; separate instances never share pose arrays',()=>{
 const a=newWallControls(),b=newWallControls(),saved=structuredClone(b),anchor=mat4.create(),copy=Array.from(anchor);
 wallMotion(a,anchor,1,-2,.7,-1,.05);a.width=13;a.depth=9;assert.notDeepEqual(a,saved);assert.deepEqual(b,saved);assert.deepEqual(Array.from(anchor),copy);
 const before=Array.from(wallActor(anchor,a));groundedActor(anchor,[3,0,-4],2,1.6,2,-.0375);assert.deepEqual(Array.from(wallActor(anchor,a)),before);
});
test('actual wall vertices remain above independently sloped ground at min/max footprint and height',()=>{
 const verts=points(),a=mat4.create();mat4.translate(a,a,[1,-.7,2]);mat4.rotateX(a,a,.18);mat4.rotateY(a,a,.7);
 const w=newWallControls();w.pose=[2,0,-3];w.yaw=1.1;
 for(const width of [2,20])for(const depth of [2,20])for(const height of [.8,5])for(const t of [0,76,170,269.32]){
  Object.assign(w,{width,depth,height});const root=wallActor(a,w);
  for(const m of wallFrame(w,t,1)){const world=mat4.multiply(mat4.create(),root,m);for(const v of verts){const p=transformPoint(world,v);const d=(p[0]-a[12])*a[4]+(p[1]-a[13])*a[5]+(p[2]-a[14])*a[6];assert.ok(d>=-2e-6,`wall under ground: ${d}`);}}
 }
});
test('wall and machine placements, native-anchor loss and reposition are independent',async()=>{
 const session={},one=new WorldTracking(mat4.create()),two=new WorldTracking(mat4.create());for(const t of [one,two]){t.begin(session);t.observe(nativePose(),'visible',session);}
 assert.ok(one.place(mat4.fromTranslation(mat4.create(),[1,0,-2]),10,20));assert.ok(two.place(mat4.fromTranslation(mat4.create(),[-1,0,-3]),10,20));
 let deleted=false;await two.attachNative({createAnchor:async()=>({anchorSpace:{},delete(){deleted=true;}})});const before=Array.from(one.anchor);
 assert.equal(two.refreshAnchor({getPose:()=>null},{}),false);assert.equal(two.visible,false);assert.equal(one.visible,true);two.reposition();assert.ok(deleted);assert.deepEqual(Array.from(one.anchor),before);assert.equal(one.placed,true);two.resetOrigin();assert.equal(one.visible,true);
});
test('outer structure budget and glTF buffers are valid',()=>{
 assert.equal(model.nodes.length,20);assert.equal(model.meshes.length,1);assert.equal(model.meshes[0].primitives.length,3);assert.ok(binary.length<20000);assert.equal(model.buffers[0].byteLength,binary.length);
 let triangles=0;for(const a of model.accessors){const view=model.bufferViews[a.bufferView];assert.equal(a.componentType,5126);assert.ok(view.byteOffset+a.count*12<=binary.length);for(let i=0;i<a.count*3;i++)assert.ok(Number.isFinite(binary.readFloatLE(view.byteOffset+i*4)));}for(const p of model.meshes[0].primitives)triangles+=model.accessors[p.attributes.POSITION].count/3;assert.equal(triangles*20,3600);
});
