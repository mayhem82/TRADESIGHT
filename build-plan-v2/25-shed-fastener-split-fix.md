# 25 - Shed Fastener Split Fix

Objective: fix a fastener estimate that silently summed two different fixing types into one number, reported by a user as "screw count seems off."

Inspect:
- src/shed/shed-item-list.js (fastenerItems)

Create or update:
- src/shed/shed-item-list.js
- buildos/changelog.json
- buildos/state.json
- README.md

Done when:
- the enclosed-shed fastener estimate reports "Wall cladding screws" and "Roofing screws" as separate line items, matching the open-sided branch's existing separation
- no line item's quantity is the sum of two different fastener types under one label
- self-check still passes

Next step: 36-shed-roof-pitch-and-lean-to
