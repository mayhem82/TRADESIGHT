const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const baseURL=process.env.AR_BASE_URL||'http://localhost:8765';
const outputDir=process.env.AR_OUTPUT_DIR||'/tmp/ar-validation';
const browser=await chromium.launch({executablePath:process.env.AR_BROWSER||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try {
const pages=['index.html','ar-colour-vision-001/index.html','ar-sound-vision-autostereography-001/index.html','tv-tabletop-002/index.html','mayhem-text-003/index.html','invisibility-wall-005/index.html','invisibility-wall-006/index.html','invisibility-wall-008/index.html',...'bcdefg'.split('').map(x=>`invisibility-wall-008${x}/index.html`),'single-wall-009/index.html','single-wall-010/index.html','stone-room-texture-001/index.html','experiments/ar-marker/index.html','experiments/opencv-outline/index.html',...['bellbrook-yowie-v1','bellbrook-yowie-v2','bellbrook-yowie-v3','bellbrook-yowie-v4','walking-stable','joystick-movement','placement'].map(x=>`stone-room/reference/${x}.html`)];
await mkdir(outputDir,{recursive:true});
const results=[];
for(const path of pages){
 const page=await browser.newPage({viewport:{width:412,height:915}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(baseURL+'/ar-experiments/mayhem-ar/'+path+'?test=1',{waitUntil:'load',timeout:30000});
 await page.waitForTimeout(300);
 for(const [width,height] of [[412,915],[915,412]]){
  await page.setViewportSize({width,height});
  await page.evaluate(()=>{
   if(document.querySelector('#walking-overlay'))document.querySelector('#walking-overlay').hidden=false;
   else if(document.querySelector('#ar-overlay')){document.body.classList.add('in-ar');document.querySelector('#ar-overlay').hidden=false;document.querySelector('#ar-ui').hidden=false;}
   else if(document.querySelector('#overlay')&&!document.querySelector('#ar-tools'))document.body.classList.add('xr');
  });
  await page.evaluate(()=>{
   const p=document.querySelector('#panel');if(p&&!document.querySelector('#ar-tools'))p.hidden=false;
   document.querySelector('#walking-overlay')?.classList.remove('collection-info-hidden');
   document.body.classList.remove('menu-hidden','collection-room-hidden','collection-simple-hidden');
  });
  for(const hidden of [false,true]){
   if(hidden){
    const toggle=page.locator('#ar-menu,#menu-toggle,#walking-overlay .collection-menu,#collection-room-menu,#collection-simple-menu').first();
    assert.equal(await toggle.count(),1,path+' menu exists');await toggle.click();
   }
   await page.waitForTimeout(80);
   const metrics=await page.evaluate(()=>{
    const sticks=[...document.querySelectorAll('#ar-move,#ar-pose,#move-stick,#pose-stick,#turn-stick,#walking-joystick')];
    const checks=sticks.map(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {id:el.id,x:r.x,y:r.y,w:r.width,h:r.height,visible:!!el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden',hit:el.contains(hit),inside:r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight};});
    return {sticks:checks,panel:document.querySelector('#panel')?.getBoundingClientRect().toJSON(),actions:document.querySelector('#collection-actions')?.getBoundingClientRect().toJSON(),overflow:document.documentElement.scrollWidth>innerWidth};
   });
   results.push({path,width,height,hidden,fullscreen:false,...metrics,errors});
   if(hidden){
    await page.evaluate(()=>document.documentElement.requestFullscreen());
    const full=await page.evaluate(()=>[...document.querySelectorAll('#ar-move,#ar-pose,#move-stick,#pose-stick,#turn-stick,#walking-joystick')].map(el=>{const r=el.getBoundingClientRect();return {id:el.id,w:r.width,h:r.height,visible:!!el.getClientRects().length,hit:el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),inside:r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight};}));
    results.push({path,width,height,hidden,fullscreen:true,sticks:full,errors});
    await page.evaluate(()=>document.exitFullscreen());
   }
  }
 }
 await page.close();
}
await writeFile(outputDir+'/layout-results.json',JSON.stringify(results,null,2));
const failures=results.filter(r=>r.sticks.some(s=>!s.visible||!s.hit||!s.inside));console.log(JSON.stringify({cases:results.length,failures,errors:results.filter(r=>r.errors.length).map(r=>({path:r.path,errors:r.errors})).filter((r,i,a)=>a.findIndex(x=>x.path===r.path)===i)},null,2));

if(failures.length||results.some(r=>r.errors.length))process.exitCode=1;

} finally { await browser.close(); }
