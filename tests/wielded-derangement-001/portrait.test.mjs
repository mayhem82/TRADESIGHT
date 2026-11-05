import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
// Only numeric WebGL enums are supplied for material data tests. No context,
// browser, camera, network or synthetic tracking session is created here.
globalThis.WebGLRenderingContext={SRC_ALPHA:770,ONE_MINUS_SRC_ALPHA:771,LESS:513,SRC_COLOR:768};
const {PortraitMaterial}=await import('../../public/ar-experiments/mayhem-ar/wielded-derangement-001/portrait.mjs');
const assets=new URL('../../public/ar-experiments/mayhem-ar/wielded-derangement-001/assets/',import.meta.url),g=JSON.parse(fs.readFileSync(new URL('machine.gltf',assets)));const buffers=g.buffers.map(b=>fs.readFileSync(new URL(b.uri,assets)));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function values(index){const a=g.accessors[index],v=g.bufferViews[a.bufferView],b=buffers[v.buffer],n={VEC3:3,VEC2:2,SCALAR:1}[a.type],step=a.componentType===5126?4:2;assert.ok((v.byteOffset||0)+(a.byteOffset||0)+a.count*n*step<=b.length);return Array.from({length:a.count},(_,i)=>Array.from({length:n},(_,j)=>b[a.componentType===5126?'readFloatLE':'readUInt16LE']((v.byteOffset||0)+(a.byteOffset||0)+(i*n+j)*step)));}
test('portrait is the exact self-email PNG and has valid independent face materials',()=>{
 const png=fs.readFileSync(new URL('frontal-head.png',assets));assert.equal(png.length,2759665);assert.equal(hash(png),'0b7b3712ce697e8aa034d2a5e0cfd297651edba88ff29df680c39961bebb5564');assert.equal(png.readUInt32BE(16),1086);assert.equal(png.readUInt32BE(20),1448);assert.equal(png[25],6,'RGBA PNG');
 const materials=new Set();for(let i=0;i<12;i++){const face=g.nodes.find(n=>n.name==='face-'+i);assert.equal(face.children.length,1);const n=g.nodes[face.children[0]],p=g.meshes[n.mesh].primitives[0],m=g.materials[p.material];assert.ok(n.name.startsWith('julian-relief-surface-'));assert.equal(m.alphaMode,'BLEND');assert.equal(g.images[g.textures[m.pbrMetallicRoughness.baseColorTexture.index].source].uri,'frontal-head.png');materials.add(p.material);}assert.equal(materials.size,12);
});
test('relief mesh has consistent winding, finite normalized normals, upright UVs and phone-conscious budget',()=>{
 const n=g.nodes.find(n=>n.name==='julian-relief-surface-0'),p=g.meshes[n.mesh].primitives[0],pos=values(p.attributes.POSITION),norm=values(p.attributes.NORMAL),uv=values(p.attributes.TEXCOORD_0),indices=values(p.indices).flat();assert.equal(pos.length,825);assert.equal(indices.length/3,1536);assert.ok(buffers.at(-1).length<40000);
 for(let i=0;i<pos.length;i++){assert.ok(pos[i].every(Number.isFinite));assert.ok(Math.abs(Math.hypot(...norm[i])-1)<1e-6);assert.ok(uv[i].every(x=>x>=0&&x<=1));assert.ok(pos[i][2]>.02&&pos[i][2]<.16);if(pos[i][1]>.35)assert.ok(uv[i][1]<.01);if(pos[i][1]<-.35)assert.ok(uv[i][1]>.99);}
 for(let i=0;i<indices.length;i+=3){const [a,b,c]=indices.slice(i,i+3).map(j=>{assert.ok(j<pos.length);return pos[j];});assert.ok((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])>0);}
});
test('native portrait materials fade independently and do not write transparent rectangle depth',()=>{
 const texture={sampler:{},textureKey:'https://example.invalid/frontal-head.png'},a=new PortraitMaterial(texture),b=new PortraitMaterial(texture);a.modelOpacity.value=.23;assert.equal(b.modelOpacity.value,1);assert.equal(a.state.depthMask,false);assert.equal(a.state.blend,true);assert.equal(a.state.depthTest,true);assert.equal(texture.mipmap,false);assert.equal(texture.sampler.wrapS,33071);
});
