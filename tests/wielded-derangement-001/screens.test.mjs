import {test} from 'node:test';import assert from 'node:assert/strict';
import {stateAt,faceAt,DURATION} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/timeline.mjs';
import {SCREEN_WIDTH,SCREEN_HEIGHT,SCREEN_PERIOD,SCREEN_WINDOW,SCREEN_LOOPS,MAX_SCREENS,screenPlans,loopPhaseAt} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/screen-plan.mjs';
import {mat4} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/vendor/js/render/math/gl-matrix.js';
import {groundedActor,transformPoint} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/grounding.mjs';
// Material/scene data tests only. This supplies numeric enums without creating
// a browser, graphics context, camera or synthetic positional tracking.
globalThis.WebGLRenderingContext={SRC_ALPHA:770,ONE_MINUS_SRC_ALPHA:771,LESS:513,SRC_COLOR:768};
const {AnimationScreen,ScreenMaterial,SCREEN_VERTICES}=await import('../../public/ar-experiments/mayhem-ar/wielded-derangement-001/screen-node.mjs');
const {Node}=await import('../../public/ar-experiments/mayhem-ar/wielded-derangement-001/vendor/js/render/core/node.js');
test('screens appear only in hidden-face slots, with two maximum and all distinct loops used',()=>{
 let activeFrames=0,total=0;const kinds=new Set(),slots=new Set();
 for(let t=0;t<=DURATION;t+=.1){const s=stateAt(t,.6),before=Array.from({length:12},(_,i)=>faceAt(i,s)),plans=screenPlans(s);assert.ok(plans.length<=MAX_SCREENS);assert.equal(new Set(plans.map(p=>p.slot)).size,plans.length);let active=0;
  for(const p of plans){assert.ok(p.matrix.every(Number.isFinite));assert.ok(p.opacity>=0&&p.opacity<=.92);if(p.opacity>.01){assert.ok(before[p.slot].alpha<.01,'screens must yield to the existing face');active++;kinds.add(p.kind);slots.add(p.slot);}}
  assert.deepEqual(Array.from({length:12},(_,i)=>faceAt(i,s)),before);if(active)activeFrames++;total++;
 }assert.ok(activeFrames/total>.25,'feature should actually appear across the song');assert.equal(kinds.size,3);assert.ok(slots.size>=6);
});
test('screens are wider than twice the maximum portrait and retain open angular gaps',()=>{
 assert.ok(SCREEN_WIDTH>.54*1.35*2);assert.equal(SCREEN_HEIGHT/SCREEN_WIDTH,9/16);assert.equal(MAX_SCREENS,2);
 for(let t=0;t<DURATION;t+=.4){const s=stateAt(t),p=screenPlans(s);if(p.length===2){const angle=faceAt(p[0].slot,s).yaw-faceAt(p[1].slot,s).yaw;assert.ok(Math.acos(Math.cos(angle))>1.4);}}
});
test('loop phase is periodic, screen selection is reversible and slot changes fade at boundaries',()=>{
 assert.equal(SCREEN_PERIOD,8);assert.equal(SCREEN_WINDOW,12);assert.equal(SCREEN_LOOPS.length,3);
 for(const t of [0,.75,3.2,75.3,228.9])for(const slot of [0,4,11]){const a=loopPhaseAt(t,slot),b=loopPhaseAt(t+SCREEN_PERIOD,slot);assert.ok(Math.abs(Math.sin(a*Math.PI*2)-Math.sin(b*Math.PI*2))<1e-10);}
 const times=[7,19,69,155,228],reference=times.map(t=>screenPlans(stateAt(t,.6)));for(const i of [4,1,3,0,2])assert.deepEqual(screenPlans(stateAt(times[i],.6)),reference[i]);
 for(let t=12;t<DURATION;t+=12)for(const offset of [-.0001,0,.0001])for(const p of screenPlans(stateAt(t+offset)))assert.ok(p.opacity<1e-6);
 for(const t of [0,DURATION])for(const p of screenPlans(stateAt(t)))assert.equal(p.opacity,0);
});
test('actual screen vertices remain grounded through full-song placement, scaling and height controls',()=>{
 const anchor=mat4.create();mat4.translate(anchor,anchor,[1,-.9,2]);mat4.rotateX(anchor,anchor,.18);const vertices=Array.from({length:6},(_,i)=>Array.from(SCREEN_VERTICES.slice(i*5,i*5+3)));
 for(const size of [.25,1.6])for(const height of [.5,2])for(let t=0;t<DURATION;t+=.4){const actor=groundedActor(anchor,[.4,0,-.6],.8,size,height,-.0375);for(const p of screenPlans(stateAt(t,1))){const m=mat4.multiply(mat4.create(),actor,p.matrix);for(const v of vertices){const point=transformPoint(m,v),distance=(point[0]-anchor[12])*anchor[4]+(point[1]-anchor[13])*anchor[5]+(point[2]-anchor[14])*anchor[6];assert.ok(distance>=-1e-6);}}}
});
function mockRenderer(){return {buffers:[],materials:[],primitives:[],createRenderBuffer(target,data){const b={target,data};this.buffers.push(b);return b;},createRenderPrimitive(shape,material){this.materials.push(material);const p={shape,uniforms:Object.fromEntries(material._uniforms.map(u=>[u._uniformName,u])),_instances:[],marks:0,markActive(){this.marks++;},waitForComplete(){return Promise.resolve();}};this.primitives.push(p);return p;}};}
test('two native screens share one tiny geometry buffer but have independent materials and loop uniforms',()=>{
 const renderer=mockRenderer(),a=new AnimationScreen(),b=new AnimationScreen();a._setRenderer(renderer);b._setRenderer(renderer);assert.equal(renderer.buffers.length,1);assert.equal(renderer.buffers[0].data.byteLength,120);assert.equal(a.primitive.shape,b.primitive.shape);assert.notEqual(renderer.materials[0],renderer.materials[1]);assert.equal(renderer.primitives.reduce((n,p)=>n+p.shape.elementCount/3,0),4);
 const plan={matrix:mat4.create(),opacity:.8,phase:.25,kind:2};a.update(plan,true);assert.equal(a.primitive.uniforms.screenKind.value,2);assert.equal(b.primitive.uniforms.screenKind.value,0);assert.equal(a.primitive.uniforms.modelOpacity.value,.8);assert.equal(b.primitive.uniforms.modelOpacity.value,0);
});
test('screen toggle and hidden/tracking-suspended parent suppress rendering without moving the machine',()=>{
 const renderer=mockRenderer(),actor=new Node(),screen=new AnimationScreen();actor.addNode(screen);actor._setRenderer(renderer);const original=Array.from(actor.matrix),plan={matrix:mat4.fromTranslation(mat4.create(),[1,1,1]),opacity:.9,phase:.2,kind:1};screen.update(plan,true);actor.visible=false;actor.markActive(1);assert.equal(screen.primitive.marks,0);actor.visible=true;actor.markActive(2);assert.equal(screen.primitive.marks,1);screen.update(plan,false);actor.markActive(3);assert.equal(screen.primitive.marks,1);assert.deepEqual(Array.from(actor.matrix),original);screen.update(undefined,true);assert.equal(screen.visible,false);
});
test('screen material preserves depth testing and independent fade without writing invisible rectangle depth',()=>{
 const material=new ScreenMaterial();assert.equal(material.state.depthTest,true);assert.equal(material.state.depthMask,false);assert.equal(material.state.blend,true);assert.equal(material.state.cullFace,false);assert.equal(material._samplers.length,0);
});
