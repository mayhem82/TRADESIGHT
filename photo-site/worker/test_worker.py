"""Contract tests use a deterministic estimator; they do not verify the neural model."""
import io
import http.client
import json
from pathlib import Path
import tempfile
import threading
import time
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from http.server import ThreadingHTTPServer
import numpy as np
from PIL import Image
from depth import BOUNDARY, MODEL_ID, decode_photo, relief
from server import Jobs, handler_for


class Estimator:
    device = "test-only"
    provenance = {"model": MODEL_ID, "revision": "test-only", "implementation": "deterministic test estimator"}

    def __call__(self, photo):
        return np.tile(np.linspace(0, 1, photo.width), (photo.height, 1))


class Tests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        root = Path(self.temp.name)
        web = root / "web"; web.mkdir()
        (web / "index.html").write_text("independent photo site", encoding="utf-8")
        self.jobs = Jobs(root / "data", Estimator())
        self.service = ThreadingHTTPServer(('127.0.0.1', 0), handler_for(self.jobs, 'a' * 32, web))
        threading.Thread(target=self.service.serve_forever, daemon=True).start()
        self.base = f"http://127.0.0.1:{self.service.server_port}"

    def tearDown(self):
        self.service.shutdown(); self.service.server_close(); self.temp.cleanup()

    def request(self, path, data=None, authorized=True, headers=None):
        supplied = {"Authorization": "Bearer " + "a" * 32} if authorized else {}
        supplied.update(headers or {})
        return urlopen(Request(self.base + path, data=data, headers=supplied), timeout=5)

    def photo_bytes(self):
        stream = io.BytesIO(); Image.new('RGB', (40, 20), 'blue').save(stream, format='JPEG')
        return stream.getvalue()

    def test_auth_and_traversal(self):
        with self.assertRaises(HTTPError) as error:
            self.request('/api/health', authorized=False)
        self.assertEqual(error.exception.code, 401)
        with self.assertRaises(HTTPError) as error:
            self.request('/../data/status.json', authorized=False)
        self.assertEqual(error.exception.code, 404)
        self.assertIn(b'independent photo site', self.request('/').read())

    def test_real_http_upload_and_download_contract(self):
        job = json.load(self.request('/api/jobs', self.photo_bytes()))
        for _ in range(100):
            state = json.load(self.request('/api/jobs/' + job['id']))
            if state['status'] in {'complete', 'failed'}:
                break
            time.sleep(.02)
        self.assertEqual(state['status'], 'complete')
        self.assertIn('Not measured geometry', state['boundary'])
        grid = json.load(self.request(f"/api/jobs/{job['id']}/relief.json"))
        self.assertEqual(grid['units'], 'none')
        self.assertEqual(len(grid['values']), grid['width'] * grid['height'])
        self.assertLess(grid['values'][0], grid['values'][grid['width']-1])
        self.assertTrue(self.request(f"/api/jobs/{job['id']}/depth.png").read().startswith(b'\x89PNG'))
        raw = np.load(io.BytesIO(self.request(f"/api/jobs/{job['id']}/relative-depth.npy").read()))
        self.assertEqual(raw.shape, (20, 40))
        obj = self.request(f"/api/jobs/{job['id']}/inferred-relief.obj").read().decode()
        self.assertIn(BOUNDARY, obj)
        self.assertEqual(sum(line.startswith('v ') for line in obj.splitlines()), len(grid['values']))
        self.assertFalse((self.jobs.root / job['id'] / 'input.jpg').exists())

    def test_invalid_upload_origin_and_full_queue(self):
        for data, headers, code in [(b'not a photo', {}, 400), (self.photo_bytes(), {'Origin': 'https://other.example'}, 403)]:
            with self.assertRaises(HTTPError) as error:
                self.request('/api/jobs', data, headers=headers)
            self.assertEqual(error.exception.code, code)
        for _ in range(4):
            self.jobs.capacity.acquire()
        with self.assertRaises(HTTPError) as error:
            self.request('/api/jobs', self.photo_bytes())
        self.assertEqual(error.exception.code, 429)
        for _ in range(4):
            self.jobs.capacity.release()

    def test_depth_validation_and_constant_map(self):
        photo = Image.new('RGB', (40, 20))
        _, grid = relief(np.ones((20, 40)), photo)
        self.assertEqual(set(grid['values']), {0.0})
        with self.assertRaises(ValueError):
            relief(np.full((20, 40), np.nan), photo)
        with self.assertRaises(ValueError):
            decode_photo(b'broken')

    def test_portrait_orientation_and_metadata_removed(self):
        image = Image.new('RGB', (40, 20), 'blue')
        metadata = Image.Exif(); metadata[274] = 6
        stream = io.BytesIO(); image.save(stream, format='JPEG', exif=metadata)
        decoded = decode_photo(stream.getvalue())
        self.assertEqual(decoded.size, (20, 40))
        self.jobs.capacity.acquire()
        job = self.jobs.submit(decoded)
        self.jobs.pending.join()
        with Image.open(self.jobs.root / job['id'] / 'photo.jpg') as result:
            self.assertEqual(result.size, (20, 40))
            self.assertEqual(len(result.getexif()), 0)

    def test_rejects_oversized_and_animated_input(self):
        connection = http.client.HTTPConnection('127.0.0.1', self.service.server_port, timeout=5)
        connection.putrequest('POST', '/api/jobs')
        connection.putheader('Authorization', 'Bearer ' + 'a' * 32)
        connection.putheader('Content-Length', str(13 * 1024 * 1024))
        connection.endheaders()
        self.assertEqual(connection.getresponse().status, 413)
        connection.close()
        stream = io.BytesIO()
        Image.new('RGB', (8, 8), 'blue').save(stream, format='PNG', save_all=True,
                                           append_images=[Image.new('RGB', (8, 8), 'red')])
        with self.assertRaises(ValueError):
            decode_photo(stream.getvalue())

    def test_failure_is_not_success(self):
        def fail(_):
            raise RuntimeError('private implementation detail')
        self.jobs.estimator = fail
        self.jobs.capacity.acquire()
        record = self.jobs.submit(Image.new('RGB', (8, 8)))
        self.jobs.pending.join()
        state = self.jobs.get(record['id'])
        self.assertEqual(state['status'], 'failed')
        self.assertIsNone(self.jobs.last_success)
        self.assertNotIn('private implementation', state['error'])

    def test_private_https_proxy_origin(self):
        # A proxy can rewrite Host to localhost; only the configured HTTPS origin is accepted.
        proxy = ThreadingHTTPServer(('127.0.0.1', 0), handler_for(
            self.jobs, 'a' * 32, Path(self.temp.name) / 'web', 'https://photo.example.ts.net:8443'))
        threading.Thread(target=proxy.serve_forever, daemon=True).start()
        try:
            def upload(origin):
                return urlopen(Request(f'http://127.0.0.1:{proxy.server_port}/api/jobs',
                    data=self.photo_bytes(), headers={'Authorization': 'Bearer ' + 'a' * 32,
                                                     'Origin': origin}), timeout=5)
            self.assertEqual(upload('https://photo.example.ts.net:8443').status, 202)
            self.jobs.pending.join()
            with self.assertRaises(HTTPError) as error:
                upload('https://other.example')
            self.assertEqual(error.exception.code, 403)
        finally:
            proxy.shutdown(); proxy.server_close()

    def test_restart_marks_interrupted_job_failed(self):
        folder = self.jobs.root / ('b' * 32); folder.mkdir()
        (folder / 'status.json').write_text(json.dumps({'id': folder.name, 'status': 'processing'}))
        restarted = Jobs(self.jobs.root, Estimator())
        self.assertEqual(restarted.get(folder.name)['status'], 'failed')


if __name__ == '__main__':
    unittest.main()
