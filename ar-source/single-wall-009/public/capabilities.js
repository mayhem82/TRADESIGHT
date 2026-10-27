export function granted(session,feature){return Array.from(session?.enabledFeatures||[]).includes(feature);}
export function cameraImage(session,view,binding,gl){
  if(!granted(session,'camera-access'))return {texture:null,status:'camera-access not granted; virtual-only diagnostic'};
  if(!binding?.getCameraImage)return {texture:null,status:'getCameraImage unavailable; virtual-only diagnostic'};
  try {
    const camera=view?.camera;if(!camera)return {texture:null,status:'XRView.camera is null; virtual-only diagnostic'};
    const texture=binding.getCameraImage(camera);
    if(!texture||!gl.isTexture(texture)||!(camera.width>0&&camera.height>0))return {texture:null,status:'No valid camera texture; virtual-only diagnostic'};
    return {texture,width:camera.width,height:camera.height,granted:true,status:`Live camera texture ${camera.width} × ${camera.height}; phone alignment unverified`};
  }catch(e){return {texture:null,status:`Camera unavailable (${e.name}); virtual-only diagnostic`};}
}
export function depthSample(session,frame,view){
  if(!granted(session,'depth-sensing'))return 'Depth not granted; occlusion not implemented';
  try {
    const d=frame.getDepthInformation?.(view);
    const metres=d?.getDepthInMeters?.(.5,.5);
    return Number.isFinite(metres)&&metres>0?`CPU depth sample ${metres.toFixed(2)} m; occlusion not implemented`:'Depth granted, no valid CPU sample; occlusion not implemented';
  }catch(e){return `Depth unavailable (${e.name}); occlusion not implemented`;}
}
export function sessionOptions(camera,depth,root){
  return {requiredFeatures:['local','hit-test'],optionalFeatures:['dom-overlay',...(camera?['camera-access']:[]),...(depth?['depth-sensing']:[])],domOverlay:{root},...(depth?{depthSensing:{usagePreference:['cpu-optimized'],dataFormatPreference:['float32','luminance-alpha']}}:{})};
}
