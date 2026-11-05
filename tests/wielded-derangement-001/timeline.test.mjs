import {test} from 'node:test';import assert from 'node:assert/strict';
import {stateAt,cellAt,faceAt,DURATION} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/timeline.mjs';
test('complete song timeline produces finite reversible sculpture states',()=>{
 for(let t=0;t<=DURATION;t+=.5){const s=stateAt(t,.7);for(let i=0;i<48;i++)assert.ok(Object.values(cellAt(i,s)).every(Number.isFinite));for(let i=0;i<12;i++){const p=faceAt(i,s);assert.ok(Object.values(p).every(Number.isFinite));assert.ok(p.alpha>=0&&p.alpha<=1);}}
 assert.deepEqual(stateAt(134,.3),stateAt(134,.3));assert.equal(stateAt(Infinity).t,DURATION);assert.equal(stateAt(-10).t,0);
});
test('machine grows, contracts, changes shape and forms/fades faces',()=>{
 const states=[0,40,75,112,155,180,213,245,269].map(t=>stateAt(t));
 assert.ok(Math.max(...states.map(s=>s.height))-Math.min(...states.map(s=>s.height))>1.4);
 assert.ok(states[5].height<states[4].height);assert.notDeepEqual(cellAt(7,states[0]),cellAt(7,states[5]));
 const opacity=Array.from({length:100},(_,i)=>faceAt(0,stateAt(i)).alpha);assert.ok(Math.min(...opacity)<.01&&Math.max(...opacity)>.99);
});
