import {test} from 'node:test';import assert from 'node:assert/strict';
import {mat4} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/vendor/js/render/math/gl-matrix.js';
import {WorldTracking,positionalPose,acquireTrackedSession,nativeSessionOptions} from '../../public/ar-experiments/mayhem-ar/wielded-derangement-001/world-tracking.mjs';
function viewer(x=0,yaw=0,emulatedPosition=false){const world=mat4.create();mat4.translate(world,world,[x,1.6,0]);mat4.rotateY(world,world,yaw);return {emulatedPosition,transform:{matrix:world},views:[{projectionMatrix:mat4.perspective(mat4.create(),Math.PI/3,.5,.03,50),transform:{inverse:{matrix:mat4.invert(mat4.create(),world)}}}]};}
const floor=()=>mat4.fromTranslation(mat4.create(),[0,0,-2]);
const point=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
test('AR mode support alone does not establish active positional tracking',()=>{
 assert.equal(positionalPose(null).usable,false);assert.equal(positionalPose(viewer(0,0,true)).reason,'position-emulated');
 const unknown=viewer();delete unknown.emulatedPosition;assert.equal(positionalPose(unknown).reason,'position-unverified');
 assert.equal(positionalPose(viewer(),'hidden').usable,false);const bad=viewer();bad.views[0].transform.inverse.matrix[0]=NaN;assert.equal(positionalPose(bad).usable,false);assert.equal(positionalPose(viewer()).usable,true);
});
test('a captured world point stays fixed while translated/rotated viewer coordinates change',()=>{
 const a=mat4.create(),t=new WorldTracking(a),session={};t.begin(session);t.observe(viewer(),'visible',session);assert.ok(t.place(floor(),10,20));const fixed=Array.from(a),initial=point(viewer().views[0].transform.inverse.matrix,[a[12],a[13],a[14]]);
 for(const [x,yaw] of [[.5,0],[1,.35],[-.5,-.5]]){const pose=viewer(x,yaw);assert.ok(t.observe(pose,'visible',session).usable);assert.deepEqual(Array.from(a),fixed);const cameraPoint=point(pose.views[0].transform.inverse.matrix,[a[12],a[13],a[14]]);assert.ok(Math.hypot(...cameraPoint.map((v,i)=>v-initial[i]))>.1);assert.ok(t.visible);}
});
test('loss and emulation hide placement without rebasing it to the viewer',()=>{
 const a=mat4.create(),t=new WorldTracking(a),s={};t.begin(s);t.observe(viewer(),'visible',s);t.place(floor(),0,1);const fixed=Array.from(a);
 t.observe(null,'visible',s);assert.equal(t.visible,false);assert.equal(t.place(floor(),1,2),false);assert.deepEqual(Array.from(a),fixed);
 t.observe(viewer(.5,0,true),'visible',s);assert.equal(t.visible,false);t.observe(viewer(.5),'visible',s);assert.ok(t.visible);assert.deepEqual(Array.from(a),fixed);
 t.observe(viewer(),'visible-blurred',s);assert.equal(t.visible,false);
});
test('reference resets and re-entry require new placement; stale sessions cannot overwrite it',()=>{
 const a=mat4.create(),t=new WorldTracking(a),old={},next={};t.begin(old);t.observe(viewer(),'visible',old);t.place(floor(),0,1);t.resetOrigin();assert.equal(t.placed,false);assert.equal(t.visible,false);t.observe(viewer(),'visible',old);assert.equal(t.visible,false);
 t.begin(next);assert.equal(t.place(floor(),2,3),false);t.observe(viewer(),'visible',next);t.place(floor(),2,3);const saved=Array.from(a);assert.equal(t.observe(viewer(9),'visible',old).reason,'inactive-session');assert.deepEqual(Array.from(a),saved);assert.ok(t.visible);t.end();assert.equal(t.visible,false);
});
test('native request retains confirmed local/hit-test requirements and closes late or control-less sessions',async()=>{
 assert.deepEqual(nativeSessionOptions({}).requiredFeatures,['local','hit-test']);let ends=0,resolve;const late={domOverlayState:{type:'screen'},end:async()=>{ends++;}};
 const pending=acquireTrackedSession({requestSession:()=>new Promise(r=>resolve=r)},{},()=>false);resolve(late);assert.equal(await pending,null);assert.equal(ends,1);
 const noControls={end:async()=>{ends++;}};await assert.rejects(acquireTrackedSession({requestSession:async()=>noControls},{},()=>true),/controls overlay/);assert.equal(ends,2);
 const good=await acquireTrackedSession({requestSession:async(mode,options)=>{assert.equal(mode,'immersive-ar');assert.ok(options.optionalFeatures.includes('anchors'));return late;}},{},()=>true);assert.equal(good,late);
});
test('native anchors update from anchor space, hide on loss, and clean up after reposition',async()=>{
 const a=mat4.create(),t=new WorldTracking(a),s={};t.begin(s);t.observe(viewer(),'visible',s);t.place(floor(),0,1);let deleted=0;const native={anchorSpace:{},delete(){deleted++;}};assert.ok(await t.attachNative({createAnchor:()=>Promise.resolve(native)}));
 const corrected=mat4.fromTranslation(mat4.create(),[.02,0,-2.01]);assert.ok(t.refreshAnchor({getPose:()=>({emulatedPosition:false,transform:{matrix:corrected}})},{}));assert.deepEqual(Array.from(a),Array.from(corrected));assert.equal(t.refreshAnchor({getPose:()=>null},{}),false);assert.equal(t.visible,false);
 t.reposition();assert.equal(deleted,1);assert.equal(t.placed,false);
});
test('a late-created native anchor is deleted after session cancellation',async()=>{
 const a=mat4.create(),t=new WorldTracking(a),s={};t.begin(s);t.observe(viewer(),'visible',s);t.place(floor(),0,1);let resolve,deleted=0;const pending=t.attachNative({createAnchor:()=>new Promise(r=>resolve=r)});t.end();resolve({delete(){deleted++;}});assert.equal(await pending,false);assert.equal(deleted,1);assert.equal(t.visible,false);
});
