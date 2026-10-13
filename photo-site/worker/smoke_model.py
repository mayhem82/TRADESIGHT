"""Opt-in actual-model HTTP smoke test. Fixture proves execution, not depth accuracy."""
import argparse
import io
import json
from pathlib import Path
import secrets
import tempfile
import threading
import time
from http.server import ThreadingHTTPServer
from urllib.request import Request, urlopen
import numpy as np
from PIL import Image
from depth import SmallEstimator
from server import Jobs, handler_for


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', type=Path, default=Path('photo-site/model'))
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument('--photo', type=Path)
    source.add_argument('--fixture', action='store_true', help='Synthetic test image; not an accuracy test')
    args = parser.parse_args()
    estimator = SmallEstimator(args.model.resolve())
    if args.photo:
        data = args.photo.read_bytes()
    else:
        pixels = np.zeros((192, 256, 3), dtype=np.uint8)
        pixels[:, :, 0] = np.arange(256, dtype=np.uint8)
        pixels[40:150, 80:180, 1:] = 220
        stream = io.BytesIO(); Image.fromarray(pixels).save(stream, format='JPEG'); data = stream.getvalue()
    with tempfile.TemporaryDirectory() as temporary:
        jobs = Jobs(Path(temporary), estimator)
        token = secrets.token_urlsafe(32)
        service = ThreadingHTTPServer(('127.0.0.1', 0), handler_for(jobs, token, Path('photo-site/dist').resolve()))
        threading.Thread(target=service.serve_forever, daemon=True).start()
        base = f'http://127.0.0.1:{service.server_port}'
        def request(path, body=None):
            return urlopen(Request(base + path, data=body, headers={'Authorization': 'Bearer ' + token}), timeout=30)
        try:
            assert b'TRADESIGHT' in request('/').read()
            health = json.load(request('/api/health'))
            assert health['lastSuccessfulInference'] is None
            job = json.load(request('/api/jobs', data))
            deadline = time.time() + 180
            while time.time() < deadline:
                state = json.load(request('/api/jobs/' + job['id']))
                if state['status'] in {'failed', 'complete'}:
                    break
                time.sleep(.5)
            assert state['status'] == 'complete', state
            raw = np.load(io.BytesIO(request(f"/api/jobs/{job['id']}/relative-depth.npy").read()))
            assert raw.ndim == 2 and np.isfinite(raw).all()
            assert request(f"/api/jobs/{job['id']}/depth.png").read().startswith(b'\x89PNG')
            assert b'Not measured geometry' in request(f"/api/jobs/{job['id']}/inferred-relief.obj").read()
            assert json.load(request('/api/health'))['lastSuccessfulInference'] is not None
            print(json.dumps({'verified': 'actual Small-model inference and local HTTP upload/results',
                              'device': estimator.device, 'shape': list(raw.shape),
                              'input': 'synthetic test fixture' if args.fixture else 'supplied photo',
                              'provenance': estimator.provenance,
                              'phoneAccess': 'not tested', 'remoteDeployment': 'not tested'}))
        finally:
            service.shutdown(); service.server_close()
            jobs.pending.join()


if __name__ == '__main__':
    main()
