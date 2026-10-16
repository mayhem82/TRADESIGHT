"""Real FreeCAD + authenticated HTTP integration. Synthetic geometry, not site accuracy."""
import base64
import hashlib
import io
import json
from pathlib import Path
import tempfile
import threading
import time
import unittest
import zipfile
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from http.server import ThreadingHTTPServer
from PIL import Image
from contract import validate
from server import Jobs,handler_for,ROOT

def fixture():
    return {'title':'Integration fixture — wall, opening, route','mode':'components','components':[
        {'id':'Wall','label':'Test wall','kind':'box','source':'measured','x':0,'y':0,'z':0,'width':3600,'depth':110,'height':2400,'description':'Synthetic integration fixture.'},
        {'id':'Opening','label':'Test opening','kind':'opening','source':'measured','host':'Wall','x':1200,'y':-1,'z':900,'width':1200,'depth':112,'height':1000},
        {'id':'Route','label':'Service test','kind':'service','source':'unknown','x':0,'y':0,'z':0,'radius':10,'points':[[200,-40,200],[200,-40,2200],[3200,-40,2200]]}]}

class ContractTests(unittest.TestCase):
    def test_invalid_numbers_and_hosts(self):
        j=fixture();j['components'][0]['width']=float('nan')
        with self.assertRaises(ValueError):validate(j)
        j=fixture();j['components'][1]['host']='Missing'
        with self.assertRaises(ValueError):validate(j)
        j=fixture();j['components'][0]['source']='guaranteed'
        with self.assertRaises(ValueError):validate(j)

class RealPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        (ROOT/'.local').mkdir(exist_ok=True)
        cls.tmp=tempfile.TemporaryDirectory(dir=ROOT/'.local');cls.root=Path(cls.tmp.name)
        cls.jobs=Jobs(cls.root,'C:/Program Files/FreeCAD 1.1/bin/python.exe')
        cls.server=ThreadingHTTPServer(('127.0.0.1',0),handler_for(cls.jobs,'k'*40))
        threading.Thread(target=cls.server.serve_forever,daemon=True).start()
        cls.url='http://127.0.0.1:'+str(cls.server.server_port)
    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown();cls.server.server_close();cls.tmp.cleanup()
    def fetch(self,path,body=None,key=True,origin=None):
        headers={'Authorization':'Bearer '+'k'*40} if key else {}
        if body is not None:headers['Content-Type']='application/json'
        if origin:headers['Origin']=origin
        return urlopen(Request(self.url+path,data=json.dumps(body).encode() if body is not None else None,headers=headers),timeout=30)
    def wait(self,jobid):
        for _ in range(120):
            record=json.load(self.fetch('/api/cad/jobs/'+jobid))
            if record['status']=='failed':
                self.fail((self.root/jobid/'engine.log').read_text(encoding='utf-8'))
            if record['status']=='complete':return record
            time.sleep(.5)
        self.fail('FreeCAD timed out')
    def test_auth_origin_validation(self):
        with self.assertRaises(HTTPError) as e:self.fetch('/api/cad/health',key=False)
        self.assertEqual(e.exception.code,401)
        with self.assertRaises(HTTPError) as e:self.fetch('/api/cad/jobs',fixture(),origin='https://other.example')
        self.assertEqual(e.exception.code,403)
        with self.assertRaises(HTTPError) as e:self.fetch('/api/cad/jobs',{'title':'bad','components':[]})
        self.assertEqual(e.exception.code,400)
    def test_real_photo_job_and_existing_reimport(self):
        photo=io.BytesIO();Image.new('RGB',(320,240),'#a4c1ca').save(photo,'JPEG')
        spec=fixture();spec['photo']=base64.b64encode(photo.getvalue()).decode()
        record=json.load(self.fetch('/api/cad/jobs',spec));result=self.wait(record['id']);manifest=result['manifest']
        self.assertTrue(manifest['geometryValid']);self.assertEqual(manifest['components'],2)
        self.assertTrue({'front','plan','side','section','services','schedule_1'} <= {d['id'] for d in manifest['drawings']})
        model=self.fetch('/api/cad/jobs/'+record['id']+'/model.FCStd').read()
        self.assertGreater(len(model),1000)
        package=self.fetch('/api/cad/jobs/'+record['id']+'/package.zip').read()
        with zipfile.ZipFile(io.BytesIO(package)) as z:
            self.assertIn('photo.jpg',z.namelist());self.assertIn('viewer.html',z.namelist())
            self.assertTrue(z.read('drawings.pdf').startswith(b'%PDF'))
            schedule=z.read('components.csv').decode('utf-8-sig');self.assertIn('1200.0',schedule);self.assertIn('Opening',schedule)
        mesh=json.loads(self.fetch('/api/cad/jobs/'+record['id']+'/mesh.json').read())
        self.assertEqual(mesh[0]['bounds'],[3600.0,110.0,2400.0])
        original_hash=hashlib.sha256(model).hexdigest()
        imported=json.load(self.fetch('/api/cad/jobs',{'title':'Reimport test','mode':'existing','sourceFile':base64.b64encode(model).decode()}))
        self.wait(imported['id'])
        self.assertEqual(hashlib.sha256((self.root/imported['id']/'source.FCStd').read_bytes()).hexdigest(),original_hash)
        self.assertEqual(len(json.loads(self.fetch('/api/cad/jobs').read())),2)
        with self.assertRaises(HTTPError) as e:self.fetch('/api/cad/jobs/'+record['id']+'/engine.log')
        self.assertEqual(e.exception.code,404)
        restarted=Jobs(self.root,'C:/Program Files/FreeCAD 1.1/bin/python.exe')
        self.assertEqual(restarted.get(record['id'])['status'],'complete')

if __name__=='__main__':unittest.main()
