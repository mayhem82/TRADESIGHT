const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.AR_BASE_URL||'http://localhost:8765',out=process.env.AR_OUTPUT_DIR||'/tmp/ar-validation/speed';await mkdir(out,{recursive:true});
const paths=['ar-colour-vision-001/index.html','ar-sound-vision-autostereography-001/index.html','single-wall-009/index.html','single-wall-010/index.html','tv-tabletop-002/index.html','stone-room-texture-001/index.html',...['bellbrook-yowie-v1','bellbrook-yowie-v2','bellbrook-yowie-v3','bellbrook-yowie-v4','walking-stable','joystick-movement'].map(n=>'stone-room/reference/'+n+'.html')];
const browser=await chromium.launch({executablePath:process.env.AR_BROWSER||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});const results=[];
try{
 for(const path of paths.filter(path=>!process.env.AR_SPEED_FILTER||path.includes(process.env.AR_SPEED_FILTER))){
  const page=await browser.newPage({viewport:{width:412,height:915}});if(path.startsWith('stone-room-texture'))await page.route('**/stone-room-texture-001/room.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+'\nrenderer.setAnimationLoop(null);'});});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/ar-experiments/mayhem-ar/'+path);await page.waitForSelector('#travel-speed',{state:'attached'});if(path.startsWith('ar-colour-vision'))await page.click('#ar-preview');
  await page.evaluate(()=>{document.querySelector('#walking-overlay')?.removeAttribute('hidden');document.querySelector('#loading')?.setAttribute('hidden','');if(document.querySelector('#overlay')&&!document.querySelector('#ar-tools'))document.body.classList.add('xr');});
  for(const [width,height] of [[412,915],[915,412],[852,393],[393,852],[360,800],[320,700]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>{document.querySelector('#panel')?.removeAttribute('hidden');document.querySelector('#walking-overlay')?.classList.remove('collection-info-hidden');document.body.classList.remove('menu-hidden','collection-room-hidden');});
   for(const hidden of [false,true]){
    if(hidden)await page.locator('#ar-menu,#menu-toggle,#walking-overlay .collection-menu,#collection-room-menu').first().click();
    for(const exponent of [-3,5]){
     await page.locator('#travel-speed').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},String(exponent));await page.waitForTimeout(100);
     const metrics=await page.evaluate(()=>{
      const input=document.querySelector('#travel-speed'),r=input.getBoundingClientRect();
      const sticks=[...document.querySelectorAll('#ar-move,#ar-pose,#move-stick,#pose-stick,#turn-stick,#walking-joystick,#joystick')].map(el=>{const q=el.getBoundingClientRect();return {id:el.id,width:q.width,height:q.height,visible:q.width>0&&q.height>0,inside:q.x>=0&&q.y>=0&&q.right<=innerWidth&&q.bottom<=innerHeight,hit:el.contains(document.elementFromPoint(q.x+q.width/2,q.y+q.height/2)),overlapsRange:q.x<r.right&&q.right>r.x&&q.y<r.bottom&&q.bottom>r.y};});
      const dock=document.querySelector('#motion-dock');const d=dock?.getBoundingClientRect();return {dockInside:!d||(d.top>=0&&d.right<=innerWidth&&d.bottom<=innerHeight),range:{width:r.width,height:r.height,inside:r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight,hit:input===document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)},sticks};
     });
     const record={path,width,height,hidden,exponent,...metrics};results.push(record);const expected=path.startsWith('ar-colour')?[132,132]:path.startsWith('single-wall-009')?[96,96]:path.startsWith('tv-')?[136,72]:path.startsWith('stone-room/reference')?[136,136]:path.startsWith('stone-room-texture')?[120,120]:[86,86];for(const stick of metrics.sticks){assert.equal(stick.width,expected[0],JSON.stringify(record));assert.equal(stick.height,expected[1],JSON.stringify(record));}
     assert.ok(metrics.dockInside,JSON.stringify(record));assert.ok(metrics.range.inside&&metrics.range.hit,JSON.stringify(record));assert.ok(metrics.sticks.every(s=>s.inside&&s.hit&&!s.overlapsRange),JSON.stringify(record));
    }
   }
   if(width===412||width===915){await page.evaluate(()=>document.documentElement.requestFullscreen());await page.waitForTimeout(100);const hit=await page.locator('#travel-speed').evaluate(e=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e;});assert.ok(hit,path+' fullscreen speed');await page.evaluate(()=>document.exitFullscreen());}
   if((width===412||width===915)&&!path.startsWith('stone-room-texture'))await page.screenshot({path:out+'/'+path.replaceAll('/','-')+'-'+width+'.png'});
  }
  assert.deepEqual(errors,[],path);await page.close();
 }
 await writeFile(out+'/layout-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify({cases:results.length,failures:0,apps:new Set(results.map(row=>row.path)).size}));
}finally{await browser.close();}
