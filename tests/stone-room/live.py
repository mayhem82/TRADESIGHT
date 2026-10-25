"""Verify published bytes against the checked-out production source (standard library)."""
from pathlib import Path
from urllib.request import urlopen,Request
from urllib.error import URLError
import hashlib,time,json,os
R=Path(__file__).resolve().parents[2];base='https://mayhem82.github.io/TRADESIGHT/stone-room/'
files=['index.html','room.js','room.css','core.mjs','xr.js','floor-contact.js','xr-graphics.js','xr-presentation.js','update-guard.js','ar-render-profile.js','surface-reticle.js','vendor/three.module.js','vendor/GLTFLoader.js','vendor/BufferGeometryUtils.js','assets/stone-room.glb','assets/photo-guided-npc.glb','assets/countryside.jpg']
report=[]
for name in files:
 expected=hashlib.sha256((R/'public/stone-room'/name).read_bytes()).hexdigest();failure=None
 for attempt in range(10):
  try:
   req=Request(base+name+'?verify='+os.environ.get('GITHUB_SHA','manual'),headers={'Cache-Control':'no-cache'})
   with urlopen(req,timeout=30) as response:
    data=response.read();actual=hashlib.sha256(data).hexdigest();assert response.status==200
   assert actual==expected,f'Published SHA256 differs for {name}'
   report.append({'path':name,'bytes':len(data),'sha256':actual,'status':200});break
  except (URLError,AssertionError,TimeoutError) as e:
   failure=e
   if attempt==9:raise
   time.sleep(5)
result={'url':base,'commit':os.environ.get('GITHUB_SHA'),'verified':report,'scope':'Live HTTP byte identity; not physical AR or a real-device browser check'}
(R/'tests/stone-room/live-report.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
