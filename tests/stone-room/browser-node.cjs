// Runs the existing browser.py assertions with the already available Node
// Playwright binding. It uses the production build/assets and no physical XR.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(process.env.STONE_ROOM_ROOT||'dist'),out=path.resolve(process.env.STONE_ROOM_TEST_OUTPUT||'tests/stone-room/node-results');
fs.mkdirSync(out,{recursive:true});
const mime={'.js':'text/javascript','.mjs':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary','.jpg':'image/jpeg','.png':'image/png'};
function serve(route,requests,errors){
 let file=path.resolve(root,'.'+new URL(route.request().url()).pathname.replace(/^\/TRADESIGHT(?=\/)/,''));if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){errors.push('missing '+file);return route.fulfill({status:404,body:'missing'});}
 requests.push(path.relative(root,file).replaceAll('\\','/'));return route.fulfill({body:fs.readFileSync(file),contentType:mime[path.extname(file)]||'application/octet-stream'});
}
const diag=page=>page.evaluate(()=>window.stoneRoom.diagnostics);
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),args:['--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const results=[];
 try{
 for(const [name,width,height,touch]of [['desktop',1280,800,false],['android-portrait',393,852,true],['android-landscape',852,393,true]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,hasTouch:touch,isMobile:touch}),page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://stone.test/**',r=>serve(r,requests,errors));
  await page.goto('https://stone.test/stone-room/');await page.waitForFunction(()=>window.stoneRoom?.diagnostics.loaded,null,{timeout:90000});await page.waitForTimeout(600);
  const initial=await diag(page);assert.deepEqual(initial.uvMissing,[]);assert(initial.npcHeight>1.6&&initial.npcHeight<2);assert.equal(initial.animations.length,4);assert(initial.ceilingVisible);assert(initial.floorContactSamples>0&&Math.abs(initial.groundClearance)<.015);assert(Math.abs(initial.npcScreen[0])<.8&&Math.abs(initial.npcScreen[1])<.8&&Math.abs(initial.npcScreen[2])<1);
  assert(requests.includes('stone-room/vendor/ARButton.js')&&requests.includes('stone-room/manual-placement.js')&&requests.includes('stone-room/update-guard.js'),'built graphics modules must load');
  await page.screenshot({path:path.join(out,name+'-initial.png'),timeout:120000});
  const start=initial.camera;await page.keyboard.down('w');try{await page.waitForFunction(s=>JSON.stringify(window.stoneRoom.diagnostics.camera)!==JSON.stringify(s),start);}finally{await page.keyboard.up('w');}
  await page.click('#reset');await page.click('#plan');assert((await diag(page)).top);assert(!(await diag(page)).ceilingVisible);await page.click('#plan');assert.deepEqual((await diag(page)).camera,start);
  await page.click('#npc-toggle');assert(await page.isVisible('#npcpanel'));await page.selectOption('#behaviour','wander');await page.waitForFunction(()=>window.stoneRoom.diagnostics.activeAnimation?.toLowerCase().includes('walk'));assert(Math.abs((await diag(page)).groundClearance)<.015);
  await page.click('#wave');await page.waitForTimeout(200);assert((await diag(page)).activeAnimation.toLowerCase().includes('wave'));await page.click('#stop');await page.click('#npc-close');assert(!(await page.isVisible('#npcpanel')));
  const box=await page.locator('#joystick').boundingBox(),joyStart=(await diag(page)).camera;await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y+10);
  try{await page.waitForFunction(s=>JSON.stringify(window.stoneRoom.diagnostics.camera)!==JSON.stringify(s),joyStart);}finally{await page.mouse.up();}
  await page.waitForTimeout(100);const stopped=(await diag(page)).camera;await page.waitForTimeout(200);assert.deepEqual((await diag(page)).camera,stopped);
  await page.mouse.move(box.x+box.width/2,box.y+10);await page.mouse.down();await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.mouse.move(box.x+box.width/2,box.y+15);assert.deepEqual((await diag(page)).input,{keys:[],joystick:{x:0,y:0},joyId:null});await page.mouse.up();
  if(name==='desktop'){
   await page.click('#reset');await page.locator('#speed').evaluate(el=>{el.value='3';el.dispatchEvent(new Event('input'));});await page.keyboard.down('w');
   try{await page.waitForFunction(()=>Math.hypot(window.stoneRoom.diagnostics.camera[0]-window.stoneRoom.diagnostics.npc[0],window.stoneRoom.diagnostics.camera[2]-window.stoneRoom.diagnostics.npc[2])<1.45,null,{timeout:120000});}finally{await page.keyboard.up('w');await page.locator('#speed').evaluate(el=>{el.value='1.4';el.dispatchEvent(new Event('input'));});}
   await page.screenshot({path:path.join(out,'npc-closeup.png'),timeout:120000});await page.click('#reset');
  }
  await page.screenshot({path:path.join(out,name+'.png'),timeout:120000});
  await page.waitForFunction(()=>/AR NOT SUPPORTED|WEBXR NOT AVAILABLE/.test(document.querySelector('#ar').textContent));assert((await diag(page)).roomVisible);assert.deepEqual(errors,[]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await page.evaluate(()=>document.body.contains(document.querySelector('#view'))));
  if(name==='desktop'){const update=await page.evaluate('('+fs.readFileSync('tests/stone-room/update-error-check.js','utf8')+')()');assert(update.failures>=3&&update.draws>0&&update.notices===1&&update.visible&&update.poseRestored&&update.normalAnimationResumed);assert(update.text.includes('Animation update failed: Injected animation update fault'));assert.deepEqual(errors,[]);results.push({scenario:'injected animation exception containment',evidence:update});}
  await page.evaluate(()=>{document.body.classList.add('in-ar');for(const id of ['ar-overlay','ar-ui','ar-motion','reposition'])document.getElementById(id).hidden=false;document.getElementById('ar-options').open=true;});
  for(const selector of ['#ar-content','#ar-speed','#place','#reposition','#exit-ar','#ar-follow','#ar-stop','#ar-wave']){const b=await page.locator(selector).boundingBox();assert(b&&b.x>=0&&b.y>=0&&b.x+b.width<=width+1&&b.y+b.height<=height+1,'AR control outside viewport: '+selector);}
  const options=await page.locator('#ar-options').boundingBox(),actions=await page.locator('.ar-actions').first().boundingBox();assert(options.y+options.height<=actions.y||options.x+options.width<=actions.x,'AR panels overlap');
  await page.evaluate(()=>document.querySelector('#view').dispatchEvent(new Event('webglcontextlost',{cancelable:true})));assert((await page.locator('#error').innerText()).includes('Graphics context lost'));
  results.push({viewport:name,dimensions:[width,height],diagnostics:initial,requests,errors,scope:'Production GLBs, UI/movement/animation/layout/errors; no physical XR'});console.log('PASS '+name);await context.close();
 }
 const context=await browser.newContext(),page=await context.newPage(),errors=[],requests=[];await page.route('https://stone.test/**',r=>serve(r,requests,errors));await page.goto('https://stone.test/stone-room/?graphics=compat');await page.waitForFunction(()=>window.stoneRoom?.diagnostics.loaded,null,{timeout:90000});assert.equal((await diag(page)).graphicsMode,'compat');assert.equal((await diag(page)).antialias,false);assert(!(await page.locator('#ar-probe').isChecked()));
 const python=fs.readFileSync('tests/stone-room/browser.py','utf8'),probe=python.match(/pixels=compat\.evaluate\("""([\s\S]*?)"""\)/)[1],pixels=await page.evaluate('('+probe+')()');assert.equal(pixels.off[3],0);assert.deepEqual(pixels.on,[255,0,255,255]);assert.equal(pixels.restored[3],0);
 const direct=await page.evaluate('('+fs.readFileSync('tests/stone-room/ar-render-check.js','utf8')+')()');assert(direct.coloured>1000&&direct.clips.length===4);assert.deepEqual(direct.errors,[]);fs.writeFileSync(path.join(out,'ar-render-profile.png'),Buffer.from(direct.screenshot.split(',')[1],'base64'));delete direct.screenshot;results.push({scenario:'compatibility/probe/production-character pixels',pixels,direct});const xr=await page.evaluate('('+fs.readFileSync('tests/stone-room/lighthouse-xr-check.js','utf8')+')()');assert.deepEqual(xr.errors,[]);for(const step of xr.result){assert(step.immediate&&step.follows&&step.stopped&&step.retained&&step.restored);assert(step.manualPixels>100);assert(step.clips.every(c=>c.pixels>100));assert.deepEqual(step.positioned,[.3,-.8,-4]);assert.equal(step.scale,.6);assert(Math.abs(step.yaw-Math.PI/6)<1e-6);}results.push({scenario:'Lighthouse manual XR lifecycle',evidence:xr});console.log('PASS Lighthouse XR lifecycle');await context.close();
 const unavailable=await browser.newContext();await unavailable.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^(webgl2?|experimental-webgl)$/.test(type)?null:original.call(this,type,...args);};});const blocked=await unavailable.newPage();await blocked.route('https://stone.test/**',r=>serve(r,[],[]));await blocked.goto('https://stone.test/stone-room/');await blocked.waitForFunction(()=>document.querySelector('#error').textContent.includes('3D graphics could not start'));assert(!(await blocked.isVisible('#loading')));assert(await blocked.locator('#ar').isDisabled());await unavailable.close();results.push({scenario:'unavailable graphics',passed:true});
 const mainContext=await browser.newContext(),main=await mainContext.newPage(),mainErrors=[];main.on('pageerror',e=>mainErrors.push(e.message));await main.route('https://stone.test/**',r=>serve(r,[],mainErrors));await main.goto('https://stone.test/TRADESIGHT/');await main.waitForSelector('h1');assert((await main.locator('h1').innerText()).includes('TRADESIGHT'));assert.deepEqual(mainErrors,[]);await mainContext.close();results.push({scenario:'built main application',passed:true,errors:mainErrors});
 fs.writeFileSync(path.join(out,'browser-node-report.json'),JSON.stringify({results,scope:'Production build and assets in desktop browser/mobile viewports; no physical AR'},null,2)+'\n');console.log('PASS compatibility, production GLB pixels, unavailable graphics, main application');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
