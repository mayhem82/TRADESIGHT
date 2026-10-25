async () => {
 const THREE=await import('./vendor/three.module.js');
 const original=THREE.AnimationMixer.prototype.update,after=THREE.Object3D.prototype.onAfterRender;
 const alert=document.querySelector('#error'),before=window.stoneRoom.diagnostics.npc;
 let notices=0,draws=0,healthy=0;
 const observer=new MutationObserver(records=>{notices+=records.filter(r=>r.type==='childList'||r.type==='characterData').length});
 observer.observe(alert,{childList:true,characterData:true,subtree:true});
 THREE.Object3D.prototype.onAfterRender=function(...args){draws++;return after.apply(this,args)};
 function waitFor(predicate){return new Promise((resolve,reject)=>{const until=performance.now()+30000;const poll=()=>{if(predicate())resolve();else if(performance.now()>until)reject(Error('Animation containment timed out'));else setTimeout(poll,25)};poll()})}
 try{
  THREE.AnimationMixer.prototype.update=function(dt){original.call(this,dt);throw Error('Injected animation update fault')};
  await waitFor(()=>window.stoneRoom.diagnostics.updateErrors.failureCount>=3);
  await new Promise(resolve=>setTimeout(resolve,100));
  const diagnostic=window.stoneRoom.diagnostics;
  const result={failures:diagnostic.updateErrors.failureCount,draws,notices,text:alert.textContent,visible:getComputedStyle(alert).display!=='none',poseRestored:JSON.stringify(diagnostic.npc)===JSON.stringify(before)};
  THREE.AnimationMixer.prototype.update=function(dt){healthy++;return original.call(this,dt)};
  await waitFor(()=>healthy>=2);result.normalAnimationResumed=true;
  return result;
 }finally{
  THREE.AnimationMixer.prototype.update=original;THREE.Object3D.prototype.onAfterRender=after;observer.disconnect();alert.hidden=true;
 }
}
