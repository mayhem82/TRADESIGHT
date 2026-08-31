# 24 - Shed Round Post Size Impute

Objective: give the open-sided support post item a concrete round timber diameter instead of an unspecified "post", imputed from post height rather than requiring the homeowner to enter it.

Inspect:
- src/shed/shed-item-list.js
- src/shed/build-shed-model.js
- src/diagnostics/self-check.js

Create or update:
- src/shed/shed-item-list.js
- src/shed/build-shed-model.js
- src/diagnostics/self-check.js
- docs/testing.md

Done when:
- a banded diameter table (100/125/150/175mm by wall height) imputes a round timber post diameter, exposed as `imputeRoundPostDiameterMM`
- the open-sided "Support posts" item line shows the imputed diameter and states it is imputed, not a span or wind-load calculation
- the 3D model's open-sided posts render as cylinders sized from the same imputed diameter, so the model and the item list agree
- self-check confirms the item list diameter matches `imputeRoundPostDiameterMM` for the plan's wall height

Next step: 35-live-supplier-api-foundation (blocked on approved Bunnings partner API credentials)
