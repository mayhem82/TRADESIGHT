# Stone Room texture test 001 — irregular floors and varied windows

This complete room experiment retains the original nominal 8 × 6 × 3 m interior, companion animations, all 39 original control/option tags and defaults, and WebXR hit-test placement. Original architecture GLB SHA256 remains e091f7666a95d126ea159efa178cf8854aa9373b99e158040c08f7ae6f6ec850. Original room files and other models are unchanged.

## Aged floorboards

A unique, non-repeating room-scale atlas contains 162 boards in 28 variable-width courses. Board widths range approximately 146–282 mm; lengths range 243–2600 mm including short edge repairs. Ends are staggered. Each board has varied grain, knot position, colour, wear, drying splits and occasional nail heads. Shallow dark seams represent roughly 1.4–6.1 mm gaps; these are opaque material recesses, not open mesh holes.

Three 1024 × 1024 albedo/normal/roughness PNGs were deterministically authored with the existing NumPy/Pillow tools (seed 20261028). Blender was not used and no software or model downloads were needed. The atlas is used once across the entire original floor footprint; it does not tile. The layout and dimensions are recorded in assets/texture-001/aged-floor-layout.json.

The continuous floor treatment stays at the original highest board elevation (0.0094999969 m above the original floor origin). While active, alternate index buffers suppress only the original floor-board faces and shadows; position/normal/UV attributes and the original geometry are retained. This prevents coplanar bevel flicker and the old uniform board shadow pattern. The original floor geometry returns exactly when the original appearance is selected. Existing walk/collision rules, room dimensions, threshold footprint and placement transforms are unchanged. No legitimate floor opening is covered; the baseline has no floor-level doorway in the tested wall runs.

## Windows on all four walls

Existing north/south/west apertures are retained. North windows have multi-pane rectangular casement rails; south has broad casements with upper transom lights; west has paired tall narrow casements. The previously solid east wall has a real tall arched aperture and a small round aperture, with timber liners and stone surrounds.

The east openings are cut through the actual stone and mortar triangles using analytic convex-prism clipping. Original normals and UVs are interpolated at cut edges. This is geometry, not a painted window or transparent wall. No glass is used. Openings can be viewed through from either side; structural corners and all 48 sampled pre-existing opening sightlines remain intact. Window geometry is present in both material-comparison modes.

Frame geometry is merged into two batches to keep draw calls bounded. All additions are children of the original architecture and follow the same room placement/world anchor. Overall room bounds remain unchanged. The original asset file is not overwritten.

## Centre ceiling bulb

A visible frosted bulb with a short aged-brass fitting mounts at the actual centre ceiling underside (x/z = 0). Its lower edge stays above 2.57 m. One bounded warm downward spotlight illuminates the room. Existing lights are preserved, and the bulb adds no shadow map, bloom or post-processing. The cone points away from the ceiling and its short range limits exterior spill.

The baseline has no dedicated brightness control. The bulb therefore follows the existing Overhead and architecture Hide/Show state. It remains present and steady through original/aged material comparison and rune pulse changes; it does not create duplicate lights on AR reentry.

## Aged lime mortar

The original flat mortar is replaced only in the aged appearance mode with restrained lime/buff albedo, high roughness, fine aggregate, worn pitting and subtle dirt/mottling. Three 512 px PBR maps are authored with NumPy/Pillow (seed 41028). A separate UV channel uses a consistent 1.25 m physical repeat instead of stretching one patch over each wall.

Existing irregular stone boundaries and physical mortar recesses remain. Micro-relief comes from the normal map; there is no mortar geometry displacement, added dark outline, alpha cutout or transparent wall. Wall positions, original UVs, window apertures and frame geometry are unchanged by this material correction. Original mode restores the original mortar material. Multi-angle daylight and bulb-lit renders were visually reviewed; automated checks do not establish photorealism.

## Stone, runes, comparison and budget

The four original 512 px weathered-stone/rune maps and their six original limestone slots are retained. One additional stone surround material shares those maps. Rune emission remains a three-second JavaScript emissive-intensity cycle, independent of companion animation and Blender shader export.

Open Textures to compare original materials/floor versus the aged treatment, hold/resume the rune pulse and Hide/Show architecture. Original UI names, positions, options, defaults, text-size increase of four CSS pixels and collapsible AR overlay behavior remain. Select Stone Room + NPC in the original AR Environment setting to test the full room; its original NPC-only default is retained.

The ten authored texture maps use approximately 25.33 MiB additional RGBA8 GPU storage including mipmaps (16 MiB for the new floor maps and 4 MiB for mortar). The one requested warm bulb light is bounded and shadow-free; existing lights are retained. No new shadow map, bloom or post-processing pass is added.

All new appearance and geometry changes run in the walkthrough and Browser AR. The separate native Android viewer keeps the original model/appearance, including its original floor, windows and lighting and cannot execute these JavaScript effects.

## Verification scope

Local tests use the full original architecture and animated companion, plus real geometry rays, software WebGL, mobile DOM and emulated XR lifecycle checks. Tests cover original opening rays, both sides of the new openings, frames on every wall, continuous floor probes, original floor geometry restoration, controls, material/pulse comparison, Hide/Show, repeated sessions/cancel, cleanup and resource counts. Six additional full-scene render views inspect all interior walls and both exterior directions of the new east openings. A floor-pixel comparison confirms the bulb actually illuminates the room without allocating a shadow map.

Physical S25FE AR tracking, thermal behavior, memory pressure and performance acceptance remain pending. Desktop software-renderer timing is not physical-device acceptance.
