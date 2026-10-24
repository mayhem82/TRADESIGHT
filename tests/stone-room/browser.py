"""Browser tests use local file responses over an intercepted HTTPS origin.
Synthetic routing and unsupported-AR checks are not physical ARCore verification.
Run after installing Playwright and Chromium. CI saves screenshots and JSON.
"""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,mimetypes,shutil,os,base64,time
REPO=Path(__file__).resolve().parents[2];ROOT=Path(os.environ.get('STONE_ROOM_ROOT',str(REPO/'public'))).resolve();OUT=REPO/'tests/stone-room';results=[]
def capture(page, label, **options):
 # SwiftShader capture can take longer than Playwright's 30s action default.
 # Keep a hard bound and fail the deployment if actual pixels cannot be captured.
 started=time.monotonic()
 try:
  return page.screenshot(timeout=120000, **options)
 finally:
  print('CAPTURE_DIAGNOSTICS:'+json.dumps({'label':label,'seconds':round(time.monotonic()-started,2)}),flush=True)

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
  diag=page.evaluate('window.stoneRoom.diagnostics');print('INITIAL_DIAGNOSTICS:'+json.dumps(diag),flush=True);assert not diag['uvMissing'];assert 1.6<diag['npcHeight']<2;assert len(diag['animations'])==4;assert diag['ceilingVisible'];assert diag['floorContactSamples']>0 and abs(diag['groundClearance'])<.015;assert abs(diag['npcScreen'][0])<.8 and abs(diag['npcScreen'][1])<.8 and -1<diag['npcScreen'][2]<1,'NPC starts outside viewing area'
  initial=capture(page,name+'-initial',type='jpeg',quality=55,scale='css');print('STONE_SCREENSHOT:'+name+'-initial:'+base64.b64encode(initial).decode(),flush=True)
  start=diag['camera'];page.keyboard.down('w')
  try:page.wait_for_function('(start)=>JSON.stringify(window.stoneRoom.diagnostics.camera)!==JSON.stringify(start)',arg=start,timeout=30000)
  finally:page.keyboard.up('w')
  page.click('#reset');page.click('#plan');assert page.evaluate('window.stoneRoom.diagnostics.top');assert not page.evaluate('window.stoneRoom.diagnostics.ceilingVisible');page.click('#plan');assert page.evaluate('window.stoneRoom.diagnostics.camera')==start
  page.click('#npc-toggle');assert page.is_visible('#npcpanel');page.select_option('#behaviour','wander');page.wait_for_function("window.stoneRoom.diagnostics.activeAnimation?.toLowerCase().includes('walk')",timeout=30000);assert abs(page.evaluate('window.stoneRoom.diagnostics.groundClearance'))<.015
  page.click('#wave');page.wait_for_timeout(200);assert 'wave' in page.evaluate('window.stoneRoom.diagnostics.activeAnimation').lower();page.click('#stop');page.click('#npc-close');assert not page.is_visible('#npcpanel')
  # Verify pointer joystick actually moves the camera and releases cleanly.
  b=page.locator('#joystick').bounding_box();joy_start=page.evaluate('window.stoneRoom.diagnostics.camera');page.mouse.move(b['x']+b['width']/2,b['y']+b['height']/2);page.mouse.down();page.mouse.move(b['x']+b['width']/2,b['y']+10)
  try:page.wait_for_function('(start)=>JSON.stringify(window.stoneRoom.diagnostics.camera)!==JSON.stringify(start)',arg=joy_start,timeout=30000)
  finally:page.mouse.up()
  page.wait_for_timeout(100)
  a=page.evaluate('window.stoneRoom.diagnostics.camera');page.wait_for_timeout(200);assert page.evaluate('window.stoneRoom.diagnostics.camera')==a
  # A cancelled gesture must not resume when a stale touch pointer moves.
  page.mouse.move(b['x']+b['width']/2,b['y']+10);page.mouse.down()
  page.evaluate("window.dispatchEvent(new Event('blur'))")
  page.mouse.move(b['x']+b['width']/2,b['y']+15)
  assert page.evaluate('window.stoneRoom.diagnostics.input')=={'keys':[],'joystick':{'x':0,'y':0},'joyId':None}
  page.mouse.up()
  if name=='desktop':
   page.click('#reset');page.locator('#speed').evaluate("el=>{el.value='3';el.dispatchEvent(new Event('input'))}");page.keyboard.down('w')
   try:page.wait_for_function('Math.hypot(window.stoneRoom.diagnostics.camera[0]-window.stoneRoom.diagnostics.npc[0],window.stoneRoom.diagnostics.camera[2]-window.stoneRoom.diagnostics.npc[2])<1.45',timeout=120000)
   finally:
    page.keyboard.up('w');print('CLOSEUP_DIAGNOSTICS:'+json.dumps(page.evaluate('window.stoneRoom.diagnostics')),flush=True);page.locator('#speed').evaluate("el=>{el.value='1.4';el.dispatchEvent(new Event('input'))}")
   close=capture(page,'npc-closeup',type='jpeg',quality=85,scale='css');print('STONE_SCREENSHOT:npc-closeup:'+base64.b64encode(close).decode(),flush=True)
   capture(page,'npc-closeup-png',path=str(OUT/'npc-closeup.png'));page.click('#reset')
  capture(page,name+'-png',path=str(OUT/(name+'.png')))
  thumbnail=capture(page,name+'-final',type='jpeg',quality=55,scale='css');print('STONE_SCREENSHOT:'+name+':'+base64.b64encode(thumbnail).decode(),flush=True)
  if not page.evaluate("navigator.xr && window.stoneRoom.diagnostics.xrState!=='inactive'"):
   page.click('#ar');page.wait_for_timeout(300);assert page.is_visible('#error');assert page.evaluate('window.stoneRoom.diagnostics.roomVisible')
  assert not errors,errors
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),'horizontal overflow'
  results.append({'viewport':name,'dimensions':[width,height],'diagnostics':diag,'assetRequests':requests,'errors':errors,'verified':['load','embedded assets','UVs','NPC scale','named clips','walk','wave','stop','keyboard movement','joystick release','reset','overhead roof visibility','settings collapse','unsupported AR error'],'notVerified':['ARCore camera','physical hit tests','tracking stability','Galaxy S25 FE performance','photorealistic quality']})
  assert page.evaluate("!document.querySelector('#ar-overlay').contains(document.querySelector('#view'))"),'XR projection canvas must not be part of DOM overlay'
  # Layout-only check: this does not simulate camera passthrough or XR tracking.
  page.evaluate("document.body.classList.add('in-ar');document.querySelector('#ar-overlay').hidden=false;document.querySelector('#ar-ui').hidden=false;document.querySelector('#ar-motion').hidden=false;document.querySelector('#ar-options').open=true;document.querySelector('#reposition').hidden=false")
  for selector in ['#ar-content','#ar-speed','#place','#reposition','#exit-ar','#ar-follow','#ar-stop','#ar-wave']:
   box=page.locator(selector).bounding_box();assert box and box['x']>=0 and box['y']>=0 and box['x']+box['width']<=width+1 and box['y']+box['height']<=height+1,('AR control out of viewport',selector,box)
  options=page.locator('#ar-options').bounding_box();actions=page.locator('.ar-actions').first.bounding_box();assert options['y']+options['height']<=actions['y'] or options['x']+options['width']<=actions['x'],'AR panels overlap'
  results[-1]['verified'].append('AR control layout only; no physical XR')
  page.evaluate("document.querySelector('#view').dispatchEvent(new Event('webglcontextlost',{cancelable:true}))")
  assert 'Graphics context lost' in page.locator('#error').inner_text()
  results[-1]['verified'].extend(['joystick blur cancellation','canvas context-loss message'])
  context.close()
 # Compatibility is explicit and changes context antialiasing, not assets/placement.
 compatibility=browser.new_context();compat=compatibility.new_page();compat.route('https://stone.test/**',serve);compat.goto('https://stone.test/stone-room/?graphics=compat')
 compat.wait_for_function('window.stoneRoom?.diagnostics.loaded',timeout=90000)
 assert compat.evaluate('window.stoneRoom.diagnostics.graphicsMode')=='compat'
 assert compat.evaluate('window.stoneRoom.diagnostics.antialias') is False
 assert not compat.locator('#ar-probe').is_checked(),'graphics test must default off'
 # Verify actual optional probe pixels in an ordinary test framebuffer, never XR/camera pixels.
 pixels=compat.evaluate("""async()=>{
  const THREE=await import('./vendor/three.module.js'),{createXRGraphics}=await import('./xr-graphics.js');
  const canvas=document.createElement('canvas'),renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:true});renderer.setSize(32,32);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),graphics=createXRGraphics(renderer,scene),gl=renderer.getContext(),pixel=new Uint8Array(4);
  graphics.beforeFrame(false);renderer.render(scene,camera);gl.readPixels(4,28,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);const off=[...pixel];
  graphics.beforeFrame(true);renderer.render(scene,camera);gl.readPixels(4,28,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);const on=[...pixel];
  graphics.beforeFrame(false);renderer.render(scene,camera);gl.readPixels(4,28,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);const restored=[...pixel];
  graphics.dispose();renderer.dispose();return {off,on,restored};
 }""")
 assert pixels['off'][3]==0 and pixels['on']==[255,0,255,255] and pixels['restored'][3]==0,pixels
 results.append({'scenario':'explicit compatibility and optional graphics probe','verified':['antialias disabled only when requested','probe defaults off','real magenta test pixels','test can be switched off'],'notVerified':['XR compositor','physical device']})
 # Render the real animated character and a world-space ring with the AR profile.
 direct=compat.evaluate((OUT/'ar-render-check.js').read_text())
 assert direct['coloured']>1000 and direct['green']>20 and not direct['errors'],{k:v for k,v in direct.items() if k!='screenshot'}
 (OUT/'ar-render-profile.png').write_bytes(base64.b64decode(direct.pop('screenshot').split(',')[1]))
 results.append({'scenario':'direct-lit AR scene rendering','evidence':direct,'notVerified':['XR compositor','physical ground hit','Samsung GPU']})
 compatibility.close()
 # Explicitly exercise unavailable graphics: no infinite loading screen or AR launch.
 unavailable=browser.new_context();unavailable.add_init_script("""
 const getContext=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(type,...args){
  return /^(webgl2?|experimental-webgl)$/.test(type)?null:getContext.call(this,type,...args);
 };
 """)
 blocked=unavailable.new_page();blocked.route('https://stone.test/**',serve);blocked.goto('https://stone.test/stone-room/')
 blocked.wait_for_function("document.querySelector('#error').textContent.includes('3D graphics could not start')")
 assert not blocked.is_visible('#loading');assert blocked.locator('#ar').is_disabled()
 results.append({'scenario':'WebGL creation unavailable','verified':['visible startup error','loading dismissed','AR disabled'],'notVerified':['GPU recovery','physical device']})
 unavailable.close()
 browser.close()
(OUT/'browser-report.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(results))
