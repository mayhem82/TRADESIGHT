import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {beatAt,reactiveState,beatEmission} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/beat-response.mjs';
import {stateAt,DURATION} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/timeline.mjs';
import {newWallControls,wallFrame} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/enclosure.mjs';
import {boundsFromGltf,groundedFrame,minimumY} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/grounding.mjs';
const assets=new URL('../../public/ar-experiments/mayhem-ar/wielded-derangement-001/assets/',import.meta.url),features=JSON.parse(fs.readFileSync(new URL('beats.json',assets))),bounds=boundsFromGltf(JSON.parse(fs.readFileSync(new URL('machine.gltf',assets))));
test('response uses full original audio analysis with genuine varying transient strengths',()=>{
 assert.equal(features.sourceSha256.toUpperCase(),'52364F8DD70F4A149974C2350693DD09F122D67D60D4CBA64FF4FF36271AC214');assert.equal(features.secondsPerSample,.02);assert.equal(features.response.length,Math.ceil(DURATION/.02));assert.ok(features.response.every(x=>Number.isFinite(x)&&x>=0&&x<=1));assert.ok(features.response.filter(x=>x>.8).length>100);assert.ok(features.response.filter(x=>x<.12).length>features.response.length/2);
 const peak=beatAt(features,1.3),after=beatAt(features,1.5);assert.ok(peak>.65);assert.ok(after<peak*.5,'short release should settle before next hit');
});
test('transient response is deterministic when seeking and independent of frame rate',()=>{
 const times=[1.3,29.8,75.1,155.3,245.7,269.3];const first=times.map(t=>reactiveState(t,.6,features));for(const i of [5,2,0,4,1,3])assert.deepEqual(reactiveState(times[i],.6,features),first[i]);assert.equal(beatAt(features,-1),0);assert.equal(beatAt(features,Infinity),0);assert.equal(beatAt(features,270),0);
});
test('stronger recoil and warm emission leave timeline identity and independent wall controls intact',()=>{
 const w=newWallControls(),copy=structuredClone(w),before=wallFrame(w,1.3,.6).map(m=>Array.from(m)),base=stateAt(1.3,.6),hit=reactiveState(1.3,.6,features);assert.ok(hit.pulse>base.pulse+.1);assert.ok(hit.radius>base.radius*1.05);for(const key of ['height','twist','phase','angular'])assert.equal(hit[key],base[key]);assert.deepEqual(w,copy);assert.deepEqual(wallFrame(w,1.3,.6).map(m=>Array.from(m)),before);const original=[.1,.2,.3];assert.deepEqual(beatEmission(original,0),original);assert.ok(beatEmission(original,1)[0]>.35);assert.deepEqual(original,[.1,.2,.3]);
});
test('full-song real transient recoil and maximum pulse stay grounded with portrait geometry',()=>{
 const floor=bounds.get('base').min[1];for(let t=0;t<DURATION;t+=.08){for(const state of [reactiveState(t,1,features),reactiveState(t,1,{secondsPerSample:300,response:[1,1]})])for(const [name,part] of groundedFrame(state,bounds)){assert.ok(part.matrix.every(Number.isFinite));assert.ok(minimumY(bounds.get(name),part.matrix)>=floor-2e-6,`${name} at ${t}`);}}
});
