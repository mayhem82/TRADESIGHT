# Stone Room editable assets

Dimensions are illustrative: 8 × 6 × 3 metres. No measured survey was supplied.

- `StoneRoom.FCStd`: native FreeCAD solid architecture, independent walls and window cuts.
- `StoneRoom.step`: neutral editable solid geometry export.
- `StoneRoom.blend`: individual stones and timber, UVs, packed material maps.
- `PhotoGuidedNPC.blend`: full-body skinned character and four NLA animation tracks.

Rebuild from the repository root (Blender 4.3, Python with Pillow and NumPy):

```sh
PYTHONPATH=/usr/lib/freecad/lib /usr/bin/python3 tools/stone-room/architecture.py
python tools/stone-room/textures.py
blender -b --python tools/stone-room/build_room.py
blender -b --python tools/stone-room/build_npc.py
python tests/stone-room/assets.py
blender -b --python tests/stone-room/geometry_blender.py
```

The supplied frontal photograph is projected into `face-albedo.jpg`; preserve that
file when rebuilding. Other PBR maps are original deterministic procedural textures.
The native character source contains the packed face map, skeleton and editable geometry.
The character is a photo-guided interpretation, not a verified photogrammetric likeness.
No third-party human model was incorporated. Three.js is MIT licensed (see vendor/LICENSE).

Runtime assets are `public/stone-room/assets/stone-room.glb` and
`photo-guided-npc.glb`. The room ceiling remains independently hideable; production
meshes combine individually editable source elements to reduce draw calls. Exported
scenes use glTF metre units, Y up. The character faces glTF +Z.

AR uses WebXR hit testing and session-relative placement. Wall placement estimates
floor height from a nominal 1.65 m viewer eye level; floor hits provide the measured
surface elevation. Persistent anchors and cross-session relocalization are absent.
Physical ARCore tracking and Samsung Galaxy S25 FE performance remain unverified.

## 2026-10-24 visual revision

Run `blender -b --python tools/stone-room/prepare_textures.py` before rebuilding.
Generated color-map masters are retained in `reference-textures/`; optimized JPEGs
are used by the GLBs/runtime. The countryside is a distant equirectangular background,
not measured terrain or a real AR view. Real camera passthrough replaces it in AR.

The face-neutral color map is generated from the supplied frontal photo to remove
baked eyewear/lighting. Eyes underneath the 3D glasses are generated, not observed.
The original supplied `face-albedo.jpg` remains retained. Head/hand topology now
uses CC0 MakeHuman data (see anatomy/README.md), superseding the earlier original-only
character statement. Facial likeness remains an artistic interpretation.
