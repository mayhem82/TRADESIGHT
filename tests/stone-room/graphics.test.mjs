import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../../public/stone-room/vendor/three.module.js';
import {createXRGraphics,PROBE_BOUNDS} from '../../public/stone-room/xr-graphics.js';
import {renderScene} from '../../public/stone-room/xr-presentation.js';
import fs from 'node:fs';

function fixture(){
 let queries=0;const framebuffer={},target={samples:4},errorQueue=[];
 const gl={FRAMEBUFFER:1,FRAMEBUFFER_COMPLETE:2,FRAMEBUFFER_BINDING:3,VIEWPORT:4,NO_ERROR:0,
  checkFramebufferStatus(){queries++;return 2;},getParameter(p){return p===3?framebuffer:new Int32Array([0,0,32,32]);},getError(){return errorQueue.shift()??0;}};
 const renderer={autoClear:true,getContext:()=>gl,getRenderTarget:()=>target,xr:{getBaseLayer:()=>({framebuffer})}};
 const scene=new THREE.Scene(),api=createXRGraphics(renderer,scene),probe=scene.children[0];
 return {api,scene,probe,gl,renderer,errorQueue,target,get queries(){return queries;}};
}
test('clip-space probe is opt-in, last, opaque, depth independent and bounded',()=>{
 const f=fixture(),p=f.probe;
 assert.equal(p.visible,false);assert.equal(p.frustumCulled,false);assert.equal(p.material.depthTest,false);
 assert.equal(p.material.blending,THREE.NoBlending);assert.equal(p.material.transparent,true);
 p.geometry.computeBoundingBox();assert.ok(Math.abs(p.geometry.boundingBox.min.x-PROBE_BOUNDS.left)<1e-6);
 assert.ok(Math.abs(p.geometry.boundingBox.max.y-PROBE_BOUNDS.top)<1e-6);
 f.api.beforeFrame(true);p.onAfterRender();const result=f.api.afterFrame(630);
 assert.equal(result.probeDraws,1);assert.equal(result.probeFrameDraws,1);assert.equal(result.probeFbo,'complete');
 assert.equal(result.layer,'webgl');assert.equal(result.baseFramebufferMatches,true);assert.equal(result.samples,4);
 assert.deepEqual(result.viewport,[0,0,32,32]);assert.equal(result.sampledFrame,630);
 assert.equal(f.renderer.autoClear,true);assert.equal(f.renderer.getRenderTarget(),f.target);
 for(let i=2;i<30;i++){f.api.beforeFrame(false);f.api.afterFrame(i);}
 assert.equal(f.queries,2);f.api.beforeFrame(false);f.api.afterFrame(30);assert.equal(f.queries,3);
});
test('probe and post-render errors remain distinct; returned arrays cannot corrupt cache',()=>{
 const f=fixture();f.api.beforeFrame(true);f.errorQueue.push(1282);f.probe.onAfterRender();
 f.errorQueue.push(1286);const stats=f.api.afterFrame();assert.deepEqual(stats.probeErrors,['0x502']);assert.deepEqual(stats.errors,['0x506']);
 stats.errors.push('mutated');assert.deepEqual(f.api.afterFrame().errors,['0x506']);
});
test('query failures do not interrupt rendering; reset and disposal are safe',()=>{
 const f=fixture();f.gl.checkFramebufferStatus=()=>{throw Error('unavailable');};
 f.api.beforeFrame(true);assert.doesNotThrow(()=>f.probe.onAfterRender());assert.equal(f.api.afterFrame().fbo,'query failed');
 f.api.reset();assert.equal(f.probe.visible,false);assert.equal(f.api.afterFrame().probeDraws,0);
 let disposed=0;f.probe.geometry.addEventListener('dispose',()=>disposed++);f.probe.material.addEventListener('dispose',()=>disposed++);
 f.api.dispose();f.api.dispose();assert.equal(disposed,2);assert.equal(f.scene.children.length,0);f.api.beforeFrame(true);assert.equal(f.probe.visible,false);
});
test('projection-layer detection does not assume an external framebuffer',()=>{
 const f=fixture();f.renderer.xr.getBaseLayer=()=>({textureWidth:32});f.api.beforeFrame(false);
 const stats=f.api.afterFrame();assert.equal(stats.layer,'projection');assert.equal(stats.baseFramebufferMatches,null);
});

// Exercise the same enter/exit path used for actual NPC and room rendering.
import {createARRenderProfile} from '../../public/stone-room/ar-render-profile.js';
test('direct-lit AR keeps textured skinned geometry and restores the walkthrough shader inputs',()=>{
 const scene=new THREE.Scene(),root=new THREE.Group();scene.add(root);
 const albedo=new THREE.Texture(),normal=new THREE.Texture(),roughness=new THREE.Texture(),metalness=new THREE.Texture(),environment=new THREE.Texture();
 scene.environment=environment;
 const material=new THREE.MeshStandardMaterial({map:albedo,normalMap:normal,roughnessMap:roughness,metalnessMap:metalness,envMap:environment});
 const mesh=new THREE.SkinnedMesh(new THREE.BoxGeometry(),material);root.add(mesh);const geometry=mesh.geometry;
 let alpha=.7;const renderer={shadowMap:{enabled:true},toneMapping:THREE.ACESFilmicToneMapping,getClearAlpha:()=>alpha,setClearAlpha:v=>alpha=v};
 const profile=createARRenderProfile(renderer,scene,root);
 profile.enter();profile.enter();assert.equal(profile.active,true);assert.equal(mesh.geometry,geometry);assert.equal(mesh.isSkinnedMesh,true);assert.equal(material.map,albedo);assert.equal(material.normalMap,null);assert.equal(material.roughnessMap,null);assert.equal(scene.environment,null);assert.equal(renderer.shadowMap.enabled,false);assert.equal(alpha,0);
 profile.exit();profile.exit();assert.equal(profile.active,false);assert.equal(material.normalMap,normal);assert.equal(material.roughnessMap,roughness);assert.equal(material.metalnessMap,metalness);assert.equal(material.envMap,environment);assert.equal(scene.environment,environment);assert.equal(renderer.shadowMap.enabled,true);assert.equal(renderer.toneMapping,THREE.ACESFilmicToneMapping);assert.equal(alpha,.7);
 profile.enter();profile.exit();assert.equal(material.normalMap,normal,'a second session also restores the original map');
});

test('XR rendering repairs a stale physical binding without replacing the XR target',()=>{
 const projection={isXRRenderTarget:true,samples:4},scene={},camera={};
 let logical=projection,bound='walkthrough-shadow',cache='projection',rendered=false;
 const renderer={xr:{isPresenting:true},getRenderTarget:()=>logical,
  resetState(){logical=null;cache=null;bound=null;},
  setRenderTarget(target){assert.equal(target,projection);logical=target;if(cache!==target){bound=target;cache=target;}},
  render(s,c){assert.equal(s,scene);assert.equal(c,camera);assert.equal(bound,projection);assert.equal(logical,projection);rendered=true;}};
 renderScene(renderer,scene,camera);assert.equal(rendered,true);assert.equal(projection.samples,4);
});
test('ordinary walkthrough rendering does not reset graphics or change its target',()=>{
 let rendered=false;const renderer={xr:{isPresenting:false},resetState(){assert.fail('walkthrough reset')},setRenderTarget(){assert.fail('walkthrough rebind')},render(){rendered=true}};
 renderScene(renderer,{},{});assert.equal(rendered,true);
});
test('missing XR target reaches the existing visible AR error handler',()=>{
 const renderer={xr:{isPresenting:true},getRenderTarget:()=>null,render(){assert.fail('wrong framebuffer render')}};
 let visible='';const ar={renderError:e=>{visible='AR graphics error: '+e.message}};
 try{renderScene(renderer,{},{});}catch(e){ar.renderError(e);}
 assert.equal(visible,'AR graphics error: XR projection target is unavailable');
 const source=fs.readFileSync(new URL('../../public/stone-room/room.js',import.meta.url),'utf8');
 assert.match(source,/if\(renderScene\(renderer,scene,camera,frame\)&&ar.active\)/);
 assert.match(source,/catch\(e\)\{if\(ar.active\)ar.renderError\(e\)/);
});
test('live byte verifier includes the new presentation module',()=>{
 const source=fs.readFileSync(new URL('./live.py',import.meta.url),'utf8');
 assert.match(source,/'xr-presentation\.js'/);
});
test('initial XR frames without a viewer pose wait without a false graphics error',()=>{
 const reference={},renderer={xr:{isPresenting:true,getReferenceSpace:()=>reference},getRenderTarget:()=>null,render(){assert.fail('render before tracking')}};
 const frame={getViewerPose:r=>{assert.equal(r,reference);return null;}};
 assert.equal(renderScene(renderer,{}, {},frame),false);
 assert.throws(()=>renderScene(renderer,{}, {},{getViewerPose:()=>({})}),/XR projection target/);
});
