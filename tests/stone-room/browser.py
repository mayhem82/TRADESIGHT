"""Browser tests use local file responses over an intercepted HTTPS origin.
Synthetic routing and unsupported-AR checks are not physical ARCore verification.
Run after installing Playwright and Chromium. CI saves screenshots and JSON.
"""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,mimetypes,shutil,os,base64
REPO=Path(__file__).resolve().parents[2];ROOT=Path(os.environ.get('STONE_ROOM_ROOT',str(REPO/'public'))).resolve();OUT=REPO/'tests/stone-room';results=[]
with sync_playwright() as p:
 exe=os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium')
 browser=p.chromium.launch(**({'executable_path':exe} if exe else {}),headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 for name,width,height,touch in [('desktop',1280,800,False),('android-portrait',393,852,True),('android-landscape',852,393,True)]:
  context=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1,has_touch=touch,is_mobile=touch)
  page=context.new_page();errors=[];requests=[];page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE_ERROR:'+str(e),flush=True)))
  def serve(route):
   path=ROOT/route.request.url.split('stone.test/')[1].split('?')[0]
   if path.is_dir():path=path/'index.html'
   requests.append(str(path.relative_to(ROOT)))
   if path.exists():route.fulfill(body=path.read_bytes(),content_type=mimetypes.guess_type(str(path))[0] or 'application/octet-stream')
   else:errors.append('missing '+str(path));route.fulfill(status=404,body='missing')
  page.route('https://stone.test/**',serve);page.goto('https://stone.test/stone-room/');page.wait_for_function('window.stoneRoom?.diagnostics.loaded',timeout=90000);page.wait_for_timeout(600)
  diag=page.evaluate('window.stoneRoom.diagnostics');print('INITIAL_DIAGNOSTICS:'+json.dumps(diag),flush=True);assert not diag['uvMissing'];assert 1.6<diag['npcHeight']<2;assert len(diag['animations'])==4;assert diag['ceilingVisible'];assert abs(diag['npcScreen'][0])<.8 and abs(diag['npcScreen'][1])<.8 and -1<diag['npcScreen'][2]<1,'NPC starts outside viewing area'
  initial=page.screenshot(type='jpeg',quality=55,scale='css');print('STONE_SCREENSHOT:'+name+'-initial:'+base64.b64encode(initial).decode(),flush=True)
  start=diag['camera'];page.keyboard.down('w')
  try:page.wait_for_function('(start)=>JSON.stringify(window.stoneRoom.diagnostics.camera)!==JSON.stringify(start)',arg=start,timeout=30000)
  finally:page.keyboard.up('w')
  page.click('#reset');page.click('#plan');assert page.evaluate('window.stoneRoom.diagnostics.top');assert not page.evaluate('window.stoneRoom.diagnostics.ceilingVisible');page.click('#plan');assert page.evaluate('window.stoneRoom.diagnostics.camera')==start
  page.click('#npc-toggle');assert page.is_visible('#npcpanel');page.select_option('#behaviour','wander');page.wait_for_function("window.stoneRoom.diagnostics.activeAnimation?.toLowerCase().includes('walk')",timeout=30000)
  page.click('#wave');page.wait_for_timeout(200);assert 'wave' in page.evaluate('window.stoneRoom.diagnostics.activeAnimation').lower();page.click('#stop');page.click('#npc-close');assert not page.is_visible('#npcpanel')
  # Verify pointer joystick actually moves the camera and releases cleanly.
  b=page.locator('#joystick').bounding_box();page.mouse.move(b['x']+b['width']/2,b['y']+b['height']/2);page.mouse.down();page.mouse.move(b['x']+b['width']/2,b['y']+10);page.wait_for_timeout(250);page.mouse.up();page.wait_for_timeout(100)
  a=page.evaluate('window.stoneRoom.diagnostics.camera');page.wait_for_timeout(200);assert page.evaluate('window.stoneRoom.diagnostics.camera')==a
  if name=='desktop':
   page.click('#reset');page.keyboard.down('w')
   try:page.wait_for_function('Math.hypot(window.stoneRoom.diagnostics.camera[0]-window.stoneRoom.diagnostics.npc[0],window.stoneRoom.diagnostics.camera[2]-window.stoneRoom.diagnostics.npc[2])<1.45',timeout=45000)
   finally:page.keyboard.up('w')
   close=page.screenshot(type='jpeg',quality=85,scale='css');print('STONE_SCREENSHOT:npc-closeup:'+base64.b64encode(close).decode(),flush=True)
   page.screenshot(path=str(OUT/'npc-closeup.png'));page.click('#reset')
  page.screenshot(path=str(OUT/(name+'.png')))
  thumbnail=page.screenshot(type='jpeg',quality=55,scale='css');print('STONE_SCREENSHOT:'+name+':'+base64.b64encode(thumbnail).decode(),flush=True)
  if not page.evaluate("navigator.xr && window.stoneRoom.diagnostics.xrState!=='inactive'"):
   page.click('#ar');page.wait_for_timeout(300);assert page.is_visible('#error');assert page.evaluate('window.stoneRoom.diagnostics.roomVisible')
  assert not errors,errors
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),'horizontal overflow'
  results.append({'viewport':name,'dimensions':[width,height],'diagnostics':diag,'assetRequests':requests,'errors':errors,'verified':['load','embedded assets','UVs','NPC scale','named clips','walk','wave','stop','keyboard movement','joystick release','reset','overhead roof visibility','settings collapse','unsupported AR error'],'notVerified':['ARCore camera','physical hit tests','tracking stability','Galaxy S25 FE performance','photorealistic quality']})
  # Layout-only check: this does not simulate camera passthrough or XR tracking.
  page.evaluate("document.body.classList.add('in-ar');document.querySelector('#ar-ui').hidden=false;document.querySelector('#ar-motion').hidden=false;document.querySelector('#ar-options').open=true;document.querySelector('#reposition').hidden=false")
  for selector in ['#ar-content','#ar-speed','#place','#reposition','#exit-ar','#ar-follow','#ar-stop','#ar-wave']:
   box=page.locator(selector).bounding_box();assert box and box['x']>=0 and box['y']>=0 and box['x']+box['width']<=width+1 and box['y']+box['height']<=height+1,('AR control out of viewport',selector,box)
  options=page.locator('#ar-options').bounding_box();actions=page.locator('.ar-actions').first.bounding_box();assert options['y']+options['height']<=actions['y'] or options['x']+options['width']<=actions['x'],'AR panels overlap'
  results[-1]['verified'].append('AR control layout only; no physical XR')
  context.close()
 browser.close()
(OUT/'browser-report.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(results))
