# Anatomical source data

The base mesh and adult male shape target are CC0 graphical data from MakeHuman:
https://github.com/makehumancommunity/makehuman

- `base.obj`: upstream `makehuman/data/3dobjs/base.obj`, blob d26635e9326e3cca30778fd7b9c00062b03cce09.
- `adult-male.target`: upstream `makehuman/data/targets/macrodetails/caucasian-male-young.target`.
- `LICENSE.ASSETS.md`: upstream asset license, CC0 1.0 Universal.

Only graphical data is incorporated; MakeHuman application code is not included.
Upstream names describe the source asset, not an assertion about the photographed person.
`tools/stone-room/anatomy.py` reads the data and extracts head/neck and hand topology.
The character's geometry, fitting, clothing, accessories, rig and animation remain
editable in `PhotoGuidedNPC.blend`. This anatomical base does not establish likeness.
