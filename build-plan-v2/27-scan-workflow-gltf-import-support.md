# 27 - Scan Workflow GLTF Import Support

Objective: fix a real-world gap reported by a user — a screenshot of their photogrammetry app's export menu showed no GLB option, only GLTF among OBJ/FBX/DAE/STL/USDZ and point-cloud/CAD formats, but the scan importer only accepted `.glb`.

Inspect:
- src/components/PhoneScanWorkflow.jsx

Create or update:
- src/components/PhoneScanWorkflow.jsx
- docs/testing.md

Done when:
- the file input and its handler accept `.gltf` as well as `.glb`
- on-screen capture instructions and panel copy mention GLTF, not just GLB, and warn that a multi-file GLTF bundle (separate .bin/texture files) will not load — only a single embedded file or GLB will
- the load-failure message explains the likely multi-file cause rather than only repeating "export as GLB"
- verified against a real single-file embedded `.gltf` fixture (loads successfully) and a multi-file-reference `.gltf` fixture (fails with the improved message)

Next step: 38-live-supplier-api-foundation (blocked on approved Bunnings partner API credentials)
