# Bellbrook — POV terrain and road world

## Phone flight controls

The browser opens in fly mode near a mapped Main Street reference. Use the left joystick for forward/back and sideways movement; the right joystick looks around. Hold Rise/Descend for altitude. The speed slider covers 1–120 metres per second. Releasing controls stops movement. Expand fills the page; from the embedded library it opens the real world page first. Overview returns to orbit navigation. Main Street resets the viewpoint. On desktop, use WASD, Space/C for altitude, arrow keys or dragging the scene to look.

Flight is confined to the terrain coverage and stays at least 2 m above the rendered DEM surface. This is a virtual camera constraint, not a real navigation or clearance assessment. Roads are reference lines, not collision surfaces; bridge decks and vegetation are not yet reconstructed. Building footprint massing is now included; roof forms and facades are not reconstructed.

## Optional issue notebook

No automatic alerts or phone notifications are enabled. Issues are passive, optional markers you can inspect. Two initial markers identify mapped bridge references with unverified deck heights. The historical gauge screenshot is linked to Bellbrook Bridge on Toose Road by user confirmation. Its historical reading is not presented as live.

Open Issues to add a note at the current viewpoint or pick a terrain location. Notes are unverified user reports and remain in local browser storage. They do not sync between devices or get sent to another person. Export/import JSON transfers them manually; imported files must match this world's CRS and origin. Clearing browser storage or moving between the previous temporary host and GitHub Pages can make previous local notes unavailable, so export any notes you need to retain.

`World-Checks.json` records controller, multi-touch, persistence and notification-state checks. These used browser touch emulation; physical phone performance remains untested.

Real elevation from [NSW Spatial Services' 5 m elevation service](https://maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_5M_Elevation/ImageServer), aligned with the Bellbrook road reference. The service describes its statewide coverage as derived from stereo imagery. This is not a new LiDAR or site survey.

## Source and geometry

- Download footprint: 5 × 5 km, E450524–455524 / N6588035–6593035 in EPSG:32756.
- Original float32 GeoTIFF export retained: `Bellbrook-5m-DEM.tif`.
- Requested metric grid: 1000 × 1000 cells at 5 m, bilinear resampling. One million valid finite samples; no holes detected. Heights approximately 53.35–341.72 m.
- Mesh vertices sit at raster pixel centres, from local -2497.5 to +2497.5 m. There are 1,996,002 triangles; no decimation or height exaggeration.
- Shared local XY origin: E453024 / N6590535 m. Blender, PLY and browser units are metres; FreeCAD is millimetres. Raw elevation values are retained.
- Catalogue records identify `Carrai-DEM-AHD_56_5m` and `Macksville-DEM-AHD_56_5m`. AHD is indicated by those names; the export's vertical datum was not independently validated. Capture dates and local vertical accuracy were not established.

The live identify response near Bellbrook centre returned 88.744 m. Sampling the bilinear export at that coordinate gives 88.691 m, a difference of -0.053 m. This is an alignment screen, not a test against surveyed ground. Three further remote identify requests timed out and are not counted as passed.

## Road reference treatment

The original 2D source geometry remains in `Bellbrook-Roads/`. Here, reference lines are sampled along their original XY paths and placed on DEM ground with a 1 m display offset. This does not establish carriageway, bridge, retaining or slab levels. Parts outside the DEM's pixel-centre coverage are omitted from this terrain view; the source road files remain complete.

Two NSW segments are classified OnBridge. Their source Z values are zero, so those do not establish deck heights. The browser marks their ground-reference traces orange. No bridge deck or clearance has been invented.

Cadastral reference lines remain a separate optional layer and do not prove a formed road or access entitlement. Display line thickness is not road width.

## Outputs

- `index.html`: 3D browser viewer with village, whole-area and top views; tap the terrain for approximate source-grid heights.
- `Bellbrook-Terrain.blend`: full-resolution native Blender terrain and NSW ground-reference lines; BlenderGIS geographic reference retained.
- `Bellbrook-Terrain.FCStd`: full open terrain mesh and NSW reference wires in FreeCAD. An open terrain surface is intentionally not a closed solid.
- `Bellbrook-Full-5m-Terrain.ply`: full mesh in local metres.
- `terrain.json`, `heights.f32`: uncompressed browser grid and its metadata.
- `Terrain-Checks.json`, `FreeCAD-Checks.json`: source/grid and native reopen checks.

This stage does not resolve small retaining walls, slab falls, gate clearances, road widths, bridge deck heights or the exact laneway beside the photographed property. A 5 m grid is a town-scale reference for those later details.

Attribution: NSW Spatial Services; service copyright field reads “DFSI 2019”. Original source responses and metadata retained in this folder. The generated-output URL supplied by the service returned 404; the documented `exportImage?f=image` route was used to retrieve the TIFF directly.


## Town stage 1 — buildings, waterways and named places

The GitHub world includes 222 building footprints: the existing OSM Hall reference plus 221 Microsoft ML footprint massings after removing the overlapping Hall footprint. Microsoft coverage was captured from the August 2026 global index. Original source polygons are retained without simplification. ML-derived boundaries and height estimates are not surveyed boundaries or measured roof profiles. Missing heights use illustrative 4 m massing. Flat top caps are reference massing, not reconstructed roof shapes.

Town layers toggles building massing, water references, mapped parks, illustrative road surfaces and place/road names. Named-place shortcuts include Bellbrook Hotel, Hall, Public School, Police Station, mapped waterways and NSW road references including Oreen Street. Free flight still covers the whole 5 × 5 km terrain, with no restriction around the sign or town centre.

The 11 mapped waterway features produce 15 clipped reference paths. They are centreline references, not reconstructed bank-to-bank water surfaces. Two mapped parks are included. No individual trees or unverified forest areas have been invented. Solid road ribbons follow the existing NSW centreline/DEM reference with illustrative 6 m width, or 3 m for vehicular tracks. Bridge segments remain excluded from these ribbons because their deck elevation is unresolved.

Sources: OpenStreetMap contributors, ODbL 1.0 (https://www.openstreetmap.org/copyright); Microsoft Global ML Building Footprints (https://github.com/microsoft/GlobalMLBuildingFootprints), CDLA Permissive 2.0 (https://cdla.dev/permissive-2-0/). Source metadata and original captures are retained in the GitHub world directory. Source input may already contain publisher generalisation; TradeSight adds no simplification.

FreeCAD outputs: Bellbrook-Town-Features.FCStd and Bellbrook-Town-Buildings.step contain 222 valid building solids. The local Bellbrook-World.FCStd now also includes the town layer, complete terrain and native sign assembly. Town-Native-Checks.json records reopened solids and retained 1,996,002 terrain facets. Town-Browser-Checks.json records layer toggles, named-place flight, movement/stop and a browser run with all external and PC network requests blocked. Physical-phone performance remains untested.

Still missing: individual facade and roof reconstruction, bridge deck geometry and levels, bank-to-bank river geometry, trees and vegetation, imagery textures, measured road widths and site-level detail. These should be added as sourced build stages rather than treated as already complete.
