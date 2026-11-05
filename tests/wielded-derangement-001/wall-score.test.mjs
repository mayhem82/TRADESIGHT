import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {wallScoreAt,cueEnvelope,wallGlow,WAVE_SECTION_DELAY} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/wall-score.mjs';
import {newWallControls,wallFrame,wallMechanisms,wallActor} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/enclosure.mjs';
import {minimumY,transformPoint} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/grounding.mjs';
import {mat4} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/vendor/js/render/math/gl-matrix.js';
const base=new URL('../../public/ar-experiments/mayhem-ar/wielded-derangement-001/',import.meta.url),read=name=>JSON.parse(fs.readFileSync(new URL('assets/'+name,base))),score=read('wall-score.json'),beats=read('beats.json'),wave=read('enclosure-wave.gltf'),circle=read('enclosure-circle.gltf'),drive=read('wall-drive.gltf');
const near=(a,b)=>a.forEach((x,i)=>assert.ok(Math.abs(x-b[i])<4e-6));
const bounds=(g,n)=>{const primitives=g.meshes[n.mesh].primitives,as=primitives.map(p=>g.accessors[p.attributes.POSITION]);return {min:[0,1,2].map(i=>Math.min(...as.map(a=>a.min[i]))),max:[0,1,2].map(i=>Math.max(...as.map(a=>a.max[i])))};};
test('contrast cues and envelopes come from the complete original audio, with independently checked PCM energy changes',()=>{
 const wav=fs.readFileSync(new URL('WIELDED-DERANGEMENT.wav',base));assert.equal(crypto.createHash('sha256').update(wav).digest('hex'),score.sourceSha256);assert.equal(score.sourceSha256,beats.sourceSha256);assert.equal(score.duration,269.32);assert.equal(score.events.length,5);
 for(const band of Object.values(score.bands)){assert.equal(band.length,5387);assert.ok(band.every(x=>Number.isFinite(x)&&x>=0&&x<=1));}
 let offset=12,dataStart=0;while(offset+8<wav.length){const size=wav.readUInt32LE(offset+4);if(wav.toString('ascii',offset,offset+4)==='data'){dataStart=offset+8;break;}offset+=8+size+(size%2);}assert.ok(dataStart);
 const rms=(a,b)=>{let sum=0,n=0;for(let i=Math.round(a*48000);i<Math.round(b*48000);i+=48){const p=dataStart+i*4,v=(wav.readInt16LE(p)+wav.readInt16LE(p+2))/65536;sum+=v*v;n++;}return Math.sqrt(sum/n);};
 for(let i=0;i<5;i++){const e=score.events[i];assert.ok(e.novelty>.5);assert.ok(e.time>=15&&e.time<249);if(i)assert.ok(e.time-score.events[i-1].time>=28);const before=rms(e.time-3.4,e.time-.4),after=rms(e.time+.4,e.time+3.4);assert.equal(Math.sign(after-before),Math.sign(e.afterRms-e.beforeRms));assert.ok(Math.abs(after-before)>.015);}
});
test('one audio impulse travels section by section rather than moving the wall in unison',()=>{
 const s={duration:20,secondsPerSample:.01,bands:{high:Array(2000).fill(0)},events:[]},b={secondsPerSample:.01,response:Array(2000).fill(0)};b.response[500]=1;
 for(let id=0;id<20;id++){const state=wallScoreAt(s,b,5+id*WAVE_SECTION_DELAY,id);assert.ok(state.wave>.999);assert.ok(wallScoreAt(s,b,5.04+id*WAVE_SECTION_DELAY,id).height>1.11);if(id)assert.equal(wallScoreAt(s,b,5,id).wave,0);}assert.ok(Math.abs(WAVE_SECTION_DELAY*20-1.4)<1e-12);
});
test('actual recording produces a travelling crest and substantially larger forms at measured cues',()=>{
 let index=0;for(let i=1250;i<3000;i++)if(beats.response[i]>beats.response[index])index=i;const time=index*beats.secondsPerSample+8*WAVE_SECTION_DELAY,states=Array.from({length:20},(_,i)=>wallScoreAt(score,beats,time,i));assert.ok(Math.max(...states.map(s=>s.height))-Math.min(...states.map(s=>s.height))>.15);
 const neutral={...score,events:[]};for(const cue of score.events){const differences=Array.from({length:20},(_,i)=>Math.abs(wallScoreAt(score,beats,cue.time,i).height-wallScoreAt(neutral,beats,cue.time,i).height));assert.ok(Math.max(...differences)>.20,cue.mode+' should make a larger structural change');}
});
test('cue boundaries are smooth, seeking is reversible and start/end settle to the controlled base form',()=>{
 for(const e of score.events)for(const time of [e.time-1.1,e.time,e.time+.55,e.time+6.55])assert.ok(Math.abs(cueEnvelope(time-.0001,e)-cueEnvelope(time+.0001,e))<1e-6);
 const times=[16.05,67.95,98.7,137.1,228.35,35.8],states=times.map(t=>Array.from({length:20},(_,i)=>wallScoreAt(score,beats,t,i)));for(const k of [5,2,0,4,1,3])assert.deepEqual(Array.from({length:20},(_,i)=>wallScoreAt(score,beats,times[k],i)),states[k]);
 for(const t of [0,269.32])for(let i=0;i<20;i++){const s=wallScoreAt(score,beats,t,i);assert.equal(s.height,1);assert.equal(s.heat,0);assert.equal(s.kick,0);}
});
test('whole-song choreography stays bounded, grounded and circular without mutating independent controls',()=>{
 const wall=newWallControls(),anchor=mat4.fromTranslation(mat4.create(),[1,-.8,-2]),rootBefore=Array.from(wallActor(anchor,wall));
 for(const [diameter,height] of [[2,.8],[20,5]]){Object.assign(wall,{diameter,height});const snapshot=structuredClone(wall);
  for(let time=0;time<score.duration;time+=.25){const panels=wallFrame(wall,time,1,score,beats),mechanisms=wallMechanisms(wall,time,1,score,beats).frame;
   for(let i=0;i<20;i++){const state=wallScoreAt(score,beats,time,i);assert.ok(state.height>=.55&&state.height<=1.7);assert.ok(Math.abs(Math.hypot(panels[i][12],panels[i][14])-diameter/2)<1e-6);assert.ok(minimumY(bounds(wave,wave.nodes[i]),panels[i])>=-1e-6);}
   for(const n of drive.nodes){const m=mechanisms.get(n.name);assert.ok(m.every(Number.isFinite));assert.ok(minimumY(bounds(drive,n),m)>=-1e-6,n.name+' at '+time);}
  }assert.deepEqual(wall,snapshot);
 }const reset=newWallControls();assert.deepEqual(Array.from(wallActor(anchor,reset)),rootBefore);
});
test('linkages stay attached as musical transformations change adjacent panel heights',()=>{
 const wall=newWallControls();for(const time of score.events.flatMap(e=>[e.time-.5,e.time,e.time+2])){const {frame,connections}=wallMechanisms(wall,time,.6,score,beats),panels=wallFrame(wall,time,.6,score,beats);
  for(let i=0;i<20;i++){const c=connections[i];near(transformPoint(frame.get('wall-rod-'+i),[0,-.5,0]),c.a);near(transformPoint(frame.get('wall-rod-'+i),[0,.5,0]),c.b);near(transformPoint(frame.get('wall-gear-'+i),[.64,0,.28]),c.a);near(c.b,connections[(i+1)%20].a);assert.ok(Math.abs(c.shaftA[1]/panels[i][5]-.78)<1e-6);}
 }
});
test('section light waves use independent materials, original geometry and unchanged draw budget',()=>{
 assert.equal(wave.nodes.length,20);assert.equal(wave.meshes.length,20);assert.equal(wave.materials.length,60);assert.deepEqual(wave.buffers,circle.buffers);assert.deepEqual(wave.bufferViews,circle.bufferViews);assert.deepEqual(wave.accessors,circle.accessors);const materials=new Set();let draws=0;
 for(const node of wave.nodes)for(let j=0;j<3;j++){const p=wave.meshes[node.mesh].primitives[j];assert.deepEqual(p.attributes,circle.meshes[0].primitives[j].attributes);materials.add(p.material);draws++;}assert.equal(materials.size,60);assert.equal(draws+drive.nodes.length,140);const original=[.08,.03,0],copy=[...original];assert.deepEqual(wallGlow(original,0),copy);assert.ok(wallGlow(original,1)[0]>.45);assert.deepEqual(original,copy);
});
