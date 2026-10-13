# TRADESIGHT Photo Studio — independent Windows service

This is a separate site inside mayhem82/TRADESIGHT. It has its own build output,
web entry point and Windows server; it does not import the current application,
its browser storage, or its GitHub Pages deployment. No replacement repository
or demonstration mode is involved.

## What a result means

Depth Anything V2 **Small** estimates single-photo relative depth. Brighter/high
values indicate inferred nearer surfaces within that image. The rotatable preview
and OBJ are a 2.5D relief using an arbitrary height scale, not a measured 3D scan.
There are no metres, calibrated dimensions, recovered backs/hidden surfaces,
compliance conclusions or accuracy guarantees. Raw NPY is model output in
relative units. Small weights use Apache-2.0; no Base/Large weights are used.

Sources: https://github.com/DepthAnything/Depth-Anything-V2 and
https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf.
The Transformers implementation uses Pillow preprocessing and may differ slightly
from the upstream OpenCV implementation. Model snapshot revision is recorded in
every result. Serving uses local weights only, with no runtime download fallback.

## Windows setup (PowerShell, from the repository root)

Install Python 3.11 or 3.12 and Node.js 22+. CPU inference is supported; compatible
CUDA hardware is optional. These commands install packages and download roughly
100 MB of Small weights in addition to PyTorch's larger installation.

```powershell
npm install
npm run build:photo
py -3.12 -m venv photo-site/.venv
photo-site/.venv/Scripts/python.exe -m pip install -r photo-site/worker/requirements.txt
photo-site/.venv/Scripts/python.exe photo-site/worker/download_model.py
# Generate a key without saving it in source control:
$photoKeyBytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Fill($photoKeyBytes)
$env:TRADESIGHT_PHOTO_KEY = [Convert]::ToBase64String($photoKeyBytes)
# Copy the key into the website's password field; do not share it publicly.
$env:TRADESIGHT_PHOTO_KEY
photo-site/.venv/Scripts/python.exe photo-site/worker/server.py
```

Open http://127.0.0.1:8765 on the PC. Check connection, select a real photo,
and process it. A reachable service and loaded model do **not** prove inference
works. Confirm a completed job, a depth map, the relief preview and downloads.
This is a single trusted operator/group service: anyone with the access key can
read its jobs. It is not a multi-user hosted account system.

## Private access from anywhere (the requested deployment)

The phone does **not** need to share the PC's Wi-Fi. Use Tailscale Serve for a
dedicated private HTTPS address. The phone can use mobile data or any Wi-Fi while
the PC processes photos at home. The PC must stay awake, online and running the
worker; availability everywhere does not mean processing while the PC is off.

1. Install [Tailscale](https://tailscale.com/download) on the Windows PC and phone.
2. Sign into the same private Tailscale account on both devices. Enable MagicDNS
   and HTTPS certificates in that account if prompted. Keep access restricted to
   your trusted devices/users.
3. After completing the build/model setup above, run from the repository root:

   ```powershell
   ./photo-site/Start-PrivatePhoto.ps1
   ```

4. The launcher prints your actual private HTTPS address and a photo access key.
   Leave that window running. Connect Tailscale on the phone, open the printed
   address, enter the key, and check the PC connection.
5. Turn **Wi-Fi off on the phone** and use mobile data to upload a real photo.
   Confirm processing completes and both the depth map and OBJ download work.
   Only then is off-network phone access verified.

The launcher uses HTTPS port 8443 and loopback-only worker port 8765. It refuses
to overwrite a Tailscale Serve route already on its chosen port. For another free
port use `./photo-site/Start-PrivatePhoto.ps1 -HttpsPort 9443`. It generates a key
in memory unless `TRADESIGHT_PHOTO_KEY` is already set. A newly generated key
changes on each launch. It does not open Windows firewall/router ports or use
public Tailscale Funnel. The HTTPS address is private to authorized tailnet devices.

The Tailscale route remains configured after the worker stops; its address will
then be unavailable for processing. Stop just this route, if desired, with:

```powershell
& "$env:ProgramFiles/Tailscale/tailscale.exe" serve --https=8443 off
```

For an existing managed HTTPS reverse proxy instead, set
`TRADESIGHT_PHOTO_ORIGIN` to its exact HTTPS origin (including a non-default port,
without a trailing slash). This allows authenticated uploads even if the proxy
rewrites Host to localhost. Other browser origins are rejected. Frontend and API
share that origin. No Tailscale login, private URL, or physical phone connection
is established merely by committing these files.

Official references: [Serve](https://tailscale.com/docs/features/tailscale-serve)
and [CLI](https://tailscale.com/docs/reference/tailscale-cli/serve).

The service listens only after local model loading succeeds. Access-key protected
health reports service reachability, model device and last successful inference
for the current process. Jobs are bounded to four admitted uploads, processed
sequentially, and persisted on disk. Interrupted queued/running jobs become failed
on restart. Results can be resumed after a page refresh by re-entering the key.
The browser stores only the last job ID in session storage, not the key.

## Data and tests

Input files are deleted after processing; EXIF/GPS are stripped when photos are
re-encoded. Results/status remain in `photo-site/data/<job-id>` until the operator
deletes them with the service stopped. Model cache, jobs and virtual environment
are ignored by Git. There is no automatic expiry; plan disk cleanup for regular
use. Changing the access key protects existing results with the new key.

```powershell
photo-site/.venv/Scripts/python.exe -m unittest discover -s photo-site/worker -p "test_*.py" -v
npm run build:photo
npm run build
photo-site/.venv/Scripts/python.exe photo-site/worker/smoke_model.py --photo C:/path/to/photo.jpg
```

Tests use a deterministic estimator to check upload authentication, rejected
files/origins, bounded jobs, real HTTP result downloads, depth normalization,
OBJ output, failure status and restart behavior. They do **not** test the neural
weights or prove a Windows PC/phone connection. Run the actual model smoke test
above on the intended PC, then repeat it from the phone's deployed URL before
claiming an operational deployment. Verify portrait orientation, camera/library
uploads, a failed/disconnected PC, reload recovery and drag/pinch on the phone.

`smoke_model.py --fixture` runs actual weights through a local HTTP upload and
download using a synthetic test image. That tests execution only; it establishes
neither depth accuracy on real photos nor phone/remote access.
