# Verification — 16 October 2026

Verified on Windows with FreeCAD 1.1.4.

- Three Python test cases passed. They exercise the actual FreeCAD subprocess and
  HTTP authentication, origin checks, geometry validation, opening cuts, real
  sections, supplied service schematics, photo persistence, dimensions, ZIP/PDF
  outputs, existing-file re-import, source preservation and restart recovery.
- The existing TradeSight React application builds successfully with the new
  FreeCAD Site Studio entry point. Vite retains its existing large-chunk warning.
- Chromium at 390 × 844 verified responsive layout, connection, real generation,
  viewer iframe/CSP, plan presets, zoom, drag, job history and reload recovery.
- A second Chromium run through the actual public HTTPS tunnel verified pairing,
  HttpOnly secure-cookie authentication, photo selection/upload, touchscreen
  scale marking and component tracing, actual FreeCAD generation, model display,
  and PDF retrieval. No page/console errors occurred.
- Automated Chromium's native download manager canceled saves in this Windows
  execution sandbox. Actual authenticated PDF/ZIP bytes were retrieved and checked
  by HTTP. Physical-phone browser save/share behavior remains to be confirmed.
- PDF sheets were rendered with Poppler and visually checked. Geometry remains
  synthetic/test or supplied CAD; none of these checks establishes site accuracy.
- Customer-model import was tested separately during development. All development
  and customer fixtures are outside the live `data/jobs` directory. The delivered
  console starts with an empty live job list and no dependency on a customer file.
- Both PowerShell launchers parse successfully. The current temporary HTTPS route
  was established and authenticated health checked. A physical phone using mobile
  data has not yet been independently tested.

This release supports photo-assisted tracing and supplied geometry. It does not
claim automatic complete photo-to-building reconstruction, measured hidden
geometry, full BIM authoring, DXF/IFC export, fabrication-ready dimensioning or
engineering analysis. Native TechDraw pages are editable; exported projection
sheets include overall sizes plus separate component dimensions and descriptions.

Do not commit access keys, runtime URLs, photos, CAD jobs or tunnel binaries.

## Actual photo texturing increment

The actual FreeCAD integration test now checks a photo crop, mapping restricted
to front-plane triangles, embedded photo bytes in the offline viewer, and GLB
container/image/UV metadata. A colour-quadrant test image is used to distinguish
correct orientation from a flipped or stretched mapping. The web viewer is also
checked for switching between photo texture and base colour. This validates the
mapping mechanism, not real-site photographic alignment or concealed textures.
