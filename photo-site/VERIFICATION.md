# Verification — 13 October 2026 (Australia/Sydney)

Repository base: `a88bf17` on `mayhem82/TRADESIGHT/main`.
Independent source: `photo-site/`; current app components and Pages workflow unchanged.

| Check | Evidence / result |
| --- | --- |
| Existing app production build | `npm run build` passed; existing large bundle warning |
| Independent photo production build | `npm run build:photo` passed; Three.js bundle warning |
| Windows dependencies | Python 3.12.14; pinned worker packages installed in isolated venv |
| Worker contracts | Nine unittest tests: HTTP/auth, uploads/results, queue rejection, failures, restart, EXIF orientation, metadata stripping, animated/oversized rejection, depth validation, configured private HTTPS proxy origin |
| Existing runtime self-check | All 15 checks passed |
| Actual Small-model inference | `smoke_model.py --fixture` passed on Windows CPU via local HTTP upload, polling and result downloads |
| Official checkpoint | `depth-anything/Depth-Anything-V2-Small-hf`, revision `5426e4f0f36572d16453bbda7a8389317b1bef99` |
| Actual model outputs | Finite 192 × 256 relative-depth array; PNG and OBJ retrieved |
| Real-photo accuracy / reconstruction | Not evaluated; fixture proves execution only; no metric accuracy asserted |
| Physical phone / user PC connection | Not tested |
| Mobile browser rendering / gestures | Not tested; responsive layout and OrbitControls implemented |
| Private access from anywhere | Tailscale Serve launcher and HTTPS origin validation implemented; Tailscale is not installed on this PC, and account login/phone mobile-data test remain outstanding |

The actual inference test uses the production estimator and HTTP handlers, with
a temporary job directory and a synthetic test image. It is not a demonstration
mode in the delivered site. Test outputs are deleted after the test, and no model
weights, access keys, or photos are committed. A service must still be started
and verified on the intended PC and phone before claiming that connection works.

The separate site has a Windows CI verification workflow; local results do not
imply that GitHub CI has run or passed. No deployment is claimed by this record.
