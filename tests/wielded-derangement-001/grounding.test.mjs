import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {mat4} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/vendor/js/render/math/gl-matrix.js';
import {DURATION,stateAt} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/timeline.mjs';
import {floorHit,freshFloorHit,manualGroundAt,floorStep,boundsFromGltf,groundedFrame,groundedActor} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/grounding.mjs';
const folder=new URL('../../public/ar-experiments/mayhem-ar/wielded-derangement-001/assets/',import.meta.url);
const data=JSON.parse(fs.readFileSync(new URL('machine.gltf',folder),'utf8')),binary=fs.readFileSync(new URL('geometry.bin',folder)),bounds=boundsFromGltf(data),bottom=bounds.get('base').min[1];
const point=(m,p)=>[m[12]+m[0]*p[0]+m[4]*p[1]+m[8]*p[2],m[13]+m[1]*p[0]+m[5]*p[1]+m[9]*p[2],m[14]+m[2]*p[0]+m[6]*p[1]+m[10]*p[2]];
const anchor=(tilt=0)=>{const m=mat4.create();mat4.translate(m,m,[1,-.6,-2]);mat4.rotateY(m,m,.6);mat4.rotateX(m,m,tilt);return m;};
const signed=(p,a)=>(p[0]-a[12])*a[4]+(p[1]-a[13])*a[5]+(p[2]-a[14])*a[6];
function vertices(index,parent=mat4.create(),out=[]){
 const n=data.nodes[index],m=mat4.multiply(mat4.create(),parent,n.matrix||mat4.create());
 if(n.mesh!==undefined)for(const primitive of data.meshes[n.mesh].primitives){const a=data.accessors[primitive.attributes.POSITION],v=data.bufferViews[a.bufferView],stride=v.byteStride||12,offset=(v.byteOffset||0)+(a.byteOffset||0);assert.equal(a.componentType,5126);for(let i=0;i<a.count;i++)out.push(point(m,[binary.readFloatLE(offset+i*stride),binary.readFloatLE(offset+i*stride+4),binary.readFloatLE(offset+i*stride+8)]));}
 for(const child of n.children||[])vertices(child,m,out);return out;
}
const actualVertices=new Map(data.nodes.flatMap((n,i)=>n.name?[[n.name,vertices(i)]]:[]));

test('floor targets reject walls, ceilings, above-viewer targets and stale taps',()=>{
 const floor=anchor();assert.ok(floorHit(floor,1.5));assert.ok(floorHit(anchor(Math.PI/15),1.5));
 const wall=anchor(Math.PI/2),ceiling=anchor(Math.PI),high=anchor();high[13]=2;
 for(const invalid of [wall,ceiling,high,null,new Float32Array(16)])assert.equal(floorHit(invalid,1.5),false);
 assert.equal(freshFloorHit(floor,1.5,1000,1100),true);assert.equal(freshFloorHit(floor,1.5,1000,1201),false);assert.equal(freshFloorHit(floor,1.5,1100,1000),false);
});
test('manual ground picks the visible base point rather than a camera-height offset',()=>{
 const x=207,y=530,width=393,height=852,d=2.4,p=manualGroundAt(x,y,width,height,d);assert.ok(p[1]<0);assert.equal(p[2],-d);
 const screenX=(p[0]/(d*Math.tan(Math.PI/6)*(width/height))+1)*width/2,screenY=(1-p[1]/(d*Math.tan(Math.PI/6)))*height/2;
 assert.ok(Math.abs(screenX-x)<1e-8&&Math.abs(screenY-y)<1e-8);
 const a=mat4.fromTranslation(mat4.create(),p),m=groundedActor(a,[0,999,0],1.2,1.6,2,bottom),base=point(m,[0,bottom,0]);
 base.forEach((v,i)=>assert.ok(Math.abs(v-p[i])<1e-6));
});
test('the actual base bottom remains on the chosen floor through rotation, size and height changes',()=>{
 assert.ok(bottom<0,'Regression fixture must include the old below-origin base');
 for(const a of [anchor(),anchor(.18)])for(const size of [.25,.7,1.6])for(const height of [.5,1,2])for(const yaw of [0,.8,3.7]){
  const m=groundedActor(a,[0,-100,0],yaw,size,height,bottom),base=point(m,[0,bottom,0]);
  assert.ok(Math.abs(signed(base,a))<1e-6);for(let j=0;j<3;j++)assert.ok(Math.abs(base[j]-a[12+j])<1e-6);
  for(const p of actualVertices.get('base'))assert.ok(signed(point(m,p),a)>-1e-6);
 }
});
test('all parts stay above the base over the full song at minimum and maximum audio pulse',()=>{
 for(let t=0;t<=DURATION;t+=.25)for(const energy of [0,1]){
  for(const [name,p] of groundedFrame(stateAt(t,energy),bounds)){
   const b=bounds.get(name),m=p.matrix;
   // Independent interval bound, rather than calling the runtime's corner check.
   const low=m[13]+Math.min(m[1]*b.min[0],m[1]*b.max[0])+Math.min(m[5]*b.min[1],m[5]*b.max[1])+Math.min(m[9]*b.min[2],m[9]*b.max[2]);
   assert.ok(low>=bottom-.000002,`${name} sinks at ${t}: ${low}`);
  }
 }
});
test('decoded geometry vertices remain above flat and sloped ground at extreme scales and key forms',()=>{
 for(const t of [0,75,112,155,180,245,DURATION]){
  const frame=groundedFrame(stateAt(t,1),bounds);frame.set('base',{matrix:mat4.create()});
  for(const a of [anchor(),anchor(.18)])for(const [size,height] of [[.25,.5],[1.6,2]]){
   const root=groundedActor(a,[0,0,0],t*.031,size,height,bottom);
   for(const [name,p] of frame){const m=mat4.multiply(mat4.create(),root,p.matrix);for(const v of actualVertices.get(name))assert.ok(signed(point(m,v),a)>=-.00002,`${name} vertex below ground at ${t}`);}
  }
 }
});
test('camera-relative movement is projected along the chosen ground plane',()=>{
 const a=anchor(.18),[x,z]=floorStep(a,.3,-.2),p=point(a,[x,0,z]);assert.ok(Math.abs(signed(p,a))<1e-6);assert.ok(Math.hypot(p[0]-a[12],p[2]-a[14])>.2);
});
