const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {installXREmulator} from './xr-emulator.mjs';
const base=process.env.AR_BASE_URL||'http://localhost:8765';
const out=process.env.AR_OUTPUT_DIR||'/tmp/ar-validation/speed';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.AR_BROWSER||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const results=[];const selected=app=>!process.env.AR_SPEED_FILTER||process.env.AR_SPEED_FILTER===app;
const speed=(page,value)=>page.locator('#travel-speed').evaluate((e,v)=>{e.value=String(v);e.dispatchEvent(new Event('input',{bubbles:true}));},value);
async function drag(page,id,vertical=false){const r=await page.locator(id).boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width*(vertical?.5:.88),r.y+r.height*(vertical?.12:.5));}
try{
 for(const app of ['ar-colour-vision-001','single-wall-009','single-wall-010','ar-sound-vision-autostereography-001','tv-tabletop-002'].filter(selected)){
  const page=await browser.newPage({viewport:{width:915,height:412},hasTouch:true});await page.addInitScript(installXREmulator);
  await page.goto(`${base}/ar-experiments/mayhem-ar/${app}/index.html?test=1`);await page.waitForSelector('#travel-speed');
  const colour=app==='ar-colour-vision-001',tv=app==='tv-tabletop-002';
  await page.waitForFunction(({colour,tv})=>colour?window.ARColourApp?.state.supported:tv?window.__TV?.state.ready:window.__WALL?.state.ready,{colour,tv});
  await page.click(colour?'#ar-start':tv?'#start':'#basic');await page.waitForFunction(({colour,tv})=>colour?ARColourApp.state.session:tv?__TV.state.active:__WALL.state.active,{colour,tv});
  await page.evaluate(({colour,tv})=>{testSession.dispatchEvent(new Event('select'));driveFrame();driveFrame();window.readSpeedMatrix=()=>colour?ARColourApp.state.items[0].matrix:tv?__TV.state.matrix:__WALL.state.walls[0].model;},{colour,tv});
  await page.click(colour?'#ar-menu':'#menu-toggle');await page.evaluate(()=>driveFrame());
  const ground=colour?'#ar-move':'#move-stick',pose=colour?'#ar-pose':tv?'#turn-stick':'#pose-stick';
  const distances=[];
  for(const exponent of [0,-3,5]){
   await speed(page,exponent);const before=await page.evaluate(()=>readSpeedMatrix());await drag(page,ground);
   await page.evaluate(()=>{for(let i=0;i<60;i++)driveFrame();});await page.mouse.up();const after=await page.evaluate(()=>readSpeedMatrix());
   distances.push(Math.hypot(after[12]-before[12],after[14]-before[14]));assert.equal(after[13],before[13],app+' horizontal move preserves height');
  }
  assert.ok(distances[2]>5,app+' fast traversal covers metres');assert.ok(Math.abs(distances[2]/distances[0]-32)<.01,JSON.stringify({app,distances}));assert.ok(Math.abs(distances[1]/distances[0]-.125)<.001,JSON.stringify({app,distances}));
  if(app!=='single-wall-009'){
   const yaw=[],height=[];for(const exponent of [0,5]){await speed(page,exponent);const before=await page.evaluate(()=>readSpeedMatrix());await drag(page,pose);await page.evaluate(()=>{for(let i=0;i<10;i++)driveFrame();});await page.mouse.up();const after=await page.evaluate(()=>readSpeedMatrix());yaw.push(Math.atan2(after[8],after[10])-Math.atan2(before[8],before[10]));
    if(!tv){await drag(page,pose,true);const h=await page.evaluate(()=>readSpeedMatrix()[13]);await page.evaluate(()=>{for(let i=0;i<10;i++)driveFrame();});await page.mouse.up();height.push((await page.evaluate(()=>readSpeedMatrix()[13]))-h);}}
   assert.ok(Math.abs(yaw[0]-yaw[1])<.001,app+' unchanged yaw rate');if(!tv)assert.ok(Math.abs(height[1]/height[0]-32)<.01);
  }
  if(colour||app==='ar-sound-vision-autostereography-001'){
   await page.setViewportSize({width:412,height:915});const cdp=await page.context().newCDPSession(page),a=await page.locator(ground).boundingBox(),b=await page.locator(pose).boundingBox(),r=await page.locator('#travel-speed').boundingBox();
   const points=[{id:1,x:a.x+a.width*.85,y:a.y+a.height/2},{id:2,x:b.x+b.width/2,y:b.y+b.height*.15}];
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[...points,{id:3,x:r.x+r.width/2,y:r.y+r.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[...points,{id:3,x:r.x+r.width-1,y:r.y+r.height/2}]});
   const state=await page.evaluate(colour=>colour?ARTravelSpeed.multiplier>1:__WALL.state.joystick.x>.2&&__WALL.state.poseJoystick.y<-.2&&ARTravelSpeed.multiplier>1,colour);assert.ok(state,app+' slider gesture coexists with both owned stick touches');const beforeTouch=await page.evaluate(()=>readSpeedMatrix());await page.evaluate(()=>{for(let i=0;i<5;i++)driveFrame();});const afterTouch=await page.evaluate(()=>readSpeedMatrix());assert.notEqual(afterTouch[12],beforeTouch[12]);assert.notEqual(afterTouch[13],beforeTouch[13]);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }
  if(app==='ar-sound-vision-autostereography-001'){
   await speed(page,5);const r=await page.locator('#wall-nearer').boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.evaluate(()=>{for(let i=0;i<300;i++)driveFrame();});await page.mouse.up();
   const distance=await page.evaluate(()=>{const w=__WALL.wall.active,m=w.model;return Math.hypot(m[12]-m[8]*w.radius,m[14]-m[10]*w.radius-3);});assert.ok(distance>=.7499&&distance<=.751,'fast nearer motion retains 0.75m stop');
  }
  await page.locator('#travel-speed').focus();await page.keyboard.press('Home');assert.equal(await page.evaluate(()=>ARTravelSpeed.multiplier),.125);await page.keyboard.press('End');assert.equal(await page.evaluate(()=>ARTravelSpeed.multiplier),32);await page.getByRole('button',{name:'Reset movement speed to normal'}).click();assert.equal(await page.evaluate(()=>ARTravelSpeed.multiplier),1);
  results.push({app,metresOver60Frames:distances,fastToNormal:distances[2]/distances[0],slowToNormal:distances[1]/distances[0],rotationUnchanged:true});await page.screenshot({path:`${out}/${app}.png`});await page.close();
 }
 for(const file of ['bellbrook-yowie-v1','bellbrook-yowie-v2','bellbrook-yowie-v3','bellbrook-yowie-v4','walking-stable','joystick-movement'].filter(selected)){
  const page=await browser.newPage({viewport:{width:412,height:915}});
  // Test-only instance access; production responses and model/renderer code are otherwise intact.
  await page.route('**/*.bundle.js*',async route=>{const response=await route.fetch();let body=await response.text();if(body.includes('this.speed=.75'))body=body.replace('this.speed=.75','this.speed=.75,window.__SPEED_WALKER=this');await route.fulfill({response,body});});
  await page.goto(`${base}/ar-experiments/mayhem-ar/stone-room/reference/${file}.html`);await page.waitForFunction(()=>window.__SPEED_WALKER&&document.querySelector('#travel-speed'));
  await page.evaluate(()=>{const w=__SPEED_WALKER;w.active=true;w.placing=false;w.node={matrix:new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])};w.overlay.hidden=false;if(w.ground)w.ground.enabled=false;});
  const distances=[];for(const exponent of [0,-3,5]){await speed(page,exponent);await drag(page,'#walking-joystick');const distance=await page.evaluate(()=>{const w=__SPEED_WALKER,before=w.node.matrix.slice(),pose={transform:{matrix:new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}};w.lastTime=0;for(let i=1;i<=60;i++)w.update(i*16,pose);return Math.hypot(w.node.matrix[12]-before[12],w.node.matrix[14]-before[14]);});await page.mouse.up();distances.push(distance);}
  assert.ok(Math.abs(distances[2]/distances[0]-32)<.01,file);assert.ok(Math.abs(distances[1]/distances[0]-.125)<.001,file);
  if(file==='bellbrook-yowie-v4'){
   await page.evaluate(()=>{const w=__SPEED_WALKER;w.navigation={active:true,input(){}};});const route=[];
   for(const value of [0,5]){await speed(page,value);route.push(await page.evaluate(()=>{const w=__SPEED_WALKER,before=w.node.matrix.slice();w.joystick.x=1;w.joystick.y=0;w.lastTime=0;for(let i=1;i<=60;i++)w.update(i*16,{transform:{matrix:new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}});w.joystick.stop();return Math.hypot(w.node.matrix[12]-before[12],w.node.matrix[14]-before[14]);}));}
   assert.ok(Math.abs(route[0]-route[1])<.0001,'automatic route unaffected by manual speed slider');
  }
  results.push({app:file,metresOver60Frames:distances,fastToNormal:distances[2]/distances[0],slowToNormal:distances[1]/distances[0]});await page.screenshot({path:`${out}/${file}.png`});await page.close();
 }
 if(selected('stone-room-texture-001')){const room=await browser.newPage({viewport:{width:412,height:915}});
 await room.route('**/stone-room-texture-001/room.js*',async route=>{const response=await route.fetch();const body=(await response.text())+'\nwindow.__SPEED_ROOM={move,camera,joystick,setYaw:value=>yaw=value};';await route.fulfill({response,body});});
 await room.goto(`${base}/ar-experiments/mayhem-ar/stone-room-texture-001/index.html`);await room.waitForFunction(()=>window.__SPEED_ROOM&&window.stoneRoom?.diagnostics.loaded&&document.querySelector('#travel-speed'),null,{timeout:60000});
 const distances=[];for(const exponent of [0,-3,5]){await speed(room,exponent);distances.push(await room.evaluate(()=>{const r=__SPEED_ROOM;r.camera.position.set(-2.05,1.65,2.05);r.setYaw(0);r.joystick.x=1;r.joystick.y=0;r.move(.016);r.joystick.x=0;return r.camera.position.x+2.05;}));}
 assert.ok(Math.abs(distances[2]/distances[0]-32)<.01);assert.ok(Math.abs(distances[1]/distances[0]-.125)<.001);
 await room.evaluate(()=>{const r=__SPEED_ROOM;r.camera.position.x=3.7;r.joystick.x=1;r.move(.05);r.joystick.x=0;});assert.ok(await room.evaluate(()=>__SPEED_ROOM.camera.position.x<4));
 results.push({app:'stone-room-texture-001 walkthrough',metresOverOne16msFrame:distances,fastToNormal:distances[2]/distances[0],roomBoundsRetained:true});await room.close();}
 assert.ok(results.length);
 await writeFile(`${out}/movement-results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}
