"""Standalone Windows PC service: isolated website, bounded queue and private jobs."""
import argparse
import hmac
import json
import os
from pathlib import Path
import queue
import re
import threading
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
from depth import BOUNDARY, MAX_BYTES, SmallEstimator, decode_photo, save_result

ARTIFACTS = {"photo.jpg": "image/jpeg", "depth.png": "image/png",
             "relief.json": "application/json", "relative-depth.npy": "application/octet-stream",
             "inferred-relief.obj": "text/plain"}


class Jobs:
    def __init__(self, directory, estimator):
        self.root = directory
        self.root.mkdir(parents=True, exist_ok=True)
        self.estimator = estimator
        self.items = {}
        self.lock = threading.Lock()
        self.pending = queue.Queue(maxsize=4)
        self.capacity = threading.BoundedSemaphore(4)
        self.last_success = None
        for folder in self.root.iterdir():
            if folder.is_dir() and (folder / "status.json").exists():
                record = json.loads((folder / "status.json").read_text(encoding="utf-8"))
                if record["status"] in {"queued", "processing"}:
                    record.update(status="failed", error="PC service restarted. Upload the photo again.")
                self.items[folder.name] = record
                self.persist(folder.name, record)
        threading.Thread(target=self.run, daemon=True).start()

    def persist(self, job_id, record):
        folder = self.root / job_id
        temporary = folder / "status.tmp"
        temporary.write_text(json.dumps(record), encoding="utf-8")
        temporary.replace(folder / "status.json")

    def get(self, job_id):
        with self.lock:
            return dict(self.items[job_id]) if job_id in self.items else None

    def update(self, job_id, **changes):
        with self.lock:
            self.items[job_id].update(changes)
            self.persist(job_id, self.items[job_id])

    def submit(self, photo):
        # Caller reserves capacity before reading/decoding the body.
        job_id = uuid.uuid4().hex
        folder = self.root / job_id
        folder.mkdir()
        record = {"id": job_id, "status": "queued", "created": time.time(), "boundary": BOUNDARY}
        photo.save(folder / "input.jpg", quality=95)
        with self.lock:
            self.items[job_id] = record
            self.persist(job_id, record)
        self.pending.put_nowait(job_id)
        return record

    def run(self):
        while True:
            job_id = self.pending.get()
            folder = self.root / job_id
            try:
                self.update(job_id, status="processing")
                photo = decode_photo((folder / "input.jpg").read_bytes())
                depth = self.estimator(photo)
                save_result(folder, photo, depth, self.estimator.provenance)
                self.last_success = time.time()
                self.update(job_id, status="complete", completed=self.last_success,
                            provenance=self.estimator.provenance)
            except Exception:
                # No internal paths, credentials or uploaded content in client errors.
                self.update(job_id, status="failed", error="Model processing failed. Check the PC service and retry.")
            finally:
                (folder / "input.jpg").unlink(missing_ok=True)
                self.capacity.release()
                self.pending.task_done()


def handler_for(jobs, token, web):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_):
            pass  # Avoid exposing job identifiers in default access logs.

        def respond(self, status, payload, kind="application/json"):
            data = json.dumps(payload).encode() if kind == "application/json" else payload
            self.send_response(status)
            self.send_header("Content-Type", kind)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Referrer-Policy", "no-referrer")
            self.send_header("Content-Security-Policy", "default-src 'self'; img-src 'self' blob:; connect-src 'self'; style-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'")
            self.end_headers()
            self.wfile.write(data)

        def authorized(self):
            supplied = self.headers.get("Authorization", "")
            if not hmac.compare_digest(supplied.encode(), ("Bearer " + token).encode()):
                self.respond(401, {"error": "Enter the PC access key to connect."})
                return False
            return True

        def do_GET(self):
            path = urlsplit(self.path).path
            if path.startswith("/api/"):
                if not self.authorized():
                    return
                if path == "/api/health":
                    self.respond(200, {"service": "reachable", "model": "loaded",
                                      "device": jobs.estimator.device,
                                      "lastSuccessfulInference": jobs.last_success,
                                      "provenance": jobs.estimator.provenance})
                    return
                match = re.fullmatch(r"/api/jobs/([a-f0-9]{32})(?:/([a-z.-]+))?", path)
                if match:
                    job_id, artifact = match.groups()
                    record = jobs.get(job_id)
                    if record and not artifact:
                        self.respond(200, record)
                        return
                    if record and record["status"] == "complete" and artifact in ARTIFACTS:
                        self.respond(200, (jobs.root / job_id / artifact).read_bytes(), ARTIFACTS[artifact] if artifact != "relief.json" else "application/json; charset=utf-8")
                        return
                self.respond(404, {"error": "Job or result not found."})
                return
            relative = "index.html" if path == "/" else path.lstrip("/")
            target = (web / relative).resolve()
            if web.resolve() not in target.parents or not target.is_file():
                self.respond(404, {"error": "Page not found."})
                return
            kinds = {".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css"}
            self.respond(200, target.read_bytes(), kinds.get(target.suffix, "application/octet-stream"))

        def do_POST(self):
            self.close_connection = True
            if not self.authorized():
                return
            origin = self.headers.get("Origin")
            if origin and urlsplit(origin).netloc != self.headers.get("Host"):
                self.respond(403, {"error": "Upload from the PC service's own website."})
                return
            if self.path != "/api/jobs":
                self.respond(404, {"error": "Endpoint not found."})
                return
            try:
                length = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                length = 0
            if self.headers.get("Transfer-Encoding") or not 0 < length <= MAX_BYTES:
                self.respond(413, {"error": "Choose a photo under 12 MB."})
                return
            if not jobs.capacity.acquire(blocking=False):
                self.respond(429, {"error": "PC queue is full. Wait for a job to finish and retry."})
                return
            try:
                self.connection.settimeout(30)
                data = self.rfile.read(length)
                if len(data) != length:
                    raise ValueError("Upload was interrupted. Try again.")
                photo = decode_photo(data)
                record = jobs.submit(photo)
            except (ValueError, OSError) as error:
                jobs.capacity.release()
                self.respond(400, {"error": str(error)})
                return
            except Exception:
                jobs.capacity.release()
                self.respond(500, {"error": "PC could not store the upload."})
                return
            self.respond(202, record)
    return Handler


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--model", type=Path, default=Path("photo-site/model"))
    parser.add_argument("--data", type=Path, default=Path("photo-site/data"))
    parser.add_argument("--web", type=Path, default=Path("photo-site/dist"))
    args = parser.parse_args()
    token = os.environ.get("TRADESIGHT_PHOTO_KEY", "")
    if len(token) < 32:
        parser.error("Set TRADESIGHT_PHOTO_KEY to a private random key of at least 32 characters.")
    if not (args.web / "index.html").is_file():
        parser.error("Build the independent photo site first: npm run build:photo")
    estimator = SmallEstimator(args.model.resolve())
    jobs = Jobs(args.data.resolve(), estimator)
    service = ThreadingHTTPServer((args.host, args.port), handler_for(jobs, token, args.web.resolve()))
    print(f"TRADESIGHT photo service listening on {args.host}:{args.port}; Small model loaded on {estimator.device}.")
    print("Model inference and phone access remain unverified until a real photo completes.")
    try:
        service.serve_forever()
    except KeyboardInterrupt:
        service.server_close()
