# MAYHEM AR release 011

Public front door after deployment: https://mayhem82.github.io/TRADESIGHT/ar-experiments/mayhem-ar/projects/index.html

Two collections: Stone Room (exact PC-accepted Bellbrook Yowie4 d0e78b45bad9 bundle and its own reference experiments) and AR Occlusion (current square008f and preserved variants). The pre-existing basic AR library is retained below the new launcher, with a recoverable copy at public/ar-experiments/legacy-basic-20261026. Unrelated TRADESIGHT and old root Stone Room runtime remain unchanged.

This is a static public release. Runtime does not call ChatGPT/OpenAI or require a ChatGPT subscription, PC server or Cloudflare tunnel. Hosting/network availability and a compatible phone browser remain necessary. Camera/AR permissions are asked on the public origin; optional camera/depth capabilities are not guaranteed. Captured wall images remain session/GPU memory only and are never uploaded; no service worker/camera-data cache was added. Home-screen installation was tested through manifests and simulated UI events; physical phone install remains pending.

## Source and deployment

- Deployed assets: public/ar-experiments/mayhem-ar. Vite copies them into dist during the unchanged existing npm run build / Pages workflow.
- Editable current square source: ar-source/current-square/public, including the accepted renderer modules and local reticle assets. Pinned bundler: rolldown1.2.13. Run npm install and npm run build in ar-source/current-square if rebuilding; no dependency installation is needed merely to serve the already compiled release.
- Current binary: invisibility-wall-008g/invisibility-wall-008g.bundle.js. Original prepared SHA256 89e36075cdec343e4912cd8619a364a19bdd03b2e0d09c15ed79435f769c0514. It has three whole panels and three wall-level indicators, max6photos/16MiB, manual capture, exterior projection, opening-away placement, compact Hide/Show and transactional Reposition/cancel.
- Accepted Stone bundle: stone-room/reference/bellbrook-yowie-4-d0e78b45bad9.bundle.js, SHA256 d0e78b45bad90485e51130f340d4f9e4472d4ed18a01641e3667bd94bde8a2e1. Original source/baseline on the PC was not changed. Copied navigation gets a subpath adapter; models/bundle remain byte exact and uncompressed.
- Models current-square card is the only launcher target to change for a future release. Use a new version directory, retain previous files and add a history link.
- Manifests/icons have distinct Hub, Stone Room and AR Occlusion names/ids, standard192/512 and maskable512 icons, scoped to the existing repository path. No custom domain or hosting-account settings changed.

## Recovery without this chat

Clone/download this repository and keep public/ar-experiments/mayhem-ar plus ar-source/current-square and this guide. The static directory can be served by any suitable HTTPS static host with the same configured path; update manifest id/start_url/scope for another mount path. No private key or app backend belongs in it. Keep camera access HTTPS and optional. Recover an older release using Git history or a preserved version folder, then redeploy with the existing Pages workflow; do not overwrite the accepted PC baseline. Legacy basic AR remains recoverable.

## Evidence and limits

008f passed13focusedlogic+14browser/GPUchecks; prior foundation/camera/placement checks passed in earlier version evidence. Left/back/right gradient tests verify no mirror, interior rejection and no former strip lines; preview has three whole outlines and AR only visible exterior outlines. These do not prove real-world concealment. Hub/shortcut checks8pass locally; final subpath/public verification is recorded separately. The805protectedStoneRoomfiles remain unchanged.

GitHub Pages is the existing repository deployment, replacing the temporary tunnel as the durable destination. No additional paid API is used by the app. Account/provider limits or prices may change; no free-forever or account-plan claim is made.


## Loading repair011 / square008g
User reported008f walls did not load on phone. Published008f was independently reproduced with an emulated0.6m floor hit: startup,AR and placement succeeded, but camera lay inside the enclosure; exterior guides0 and capture refused. Opening-away yaw had left the open edge at the hit point.008g anchors the closed back at the hit instead and extends the enclosure away. Three-panel geometry, exterior gates, capture/menu and transactional reposition modules unchanged.16focusedlogic+7browser/GPU checks pass, including .3/.6/1/2m placements and regression capture/reposition. This confirms a code defect, not the exact phone failure stage; physical008g retest pending.
