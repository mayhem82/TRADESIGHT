# Circular outer machine — local candidate 007

The square enclosure is replaced by twenty curved mechanical sections arranged
at equal angles around a full circle. The original central machine and its
portrait, animation, beat response, audio, placement and controls are unchanged.

The outer structure now has a single **Diameter** control (2–20 m), replacing
the separate width/depth controls so the footprint stays circular at every size.
Its independent position, rotation, height (0.8–5 m), visibility, reset and ground
placement remain. A 6 m default is adjustable, not a room measurement. Neither
room mapping nor physical-object occlusion is introduced.

The wall rails are subdivided and bent onto circular arcs; the result is not
four straight sides or a square with rounded corners. All twenty sections face
inward. Their original steel, brass and light vocabulary is retained, using a
new shared curved mesh. The flat wall assets are kept but are no longer loaded.

The twenty cranks and their eccentric pins, moving connecting rods and upper
shafts form one closed circular drive. Each link joins the next section, with
the last section joining the first. Gear orientation follows the ring tangent;
motion remains deterministic in song time, including seeking and Hold form.
All mechanisms inherit only the outer structure's anchor and controls.

The curved panels have 9,200 triangles and the existing drive has 5,760: 14,960
triangles and 140 material draws for the complete outer structure. Curved-panel
binary size is 33,120 bytes. Existing shared drive geometry is unchanged.
Mobile frame rate has not been measured.

33 local tests pass, including equal radius/spacing/inward orientation, decoded
curved rail vertices across minimum and maximum diameters, independent controls,
closed link endpoints and rotation, actual geometry above sloped ground, full
song beat response, portrait identity/fading and tracking lifecycle. Syntax,
HTML control IDs and local asset/import references were also checked.
Offline geometry views at 6 m and 10 m diameters, inside the circle, and at two
drive phases were inspected. These are not browser or physical-phone tests.

The changed entry page and enclosure import use candidate 007 cache versions.
This is local only; the previous public release remains commit
3314f65191b430ad27abd5b71539013f1aa0bc0a. No publication attempt was made for
this circular change. The preceding approval covered the prior release.
