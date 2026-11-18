// Camera startup: try a preferred rear camera, then simpler constraints.
// Requests remain sequential; permission denials are never retried.
export async function openCameraWithFallback(getMedia, isCurrent=()=>true) {
  const attempts=[
    {video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false},
    {video:{facingMode:{ideal:'environment'}},audio:false},
    {video:true,audio:false}
  ];
  let error;
  for(let i=0;i<attempts.length;i++){
    if(!isCurrent())return null;
    try{
      const stream=await getMedia(attempts[i]);
      if(!isCurrent()){stream.getTracks().forEach(track=>track.stop());return null;}
      return stream;
    }catch(e){
      error=e;
      if(!isCurrent())return null;
      if(!['NotReadableError','OverconstrainedError','NotFoundError','AbortError'].includes(e?.name)||i===attempts.length-1)throw e;
    }
  }
  throw error;
}
export function cameraErrorMessage(error) {
  switch(error?.name){
    case 'NotAllowedError': case 'SecurityError': return 'Camera permission is blocked. Allow camera access in your browser settings, then retry.';
    case 'NotReadableError': case 'AbortError': return 'The phone could not start the camera. Close other apps or browser tabs using it, then retry.';
    case 'NotFoundError': case 'OverconstrainedError': return 'No suitable camera was available. Check the phone camera and retry.';
    default: return 'Camera could not start. Check camera access, then retry.';
  }
}
