const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.AR_BASE_URL||'http://localhost:8766',out=process.env.AR_OUTPUT_DIR||'/tmp/ar-validation/cube-orientation';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.AR_BROWSER||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:915,height:412}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  const identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  window.testViewer={x:0,y:1.6,z:3};window.testHit=identity();
  class Session extends EventTarget{
   constructor(){super();this.enabledFeatures=['local','hit-test','dom-overlay'];this.domOverlayState={type:'screen'};this.visibilityState='visible';this.environmentBlendMode='alpha-blend';this.renderState={};this.inputSources=[];}
   updateRenderState(state){Object.assign(this.renderState,state);}
   async requestReferenceSpace(){return new EventTarget();}async requestHitTestSource(){return {cancel(){}};}requestAnimationFrame(fn){this.next=fn;return 1;}async end(){this.dispatchEvent(new Event('end'));}
  }
  Object.defineProperty(navigator,'xr',{value:{isSessionSupported:async()=>true,requestSession:async()=>window.testSession=new Session()}});
  window.XRWebGLLayer=class{constructor(s,gl){this.framebuffer=null;}getViewport(){return {x:0,y:0,width:720,height:360};}};
  let time=0;window.driveFrame=()=>{
   const world=identity(),inverse=identity(),v=window.testViewer;world[12]=v.x;world[13]=v.y;world[14]=v.z;inverse[12]=-v.x;inverse[13]=-v.y;inverse[14]=-v.z;
   const projection=identity();projection[5]=2;projection[10]=-1.002;projection[11]=-1;projection[14]=-.2;projection[15]=0;
   const view={eye:'none',projectionMatrix:projection,transform:{matrix:world,position:v,orientation:{x:0,y:0,z:0,w:1},inverse:{matrix:inverse}}};
   const frame={session:testSession,getViewerPose:()=>({views:[view],transform:{matrix:world,position:v}}),getHitTestResults:()=>[{getPose:()=>({transform:{matrix:window.testHit}})}]};testSession.next(time+=16,frame);
  };
 });
 await page.goto(base+'/ar-experiments/mayhem-ar/ar-colour-vision-001/index.html');await page.waitForFunction(()=>window.ARColourApp?.state.supported);await page.click('#ar-start');await page.waitForFunction(()=>ARColourApp.state.session);
 const cases=[];
 for(const kind of ['cube','gallery','pavilion','surface']){
  await page.selectOption('#ar-kind',kind);await page.click('#ar-reset');
  await page.evaluate(()=>{testSession.dispatchEvent(new Event('select'));driveFrame();});
  const evidence=await page.evaluate(()=>{const item=ARColourApp.state.items[0],m=item.matrix,dx=testViewer.x-testHit[12],dz=testViewer.z-testHit[14];return {kind:item.kind,matrix:m,facingDot:(m[8]*dx+m[10]*dz)/Math.hypot(dx,dz),anchor:[testHit[12],testHit[13],testHit[14]]};});
  assert.ok(Math.abs(evidence.facingDot-(kind==='cube'?1:-1))<1e-6);assert.deepEqual([evidence.matrix[12],evidence.matrix[13],evidence.matrix[14]],evidence.anchor);cases.push(evidence);
  if(kind==='cube'){await page.click('#ar-menu');await page.evaluate(()=>ARColourApp.gl.canvas.style.visibility='visible');await page.screenshot({path:out+'/initial-cube-opening.png'});await page.click('#ar-menu');}
 }
 await page.selectOption('#ar-kind','cube');await page.click('#ar-reset');await page.evaluate(()=>{testSession.dispatchEvent(new Event('select'));driveFrame();});const before=await page.evaluate(()=>ARColourApp.state.items[0].matrix);
 await page.click('#ar-reposition');await page.evaluate(()=>{testHit[12]=4;testHit[13]=.5;testHit[14]=-2;testViewer={x:7,y:1.6,z:2};driveFrame();});assert.deepEqual(await page.evaluate(()=>ARColourApp.state.items[0].matrix),before);
 await page.click('#ar-reposition');assert.deepEqual(await page.evaluate(()=>ARColourApp.state.items[0].matrix),before);
 await page.click('#ar-reposition');await page.evaluate(()=>{testSession.dispatchEvent(new Event('select'));driveFrame();});
 const repositioned=await page.evaluate(()=>{const m=ARColourApp.state.items[0].matrix;return {matrix:m,dot:(m[8]*3+m[10]*4)/5};});assert.ok(Math.abs(repositioned.dot-1)<1e-6);assert.deepEqual(repositioned.matrix.slice(12,15),[4,.5,-2]);assert.deepEqual(errors,[]);
 const result={scope:'Synthetic WebXR poses/session, actual served app and real Chromium WebGL; no physical phone claim',cases,repositioned,pageErrors:errors};await writeFile(out+'/browser-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}
