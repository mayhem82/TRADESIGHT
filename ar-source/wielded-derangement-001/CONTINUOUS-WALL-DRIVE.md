# Continuous outer machine — local candidate 006

The separate outer structure now has a closed mechanical circuit through all
twenty wall sections, including all four corner transfers. Each section has a
rotating crank gear and visible eccentric pin. Moving connecting rods join
each pin to the next; a continuous upper transfer shaft also joins the sections.
The connecting rods are reconstructed between their exact moving endpoints
every frame, so they stay attached as cranks rotate and the footprint changes.

Motion follows the existing visual song time (1.65 radians/second with section
phase offsets), including seeking and Hold form. It does not depend on rendering
frame count. The mechanism uses the outer structure's existing independent
anchor, position, rotation, width, depth, height and visibility. It does not
move or resize the central machine. All central geometry, portrait, audio,
beat-response features, controls and accepted vendor files are preserved.

The added geometry is shared across 80 articulated nodes: twenty gears, twenty
connecting rods, twenty upper shafts and twenty pins. It adds 5,760 triangles,
80 material draws and a 20,736-byte binary. The complete outer structure is
9,360 triangles and 140 draws. Mobile frame rate has not been measured.

The minimum 2 m footprint is accounted for: crank radius and inward offset
reduce to retain corner clearance. Tests verify rod/shaft endpoints, a closed
circuit across every corner, nondegenerate minimum link length, repeatable
time-based motion, and actual moving vertices above sloped ground at minimum
and maximum width/depth/height. The expanded suite has 31 passing local tests.
Offline views of the saved geometry were inspected; these are not browser or
physical-phone tests. The entry and changed enclosure import use candidate 006
cache versions to avoid a cached older module missing the linkage API.

This candidate is local only. The public version remains approved release 005,
commit a59c7de47bc09a0fab7e7ad10091aecb15a4c296. No push was attempted for this
wall change. Phone validation and any publication decision remain outstanding.
