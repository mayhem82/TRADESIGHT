// Keep a failed update from aborting Three's callback before its next RAF request.
// Rendering is deliberately a separate phase and can use the last valid pose.
export function createUpdateGuard(report){
 const reported=new Set();let failureCount=0,lastError='';
 function notify(phase,error){
  const message=String(error?.message||error),key=phase+': '+message;
  lastError=key;if(reported.has(key))return;reported.add(key);
  try{report(phase,message);}catch{/* An error display must not stop the frame loop. */}
 }
 return {
  run(phase,update,pose){
   let saved=false;
   try{if(pose){pose.capture();saved=true;}update();return true;}
   catch(error){
    failureCount++;
    if(saved)try{pose.restore();}catch(restoreError){notify(phase+' pose restore',restoreError);}
    notify(phase,error);return false;
   }
  },
  reset(){reported.clear();failureCount=0;lastError='';},
  get diagnostics(){return {failureCount,lastError};}
 };
}

// Reuse storage each frame; animation clips and their action state stay intact.
export function createPoseCheckpoint(root){
 const objects=[];root.traverse(object=>objects.push(object));
 const values=new Float64Array(objects.length*10);
 return {
  capture(){for(let i=0;i<objects.length;i++){const o=objects[i],n=i*10;o.position.toArray(values,n);o.quaternion.toArray(values,n+3);o.scale.toArray(values,n+7);}},
  restore(){for(let i=0;i<objects.length;i++){const o=objects[i],n=i*10;o.position.fromArray(values,n);o.quaternion.fromArray(values,n+3);o.scale.fromArray(values,n+7);o.updateMatrix();}root.updateMatrixWorld(true);}
 };
}
