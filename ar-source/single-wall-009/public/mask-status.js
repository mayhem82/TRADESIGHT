export function maskStatus({active,tracking,placed,captured,effect,camera,aligned,submitted,error,reason='',moduleReady=true,moduleError='',warning=''}){
  if(!active)return {kind:'idle',text:'MASK NOT ACTIVE — enter AR'};
  if(!moduleReady)return {kind:'error',text:'CAPTURE RENDERER UNAVAILABLE — '+moduleError};
  if(!tracking)return {kind:'paused',text:'MASK PAUSED — tracking/visibility unavailable'};
  if(!placed)return {kind:'place',text:'MASK NOT ACTIVE — tap the surface circle to place'};
  if(!captured&&!camera)return {kind:'unavailable',text:'NO CAMERA CAPTURE — '+reason};
  if(!captured)return {kind:'empty',text:'NO PHOTOS STORED — press Add view'};
  if(!effect)return {kind:'off',text:'MASK OFF — live camera is unobstructed'};
  if(!aligned)return {kind:'suspended',text:'MASK SUSPENDED — '+reason};
  if(error)return {kind:'error',text:'MASK DRAW ERROR — WebGL '+error};
  if(!submitted)return {kind:'inactive',text:'MASK NOT DRAWN — '+reason};
  if(warning)return {kind:'warning',text:'IMAGE DRAW SUBMITTED — '+warning+'; rotation allowed'};
  return {kind:'submitted',text:'MASK DRAW SUBMITTED — stored image, rotation allowed; phone output not yet verified'};
}
