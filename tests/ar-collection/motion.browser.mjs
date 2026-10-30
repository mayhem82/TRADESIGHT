const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const baseURL=process.env.AR_BASE_URL||'http://localhost:8765';
const outputDir=process.env.AR_OUTPUT_DIR||'/tmp/ar-validation';
await mkdir(outputDir,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.AR_BROWSER||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try {
const results=[];
for(const app of ['single-wall-009','single-wall-010','ar-sound-vision-autostereography-001']){
 const page=await browser.newPage({viewport:{width:915,height:412},hasTouch:true});
 await page.addInitScript(()=>{
  const identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  class Session extends EventTarget{
   constructor(){super();this.enabledFeatures=['local','hit-test','dom-overlay'];this.domOverlayState={type:'screen'};this.visibilityState='visible';this.environmentBlendMode='alpha-blend';this.renderState={};this.inputSources=[];}
   updateRenderState(s){Object.assign(this.renderState,s);}
   async requestReferenceSpace(){return new EventTarget();}
   async requestHitTestSource(){return {cancel(){}};}
   requestAnimationFrame(fn){this.next=fn;return 1;}
   async end(){this.dispatchEvent(new Event('end'));}
  }
  Object.defineProperty(navigator,'xr',{value:{isSessionSupported:async()=>true,requestSession:async()=>window.testSession=new Session()}});
  window.XRWebGLLayer=class{constructor(s,gl){this.framebuffer=null;this.framebufferWidth=gl.drawingBufferWidth;this.framebufferHeight=gl.drawingBufferHeight;}getViewport(){return {x:0,y:0,width:720,height:360};}};
  let time=0;
  window.driveFrame=()=>{const s=window.testSession,world=identity(),inverse=identity();world[13]=1.6;world[14]=3;inverse[13]=-1.6;inverse[14]=-3;
   const projection=identity();projection[0]=1;projection[5]=2;projection[10]=-1.002;projection[11]=-1;projection[14]=-.2;projection[15]=0;
   const view={eye:'none',projectionMatrix:projection,transform:{matrix:world,position:{x:0,y:1.6,z:3},orientation:{x:0,y:0,z:0,w:1},inverse:{matrix:inverse}}};
   const frame={session:s,getViewerPose:()=>({views:[view],transform:{matrix:world,position:{x:0,y:1.6,z:3}}}),getHitTestResults:()=>[{getPose:()=>({transform:{matrix:identity()}})}]};
   s.next(time+=16,frame);
  };
 });
 await page.goto(`${baseURL}/ar-experiments/mayhem-ar/${app}/index.html?test=1`);
 await page.waitForFunction(()=>window.__WALL?.state.ready);
 await page.click('#basic');await page.waitForFunction(()=>window.__WALL.state.active);
 await page.evaluate(()=>{testSession.dispatchEvent(new Event('select'));driveFrame();driveFrame();});
 assert.equal((await page.evaluate(()=>__WALL.state.walls)).length,1,app+' placement');
 await page.click('#menu-toggle');assert.equal(await page.locator('#panel').getAttribute('hidden'),'');
 const before=await page.evaluate(()=>__WALL.state.walls[0].model);
 const rect=await page.locator('#move-stick').boundingBox();
 await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await page.mouse.down();await page.mouse.move(rect.x+rect.width*.8,rect.y+rect.height/2);
 await page.evaluate(()=>{for(let i=0;i<5;i++)driveFrame();});
 const during=await page.evaluate(()=>__WALL.state);assert.ok(during.joystick.x>.2,app+' pointer input');assert.notEqual(during.walls[0].model[12],before[12],app+' hidden menu moves world wall');
 await page.mouse.up();assert.equal(await page.evaluate(()=>__WALL.state.joystick.x),0);
 if(app!=='single-wall-009'){
  const p=await page.locator('#pose-stick').boundingBox();const before=await page.evaluate(()=>__WALL.state.walls[0].model[13]);
  await page.mouse.move(p.x+p.width/2,p.y+p.height/2);await page.mouse.down();await page.mouse.move(p.x+p.width/2,p.y+p.height*.2);await page.evaluate(()=>{for(let i=0;i<5;i++)driveFrame();});
  assert.ok(await page.evaluate(before=>__WALL.state.walls[0].model[13]>before,before));await page.mouse.up();
 }
 await page.setViewportSize({width:412,height:915});
 const ground=await page.locator('#move-stick').boundingBox(),pose=app==='single-wall-009'?null:await page.locator('#pose-stick').boundingBox();
 const cdp=await page.context().newCDPSession(page);
 const points=[{x:ground.x+ground.width*.8,y:ground.y+ground.height/2,id:1}];
 if(pose)points.push({x:pose.x+pose.width/2,y:pose.y+pose.height*.2,id:2});
 const touchBefore=await page.evaluate(()=>__WALL.state.walls[0].model);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});
 await page.evaluate(()=>{for(let i=0;i<5;i++)driveFrame();});
 const touched=await page.evaluate(()=>__WALL.state);assert.ok(touched.joystick.x>.2);assert.notEqual(touched.walls[0].model[12],touchBefore[12]);
 if(pose){assert.ok(touched.poseJoystick.y<-.2);assert.ok(touched.walls[0].model[13]>touchBefore[13]);}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.equal(await page.evaluate(()=>__WALL.state.joystick.x),0);
 if(pose)assert.equal(await page.evaluate(()=>__WALL.state.poseJoystick.y),0);
 await page.screenshot({path:`${outputDir}/${app}-portrait-hidden.png`});
 await page.click('#exit');await page.waitForFunction(()=>!window.__WALL.state.active);
 results.push({app,hiddenMenuMovement:true,releaseStops:true,exitWorks:true,portraitTouchMovement:true,simultaneousTouch:app!=='single-wall-009'});await page.close();
}
console.log(JSON.stringify(results,null,2));

} finally { await browser.close(); }
