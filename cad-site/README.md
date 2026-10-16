# TradeSight Site CAD

An independent, operational CAD job console inside TradeSight. It is not tied to
any customer model. FreeCAD 1.1.4 runs in a separate offscreen process, leaving
the user's live documents and source files untouched. No npm build is needed for
the CAD console; its web files are served directly by the Python service.

## Start locally

From the repository root, in PowerShell:

```powershell
./cad-site/Start-CAD.ps1
```

The launcher opens a private pairing link. The key is held in the browser's memory
and a derived HttpOnly session cookie permits native file downloads. Pairing
fragments do not reach the server and are removed from browser history after use.
The local key is stored in ignored `cad-site/.local/access.key`. Keep it private.
Changing that file and restarting invalidates previous pairings.

## Phone on mobile data, without Tailscale

```powershell
./cad-site/Start-TemporaryRemote.ps1
```

This downloads a pinned, SHA-256 checked official Cloudflare tunnel executable if
needed. It opens an outbound HTTPS tunnel and prints a private pairing link for
the phone. No router changes, PC administrator account or phone VPN are required.
The UI address is publicly reachable, but job data and uploads require the random
access key or paired session. Share the pairing link only with trusted people.
Photos and CAD results pass through Cloudflare's tunnel service. Files stay on
the configured PC. This temporary hostname changes on restart and is not durable
hosting; the PC and console must remain awake and connected.

Reference: https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/

For a longer-term private connection, use `./cad-site/Start-CAD.ps1 -Remote`
after connecting Tailscale on the PC and phone. That uses private HTTPS port 9443.

## Create a job

1. Enter a job title. Select a straight-on site photo or an existing `.FCStd` file.
2. For a photo, mark two reference points and supply their distance in mm. Select
   whether the reference was measured, verified from a product or nominal.
3. Tap two opposite corners per component. Trace the wall before its openings.
4. Edit sizes, depth, XYZ position, material, description and provenance. Tracing
   produces photo-inferred sizes; calibration does not remove perspective.
5. Optionally enter service routes as XYZ points. These are supplied schematic
   routes, never inferred concealed services.
6. Generate. The PC validates shapes, saves a separate CAD model and produces
   drawing sheets, schedules, exchange formats and an offline interactive model.
7. Open results on the phone or download the full ZIP for use without a signal.

### Actual photo textures

The checked **Apply actual photo texture** option maps the selected photo crop
onto the front surface of each traced solid box. It uses the actual sanitized
photo pixels, including their captured lighting. The viewer's **Photo textures**
button switches between this appearance and the CAD base colours. Unseen sides,
rear faces, service routes and manually entered components stay untextured.
Selecting a different photo detaches the old crops to avoid applying the wrong
image. A straight-on photo gives the best alignment; this is planar mapping,
not automatic multi-view unwrapping or lighting correction.

Textures are embedded in `viewer.html` for offline use and `model.glb` for a
portable 3D model. GLB units are metres; CAD/drawing values remain millimetres.
The FCStd, STEP and STL exports retain geometric/material information rather than
the baked photograph. Texturing changes the visual surface, not the measured
geometry or dimensions. Existing-model imports do not get automatic camera/photo
registration in this release.

The advanced JSON editor accepts components prepared by Codex from photos and
specifications. Supported editable primitives are boxes, vertical cylinders,
host-cut rectangular openings and cylindrical polyline service routes. This
release does not automatically identify every building component, rectify
perspective, perform photogrammetry or recover hidden construction. The existing
Photo Studio remains available separately for unscaled relative depth.

## Exports

- `model.FCStd`: BRep geometry, component provenance, materials, descriptions and
  native TechDraw pages/views. Original source files remain unchanged.
- `model.step`, `model.stl`: solid/surface exchange and tessellated export.
- `model.glb`: portable model with embedded source photo and front-face UV mapping
  when a photo crop is supplied. No external textures need downloading separately.
- `drawings.pdf`: plan, front and side elevations, real mid-depth BRep section
  where geometry intersects, supplied service schematic when present, and
  paginated component dimensions/materials/descriptions.
- SVG and PNG copies of each sheet. Projection sheets show rear edges and are
  clearly marked as transparent line projections; overall dimensions come from
  the model. They are fitted to page, not specified print scales.
- `components.csv`: XYZ sizes, volume, material, descriptions and provenance,
  including the supplied opening sizes. These are model quantities, not a
  verified procurement list or structural assessment.
- `viewer.html`: self-contained offline model with rotate, zoom, view presets,
  per-component visibility, roof/wall/service toggles, labels, descriptions,
  selected-component dimensions and image export. No internet or CDN is required.
- `job.json`, `manifest.json`, sanitized `photo.jpg` when supplied and `package.zip`.

Raw photo dimensions, standard component sizes and site measurements are distinct
evidence sources. No nominal size is treated as a guaranteed as-built dimension.
Imported models preserve their geometry and colours; site measurement provenance
defaults to unknown unless already supplied as TradeSight metadata.

## Storage, limits and operation

Live jobs are stored in ignored `cad-site/data/jobs/<job-id>`. Early development
fixtures are outside that live-job directory. There is no dependency on any
customer model. Export filenames are allowlisted, requests are bounded to 64 MB,
photos to 12 MB / 20 MP, and the engine runs sequentially with three admitted jobs.
No arbitrary Python, command line or macro is accepted from a client. Only open
trusted CAD documents; FreeCAD supports executable custom object extensions.
Interrupted jobs become failed on restart; completed jobs remain resumable.

The default FreeCAD path is `C:/Program Files/FreeCAD 1.1/bin/python.exe`.
Use `-FreeCadPython` on either launcher for another installed version. FreeCAD's
bundled Python must include Pillow and PySide6, as this installation does.

## Verification

```powershell
& 'C:/Program Files/FreeCAD 1.1/bin/python.exe' -m unittest discover -s cad-site/worker -p 'test_*.py' -v
npm run build
```

Integration tests execute the real FreeCAD engine and HTTP uploads/downloads,
validate a cut opening, sections, schematics, dimensions, re-import, source-file
preservation, authentication, origin checks and persistence. Synthetic test
geometry proves execution, not real-site accuracy. Physical-phone access must be
confirmed from the generated remote URL.
