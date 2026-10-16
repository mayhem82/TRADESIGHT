"""Authenticated local FreeCAD job service. No shell commands or model macros from clients."""
import argparse
import base64
import binascii
import hmac
import hashlib
import io
import json
import mimetypes
import os
from pathlib import Path
import queue
import re
import subprocess
import threading
import time
import uuid
import zipfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from http.cookies import SimpleCookie
from urllib.parse import urlsplit
from PIL import Image, ImageOps
from contract import validate

ROOT=Path(__file__).resolve().parent.parent
LIMIT=64*1024*1024
VIEWER_HASH=base64.b64encode(hashlib.sha256((ROOT/'web/viewer.js').read_text(encoding='utf-8').encode()).digest()).decode()

class Jobs:
    def __init__(self, root, python):
        self.root=Path(root); self.root.mkdir(parents=True,exist_ok=True)
        self.python=str(python); self.lock=threading.RLock(); self.items={}
        self.queue=queue.Queue(); self.capacity=threading.BoundedSemaphore(3)
        for folder in self.root.iterdir():
            if re.fullmatch('[a-f0-9]{32}',folder.name) and (folder/'status.json').is_file():
                try:
                    record=json.loads((folder/'status.json').read_text(encoding='utf-8'))
                    if record['status'] in {'queued','processing'}:
                        record.update(status='failed',error='PC service restarted. Create a new revision.')
                    self.items[folder.name]=record
                    self.persist(record)
                except (ValueError,KeyError,OSError):
                    continue
        threading.Thread(target=self.run,daemon=True).start()

    def persist(self, record):
        folder=self.root/record['id']
        (folder/'status.tmp').write_text(json.dumps(record),encoding='utf-8')
        (folder/'status.tmp').replace(folder/'status.json')

    def update(self, jobid, **changes):
        with self.lock:
            self.items[jobid].update(changes); self.persist(self.items[jobid])

    def get(self, jobid):
        with self.lock:
            return dict(self.items[jobid]) if jobid in self.items else None

    def listing(self):
        with self.lock:
            return sorted([dict(v) for v in self.items.values()],key=lambda x:x['created'],reverse=True)[:100]

    def submit(self, job):
        validate(job)
        photo=None; source=None
        if job.get('photo'):
            try:
                raw=base64.b64decode(job.pop('photo'),validate=True)
                if len(raw)>12*1024*1024: raise ValueError('Photo exceeds 12 MB.')
                with Image.open(io.BytesIO(raw)) as im:
                    if im.width*im.height>20000000: raise ValueError('Photo exceeds 20 megapixels.')
                    photo=ImageOps.exif_transpose(im).convert('RGB'); photo.thumbnail((2400,2400))
            except (binascii.Error,OSError,Image.DecompressionBombError) as e:
                raise ValueError('Choose a valid JPEG, PNG or WebP photo.') from e
        if job['mode']=='existing':
            try:
                source=base64.b64decode(job.pop('sourceFile'),validate=True)
                with zipfile.ZipFile(io.BytesIO(source)) as archive:
                    if 'Document.xml' not in archive.namelist() or sum(x.file_size for x in archive.infolist())>250*1024*1024:
                        raise ValueError('Unsupported or oversized FreeCAD document.')
            except (KeyError,binascii.Error,zipfile.BadZipFile) as e:
                raise ValueError('Choose a valid .FCStd file.') from e
        if not self.capacity.acquire(blocking=False): raise OverflowError('CAD queue is full. Wait for a job to finish.')
        try:
            jobid=uuid.uuid4().hex; folder=self.root/jobid; folder.mkdir()
            (folder/'job.json').write_text(json.dumps(job,indent=2),encoding='utf-8')
            if photo: photo.save(folder/'photo.jpg',quality=92)
            if source: (folder/'source.FCStd').write_bytes(source)
            record={'id':jobid,'title':job['title'],'status':'queued','created':time.time()}
            with self.lock:
                self.items[jobid]=record; self.persist(record)
            self.queue.put(jobid)
            return dict(record)
        except Exception:
            self.capacity.release(); raise

    def run(self):
        while True:
            jobid=self.queue.get(); folder=self.root/jobid
            try:
                self.update(jobid,status='processing')
                with (folder/'engine.log').open('w',encoding='utf-8') as log:
                    result=subprocess.run([self.python,str(ROOT/'worker/build.py'),str(folder/'job.json'),str(folder)],stdout=log,stderr=subprocess.STDOUT,timeout=240,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
                if result.returncode or not (folder/'package.zip').exists():
                    raise RuntimeError('FreeCAD export failed. See the engine log on the PC.')
                manifest=json.loads((folder/'manifest.json').read_text(encoding='utf-8'))
                self.update(jobid,status='complete',completed=time.time(),manifest=manifest)
            except subprocess.TimeoutExpired:
                self.update(jobid,status='failed',error='FreeCAD exceeded four minutes. Simplify the model or split the job.')
            except Exception as error:
                self.update(jobid,status='failed',error=str(error) if isinstance(error,RuntimeError) else 'PC could not complete the CAD job. Check the local engine log.')
            finally:
                self.capacity.release(); self.queue.task_done()

def handler_for(jobs, token, web=ROOT/'web', public_origin=None, main_dist=None):
    download_session=hmac.new(token.encode(),b'TradeSight download session',hashlib.sha256).hexdigest()
    class Handler(BaseHTTPRequestHandler):
        def log_message(self,*args): pass
        def respond(self,status,payload,kind='application/json',download=None,cookie=None):
            data=json.dumps(payload).encode() if kind=='application/json' else payload
            self.send_response(status)
            for k,v in [('Content-Type',kind),('Content-Length',str(len(data))),('Cache-Control','no-store'),('X-Content-Type-Options','nosniff'),('Referrer-Policy','no-referrer')]: self.send_header(k,v)
            self.send_header('Content-Security-Policy',f"default-src 'self'; img-src 'self' blob: data:; script-src 'self' 'sha256-{VIEWER_HASH}'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-src blob:; object-src 'none'; frame-ancestors 'none'")
            if download: self.send_header('Content-Disposition',f'attachment; filename="{download}"')
            if cookie: self.send_header('Set-Cookie',cookie)
            self.end_headers(); self.wfile.write(data)
        def authorized(self):
            ok=hmac.compare_digest(self.headers.get('Authorization','').encode(),('Bearer '+token).encode())
            if not ok and self.command=='GET':
                try:
                    cookies=SimpleCookie(self.headers.get('Cookie',''))
                    supplied=cookies['tradesight_cad'].value if 'tradesight_cad' in cookies else ''
                    ok=hmac.compare_digest(supplied,download_session)
                except Exception: pass
            if not ok: self.respond(401,{'error':'Enter the PC access key.'})
            return ok
        def do_GET(self):
            path=urlsplit(self.path).path
            if path=='/favicon.ico': self.respond(204,b'','image/x-icon'); return
            if path.startswith('/api/'):
                if not self.authorized(): return
                if path=='/api/cad/health':
                    self.respond(200,{'service':'reachable','freecad':Path(jobs.python).is_file(),'lastComplete':next((r['id'] for r in jobs.listing() if r['status']=='complete'),None)})
                    return
                if path=='/api/cad/jobs': self.respond(200,jobs.listing()); return
                m=re.fullmatch(r'/api/cad/jobs/([a-f0-9]{32})(?:/([A-Za-z0-9_.-]+))?',path)
                if m:
                    jobid,name=m.groups(); record=jobs.get(jobid)
                    if record and not name: self.respond(200,record); return
                    if record and record['status']=='complete' and name in record['manifest']['outputs']+['manifest.json','package.zip']:
                        target=jobs.root/jobid/name
                        if target.is_file():
                            kind=mimetypes.guess_type(name)[0] or 'application/octet-stream'
                            self.respond(200,target.read_bytes(),kind+'; charset=utf-8' if kind in {'text/html','application/json','text/csv','image/svg+xml'} else kind,name)
                            return
                self.respond(404,{'error':'Job or file not found.'}); return
            if path.startswith('/tradesight/') and main_dist:
                base=Path(main_dist); relative=path[len('/tradesight/'):]
            else:
                base=Path(web); relative='index.html' if path in {'/','/cad','/cad/'} else path.lstrip('/')
            target=(base/relative).resolve()
            if base.resolve() not in target.parents or not target.is_file(): self.respond(404,{'error':'Page not found.'}); return
            self.respond(200,target.read_bytes(),mimetypes.guess_type(target.name)[0] or 'application/octet-stream')
        def do_POST(self):
            self.close_connection=True
            if not self.authorized(): return
            origin=self.headers.get('Origin')
            valid=(origin==public_origin) if public_origin else urlsplit(origin or '').netloc==self.headers.get('Host')
            if origin and not valid: self.respond(403,{'error':'Use the CAD service’s own address.'}); return
            if self.path=='/api/cad/session':
                self.respond(200,{'session':'paired'},cookie='tradesight_cad='+download_session+'; Path=/api/cad/; HttpOnly; SameSite=Strict'+('; Secure' if public_origin else ''))
                return
            if self.path!='/api/cad/jobs': self.respond(404,{'error':'Endpoint not found.'}); return
            try:
                size=int(self.headers.get('Content-Length','0'))
                if self.headers.get('Transfer-Encoding') or not 0<size<=LIMIT:
                    self.respond(413,{'error':'Upload exceeds 64 MB.'}); return
                self.connection.settimeout(45)
                raw=self.rfile.read(size)
                if len(raw)!=size: raise ValueError('Upload interrupted.')
                job=json.loads(raw)
                record=jobs.submit(job)
                self.respond(202,record)
            except OverflowError as e: self.respond(429,{'error':str(e)})
            except (ValueError,TypeError,KeyError) as e: self.respond(400,{'error':str(e)[:200]})
            except Exception: self.respond(500,{'error':'PC could not accept this job.'})
    return Handler

if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('--host',default='127.0.0.1'); p.add_argument('--port',type=int,default=8766); p.add_argument('--data',type=Path,default=ROOT/'data/jobs'); p.add_argument('--freecad-python',type=Path,default=Path('C:/Program Files/FreeCAD 1.1/bin/python.exe')); args=p.parse_args()
    token=os.environ.get('TRADESIGHT_CAD_KEY','')
    if len(token)<32: p.error('Set TRADESIGHT_CAD_KEY to a private key of at least 32 characters.')
    if not args.freecad_python.is_file(): p.error('FreeCAD bundled python.exe was not found.')
    service=ThreadingHTTPServer((args.host,args.port),handler_for(Jobs(args.data,args.freecad_python),token,public_origin=os.environ.get('TRADESIGHT_CAD_ORIGIN')))
    print(f'TRADESIGHT CAD listening at http://{args.host}:{args.port}',flush=True)
    try: service.serve_forever()
    except KeyboardInterrupt: service.server_close()
