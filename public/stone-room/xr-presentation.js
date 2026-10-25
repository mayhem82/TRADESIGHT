// The walkthrough generates PMREM textures and shadow render targets on the same
// context used by XR. Re-enter the browser-owned projection target explicitly at
// the frame boundary; a non-null logical target alone does not prove GL binding.
// Keep Three's XR manager responsible for the target, camera and per-view viewport.
export function renderScene(renderer,scene,camera,frame){
 if(renderer.xr.isPresenting){
  // Three still invokes the loop when no viewer pose is available. Its first
  // projection target may not exist yet; ar.update already displays tracking loss.
  if(frame&&!frame.getViewerPose(renderer.xr.getReferenceSpace()))return false;
  const projection=renderer.getRenderTarget();
  if(!projection?.isXRRenderTarget)throw Error('XR projection target is unavailable');
  renderer.resetState();
  renderer.setRenderTarget(projection);
 }
 renderer.render(scene,camera);
 return true;
}
